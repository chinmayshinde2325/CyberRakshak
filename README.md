# CyberRakshak — Digital Safety & Cyber Fraud Shield for Senior Citizens

**CyberRakshak** is a voice-first, multilingual cyber-fraud protection platform and interactive **Scam Gym** built for Indian senior citizens and their family caregivers—with dedicated support for **English**, **Hindi**, **Marathi**, **Varhadi** *(Nagpur · Vidarbha)*, and **Gondi** *(Vidarbha · Gondwana)*.

> Seniors do not need another passive lecture. They need hands-on practice in their own language, instant message & link verification, and a family safety net.

---

## Key Features

- **Interactive 3D Cyber Defense Hero (`HeroSection` & `inner-green-3d.html`)**
  - WebGL interactive cyber-shield visual scene with floating quick controls (**Language Switcher**, **Optional Sign In / Family Setup**, and **Ask Saathi**).
- **Ask Saathi AI — Astra-Style Real-Time Voice & Chat Companion**
  - **Live Voice Call (Astra Mode):** Full-duplex WebSocket audio streaming (`/api/live`) powered by Gemini Live API (`gemini-3.8-live`) with 16kHz microphone capture, 24kHz gapless PCM playback, live transcription, animated reactive voice orb, and instant barge-in interruption.
  - **Streaming Chat + Spoken Replies:** Server-Sent Events (`/api/assistant/stream`) for low-latency responses with automatic Gemini TTS (`gemini-3.8-flash-lite-tts`) audio playback and regional browser speech synthesis fallback.
  - **Voice Input Across Regional Dialects:** Browser `SpeechRecognition` with automatic `MediaRecorder` + Gemini audio transcription (`/api/transcribe`) fallback for Varhadi and Gondi.
- **"Is This Safe?" — Hybrid Threat Analyzer & 1930 Helplines**
  - Deterministic URL, SMS, WhatsApp forward, and `.apk` analyzer combined with plain-language AI risk explanations (`SAFE`, `CAUTION`, `HIGH RISK`) without bank-only bias.
  - One-tap **1930 National Cyber Crime Helpline** dialing, `cybercrime.gov.in` reporting link, and major Indian bank fraud desk numbers.
- **Scam Gym & Mock Banking Safe-Browsing Sandbox**
  - Risk-free simulated bank KYC, **Digital Arrest**, **Jeevan Pramaan**, and lottery scam call practice with red-flag replays and golden rules.
  - Clicking suspicious sandbox links or APKs triggers safe blocking and caregiver alert previews.
- **Caregiver Dashboard & Optional SMS OTP Verification**
  - Consent-first caregiver pairing (`Senior Mode` / `Caregiver Mode`), privacy toggle (masked reasons vs. flagged snippet sharing), permission-scoped device scan simulation, and prefilled WhatsApp alerts.
  - Optional mobile OTP verification via **Fast2SMS** or **Twilio** (`/api/auth/otp/send` & `/api/auth/otp/verify`), with non-blocking guest access to Ask Saathi, Scam Gym, and Link Check.
- **Senior Scam News & Site Update Studio**
  - Filterable Maharashtra, Vidarbha, Nagpur, and national senior scam advisories with dates and direct **Practice in Scam Gym** / **Ask Saathi** actions.
  - Live **Site Update Studio** to toggle add-on modules (Emergency SOS card, Daily Safety Tip, Trusted Contacts Dial Book, PIN/UPI Checklist), publish custom feature cards, or add trusted domains, news alerts, and helplines with JSON export/import.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Motion |
| **3D Hero Scene** | Three.js WebGL interactive cyber-defense canvas + liquid-metal controls |
| **Backend** | Node.js, Express, `ws` WebSocket server, `tsx` |
| **AI & Voice** | `@google/genai` (`gemini-4-hydrogen`, `gemini-3.1-flash-lite`, `gemini-3.8-live`, `gemini-3.8-flash-lite-tts`, `gemini-3.5-transcribe`) |
| **Testing** | Node built-in test runner (`node:test` + `tsx`) |

---

## Project Structure

