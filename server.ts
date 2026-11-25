import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  GoogleGenAI,
  Modality,
  ThinkingLevel,
  Type,
  type LiveServerMessage,
} from '@google/genai';
import {
  analyzeThreatDeterministic,
  buildWhatsAppAlertPayload,
  validateFamilyProfileInput,
} from './src/utils/scamEngine.ts';
import { getLanguageMeta } from './src/utils/i18n.ts';
import { DEFAULT_SITE_UPDATES, normalizeSiteUpdatesConfig } from './src/utils/siteUpdates.ts';
import type {
  AlertSourceType,
  CaregiverAlert,
  LanguageCode,
  SafetyPermissions,
  ScamCategory,
  SiteUpdatesConfig,
} from './src/types/suraksha.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const VALID_LANGS = new Set<LanguageCode>(['en', 'hi', 'mr', 'vrh', 'gon']);

function parseLanguage(value: unknown): LanguageCode {
  if (typeof value === 'string' && VALID_LANGS.has(value as LanguageCode)) {
    return value as LanguageCode;
  }
  return 'en';
}

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
}

function formatGeminiError(err: unknown, fallback = 'AI service is temporarily busy.'): string {
  const raw = err instanceof Error ? err.message : String(err || fallback);
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const msg = parsed?.error?.message || parsed?.message;
      if (typeof msg === 'string' && msg.trim()) {
        return msg.trim();
      }
    } catch {
      // ignore parse failure
    }
  }
  return trimmed || fallback;
}

async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI['models']['generateContent']>[0],
) {
  const models =
    params.model === 'gemini-4-hydrogen'
      ? ['gemini-4-hydrogen', 'gemini-3.1-flash-lite', 'gemini-3.1-flash-lite']
      : [params.model, 'gemini-3.1-flash-lite'];
  const delays = [0, 150, 500];
  const timeouts = [8500, 12000, 14000];
  let lastErr: unknown;

  for (let i = 0; i < models.length; i++) {
    if (delays[i] > 0) {
      await new Promise((resolve) => setTimeout(resolve, delays[i]));
    }
    try {
      const timeoutMs = timeouts[i] ?? 12000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('503 Upstream model timeout')), timeoutMs),
      );
      const nextConfig =
        models[i] === 'gemini-3.1-flash-lite' && params.config?.thinkingConfig
          ? { ...params.config, thinkingConfig: undefined }
          : params.config;
      return await Promise.race([
        ai.models.generateContent({
          ...params,
          config: nextConfig,
          model: models[i],
        }),
        timeoutPromise,
      ]);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err || '');
      const isTransient =
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('429') ||
        msg.toLowerCase().includes('timeout') ||
        msg.toLowerCase().includes('high demand');
      if (!isTransient) {
        throw err;
      }
    }
  }
  throw lastErr;
}

function buildSaathiSystemInstruction(
  lang: LanguageCode,
  mode: 'senior' | 'caregiver',
  seniorName: string,
): string {
  const langMeta = getLanguageMeta(lang);
  return [
    `You are Saathi, the warm, calm, reassuring Astra/Fable-style cyber-safety voice companion on CyberRakshak for Indian senior citizens and their caregivers.`,
    `ALWAYS respond exclusively in: ${langMeta.geminiLanguageName}. Do NOT switch back to English if the selected language is Hindi, Marathi, Varhadi, or Gondi.`,
    lang === 'vrh'
      ? `Use natural, warm Varhadi (Nagpur/Vidarbha) phrasing like "राम-राम", "काळजी करू नका", "तुमाले", "हाये".`
      : lang === 'gon'
        ? `Use respectful Nagpur/Gondwana Gondi phrasing mixed with simple familiar words ("सेवा जोहार", "काका/आक्का", "मंता", "आयो") in clear Devanagari.`
        : '',
    mode === 'senior'
      ? `The user is a senior citizen${seniorName ? ` named ${seniorName}` : ''}. Use short, simple sentences, warm encouragement, and zero technical jargon.`
      : `The user is a caregiver supporting a senior citizen${seniorName ? ` (${seniorName})` : ''}. Give concise, practical guidance respecting the senior's dignity and privacy.`,
    `Core safety facts to uphold:`,
    `- Indian law has NO "Digital Arrest". Police/CBI/ED never arrest or take money on WhatsApp/Skype video calls.`,
    `- Real banks never ask for OTP, ATM PIN, CVV, MPIN, or KYC updates through SMS links or APK files.`,
    `- Never install screen-sharing apps (AnyDesk, QuickSupport, TeamViewer) for unknown callers.`,
    `- If money was sent or risk is urgent, tell them to call 1930 immediately or visit cybercrime.gov.in.`,
    `Write in natural, conversational spoken sentences (3-4 short lines, NO Markdown symbols like **, *, #, or bullet lists) so your reply sounds effortless when spoken aloud.`,
  ]
    .filter(Boolean)
    .join('\n');
}

