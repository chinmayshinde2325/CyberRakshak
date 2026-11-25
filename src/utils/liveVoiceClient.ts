import type { AppMode, LanguageCode } from '../types/suraksha';

export interface LiveVoiceHandlers {
  onReady?: () => void;
  onSpeakingChange?: (speaking: boolean) => void;
  onMicLevel?: (level: number) => void;
  onInputTranscript?: (text: string) => void;
  onOutputTranscript?: (text: string) => void;
  onTurnComplete?: () => void;
  onError?: (message: string) => void;
  onClose?: () => void;
}

function pcmFloat32ToBase64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64Pcm24kToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const sampleCount = Math.floor(bytes.length / 2);
  const float32 = new Float32Array(sampleCount);
  const view = new DataView(bytes.buffer, bytes.byteOffset, sampleCount * 2);
  for (let i = 0; i < sampleCount; i++) {
    float32[i] = view.getInt16(i * 2, true) / 32768;
  }
  return float32;
}

export class LiveVoiceSession {
  private ws: WebSocket | null = null;
  private inputCtx: AudioContext | null = null;
  private outputCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private nextStartTime = 0;
  private activeSources = new Set<AudioBufferSourceNode>();
  private closed = false;
  private handlers: LiveVoiceHandlers;

  constructor(handlers: LiveVoiceHandlers) {
    this.handlers = handlers;
  }

  async connect(params: {
    lang: LanguageCode;
    mode: AppMode;
    seniorName: string;
  }): Promise<void> {
    if (typeof window === 'undefined') throw new Error('Browser environment required');
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone access is not available in this browser.');
    }

    // Request mic and unlock both AudioContexts synchronously inside user gesture
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    this.mediaStream = stream;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.inputCtx = new AudioCtx({ sampleRate: 16000 });
    this.outputCtx = new AudioCtx({ sampleRate: 24000 });
    await Promise.all([
      this.inputCtx.state === 'suspended' ? this.inputCtx.resume() : Promise.resolve(),
      this.outputCtx.state === 'suspended' ? this.outputCtx.resume() : Promise.resolve(),
    ]);

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const query = new URLSearchParams({
      lang: params.lang,
      mode: params.mode,
      seniorName: params.seniorName,
    });
    const wsUrl = `${proto}//${window.location.host}/api/live?${query.toString()}`;

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      this.ws = ws;
      let settled = false;

      const connectTimer = window.setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error('Live voice connection timed out.'));
          this.disconnect();
        }
      }, 12000);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(String(event.data || '{}')) as {
            ready?: boolean;
            audio?: string;
            inputTranscript?: string;
            outputTranscript?: string;
            interrupted?: boolean;
            turnComplete?: boolean;
            error?: string;
            closed?: boolean;
          };

          if (msg.ready && !settled) {
            settled = true;
            window.clearTimeout(connectTimer);
            this.startMicCapture();
            this.handlers.onReady?.();
            resolve();
          }
          if (msg.error) {
            if (!settled) {
              settled = true;
              window.clearTimeout(connectTimer);
              reject(new Error(msg.error));
              this.disconnect();
              return;
            }
            this.handlers.onError?.(msg.error);
          }
          if (msg.inputTranscript) {
            this.handlers.onInputTranscript?.(msg.inputTranscript);
          }
          if (msg.outputTranscript) {
            this.handlers.onOutputTranscript?.(msg.outputTranscript);
          }
          if (msg.audio) {
            this.enqueueOutputAudio(msg.audio);
          }
          if (msg.interrupted) {
            this.clearOutputAudio();
          }
          if (msg.turnComplete) {
            this.handlers.onTurnComplete?.();
          }
          if (msg.closed && !this.closed) {
            this.disconnect();
          }
        } catch {
          // Ignore malformed WS message
        }
      };

      ws.onerror = () => {
        if (!settled) {
          settled = true;
          window.clearTimeout(connectTimer);
          reject(new Error('Could not connect to Live Voice server.'));
          this.disconnect();
        }
      };

      ws.onclose = () => {
        window.clearTimeout(connectTimer);
        if (!settled) {
          settled = true;
          reject(new Error('Live Voice connection closed before opening.'));
        }
        if (!this.closed) {
          this.disconnect();
        }
      };
    });
  }

  private startMicCapture(): void {
    if (!this.inputCtx || !this.mediaStream || !this.ws) return;
    const source = this.inputCtx.createMediaStreamSource(this.mediaStream);
    const processor = this.inputCtx.createScriptProcessor(4096, 1, 1);
    this.sourceNode = source;
    this.processor = processor;

    processor.onaudioprocess = (ev) => {
      if (this.closed || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      const samples = ev.inputBuffer.getChannelData(0);
      let sumSq = 0;
      for (let i = 0; i < samples.length; i++) {
        sumSq += samples[i] * samples[i];
      }
      const rms = Math.min(1, Math.sqrt(sumSq / samples.length) * 6);
      this.handlers.onMicLevel?.(rms);

      const audioBase64 = pcmFloat32ToBase64(samples);
      this.ws.send(JSON.stringify({ audio: audioBase64 }));
    };

    source.connect(processor);
    processor.connect(this.inputCtx.destination);
  }

  private enqueueOutputAudio(base64: string): void {
    if (!this.outputCtx || this.closed) return;
    const float32 = base64Pcm24kToFloat32(base64);
    if (float32.length === 0) return;

    const buffer = this.outputCtx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(new Float32Array(float32), 0);

    const source = this.outputCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputCtx.destination);

    const now = this.outputCtx.currentTime;
    if (this.nextStartTime < now) {
      this.nextStartTime = now + 0.03;
    }
    const startAt = this.nextStartTime;
    this.nextStartTime += buffer.duration;

    this.activeSources.add(source);
    this.handlers.onSpeakingChange?.(true);

    source.onended = () => {
      this.activeSources.delete(source);
      if (this.activeSources.size === 0 && !this.closed) {
        this.handlers.onSpeakingChange?.(false);
      }
    };
    source.start(startAt);
  }

  clearOutputAudio(): void {
    for (const src of this.activeSources) {
      try {
        src.onended = null;
        src.stop();
      } catch {
        // Ignore already-ended source
      }
    }
    this.activeSources.clear();
    if (this.outputCtx) {
      this.nextStartTime = this.outputCtx.currentTime;
    }
    this.handlers.onSpeakingChange?.(false);
  }

  sendText(text: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && text.trim()) {
      this.ws.send(JSON.stringify({ text: text.trim() }));
    }
  }

  disconnect(): void {
    if (this.closed) return;
    this.closed = true;
    this.clearOutputAudio();
    try {
      this.processor?.disconnect();
      this.sourceNode?.disconnect();
    } catch {}
    this.mediaStream?.getTracks().forEach((t) => t.stop());
    try {
      void this.inputCtx?.close();
      void this.outputCtx?.close();
    } catch {}
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
    } catch {}
    this.ws = null;
    this.mediaStream = null;
    this.processor = null;
    this.sourceNode = null;
    this.inputCtx = null;
    this.outputCtx = null;
    this.handlers.onMicLevel?.(0);
    this.handlers.onSpeakingChange?.(false);
    this.handlers.onClose?.();
  }
}
