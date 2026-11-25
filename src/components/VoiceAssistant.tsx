import { useEffect, useRef, useState } from 'react';
import {
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Send,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { AppMode, FamilyProfile, LanguageCode } from '../types/suraksha';
import { getLanguageMeta, type TranslationStrings } from '../utils/i18n';
import { LiveVoiceSession } from '../utils/liveVoiceClient';
import { speakInLanguage, stopSpokenAudio, unlockAudioPlayback } from '../utils/speechPlayer';

interface VoiceAssistantProps {
  open: boolean;
  t: TranslationStrings;
  lang: LanguageCode;
  mode: AppMode;
  profile: FamilyProfile | null;
  queuedTopic: string | null;
  onClearQueuedTopic: () => void;
  onClose: () => void;
  onOpen: () => void;
}

interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function VoiceAssistant({
  open,
  t,
  lang,
  mode,
  profile,
  queuedTopic,
  onClearQueuedTopic,
  onClose,
  onOpen,
}: VoiceAssistantProps) {
  const a = t.assistant;
  const [messages, setMessages] = useState<ChatTurn[]>([{ role: 'assistant', text: a.welcomeMessage }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState<0 | 1 | 2 | 3>(0);
  const [preparingAudio, setPreparingAudio] = useState(false);
  const [speakingAudio, setSpeakingAudio] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [micNote, setMicNote] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Astra Real-Time Live Voice state
  const [liveStatus, setLiveStatus] = useState<'off' | 'connecting' | 'on'>('off');
  const [liveSpeaking, setLiveSpeaking] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const liveSessionRef = useRef<LiveVoiceSession | null>(null);
  const liveUserTurnRef = useRef('');
  const liveBotTurnRef = useRef('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Reset welcome message when language switches if conversation hasn't started yet
  useEffect(() => {
    setMessages((prev) =>
      prev.length <= 1 ? [{ role: 'assistant', text: t.assistant.welcomeMessage }] : prev,
    );
  }, [lang, t.assistant.welcomeMessage]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading, preparingAudio]);

  const stopLiveVoice = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.disconnect();
      liveSessionRef.current = null;
    }
    setLiveStatus('off');
    setLiveSpeaking(false);
    setMicLevel(0);
    liveUserTurnRef.current = '';
    liveBotTurnRef.current = '';
  };

  useEffect(() => {
    if (!open) {
      stopLiveVoice();
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopLiveVoice();
        stopSpokenAudio();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  // If language changes mid-session, cleanly stop Live session so next connect uses the new language
  useEffect(() => {
    if (liveStatus !== 'off') {
      stopLiveVoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Advance processing progress indicator smoothly while awaiting AI answer
  useEffect(() => {
    if (!loading) {
      setProgressStage(0);
      return;
    }
    setProgressStage(1);
    const t1 = window.setTimeout(() => setProgressStage(2), 700);
    const t2 = window.setTimeout(() => setProgressStage(3), 1800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [loading]);

  const speakOut = async (text: string, forceSpeak = false) => {
    if (!forceSpeak && !speakReplies) return;
    unlockAudioPlayback();
    await speakInLanguage({
      text,
      lang,
      onAudioPreparing: setPreparingAudio,
      onSpeakingChange: setSpeakingAudio,
      onError: (msg) => setMicNote(msg),
    });
  };

  const toggleLiveVoice = async () => {
    if (liveStatus !== 'off') {
      stopLiveVoice();
      return;
    }

    unlockAudioPlayback();
    stopSpokenAudio();
    setErrorMsg(null);
    setMicNote(null);
    setLiveStatus('connecting');

    const session = new LiveVoiceSession({
      onReady: () => {
        setLiveStatus('on');
      },
      onMicLevel: (lvl) => {
        setMicLevel(lvl);
      },
      onSpeakingChange: (spk) => {
        setLiveSpeaking(spk);
      },
      onInputTranscript: (chunk) => {
        liveUserTurnRef.current = `${liveUserTurnRef.current} ${chunk}`.trim();
        const combined = liveUserTurnRef.current;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'user' && liveBotTurnRef.current === '') {
            return [...prev.slice(0, -1), { role: 'user', text: combined }];
          }
          return [...prev, { role: 'user', text: combined }];
        });
      },
      onOutputTranscript: (chunk) => {
        liveBotTurnRef.current = `${liveBotTurnRef.current} ${chunk}`.trim();
        const combined = liveBotTurnRef.current;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && prev.length > 1) {
            return [...prev.slice(0, -1), { role: 'assistant', text: combined }];
          }
          return [...prev, { role: 'assistant', text: combined }];
        });
      },
      onTurnComplete: () => {
        liveUserTurnRef.current = '';
        liveBotTurnRef.current = '';
      },
      onError: (msg) => {
        setMicNote(`${a.liveVoiceFallback} (${msg})`);
      },
      onClose: () => {
        liveSessionRef.current = null;
        setLiveStatus('off');
        setLiveSpeaking(false);
        setMicLevel(0);
      },
    });

    liveSessionRef.current = session;
    try {
      await session.connect({
        lang,
        mode,
        seniorName: profile?.seniorName || '',
      });
    } catch {
      session.disconnect();
      liveSessionRef.current = null;
      setLiveStatus('off');
      setMicNote(a.liveVoiceFallback);
    }
  };

  const sendMessage = async (textOverride?: string) => {
    const clean = (textOverride ?? input).trim();
    if (!clean || loading) return;

    unlockAudioPlayback();
    stopSpokenAudio();

    // If Astra Live Voice call is active, speak into the live session directly
    if (liveStatus === 'on' && liveSessionRef.current) {
      setMessages((prev) => [...prev, { role: 'user', text: clean }]);
      if (!textOverride) setInput('');
      liveUserTurnRef.current = '';
      liveBotTurnRef.current = '';
      liveSessionRef.current.sendText(clean);
      return;
    }

    const historyPayload = messages.slice(-6);
    const nextHistory: ChatTurn[] = [...messages, { role: 'user', text: clean }];
    setMessages(nextHistory);
    if (!textOverride) setInput('');
    setLoading(true);
    setErrorMsg(null);
    setMicNote(null);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 45000);

    try {
      let finalReply = '';
      const streamResp = await fetch('/api/assistant/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: clean,
          language: lang,
          mode,
          seniorName: profile?.seniorName || '',
          history: historyPayload,
        }),
      });

      const contentType = streamResp.headers.get('content-type') || '';
      if (streamResp.ok && streamResp.body && contentType.includes('text/event-stream')) {
        const reader = streamResp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let streamedText = '';
        let addedBubble = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split('\n\n');
          buffer = frames.pop() ?? '';

          for (const frame of frames) {
            const line = frame
              .split('\n')
              .find((l) => l.startsWith('data: '));
            if (!line) continue;
            try {
              const payload = JSON.parse(line.slice(6)) as {
                delta?: string;
                done?: boolean;
                reply?: string;
                error?: string;
              };
              if (payload.error) {
                throw new Error(payload.error);
              }
              if (payload.delta) {
                streamedText += payload.delta;
                if (!addedBubble) {
                  addedBubble = true;
                  setMessages([...nextHistory, { role: 'assistant', text: streamedText }]);
                } else {
                  setMessages([...nextHistory, { role: 'assistant', text: streamedText }]);
                }
              }
              if (payload.done && payload.reply) {
                finalReply = payload.reply;
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message && !parseErr.message.includes('JSON')) {
                throw parseErr;
              }
            }
          }
        }
        if (!finalReply) finalReply = streamedText.trim();
      } else {
        // Fallback to unary endpoint
        const resp = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            message: clean,
            language: lang,
            mode,
            seniorName: profile?.seniorName || '',
            history: historyPayload,
          }),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          setErrorMsg(data.error || 'Assistant could not reply right now.');
          return;
        }
        finalReply = String(data.reply || '').trim();
      }

      if (!finalReply) {
        setErrorMsg('Saathi could not generate a reply. Please try asking again.');
        return;
      }

      setMessages([...nextHistory, { role: 'assistant', text: finalReply }]);
      setLoading(false);
      await speakOut(finalReply);
    } catch (err) {
      const errText = err instanceof Error && err.name === 'AbortError'
        ? 'Saathi took too long to respond. Please tap Send again.'
        : err instanceof Error && err.message
          ? err.message
          : 'Saathi could not connect. Please tap Send again.';
      setErrorMsg(errText);
    } finally {
      window.clearTimeout(timer);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && queuedTopic) {
      const topic = queuedTopic;
      onClearQueuedTopic();
      void sendMessage(topic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, queuedTopic]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
    setListening(false);
  };

  const startMediaRecorderTranscription = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMicNote(a.micUnavailableHint);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorderRef.current = recorder;
      setListening(true);

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        setListening(false);
        if (chunks.length === 0) return;

        setTranscribing(true);
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          const buffer = await blob.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let bin = '';
          for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
          const audioBase64 = btoa(bin);

          const resp = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64,
              mimeType: blob.type || 'audio/webm',
              language: lang,
            }),
          });
          const data = await resp.json().catch(() => ({}));
          if (resp.ok && data.transcript) {
            setInput(data.transcript);
            void sendMessage(data.transcript);
          } else {
            setMicNote(data.error || a.micUnavailableHint);
          }
        } catch {
          setMicNote(a.micUnavailableHint);
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start();
      window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 6000);
    } catch {
      setListening(false);
      setMicNote(a.micUnavailableHint);
    }
  };

  const startVoiceListening = async () => {
    if (listening) {
      stopListening();
      return;
    }

    unlockAudioPlayback();
    setMicNote(null);
    setErrorMsg(null);
    stopSpokenAudio();

    const win = window as unknown as {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    // Use Gemini transcription directly for Varhadi/Gondi regional dialects or when SpeechRecognition is absent
    if (SpeechRec && lang !== 'vrh' && lang !== 'gon') {
      try {
        let gotResult = false;
        const rec = new SpeechRec();
        rec.lang = getLanguageMeta(lang).speechLocale;
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        recognitionRef.current = rec;
        setListening(true);

        rec.onresult = (ev) => {
          gotResult = true;
          const transcript = ev.results?.[0]?.[0]?.transcript?.trim();
          setListening(false);
          if (transcript) {
            setInput(transcript);
            void sendMessage(transcript);
          }
        };
        rec.onerror = (ev) => {
          setListening(false);
          const errCode = ev?.error || '';
          if (errCode === 'not-allowed' || errCode === 'permission-denied') {
            setMicNote(a.micUnavailableHint);
            return;
          }
          if (!gotResult) {
            void startMediaRecorderTranscription();
          }
        };
        rec.onend = () => {
          setListening(false);
        };
        rec.start();
        return;
      } catch {
        setListening(false);
      }
    }

    await startMediaRecorderTranscription();
  };

  if (!open) {
    return (
      <button
        type="button"
        data-testid="floating-assistant-trigger"
        onClick={() => {
          unlockAudioPlayback();
          onOpen();
        }}
        className="fixed right-5 bottom-5 z-40 inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-[#38bdf8]/35 bg-[#0d1724] px-5 py-3 text-sm font-semibold text-white shadow-xl transition-transform hover:scale-[1.03] hover:bg-[#132235]"
      >
        <Sparkles className="h-4 w-4 text-[#38bdf8]" aria-hidden="true" />
        <span>{t.commandBar.askVoiceBtn}</span>
      </button>
    );
  }

  const activeProgressText = preparingAudio
    ? a.preparingAudio
    : progressStage === 1
      ? a.processingStep1
      : progressStage === 2
        ? a.processingStep2
        : a.processingStep3;

  const progressWidthPct = preparingAudio
    ? 92
    : progressStage === 1
      ? 34
      : progressStage === 2
        ? 66
        : 88;

  const isAnySpeaking = speakingAudio || liveSpeaking;
  const orbStatusText =
    liveStatus === 'connecting'
      ? a.liveVoiceConnecting
      : liveStatus === 'on'
        ? liveSpeaking
          ? a.liveVoiceSpeaking
          : a.liveVoiceActive
        : isAnySpeaking
          ? a.liveVoiceSpeaking
          : listening
            ? a.listeningState
            : loading || preparingAudio
              ? activeProgressText
              : a.personaSubtitle;

  const orbScale =
    liveStatus === 'on'
      ? 1 + Math.min(0.28, micLevel * 0.35 + (liveSpeaking ? 0.14 : 0))
      : isAnySpeaking || listening
        ? 1.12
        : 1;

  return (
    <aside
      data-testid="assistant-drawer"
      aria-label={a.drawerTitle}
      className="fixed right-4 bottom-4 z-50 flex max-h-[88vh] w-[min(440px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#38bdf8]/25 bg-[#f1f5f9] text-[#0f172a] shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 bg-[#0d1724] px-5 py-3.5 text-white">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="h-4 w-4 text-[#38bdf8]" aria-hidden="true" />
            <span>{a.drawerTitle}</span>
          </h3>
          <p className="mt-0.5 text-xs text-[#94a3b8]">{a.personaSubtitle}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (speakReplies) {
                stopSpokenAudio();
                setSpeakingAudio(false);
              }
              setSpeakReplies(!speakReplies);
            }}
            aria-label={a.speakReplyToggle}
            title={a.speakReplyToggle}
            className="cursor-pointer rounded-lg p-1.5 text-[#cbd5e1] hover:bg-white/10"
          >
            {speakReplies ? (
              <Volume2 className={`h-4 w-4 ${isAnySpeaking ? 'text-[#38bdf8]' : ''}`} />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            data-testid="assistant-close-btn"
            onClick={() => {
              stopLiveVoice();
              stopSpokenAudio();
              onClose();
            }}
            aria-label="Close assistant"
            className="cursor-pointer rounded-lg p-1.5 text-[#cbd5e1] hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Astra / Fable Live Voice Orb Stage */}
      <div className="flex items-center justify-between gap-3 border-b border-[#38bdf8]/20 bg-gradient-to-r from-[#09131f] via-[#0d1c2e] to-[#0b1828] px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          {/* Glowing Animated Voice Orb */}
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            <span
              className={`absolute inset-0 rounded-full transition-transform duration-150 ${
                liveStatus === 'on' || isAnySpeaking
                  ? 'bg-[#38bdf8]/35 blur-[4px]'
                  : loading
                    ? 'animate-pulse bg-[#f59e0b]/35 blur-[3px]'
                    : 'bg-[#38bdf8]/18'
              }`}
              style={{ transform: `scale(${orbScale})` }}
              aria-hidden="true"
            />
            <span
              className={`relative flex h-8 w-8 items-center justify-center rounded-full border border-white/25 shadow-inner ${
                liveStatus === 'on'
                  ? liveSpeaking
                    ? 'bg-gradient-to-tr from-[#0ea5e9] via-[#38bdf8] to-[#34d399]'
                    : 'bg-gradient-to-tr from-[#059669] to-[#38bdf8]'
                  : isAnySpeaking
                    ? 'bg-gradient-to-tr from-[#0284c7] to-[#34d399]'
                    : loading
                      ? 'bg-gradient-to-tr from-[#d97706] to-[#38bdf8]'
                      : 'bg-gradient-to-tr from-[#0f4c5c] to-[#0284c7]'
              }`}
            >
              {liveStatus === 'connecting' || loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden="true" />
              ) : (
                <Radio className="h-4 w-4 text-white" aria-hidden="true" />
              )}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#e0f2fe]" data-testid="astra-orb-status">
              {orbStatusText}
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              {getLanguageMeta(lang).nativeLabel}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {isAnySpeaking && (
            <button
              type="button"
              data-testid="assistant-stop-voice-btn"
              onClick={() => {
                stopSpokenAudio();
                liveSessionRef.current?.clearOutputAudio();
                setSpeakingAudio(false);
                setLiveSpeaking(false);
              }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/20"
            >
              <Square className="h-3 w-3 fill-current" aria-hidden="true" />
              <span>{a.stopAudioBtn}</span>
            </button>
          )}
          <button
            type="button"
            data-testid="astra-live-toggle-btn"
            onClick={() => void toggleLiveVoice()}
            disabled={liveStatus === 'connecting'}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-60 ${
              liveStatus === 'on'
                ? 'bg-[#c63d2f] text-white hover:bg-[#b03225]'
                : 'bg-[#38bdf8] text-[#08121c] hover:bg-[#5cccfb]'
            }`}
          >
            {liveStatus === 'on' ? (
              <>
                <PhoneOff className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{a.liveVoiceStopBtn}</span>
              </>
            ) : (
              <>
                <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{a.liveVoiceStartBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Chat Log */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            data-testid="assistant-message"
            className={`rounded-xl p-3.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'ml-8 bg-[#0f4c5c] text-white'
                : 'mr-4 border border-[#0f172a]/10 bg-white text-[#0f172a]'
            }`}
          >
            <p className="whitespace-pre-line">{m.text}</p>
            {m.role === 'assistant' && (
              <div className="mt-2 flex items-center justify-end">
                <button
                  type="button"
                  data-testid="assistant-replay-btn"
                  onClick={() => void speakOut(m.text, true)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#0f172a]/12 bg-[#f8fafc] px-2.5 py-1 text-xs font-medium text-[#0f4c5c] hover:bg-[#e0f2fe]"
                >
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{a.replayBtn}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Live Answer Processing & Audio Generation Progress */}
        {(loading || preparingAudio) && (
          <div
            data-testid="assistant-progress"
            className="mr-4 rounded-xl border border-[#0284c7]/25 bg-[#e0f2fe] p-3.5 text-xs text-[#0c4a6e]"
          >
            <div className="flex items-center justify-between gap-2 font-semibold">
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0284c7]" aria-hidden="true" />
                <span>{a.processingTitle}</span>
              </span>
              <span className="tabular-nums text-[11px] text-[#0369a1]">
                {progressWidthPct}%
              </span>
            </div>
            <p className="mt-1.5 text-xs text-[#0369a1]">{activeProgressText}</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/80">
              <div
                className="h-full rounded-full bg-[#0284c7] transition-all duration-500"
                style={{ width: `${progressWidthPct}%` }}
              />
            </div>
          </div>
        )}

        {errorMsg && (
          <div
            data-testid="assistant-error"
            className="rounded-xl border border-[#c63d2f]/30 bg-[#fdf5f4] p-3 text-xs text-[#9d2417]"
          >
            {errorMsg}
          </div>
        )}

        {micNote && (
          <div className="rounded-xl border border-[#d98b26]/35 bg-[#fdf8ef] p-3 text-xs text-[#734a0e]">
            {micNote}
          </div>
        )}

        {/* Quick Voice Questions */}
        <div className="pt-1">
          <p className="text-xs font-semibold text-[#475569] uppercase">{a.sampleQuestionsLabel}</p>
          <div className="mt-1.5 flex flex-col gap-1.5">
            {a.sampleQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void sendMessage(q)}
                className="cursor-pointer rounded-lg border border-[#0f172a]/12 bg-white px-3 py-2 text-left text-xs font-medium text-[#0f172a] hover:border-[#0e7490] hover:bg-[#e0f2fe]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <div ref={chatBottomRef} />
      </div>

      {/* Voice & Text Input Bar */}
      <div className="border-t border-[#0f172a]/10 bg-white p-3">
        {(listening || transcribing) && (
          <div className="mb-2 flex items-center justify-center gap-2 rounded-lg bg-[#e0f2fe] py-2 text-xs font-semibold text-[#0c4a6e]">
            <span className="flex h-3.5 items-end gap-0.5" aria-hidden="true">
              <span className="eq-bar h-3.5 w-1 rounded bg-[#0284c7]" />
              <span className="eq-bar h-3.5 w-1 rounded bg-[#0284c7]" />
              <span className="eq-bar h-3.5 w-1 rounded bg-[#0284c7]" />
              <span className="eq-bar h-3.5 w-1 rounded bg-[#0284c7]" />
            </span>
            <span>{transcribing ? a.transcribingState : a.listeningState}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="assistant-mic-btn"
            onClick={() => void startVoiceListening()}
            title={a.listenBtn}
            aria-label={a.listenBtn}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
              listening
                ? 'bg-[#c63d2f] text-white'
                : 'bg-[#38bdf8] text-[#08121c] hover:bg-[#5cccfb]'
            }`}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="hidden sm:inline">{a.listenBtn}</span>
          </button>

          <input
            data-testid="assistant-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void sendMessage();
            }}
            placeholder={a.inputPlaceholder}
            className="min-w-0 flex-1 rounded-xl border border-[#0f172a]/20 bg-[#f8fafc] px-3 py-2 text-sm text-[#0f172a] focus:border-[#0e7490] focus:outline-none"
          />

          <button
            type="button"
            data-testid="assistant-send-btn"
            disabled={loading || !input.trim()}
            onClick={() => void sendMessage()}
            className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-[#0f4c5c] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#0e7490] disabled:opacity-50"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>{a.sendBtn}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