// In-memory alert store capped at 50 items for Caregiver Dashboard synchronization
const alertHistory: CaregiverAlert[] = [];

const DATA_DIR = path.resolve(__dirname, 'data');
const SITE_UPDATES_FILE = path.join(DATA_DIR, 'site-updates.json');

function loadSiteUpdates(): SiteUpdatesConfig {
  try {
    if (fs.existsSync(SITE_UPDATES_FILE)) {
      const raw = JSON.parse(fs.readFileSync(SITE_UPDATES_FILE, 'utf8'));
      return normalizeSiteUpdatesConfig(raw);
    }
  } catch {
    // Fallback to default config if file is unreadable
  }
  return { ...DEFAULT_SITE_UPDATES };
}

let cachedSiteUpdates: SiteUpdatesConfig = loadSiteUpdates();

function saveSiteUpdates(cfg: SiteUpdatesConfig) {
  cachedSiteUpdates = cfg;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SITE_UPDATES_FILE, JSON.stringify(cfg, null, 2), 'utf8');
  } catch {
    // Non-fatal if read-only filesystem
  }
}

function recordAlert(alert: CaregiverAlert) {
  alertHistory.unshift(alert);
  if (alertHistory.length > 50) {
    alertHistory.length = 50;
  }
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '8mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'cyberrakshak' });
  });

  // 1. Multi-language AI Assistant ("Saathi" — Astra/Fable calm voice & chat persona)
  app.post('/api/assistant', async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1500) : '';
      if (!message) {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      const lang = parseLanguage(body.language);
      const mode = body.mode === 'caregiver' ? 'caregiver' : 'senior';
      const seniorName = typeof body.seniorName === 'string' ? body.seniorName.trim().slice(0, 60) : '';
      const history = Array.isArray(body.history)
        ? body.history
            .slice(-6)
            .filter(
              (item: unknown): item is { role: 'user' | 'assistant'; text: string } =>
                typeof item === 'object' &&
                item !== null &&
                ((item as { role?: string }).role === 'user' ||
                  (item as { role?: string }).role === 'assistant') &&
                typeof (item as { text?: unknown }).text === 'string',
            )
        : [];

      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Add it in Secrets to enable Saathi AI responses.',
        });
        return;
      }

      const systemInstruction = buildSaathiSystemInstruction(lang, mode, seniorName);

      const trimmedHistory = [...history];
      while (trimmedHistory.length > 0 && trimmedHistory[0].role === 'assistant') {
        trimmedHistory.shift();
      }

      const contents = [
        ...trimmedHistory.map((turn: { role: 'user' | 'assistant'; text: string }) => ({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.text.slice(0, 800) }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ];

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'Empty response from AI assistant.' });
        return;
      }

      res.json({ reply, language: lang });
    } catch (err) {
      res.status(502).json({ error: formatGeminiError(err, 'Assistant request failed.') });
    }
  });

  // 1b. Low-latency SSE Streaming Assistant for Fable/Astra instant word-by-word replies
  app.post('/api/assistant/stream', async (req: Request, res: Response) => {
    const body = req.body ?? {};
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1500) : '';
    if (!message) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Add it in Secrets to enable Saathi AI responses.',
      });
      return;
    }

    const lang = parseLanguage(body.language);
    const mode = body.mode === 'caregiver' ? 'caregiver' : 'senior';
    const seniorName = typeof body.seniorName === 'string' ? body.seniorName.trim().slice(0, 60) : '';
    const history = Array.isArray(body.history)
      ? body.history
          .slice(-6)
          .filter(
            (item: unknown): item is { role: 'user' | 'assistant'; text: string } =>
              typeof item === 'object' &&
              item !== null &&
              ((item as { role?: string }).role === 'user' ||
                (item as { role?: string }).role === 'assistant') &&
              typeof (item as { text?: unknown }).text === 'string',
          )
      : [];

    const systemInstruction = buildSaathiSystemInstruction(lang, mode, seniorName);
    const trimmedHistory = [...history];
    while (trimmedHistory.length > 0 && trimmedHistory[0].role === 'assistant') {
      trimmedHistory.shift();
    }
    const contents = [
      ...trimmedHistory.map((turn: { role: 'user' | 'assistant'; text: string }) => ({
        role: turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: turn.text.slice(0, 800) }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const writeEvent = (payload: Record<string, unknown>) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    };

    let fullReply = '';
    try {
      const tryStreamModel = async (model: string, firstChunkTimeoutMs: number) => {
        const stream = await ai.models.generateContentStream({
          model,
          contents,
          config:
            model === 'gemini-4-hydrogen'
              ? { systemInstruction, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
              : { systemInstruction },
        });
        const iterator = stream[Symbol.asyncIterator]();
        let receivedAny = false;

        while (true) {
          const nextPromise = iterator.next();
          const step = !receivedAny
            ? await Promise.race([
                nextPromise,
                new Promise<never>((_, rej) =>
                  setTimeout(() => rej(new Error('Stream first-chunk timeout')), firstChunkTimeoutMs),
                ),
              ])
            : await nextPromise;

          if (step.done) break;
          receivedAny = true;
          const delta = step.value?.text ?? '';
          if (delta) {
            fullReply += delta;
            writeEvent({ delta });
          }
        }
      };

      try {
        await tryStreamModel('gemini-4-hydrogen', 4000);
      } catch (primaryErr) {
        if (fullReply.trim().length > 0) {
          // Partial text already streamed; complete cleanly
        } else {
          try {
            await tryStreamModel('gemini-3.1-flash-lite', 12000);
          } catch {
            throw primaryErr;
          }
        }
      }

      if (!fullReply.trim()) {
        writeEvent({ error: 'Saathi returned an empty reply. Please ask again.' });
      } else {
        writeEvent({ done: true, reply: fullReply.trim(), language: lang });
      }
    } catch (err) {
      writeEvent({ error: formatGeminiError(err, 'Assistant stream failed.') });
    } finally {
      if (!res.writableEnded) res.end();
    }
  });

  // 2. Audio transcription fallback (MediaRecorder -> Gemini 3.5 Transcribe)
  app.post('/api/transcribe', async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const audioBase64 = typeof body.audioBase64 === 'string' ? body.audioBase64.trim() : '';
      const mimeType = typeof body.mimeType === 'string' ? body.mimeType.trim() : 'audio/webm';
      const lang = parseLanguage(body.language);
      const langMeta = getLanguageMeta(lang);

      if (!audioBase64 || audioBase64.length > 6_000_000) {
        res.status(400).json({ error: 'Valid audio payload is required.' });
        return;
      }
      if (!/^audio\/(webm|wav|mp3|mpeg|ogg|mp4|aac)(;codecs=[a-z0-9]+)?$/i.test(mimeType)) {
        res.status(400).json({ error: 'Unsupported audio mimeType.' });
        return;
      }

      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server for audio transcription.',
        });
        return;
      }

      const cleanMime = mimeType.split(';')[0];
      let response;
      let lastTranscribeErr: unknown;
      for (const delay of [0, 500]) {
        if (delay > 0) await new Promise((r) => setTimeout(r, delay));
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.5-transcribe',
            contents: {
              parts: [
                { inlineData: { mimeType: cleanMime, data: audioBase64 } },
                {
                  text: `Transcribe this spoken question accurately. The speaker is likely speaking in ${langMeta.geminiLanguageName}. Return only the transcribed words.`,
                },
              ],
            },
          });
          break;
        } catch (err) {
          lastTranscribeErr = err;
        }
      }

      if (!response) {
        throw lastTranscribeErr;
      }

      const transcript = response.text?.trim() || '';
      res.json({ transcript });
    } catch (err) {
      res.status(502).json({ error: formatGeminiError(err, 'Audio transcription failed.') });
    }
  });

  // 3. Multilingual high-clarity TTS via Gemini 3.8 Flash Lite TTS (with server-side cache & quota cooldown)
  const serverTtsCache = new Map<string, string>();
  let serverTtsQuotaCooldownUntil = 0;
  app.post('/api/tts', async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const rawText = typeof body.text === 'string' ? body.text : '';
      const text = rawText
        .replace(/^\s*[-*•]\s+/gm, '')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`([^`]*)`/g, '$1')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 800);
      if (!text) {
        res.status(400).json({ error: 'Text is required for speech generation.' });
        return;
      }

      const lang = parseLanguage(body.language);
      const langMeta = getLanguageMeta(lang);
      const cacheKey = `${lang}:${text}`;
      const cachedWav = serverTtsCache.get(cacheKey);
      if (cachedWav) {
        res.json({ audioBase64: cachedWav, mimeType: 'audio/wav' });
        return;
      }

      if (Date.now() < serverTtsQuotaCooldownUntil) {
        res.json({
          audioBase64: null,
          quotaExceeded: true,
          fallbackToBrowser: true,
        });
        return;
      }

      const ai = getGenAIClient();
      if (!ai) {
        res.json({
          audioBase64: null,
          fallbackToBrowser: true,
          error: 'GEMINI_API_KEY is not configured on the server.',
        });
        return;
      }

      const styleInstruction = `Warm, calm, patient, elder-friendly Indian voice speaking naturally and clearly in ${langMeta.geminiLanguageName}`;
      let response;
      let lastErr: unknown;
      for (const delay of [0, 450]) {
        if (delay > 0) await new Promise((r) => setTimeout(r, delay));
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.8-flash-lite-tts',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text,
                    speechMetadata: {
                      style: styleInstruction,
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
            },
          });
          break;
        } catch (err) {
          lastErr = err;
          const msg = err instanceof Error ? err.message : String(err || '');
          if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.toLowerCase().includes('quota')) {
            serverTtsQuotaCooldownUntil = Date.now() + 180_000;
            res.json({
              audioBase64: null,
              quotaExceeded: true,
              fallbackToBrowser: true,
            });
            return;
          }
        }
      }

      if (!response) {
        throw lastErr;
      }

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        res.status(502).json({ error: 'Speech audio was not returned.' });
        return;
      }

      if (serverTtsCache.size >= 40) {
        const oldestKey = serverTtsCache.keys().next().value;
        if (oldestKey) serverTtsCache.delete(oldestKey);
      }
      serverTtsCache.set(cacheKey, base64Audio);

      res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
    } catch (err) {
      res.status(502).json({ error: formatGeminiError(err, 'TTS failed.') });
    }
  });

  // 4. Hybrid "Is This Safe?" Threat Analyzer (Deterministic rules + Gemini explanation)
  app.post('/api/analyze-threat', async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const text = typeof body.text === 'string' ? body.text.trim().slice(0, 2000) : '';
      if (!text) {
        res.status(400).json({ error: 'Message, URL, or app name is required.' });
        return;
      }

      const lang = parseLanguage(body.language);
      const langMeta = getLanguageMeta(lang);
      const reqTrusted = Array.isArray(body.extraTrustedDomains)
        ? body.extraTrustedDomains.filter((d: unknown): d is string => typeof d === 'string').slice(0, 30)
        : [];
      const mergedTrusted = Array.from(new Set([...cachedSiteUpdates.customTrustedDomains, ...reqTrusted]));
      const baseResult = analyzeThreatDeterministic(text, lang, mergedTrusted);

      const ai = getGenAIClient();
      if (!ai) {
        res.json({
          ...baseResult,
          aiError: 'GEMINI_API_KEY missing: showing deterministic rule assessment.',
        });
        return;
      }

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-4-hydrogen',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyze this message, website URL, or app name for an Indian senior citizen:\n"${text}"\n\nRule assessment: risk=${baseResult.riskLevel} (green=safe, yellow=caution, red=high risk), category=${baseResult.category}, flags=${baseResult.detectedFlags.join(', ')}.\n\nInstructions:\n- Respond ONLY in ${langMeta.geminiLanguageName}.\n- Match your verdict to the actual URL/message content and rule assessment.\n- Do NOT mention or speculate about whether a normal website is a bank or government portal unless the message itself claims to be a bank or government agency.\n- Give a clear 2-sentence plain-language explanation and 2 short, practical reasons.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: { type: Type.STRING },
              extraReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['explanation'],
          },
        },
      });

      let parsed: { explanation?: string; extraReasons?: string[] } = {};
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch {
        parsed = { explanation: response.text?.trim() };
      }

      res.json({
        ...baseResult,
        aiExplanation: parsed.explanation || undefined,
        reasons:
          Array.isArray(parsed.extraReasons) && parsed.extraReasons.length > 0
            ? [...new Set([...baseResult.reasons, ...parsed.extraReasons.slice(0, 2)])]
            : baseResult.reasons,
      });
    } catch (err) {
      res.status(502).json({ error: formatGeminiError(err, 'Threat explanation failed.') });
    }
  });

  // 5. Scam Gym AI Roleplay Simulator
  app.post('/api/scam-gym/simulate', async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const scenario = typeof body.scenario === 'string' ? body.scenario : 'kyc';
      const userReply = typeof body.userReply === 'string' ? body.userReply.trim().slice(0, 800) : '';
      const lang = parseLanguage(body.language);
      const langMeta = getLanguageMeta(lang);

      if (!userReply) {
        res.status(400).json({ error: 'Your practice reply is required.' });
        return;
      }

      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server for Scam Gym AI roleplay.',
        });
        return;
      }

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-4-hydrogen',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `We are running a safe Scam Gym training simulation for an Indian senior citizen.\nScenario: ${scenario}\nSenior's reply: "${userReply}"\n\nIn ${langMeta.geminiLanguageName}, act out the next short line of the fictional scammer (so the senior learns how scammers push harder), AND give a gentle coaching note + red flag identified in the scammer's tactic. Never ask for real sensitive personal data.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scammerReply: { type: Type.STRING },
              detectedRedFlag: { type: Type.STRING },
              coachFeedback: { type: Type.STRING },
              seniorPassed: { type: Type.BOOLEAN },
            },
            required: ['scammerReply', 'detectedRedFlag', 'coachFeedback', 'seniorPassed'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err) {
      res.status(502).json({ error: formatGeminiError(err, 'Scam Gym simulation failed.') });
    }
  });

  // 6. Caregiver Alert & WhatsApp Notification Dispatch
  app.get('/api/alerts/caregiver', (_req: Request, res: Response) => {
    res.json({ alerts: alertHistory });
  });

  app.post('/api/alerts/caregiver', (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const lang = parseLanguage(body.language);
      const profileInput = body.profile ?? {};
      const permissions: SafetyPermissions = {
        whatsappAlerts: Boolean(profileInput.permissions?.whatsappAlerts),
        messagesScan: Boolean(profileInput.permissions?.messagesScan),
        storageScan: Boolean(profileInput.permissions?.storageScan),
      };

      const validation = validateFamilyProfileInput({
        seniorName: String(profileInput.seniorName || ''),
        seniorPhone: String(profileInput.seniorPhone || ''),
        seniorEmail: typeof profileInput.seniorEmail === 'string' ? profileInput.seniorEmail : '',
        caregiverName: String(profileInput.caregiverName || ''),
        caregiverPhone: String(profileInput.caregiverPhone || ''),
        caregiverEmail: typeof profileInput.caregiverEmail === 'string' ? profileInput.caregiverEmail : '',
        permissions,
        privacyShareRawMessage: Boolean(profileInput.privacyShareRawMessage),
      });

      if (!validation.valid || !validation.normalized) {
        res.status(400).json({ error: 'Valid family profile and caregiver phone are required.', details: validation.errors });
        return;
      }

      const sourceType: AlertSourceType =
        body.sourceType === 'app' || body.sourceType === 'sms' || body.sourceType === 'call'
          ? body.sourceType
          : 'website';
      const riskLevel = body.riskLevel === 'green' || body.riskLevel === 'yellow' ? body.riskLevel : 'red';
      const category: ScamCategory =
        typeof body.category === 'string' ? (body.category as ScamCategory) : 'unknown';

      const targetSummary =
        typeof body.targetSummary === 'string' ? body.targetSummary.trim().slice(0, 180) : 'Suspicious activity';
      const maskedReason =
        typeof body.maskedReason === 'string' ? body.maskedReason.trim().slice(0, 240) : 'High-risk pattern detected';
      const rawSnippet = typeof body.rawSnippet === 'string' ? body.rawSnippet.trim().slice(0, 300) : undefined;

      const alert = buildWhatsAppAlertPayload({
        profile: validation.normalized,
        riskLevel,
        category,
        sourceType,
        targetSummary,
        maskedReason,
        rawSnippet,
        lang,
      });

      recordAlert(alert);
      res.status(201).json({ alert });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to log caregiver alert.';
      res.status(500).json({ error: msg });
    }
  });

  // 7. Modular Website Updates & Add-On Features Persistence
  app.get('/api/site-updates', (_req: Request, res: Response) => {
    res.json({ config: cachedSiteUpdates });
  });

  app.post('/api/site-updates', (req: Request, res: Response) => {
    try {
      const normalized = normalizeSiteUpdatesConfig(req.body?.config ?? req.body);
      normalized.updatedAt = new Date().toISOString();
      saveSiteUpdates(normalized);
      res.json({ config: normalized });
    } catch (err) {
      res.status(400).json({ error: formatGeminiError(err, 'Invalid website update configuration.') });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build.');
      }
    });
  }

  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    try {
      const parsed = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
      if (parsed.pathname === '/api/live') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    } catch {
      socket.destroy();
    }
  });

  // Real-time bidirectional Astra/Fable Voice Session via Gemini Live API (gemini-3.8-live)
  wss.on('connection', async (clientWs: WebSocket, req: http.IncomingMessage) => {
    const parsed = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const lang = parseLanguage(parsed.searchParams.get('lang'));
    const mode = parsed.searchParams.get('mode') === 'caregiver' ? 'caregiver' : 'senior';
    const seniorName = (parsed.searchParams.get('seniorName') || '').trim().slice(0, 60);

    const sendJson = (payload: Record<string, unknown>) => {
      if (clientWs.readyState === 1) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    const ai = getGenAIClient();
    if (!ai) {
      sendJson({ error: 'GEMINI_API_KEY is not configured on the server.' });
      clientWs.close();
      return;
    }

    let liveSession: Awaited<ReturnType<typeof ai.live.connect>> | null = null;
    const systemInstruction = buildSaathiSystemInstruction(lang, mode, seniorName);
    const sessionPromise = ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const content = message.serverContent;
          if (content?.inputTranscription?.text) {
            sendJson({ inputTranscript: content.inputTranscription.text });
          }
          if (content?.outputTranscription?.text) {
            sendJson({ outputTranscript: content.outputTranscription.text });
          }
          for (const part of content?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              sendJson({ audio: part.inlineData.data });
            }
          }
          if (content?.interrupted) {
            sendJson({ interrupted: true });
          }
          if (content?.turnComplete) {
            sendJson({ turnComplete: true });
          }
        },
        onerror: (err: unknown) => {
          sendJson({ error: formatGeminiError(err, 'Live voice session encountered an issue.') });
        },
        onclose: () => {
          sendJson({ closed: true });
        },
      },
    });

    clientWs.on('message', async (raw) => {
      try {
        const session = liveSession ?? (await sessionPromise);
        if (!session) return;
        const msg = JSON.parse(raw.toString()) as { audio?: string; text?: string };
        if (typeof msg.audio === 'string' && msg.audio) {
          session.sendRealtimeInput({
            audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (typeof msg.text === 'string' && msg.text.trim()) {
          session.sendClientContent({
            turns: [{ role: 'user', parts: [{ text: msg.text.trim().slice(0, 1500) }] }],
            turnComplete: true,
          });
        }
      } catch {
        // Ignore malformed client message frames or closed session
      }
    });

    clientWs.on('close', async () => {
      try {
        const session = liveSession ?? (await sessionPromise.catch(() => null));
        session?.close();
      } catch {
        // Ignore close cleanup errors
      }
      liveSession = null;
    });

    try {
      liveSession = await sessionPromise;
      sendJson({ ready: true, language: lang });
    } catch (err) {
      sendJson({ error: formatGeminiError(err, 'Unable to start live voice session.') });
      clientWs.close();
    }
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`CyberRakshak server listening on http://localhost:${PORT}`);
  });
}

startServer();
