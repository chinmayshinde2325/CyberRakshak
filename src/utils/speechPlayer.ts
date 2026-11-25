import type { LanguageCode } from '../types/suraksha';
import { getLanguageMeta } from './i18n.ts';

let sharedAudioCtx: AudioContext | null = null;
let activeBufferSource: AudioBufferSourceNode | null = null;
let activeAudio: HTMLAudioElement | null = null;
let activeAudioUrl: string | null = null;
let playbackToken = 0;
let ttsQuotaCooldownUntil = 0;

const ttsCache = new Map<string, string>(); // cache key: `${lang}:${text}` -> base64 WAV

// Pre-warm browser speechSynthesis voices early so regional voices are ready
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    window.speechSynthesis.getVoices();
  });
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new Ctx();
  }
  return sharedAudioCtx;
}

/**
 * Call synchronously inside a user click/keypress handler before async fetch() calls
 * so Chrome/Safari/iFrames permit Web Audio playback several seconds later.
 */
export function unlockAudioPlayback(): void {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
  } catch {
    // Non-fatal if AudioContext unavailable
  }
}

export function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stopSpokenAudio(): void {
  playbackToken += 1;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (activeBufferSource) {
    try {
      activeBufferSource.onended = null;
      activeBufferSource.stop();
    } catch {
      // Ignore already-stopped source
    }
    activeBufferSource = null;
  }
  if (activeAudio) {
    activeAudio.onended = null;
    activeAudio.onerror = null;
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (activeAudioUrl) {
    URL.revokeObjectURL(activeAudioUrl);
    activeAudioUrl = null;
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

async function playWavBase64(
  base64: string,
  myToken: number,
  onSpeakingChange?: (speaking: boolean) => void,
  onError?: (msg: string) => void,
): Promise<boolean> {
  const wavBuffer = base64ToArrayBuffer(base64);

  // 1) Prefer unlocked AudioContext (immune to 5-second gesture expiry after async fetches)
  const ctx = getAudioContext();
  if (ctx) {
    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      if (myToken !== playbackToken) return false;
      const audioBuffer = await ctx.decodeAudioData(wavBuffer.slice(0));
      if (myToken !== playbackToken) return false;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      activeBufferSource = source;
      onSpeakingChange?.(true);

      source.onended = () => {
        if (activeBufferSource === source) {
          activeBufferSource = null;
        }
        if (myToken === playbackToken) {
          onSpeakingChange?.(false);
        }
      };
      source.start(0);
      return true;
    } catch {
      // Fall through to HTMLAudioElement if decodeAudioData or resume fails
    }
  }

  // 2) Fallback: HTMLAudioElement Blob playback
  try {
    if (myToken !== playbackToken) return false;
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const blobUrl = URL.createObjectURL(blob);
    activeAudioUrl = blobUrl;
    const audio = new Audio(blobUrl);
    activeAudio = audio;
    onSpeakingChange?.(true);
    audio.onended = () => {
      onSpeakingChange?.(false);
      if (activeAudioUrl === blobUrl) {
        URL.revokeObjectURL(blobUrl);
        activeAudioUrl = null;
      }
    };
    audio.onerror = () => {
      onSpeakingChange?.(false);
      onError?.('Audio playback failed. Click Listen on the message to replay.');
    };
    await audio.play();
    return true;
  } catch {
    onSpeakingChange?.(false);
    return false;
  }
}

export async function speakInLanguage(params: {
  text: string;
  lang: LanguageCode;
  onAudioPreparing?: (preparing: boolean) => void;
  onSpeakingChange?: (speaking: boolean) => void;
  onError?: (message: string) => void;
}): Promise<void> {
  const cleanText = cleanTextForSpeech(params.text);
  if (!cleanText) return;

  stopSpokenAudio();
  const myToken = playbackToken;
  const meta = getLanguageMeta(params.lang);
  const snippet = cleanText.slice(0, 750);
  const cacheKey = `${params.lang}:${snippet}`;

  // 1) Try Gemini TTS WAV (cached or fresh) unless quota cooldown is active
  if (ttsCache.has(cacheKey) || Date.now() >= ttsQuotaCooldownUntil) {
    try {
      let audioBase64 = ttsCache.get(cacheKey);
      if (!audioBase64) {
        params.onAudioPreparing?.(true);
        const ttsController = new AbortController();
        const ttsTimer = window.setTimeout(() => ttsController.abort(), 5000);
        try {
          const resp = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: ttsController.signal,
            body: JSON.stringify({
              text: snippet,
              language: params.lang,
            }),
          });
          const data = await resp.json().catch(() => ({}));
          if (myToken !== playbackToken) return;

          if (resp.ok && typeof data.audioBase64 === 'string' && data.audioBase64) {
            const fetchedAudio: string = data.audioBase64;
            audioBase64 = fetchedAudio;
            ttsCache.set(cacheKey, fetchedAudio);
          } else if (resp.status === 429 || data?.quotaExceeded || data?.fallbackToBrowser) {
            ttsQuotaCooldownUntil = Date.now() + 180_000;
          }
        } finally {
          window.clearTimeout(ttsTimer);
          params.onAudioPreparing?.(false);
        }
      }

      if (audioBase64 && myToken === playbackToken) {
        const played = await playWavBase64(audioBase64, myToken, params.onSpeakingChange, params.onError);
        if (played) return;
      }
    } catch {
      params.onAudioPreparing?.(false);
    }
  }

  // 2) Reliable multi-language browser speech synthesis fallback (English + Devanagari hi/mr/vrh/gon)
  if (myToken === playbackToken) {
    const spoke = speakViaBrowserSynthesis(snippet, params.lang, meta.speechLocale, myToken, params.onSpeakingChange);
    if (!spoke) {
      params.onError?.('Voice synthesis is unavailable on this browser. Tap Listen to retry.');
    }
  }
}