```text
├── index.html                        # HTML entry point & SEO metadata
├── server.ts                         # Express server, SSE streaming, Gemini Live WS (/api/live), OTP & alerts API
├── public/
│   └── landing-pages/
│       ├── inner-green-3d.html       # Interactive 3D cyber-defense hero scene
│       └── inner-green-assets/       # Local Three.js runtime, font & visual assets
└── src/
    ├── App.tsx                       # Main workspace orchestration & state persistence
    ├── data/
    │   └── scamNews.ts               # Multilingual scam news, sandbox items & Scam Gym scenarios
    ├── components/
    │   ├── HeroSection.tsx           # 3D hero wrapper & floating top controls
    │   ├── CommandBar.tsx            # Sticky navigation, Senior/Caregiver mode & 5-language switcher
    │   ├── SeniorHub.tsx             # Large-button elder home hub
    │   ├── ProtectSection.tsx        # "Is This Safe?" analyzer & 1930/bank helplines
    │   ├── ScamGymSection.tsx        # Simulated scam call trainer & mock banking sandbox
    │   ├── NewsSection.tsx           # Filterable senior cyber fraud advisories
    │   ├── VoiceAssistant.tsx        # Ask Saathi Astra/Fable orb, Live Voice & streaming chat drawer
    │   ├── CaregiverDashboard.tsx    # Family shield alerts, privacy controls & practice progress
    │   ├── OnboardingGate.tsx        # Optional caregiver setup & mobile SMS OTP modal
    │   ├── SiteUpdateStudio.tsx      # Modular live feature & content builder
    │   ├── AddedFeaturesSection.tsx  # Rendered add-on safety modules & SOS tools
    │   ├── StatsAndFunnelSection.tsx # I4C fraud metrics, 4-stage scam funnel & comparison table
    │   └── DangerWarningModal.tsx    # High-risk threat alert & WhatsApp notification modal
    └── utils/
        ├── i18n.ts                   # Complete translations (en, hi, mr, vrh, gon)
        ├── scamEngine.ts             # Deterministic threat scoring, phone validation & alert builder
        ├── speechPlayer.ts           # AudioContext-unlocked Gemini TTS + SpeechSynthesis fallback
        ├── liveVoiceClient.ts        # 16kHz mic capture & 24kHz gapless WebSocket audio player
        ├── otpService.ts             # HMAC-backed OTP store + Fast2SMS / Twilio dispatcher
        ├── siteUpdates.ts            # Sanitization & normalization for Site Update Studio
        └── *.test.ts                 # Unit tests for i18n, scam engine, OTP, speech & updates
```

---

## Getting Started

### Prerequisites

- **Node.js** `>= 20`
- **npm**
- A **Gemini API Key** (and optional **Fast2SMS** or **Twilio** credentials if enabling live SMS OTP delivery)

### Installation

```bash
git clone https://github.com/<your-username>/cyber-rakshak.git
cd cyber-rakshak
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure your keys:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Server-side key for Ask Saathi chat, streaming, Live Voice, transcription, TTS, and AI threat explanations |
| `APP_URL` | Optional | Public URL of the deployed application |
| `FAST2SMS_API_KEY` | Optional | Enables genuine Indian SMS OTP delivery via Fast2SMS |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio Account SID (alternative live SMS OTP provider) |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Optional | Twilio sender phone number |
| `SESSION_SECRET` | Optional | Custom HMAC secret used for single-use OTP verification tokens |

### Running Locally

Start the full-stack development server (Express API + WebSocket + Vite middleware on port `3000`):

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Scripts

```bash
npm run dev      # Start Express + Vite dev server on port 3000
npm run build    # Build production frontend bundle into dist/
npm run start    # Start production server (server.ts)
npm run lint     # Run TypeScript type checks (tsc --noEmit)
npm test         # Run unit tests (src/utils/*.test.ts)
```

---

## API Overview

| Endpoint / Socket | Method | Purpose |
| --- | --- | --- |
| `/api/health` | `GET` | Service health check |
| `/api/live` | `WS` | Real-time bidirectional voice bridge to Gemini Live (`gemini-3.8-live`) |
| `/api/assistant/stream` | `POST` | SSE streaming multilingual cyber-safety replies |
| `/api/assistant` | `POST` | Standard multilingual assistant endpoint |
| `/api/transcribe` | `POST` | Audio transcription fallback (`gemini-3.5-transcribe`) |
| `/api/tts` | `POST` | Multilingual speech synthesis (`gemini-3.8-flash-lite-tts`) |
| `/api/analyze-threat` | `POST` | Hybrid deterministic + AI safety analysis for links, SMS, and apps |
| `/api/scam-gym/reply` | `POST` | Simulated scammer dialogue turn generation |
| `/api/auth/otp/send` | `POST` | Send real SMS verification OTP |
| `/api/auth/otp/verify` | `POST` | Verify OTP code and return single-use confirmation token |
| `/api/alerts/caregiver` | `GET` / `POST` | Retrieve or record caregiver alerts & WhatsApp payloads |
| `/api/site-updates` | `GET` / `POST` | Load or save modular Site Update Studio configuration |

---

## Built For Impact

Designed for senior citizens and families across **Nagpur, Vidarbha, Maharashtra, and India** (*YCCE HACKkumbh Nagpur*), combining practical fraud rehearsal with instant regional voice support.

## License

Apache-2.0