function pickBestBrowserVoice(lang: LanguageCode, fallbackLocale: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const preferenceOrder: Record<LanguageCode, string[]> = {
    en: ['en-in', 'en-gb', 'en-us', 'en'],
    hi: ['hi-in', 'hi'],
    mr: ['mr-in', 'mr', 'hi-in', 'hi'], // hi-IN reads Devanagari fluently when mr-IN isn't installed
    vrh: ['mr-in', 'mr', 'hi-in', 'hi'],
    gon: ['hi-in', 'hi', 'mr-in', 'mr'],
  };

  const targets = preferenceOrder[lang] || [fallbackLocale.toLowerCase()];
  for (const target of targets) {
    const exact = voices.find((v) => v.lang.toLowerCase() === target);
    if (exact) return exact;
    const prefix = voices.find((v) => v.lang.toLowerCase().startsWith(`${target}-`) || v.lang.toLowerCase() === target);
    if (prefix) return prefix;
  }
  return null;
}

export function splitSpeechChunks(text: string, maxLen = 170): string[] {
  const sentences = text.split(/(?<=[.!?।])\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    if (current && current.length + s.length + 1 > maxLen) {
      chunks.push(current);
      current = s;
    } else {
      current = current ? `${current} ${s}` : s;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

function speakViaBrowserSynthesis(
  text: string,
  lang: LanguageCode,
  fallbackLocale: string,
  myToken: number,
  onSpeakingChange?: (speaking: boolean) => void,
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

  try {
    window.speechSynthesis.cancel();
    const voice = pickBestBrowserVoice(lang, fallbackLocale);
    const chunks = splitSpeechChunks(text);

    const speakChunk = (idx: number) => {
      if (myToken !== playbackToken || idx >= chunks.length) {
        if (myToken === playbackToken) onSpeakingChange?.(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance(chunks[idx]);
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        // Use hi-IN as Devanagari speech locale when mr-IN voice isn't installed
        utter.lang = lang === 'en' ? 'en-IN' : lang === 'mr' || lang === 'vrh' ? 'mr-IN' : 'hi-IN';
      }
      utter.rate = 0.94;
      utter.onstart = () => {
        if (idx === 0 && myToken === playbackToken) onSpeakingChange?.(true);
      };
      utter.onend = () => speakChunk(idx + 1);
      utter.onerror = () => {
        if (myToken === playbackToken) onSpeakingChange?.(false);
      };
      window.speechSynthesis.speak(utter);
    };

    speakChunk(0);
    return true;
  } catch {
    onSpeakingChange?.(false);
    return false;
  }
}
