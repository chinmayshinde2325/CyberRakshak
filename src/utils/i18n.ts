import type { LanguageCode } from '../types/suraksha.ts';

export interface LanguageOption {
  code: LanguageCode;
  nativeLabel: string;
  regionHint: string;
  speechLocale: string;
  geminiLanguageName: string;
}

export const LANGUAGES: readonly LanguageOption[] = [
  {
    code: 'en',
    nativeLabel: 'English',
    regionHint: 'Default',
    speechLocale: 'en-IN',
    geminiLanguageName: 'English (simple Indian English)',
  },
  {
    code: 'hi',
    nativeLabel: 'हिन्दी',
    regionHint: 'Hindi',
    speechLocale: 'hi-IN',
    geminiLanguageName: 'Hindi (Devanagari script, warm respectful tone)',
  },
  {
    code: 'mr',
    nativeLabel: 'मराठी',
    regionHint: 'Maharashtra',
    speechLocale: 'mr-IN',
    geminiLanguageName: 'Marathi (Devanagari script, respectful elder tone)',
  },
  {
    code: 'vrh',
    nativeLabel: 'वऱ्हाडी',
    regionHint: 'Nagpur · Vidarbha',
    speechLocale: 'mr-IN',
    geminiLanguageName: 'Varhadi Marathi dialect spoken in Nagpur and Vidarbha (Devanagari script, warm respectful local phrasing)',
  },
  {
    code: 'gon',
    nativeLabel: 'गोंडी',
    regionHint: 'Vidarbha · Gondwana',
    speechLocale: 'hi-IN',
    geminiLanguageName: 'Gondi language as spoken around Nagpur and Vidarbha (written clearly in Devanagari script with simple respectful phrasing)',
  },
] as const;

export function getLanguageMeta(code: LanguageCode): LanguageOption {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export interface TranslationStrings {
  brandName: string;
  hero: {
    dockHome: string;
    dockPractice: string;
    dockProtect: string;
    dockNews: string;
    dockCaregiver: string;
    headlineLine1: string;
    headlineLine2: string;
    lede: string;
    exploreCta: string;
    playAria: string;
    stat1Label: string;
    stat1Value: string;
    stat2Label: string;
    stat2Value: string;
    card1Label: string;
    card1Title: string;
    card2Label: string;
    card2Title: string;
    discover: string;
    ghostWord: string;
    floatingLanguage: string;
    floatingSignIn: string;
    floatingSignedIn: string;
    floatingAskSaathi: string;
  };
  commandBar: {
    modeLabel: string;
    seniorMode: string;
    caregiverMode: string;
    languageLabel: string;
    setupProfileBtn: string;
    editProfileBtn: string;
    helpline1930: string;
    askVoiceBtn: string;
  };
  onboarding: {
    eyebrow: string;
    title: string;
    subtitle: string;
    seniorSectionTitle: string;
    caregiverSectionTitle: string;
    permissionsSectionTitle: string;
    nameLabel: string;
    phoneLabel: string;
    emailOptionalLabel: string;
    seniorNamePlaceholder: string;
    caregiverNamePlaceholder: string;
    phonePlaceholder: string;
    emailPlaceholder: string;
    permWhatsappTitle: string;
    permWhatsappDesc: string;
    permMessagesTitle: string;
    permMessagesDesc: string;
    permStorageTitle: string;
    permStorageDesc: string;
    privacyShareLabel: string;
    submitBtn: string;
    demoFillBtn: string;
    skipBtn: string;
    errRequiredName: string;
    errInvalidPhone: string;
    errInvalidEmail: string;
    errPermission: string;
    lockedNotice: string;
  };
  seniorHome: {
    greetingPrefix: string;
    subtitle: string;
    tileSafeTitle: string;
    tileSafeDesc: string;
    tileGymTitle: string;
    tileGymDesc: string;
    tileVoiceTitle: string;
    tileVoiceDesc: string;
    tileNewsTitle: string;
    tileNewsDesc: string;
  };
  stats: {
    sectionTitle: string;
    sectionSubtitle: string;
    sourceNote: string;
    statIndiaLabel: string;
    statIndiaSub: string;
    statMhLabel: string;
    statMhSub: string;
    statArrestLabel: string;
    statArrestSub: string;
    funnelTitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    comparisonTitle: string;
    colGap: string;
    colToday: string;
    colSaathi: string;
    gapRows: { aspect: string; today: string; saathi: string }[];
  };
  protect: {
    sectionTitle: string;
    sectionSubtitle: string;
    inputPlaceholder: string;
    analyzeBtn: string;
    analyzingBtn: string;
    loadSampleKyc: string;
    loadSampleArrest: string;
    loadSampleSafe: string;
    riskGreen: string;
    riskYellow: string;
    riskRed: string;
    whyHeading: string;
    nextStepsHeading: string;
    aiExplanationHeading: string;
    caregiverAlertedNotice: string;
    openWhatsappAlertBtn: string;
    helplineDirectoryTitle: string;
    call1930Btn: string;
    portalLinkLabel: string;
  };
  scamGym: {
    sectionTitle: string;
    sectionSubtitle: string;
    sandboxTitle: string;
    sandboxSubtitle: string;
    pretendBalanceLabel: string;
    sandboxHint: string;
    callGymTitle: string;
    callGymSubtitle: string;
    startCallBtn: string;
    replyPlaceholder: string;
    sendReplyBtn: string;
    refuseHangupBtn: string;
    redFlagReplayTitle: string;
    safeTipTitle: string;
    lessonsPassedLabel: string;
  };
  news: {
    sectionTitle: string;
    sectionSubtitle: string;
    filterAll: string;
    filterArrest: string;
    filterKyc: string;
    filterOtp: string;
    practiceThisBtn: string;
    askAssistantBtn: string;
  };
  caregiver: {
    sectionTitle: string;
    sectionSubtitle: string;
    familyCardTitle: string;
    seniorLabel: string;
    guardianLabel: string;
    permissionsLabel: string;
    learningProgressTitle: string;
    alertsFeedTitle: string;
    noAlertsYet: string;
    privacyMaskedNotice: string;
    privacySharedNotice: string;
    togglePrivacyBtn: string;
    runDeviceScanBtn: string;
    deviceScanTitle: string;
    blockedPermissionNote: string;
    sendWhatsappBtn: string;
    statusDispatched: string;
    statusNeedsPermission: string;
  };
  assistant: {
    drawerTitle: string;
    personaSubtitle: string;
    inputPlaceholder: string;
    sendBtn: string;
    listenBtn: string;
    listeningState: string;
    transcribingState: string;
    speakReplyToggle: string;
    micUnavailableHint: string;
    sampleQuestionsLabel: string;
    sampleQuestions: string[];
    welcomeMessage: string;
    processingTitle: string;
    processingStep1: string;
    processingStep2: string;
    processingStep3: string;
    preparingAudio: string;
    replayBtn: string;
    liveVoiceStartBtn: string;
    liveVoiceStopBtn: string;
    liveVoiceConnecting: string;
    liveVoiceActive: string;
    liveVoiceSpeaking: string;
    liveVoiceFallback: string;
    stopAudioBtn: string;
  };
  warningModal: {
    title: string;
    blockedTargetLabel: string;
    whatsappPrepared: string;
    whatsappSentBanner: string;
    guestBanner: string;
    openWhatsappBtn: string;
    addCaregiverBtn: string;
    dismissBtn: string;
    call1930Btn: string;
  };
  footer: {
    manifesto: string;
    hackathonCredit: string;
  };
  siteUpdates: {
    openStudioBtn: string;
    studioTitle: string;
    studioSubtitle: string;
    tabModules: string;
    tabCustomFeature: string;
    tabContent: string;
    tabBackup: string;
    sectionHeading: string;
    sectionSubheading: string;
    addBtn: string;
    saveBtn: string;
    resetBtn: string;
    exportBtn: string;
    importBtn: string;
    savedToast: string;
    modSosTitle: string;
    modSosDesc: string;
    modTipTitle: string;
    modTipDesc: string;
    modContactsTitle: string;
    modContactsDesc: string;
    modPinTitle: string;
    modPinDesc: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationStrings> = {
  en: {
    brandName: 'CyberRakshak',
    hero: {
      dockHome: 'Home',
      dockPractice: 'Scam Gym',
      dockProtect: 'Is This Safe',
      dockNews: 'Scam News',
      dockCaregiver: 'Caregiver',
      headlineLine1: 'Safety before',
      headlineLine2: 'the scam call',
      lede: 'Voice-guided fraud practice, instant link checks, and a family safety shield built for senior citizens across India.',
      exploreCta: 'Start Scam Gym',
      playAria: 'Listen to CyberRakshak voice guide',
      stat1Label: 'India cyber loss (2025)',
      stat1Value: '₹19,800+ Cr',
      stat2Label: 'Maharashtra (highest)',
      stat2Value: '₹3,203 Cr',
      card1Label: 'Family Shield',
      card1Title: 'Practice safely first.',
      card2Label: 'Alert 1930',
      card2Title: 'Spot the Red Flag',
      discover: 'Explore',
      ghostWord: 'RAKSHAK',
      floatingLanguage: 'Language',
      floatingSignIn: 'Sign In',
      floatingSignedIn: 'Family Linked',
      floatingAskSaathi: 'Ask Saathi',
    },
    commandBar: {
      modeLabel: 'View Mode',
      seniorMode: 'Senior Mode',
      caregiverMode: 'Caregiver Mode',
      languageLabel: 'Language',
      setupProfileBtn: 'Sign In / Family Setup',
      editProfileBtn: 'Edit Profile',
      helpline1930: '1930 Helpline',
      askVoiceBtn: 'Ask Saathi (Voice)',
    },
    onboarding: {
      eyebrow: 'Optional Caregiver Safety Link',
      title: 'Connect Senior & Caregiver Protection',
      subtitle: 'Ask Saathi AI and Scam Gym work freely without signing in. Add senior and caregiver numbers anytime to receive instant WhatsApp safety alerts.',
      seniorSectionTitle: 'Senior Citizen Details',
      caregiverSectionTitle: 'Caregiver / Family Guardian',
      permissionsSectionTitle: 'Protection Permissions (Clean & Consent-First)',
      nameLabel: 'Full Name',
      phoneLabel: '10-Digit Mobile / WhatsApp Number',
      emailOptionalLabel: 'Email Address (Optional)',
      seniorNamePlaceholder: 'e.g., Madhavrao Deshmukh',
      caregiverNamePlaceholder: 'e.g., Sneha Deshmukh',
      phonePlaceholder: 'e.g., 9823012345',
      emailPlaceholder: 'name@example.com',
      permWhatsappTitle: 'WhatsApp Alerts to Caregiver',
      permWhatsappDesc: 'Send instant WhatsApp warnings when a risky link, scam app, or fraud call is detected.',
      permMessagesTitle: 'Messages (SMS) Link Scan',
      permMessagesDesc: 'Check bank KYC, electricity, or lottery SMS text for hidden scam links.',
      permStorageTitle: 'Storage & App Fraud Scan',
      permStorageDesc: 'Detect risky downloaded APK files, screen-sharing tools, and scam call patterns.',
      privacyShareLabel: 'Allow caregiver to see flagged message snippets (off = warning reason only)',
      submitBtn: 'Activate Safety Shield',
      demoFillBtn: 'Fill Sample Nagpur Family',
      skipBtn: 'Skip for now',
      errRequiredName: 'Please enter a valid full name (at least 2 letters).',
      errInvalidPhone: 'Enter a valid 10-digit Indian mobile number starting with 6–9.',
      errInvalidEmail: 'Please enter a valid email address or leave it blank.',
      errPermission: 'Please enable at least one safety permission to activate protection.',
      lockedNotice: 'Ask Saathi AI, Scam Gym, and Link Check are ready to use right away. Optional: Sign In to link caregiver WhatsApp alerts.',
    },
    seniorHome: {
      greetingPrefix: 'Namaste,',
      subtitle: 'Simple, large-button protection. Choose one step below or tap the microphone to talk.',
      tileSafeTitle: '1. Is This Safe?',
      tileSafeDesc: 'Paste any SMS or website link to check if it is real or a scam.',
      tileGymTitle: '2. Practice Scam Gym',
      tileGymDesc: 'Try a safe practice call or bank screen before real scammers call.',
      tileVoiceTitle: '3. Talk to Saathi AI',
      tileVoiceDesc: 'Ask any question by speaking in English, Hindi, Marathi, Varhadi, or Gondi.',
      tileNewsTitle: '4. Senior Scam Alerts',
      tileNewsDesc: 'Read recent fraud news and call 1930 immediately if needed.',
    },
    stats: {
      sectionTitle: 'Why senior citizens need a practice range, not just posters',
      sectionSubtitle: 'Seniors do not need another passive lecture. They need hands-on practice in their own language and a family safety net.',
      sourceNote: 'Source: I4C (Ministry of Home Affairs): National Cyber Crime Reporting Portal & Supreme Court status reports, 2025',
      statIndiaLabel: 'Reported lost to cyber fraud across India in 2025',
      statIndiaSub: 'Nationwide portal total',
      statMhLabel: 'Reported lost in Maharashtra in 2025',
      statMhSub: 'Highest of any state',
      statArrestLabel: 'Digital-arrest complaints in 2025 (₹1,211 Cr lost)',
      statArrestSub: 'Coercive fake-police calls',
      funnelTitle: 'How the 4-stage scam trap works',
      step1Title: '1. Trust',
      step1Desc: 'Fake call claiming to be Police, CBI, Bank Officer, or MSEDCL.',
      step2Title: '2. Fear',
      step2Desc: '"Stay on the video call" or "Account blocked today" creates panic.',
      step3Title: '3. Panic',
      step3Desc: 'Victim shares OTP, installs AnyDesk APK, or transfers money.',
      step4Title: '4. Loss',
      step4Desc: 'Call disconnects and savings are gone before anyone realizes.',
      comparisonTitle: 'Passive warnings vs. CyberRakshak',
      colGap: 'Focus',
      colToday: "Today's Efforts",
      colSaathi: 'CyberRakshak',
      gapRows: [
        { aspect: 'Learning', today: 'Videos, posters and caller tunes: passive and one-way', saathi: 'Hands-on practice: simulated scam calls and mock banking sandbox' },
        { aspect: 'Access', today: 'One-size-fits-all warnings, not built for elders', saathi: 'Voice-first guidance in English, Hindi, Marathi, Varhadi & Gondi' },
        { aspect: 'Timing', today: 'Helplines act only after money is stolen', saathi: 'Checks message or link before you act, and explains why' },
        { aspect: 'Family', today: 'Caregivers find out too late', saathi: 'Caregiver WhatsApp alerts, progress tracking & senior consent' },
      ],
    },
    protect: {
      sectionTitle: 'Is This Safe? — Instant Message & Link Check',
      sectionSubtitle: 'Paste any SMS, WhatsApp forward, app name, or website link. High-risk threats warn you immediately and alert your caregiver on WhatsApp.',
      inputPlaceholder: 'Paste SMS, URL, or app name here (e.g., "Your SBI account suspended today: sbi-kyc-update.xyz")',
      analyzeBtn: 'Check Safety Now',
      analyzingBtn: 'Analyzing...',
      loadSampleKyc: 'Test Fake KYC SMS',
      loadSampleArrest: 'Test Digital Arrest',
      loadSampleSafe: 'Test Official SBI Link',
      riskGreen: 'SAFE — Clean & Verified Website',
      riskYellow: 'CAUTION — Verify First',
      riskRed: 'HIGH RISK — Likely Scam',
      whyHeading: 'Why we flagged this',
      nextStepsHeading: 'What to do next',
      aiExplanationHeading: 'Plain-Language Saathi Explanation',
      caregiverAlertedNotice: 'Caregiver WhatsApp Alert triggered automatically for this high-risk threat.',
      openWhatsappAlertBtn: 'Send WhatsApp Alert to Caregiver',
      helplineDirectoryTitle: 'One-Tap 1930 Cybercrime & Bank Helplines',
      call1930Btn: 'Dial 1930 National Cyber Helpline',
      portalLinkLabel: 'Report on cybercrime.gov.in',
    },
    scamGym: {
      sectionTitle: 'Practice: Scam Gym & Safe-Browsing Sandbox',
      sectionSubtitle: 'Click pretend links or rehearse a simulated AI scammer call with zero real-world risk. Opening any suspicious sandbox item triggers the real Caregiver WhatsApp alert.',
      sandboxTitle: 'Mock Banking & Safe-Browsing Sandbox',
      sandboxSubtitle: 'Test opening links and APK downloads safely — see how CyberRakshak blocks danger and notifies your caregiver.',
      pretendBalanceLabel: 'Practice Pension Balance (Mock)',
      sandboxHint: 'Tap any item below to simulate opening it:',
      callGymTitle: 'AI-Voiced Scam Call Practice',
      callGymSubtitle: 'Choose a scam type, read or listen to the caller, and practice refusing calmly.',
      startCallBtn: 'Start / Reset Call',
      replyPlaceholder: 'Type or speak your response to the caller...',
      sendReplyBtn: 'Reply to Caller',
      refuseHangupBtn: 'Hang Up & Call 1930',
      redFlagReplayTitle: 'Red-Flag Replay',
      safeTipTitle: 'Golden Rule',
      lessonsPassedLabel: 'Scenarios Practiced',
    },
    news: {
      sectionTitle: 'Recent Senior Citizen Cyber Scam Alerts',
      sectionSubtitle: 'Stay updated on active internet, WhatsApp, and phone frauds targeting seniors in Maharashtra, Nagpur, and across India.',
      filterAll: 'All Alerts',
      filterArrest: 'Digital Arrest',
      filterKyc: 'Fake KYC & APK',
      filterOtp: 'OTP & Pension',
      practiceThisBtn: 'Practice in Scam Gym',
      askAssistantBtn: 'Ask Saathi About This',
    },
    caregiver: {
      sectionTitle: 'Caregiver Safety Dashboard',
      sectionSubtitle: 'Monitor learning progress, review high-risk alerts without invading private messages, and run permission-based device checks.',
      familyCardTitle: 'Connected Family Safety Pair',
      seniorLabel: 'Senior Citizen',
      guardianLabel: 'Caregiver / Guardian',
      permissionsLabel: 'Active Safety Permissions',
      learningProgressTitle: 'Senior Practice Progress',
      alertsFeedTitle: 'Real-Time Suspicious Activity & WhatsApp Alerts',
      noAlertsYet: 'No high-risk alerts yet. Test a suspicious link in "Is This Safe?" or the Sandbox to verify live caregiver alerting.',
      privacyMaskedNotice: 'Privacy Mode Active: Warning reasons are visible; raw SMS content stays hidden.',
      privacySharedNotice: 'Consent Mode Active: Senior opted in to share short flagged snippets.',
      togglePrivacyBtn: 'Toggle Privacy Consent',
      runDeviceScanBtn: 'Run Storage, SMS & WhatsApp Fraud Scan',
      deviceScanTitle: 'Scanned Apps, APKs & Messages',
      blockedPermissionNote: 'Permission disabled in Family Setup — skipped to respect privacy.',
      sendWhatsappBtn: 'Open WhatsApp Alert',
      statusDispatched: 'WhatsApp Alert Ready / Logged',
      statusNeedsPermission: 'WhatsApp Permission Off',
    },
    assistant: {
      drawerTitle: 'Saathi AI — Voice & Chat Guide',
      personaSubtitle: 'Calm, voice-ready safety companion in your language',
      inputPlaceholder: 'Ask anything or tap the mic to speak...',
      sendBtn: 'Ask',
      listenBtn: 'Speak (Mic)',
      listeningState: 'Listening... speak now',
      transcribingState: 'Understanding your voice...',
      speakReplyToggle: 'Read replies aloud',
      micUnavailableHint: 'Microphone unavailable or blocked? Tap a quick voice question below or type normally.',
      sampleQuestionsLabel: 'Quick Voice Questions',
      sampleQuestions: [
        'Police called on video saying Digital Arrest. Is it real?',
        'Bank SMS says KYC blocked today with a link. Should I click?',
        'Someone asked me to install AnyDesk to claim pension.',
      ],
      welcomeMessage: 'Namaste! I am Saathi, your cyber safety helper. Ask me about any suspicious call, SMS, WhatsApp forward, or link — by typing or speaking.',
      processingTitle: 'Saathi is preparing your answer',
      processingStep1: 'Understanding your question...',
      processingStep2: 'Checking cyber-safety guidance...',
      processingStep3: 'Preparing simple response...',
      preparingAudio: 'Preparing spoken audio...',
      replayBtn: 'Listen',
      liveVoiceStartBtn: 'Live Voice Call (Astra)',
      liveVoiceStopBtn: 'End Live Voice',
      liveVoiceConnecting: 'Connecting live voice...',
      liveVoiceActive: 'Live voice on — speak freely',
      liveVoiceSpeaking: 'Saathi is speaking...',
      liveVoiceFallback: 'Live voice needs mic access or is busy — using fast voice & chat mode instead.',
      stopAudioBtn: 'Stop Voice',
    },
    warningModal: {
      title: 'Danger Blocked — Suspicious Activity Detected',
      blockedTargetLabel: 'Flagged Website / App / Message',
      whatsappPrepared: 'Caregiver Notification Dispatched',
      whatsappSentBanner: 'Alert generated for your caregiver via WhatsApp & Safety Feed.',
      guestBanner: 'Threat blocked safely. Sign in anytime to link a caregiver for automatic WhatsApp alerts.',
      openWhatsappBtn: 'Send Alert on WhatsApp Now',
      addCaregiverBtn: 'Sign In / Add Caregiver',
      dismissBtn: 'Close & Stay Safe',
      call1930Btn: 'Call 1930 Helpline',
    },
    footer: {
      manifesto: 'Seniors do not need another course. They need a practice range, a second pair of eyes, and a family safety net.',
      hackathonCredit: 'CyberRakshak · Digital Literacy & Cyber Fraud Awareness Assistant for Senior Citizens · YCCE HACKkumbh Nagpur',
    },
    siteUpdates: {
      openStudioBtn: 'Update / Add Features',
      studioTitle: 'Update Website & Add Features',
      studioSubtitle: 'Enable extra safety modules, publish custom feature cards, or add news alerts, safe domains, and helplines without changing existing sections.',
      tabModules: 'Safety Modules',
      tabCustomFeature: 'Custom Feature Card',
      tabContent: 'Alerts / Domains / Helplines',
      tabBackup: 'Export / Import',
      sectionHeading: 'Active Website Updates & Added Modules',
      sectionSubheading: 'Custom tools and community modules enabled via Site Update Studio.',
      addBtn: 'Add to Website',
      saveBtn: 'Save Changes',
      resetBtn: 'Reset Added Updates',
      exportBtn: 'Download Config JSON',
      importBtn: 'Import Config JSON',
      savedToast: 'Website updates saved and active.',
      modSosTitle: 'Emergency SOS Quick Card',
      modSosDesc: 'One-tap 1930 call, Cybercrime Portal, and instant caregiver WhatsApp SOS button.',
      modTipTitle: 'Daily Safety Tip Banner',
      modTipDesc: 'Rotating calm reminder in your selected language for safer browsing and calls.',
      modContactsTitle: 'Trusted Contacts Quick-Dial Book',
      modContactsDesc: 'Save family members, bank branch manager, or doctor numbers for instant one-tap calls.',
      modPinTitle: 'PIN & UPI Hygiene Self-Check',
      modPinDesc: 'Simple 4-item safety checklist to double-check UPI, SIM lock, and password habits.',
    },
  },
  hi: {
    brandName: 'CyberRakshak',
    hero: {
      dockHome: 'होम',
      dockPractice: 'स्कैम जिम',
      dockProtect: 'क्या सुरक्षित है',
      dockNews: 'ताज़ा खबरें',
      dockCaregiver: 'केयरगिवर',
      headlineLine1: 'धोखाधड़ी से पहले',
      headlineLine2: 'सजग सुरक्षा',
      lede: 'वरिष्ठ नागरिकों के लिए आवाज़-आधारित अभ्यास, तुरंत लिंक जांच और परिवार का व्हाट्सऐप सुरक्षा कवच।',
      exploreCta: 'स्कैम जिम शुरू करें',
      playAria: 'CyberRakshak आवाज़ परिचय सुनें',
      stat1Label: 'भारत में साइबर नुकसान (2025)',
      stat1Value: '₹19,800+ करोड़',
      stat2Label: 'महाराष्ट्र (देश में सर्वाधिक)',
      stat2Value: '₹3,203 करोड़',
      card1Label: 'परिवार सुरक्षा',
      card1Title: 'पहले सुरक्षित अभ्यास करें।',
      card2Label: 'हेल्पलाइन 1930',
      card2Title: 'धोखे के संकेत पहचानें',
      discover: 'आगे देखें',
      ghostWord: 'रक्षक',
      floatingLanguage: 'भाषा',
      floatingSignIn: 'साइन इन',
      floatingSignedIn: 'परिवार जुड़ा है',
      floatingAskSaathi: 'साथी से पूछें',
    },
    commandBar: {
      modeLabel: 'मोड चुनें',
      seniorMode: 'वरिष्ठ नागरिक मोड',
      caregiverMode: 'केयरगिवर मोड',
      languageLabel: 'भाषा',
      setupProfileBtn: 'साइन इन / परिवार सेटअप',
      editProfileBtn: 'प्रोफ़ाइल बदलें',
      helpline1930: '1930 हेल्पलाइन',
      askVoiceBtn: 'साथी से बोलकर पूछें',
    },
    onboarding: {
      eyebrow: 'वैकल्पिक केयरगिवर सुरक्षा लिंक',
      title: 'वरिष्ठ नागरिक और केयरगिवर को जोड़ें',
      subtitle: 'साथी AI और स्कैम जिम बिना लॉगिन के तुरंत चलते हैं। संदिग्ध लिंक खुलने पर WhatsApp अलर्ट पाने के लिए आप कभी भी नंबर जोड़ सकते हैं।',
      seniorSectionTitle: 'वरिष्ठ नागरिक की जानकारी',
      caregiverSectionTitle: 'केयरगिवर / परिवार के सदस्य',
      permissionsSectionTitle: 'सुरक्षा अनुमतियाँ (सरल और सुरक्षित)',
      nameLabel: 'पूरा नाम',
      phoneLabel: '10 अंकों का मोबाइल / WhatsApp नंबर',
      emailOptionalLabel: 'ईमेल (वैकल्पिक)',
      seniorNamePlaceholder: 'जैसे: माधवराव देशमुख',
      caregiverNamePlaceholder: 'जैसे: स्नेहा देशमुख',
      phonePlaceholder: 'जैसे: 9823012345',
      emailPlaceholder: 'name@example.com',
      permWhatsappTitle: 'केयरगिवर को WhatsApp अलर्ट',
      permWhatsappDesc: 'संदिग्ध लिंक, नकली ऐप या धोखाधड़ी दिखते ही तुरंत केयरगिवर को WhatsApp चेतावनी भेजें।',
      permMessagesTitle: 'मैसेज (SMS) लिंक जांच',
      permMessagesDesc: 'बैंक KYC, बिजली बिल या लॉटरी SMS में छिपे नकली लिंक जांचें।',
      permStorageTitle: 'स्टोरेज और ऐप सुरक्षा स्कैन',
      permStorageDesc: 'डाउनलोड की गई खतरनाक APK फ़ाइलें, स्क्रीन-शेयरिंग ऐप और फ्रॉड कॉल पैटर्न पहचानें।',
      privacyShareLabel: 'केयरगिवर को संदिग्ध मैसेज का छोटा अंश दिखाएं (बंद रखने पर केवल चेतावनी कारण दिखेगा)',
      submitBtn: 'सुरक्षा कवच चालू करें',
      demoFillBtn: 'नागपुर डेमो परिवार भरें',
      skipBtn: 'अभी छोड़ें',
      errRequiredName: 'कृपया कम से कम 2 अक्षरों का सही नाम लिखें।',
      errInvalidPhone: 'कृपया 6–9 से शुरू होने वाला 10 अंकों का सही मोबाइल नंबर डालें।',
      errInvalidEmail: 'सही ईमेल लिखें या खाली छोड़ दें।',
      errPermission: 'सुरक्षा शुरू करने के लिए कम से कम एक अनुमति चालू करें।',
      lockedNotice: 'साथी AI, स्कैम जिम और लिंक जांच अभी उपयोग के लिए तैयार हैं। वैकल्पिक: WhatsApp अलर्ट के लिए साइन इन करें।',
    },
    seniorHome: {
      greetingPrefix: 'नमस्ते,',
      subtitle: 'बड़े बटन और सरल भाषा। नीचे से एक विकल्प चुनें या माइक दबाकर बोलें।',
      tileSafeTitle: '1. क्या यह सुरक्षित है?',
      tileSafeDesc: 'कोई भी SMS या वेबसाइट लिंक डालकर जांचें कि वह असली है या धोखा।',
      tileGymTitle: '2. स्कैम जिम अभ्यास',
      tileGymDesc: 'नकली बैंक कॉल और सुरक्षित सैंडबॉक्स में बिना किसी जोखिम के अभ्यास करें।',
      tileVoiceTitle: '3. साथी AI से बात करें',
      tileVoiceDesc: 'हिन्दी, मराठी, वऱ्हाडी, गोंडी या अंग्रेज़ी में बोलकर कोई भी सवाल पूछें।',
      tileNewsTitle: '4. ताज़ा साइबर फ्रॉड खबरें',
      tileNewsDesc: 'वरिष्ठ नागरिकों के साथ हो रहे नए ऑनलाइन फ्रॉड पढ़ें और 1930 की मदद लें।',
    },
    stats: {
      sectionTitle: 'वरिष्ठ नागरिकों को सिर्फ पोस्टर नहीं, अभ्यास का मैदान चाहिए',
      sectionSubtitle: 'पोस्टर और कॉलर ट्यून से बचाव नहीं होता। अपनी भाषा में अभ्यास और परिवार का साथ ज़रूरी है।',
      sourceNote: 'स्रोत: I4C (गृह मंत्रालय): राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल और सुप्रीम कोर्ट रिपोर्ट, 2025',
      statIndiaLabel: '2025 में पूरे भारत में साइबर फ्रॉड से नुकसान',
      statIndiaSub: 'राष्ट्रीय पोर्टल डेटा',
      statMhLabel: '2025 में महाराष्ट्र में नुकसान',
      statMhSub: 'देश में सबसे ज़्यादा',
      statArrestLabel: '2025 में डिजिटल अरेस्ट की शिकायतें (₹1,211 करोड़)',
      statArrestSub: 'नकली पुलिस वीडियो कॉल',
      funnelTitle: 'ठगी के 4 चरण कैसे काम करते हैं',
      step1Title: '1. भरोसा',
      step1Desc: 'पुलिस, CBI, बैंक या बिजली विभाग बनकर नकली कॉल।',
      step2Title: '2. डर',
      step2Desc: '"वीडियो कॉल पर बने रहें" या "आज खाता बंद होगा" कहकर घबराना।',
      step3Title: '3. घबराहट',
      step3Desc: 'पीड़ित OTP बता देता है या पैसे ट्रांसफर कर देता है।',
      step4Title: '4. नुकसान',
      step4Desc: 'कॉल कटते ही जीवन भर की जमा पूंजी चली जाती है।',
      comparisonTitle: 'पुराने तरीके बनाम CyberRakshak',
      colGap: 'पहलू',
      colToday: 'आज के प्रयास',
      colSaathi: 'CyberRakshak',
      gapRows: [
        { aspect: 'सीखना', today: 'एकतरफा वीडियो और पोस्टर', saathi: 'नकली कॉल और सुरक्षित बैंकिंग सैंडबॉक्स में अभ्यास' },
        { aspect: 'पहुँच', today: 'एक जैसी जटिल चेतावनियाँ', saathi: 'हिन्दी, मराठी, वऱ्हाडी, गोंडी और अंग्रेज़ी में बड़े अक्षर व आवाज़' },
        { aspect: 'समय', today: 'पैसे जाने के बाद हेल्पलाइन', saathi: 'क्लिक करने से पहले लिंक और मैसेज की जांच' },
        { aspect: 'परिवार', today: 'परिजनों को बहुत देर से पता चलता है', saathi: 'केयरगिवर को तुरंत WhatsApp अलर्ट व सहमति आधारित देखरेख' },
      ],
    },
    protect: {
      sectionTitle: 'क्या यह सुरक्षित है? — तुरंत मैसेज और लिंक जांच',
      sectionSubtitle: 'कोई भी SMS, WhatsApp मैसेज, ऐप या लिंक यहाँ डालें। बड़ा खतरा दिखते ही आपको चेतावनी और केयरगिवर को WhatsApp अलर्ट जाएगा।',
      inputPlaceholder: 'यहाँ SMS, लिंक या ऐप का नाम पेस्ट करें (जैसे: sbi-kyc-update.xyz)',
      analyzeBtn: 'सुरक्षा जांचें',
      analyzingBtn: 'जांच हो रही है...',
      loadSampleKyc: 'नकली KYC SMS जांचें',
      loadSampleArrest: 'डिजिटल अरेस्ट जांचें',
      loadSampleSafe: 'असली SBI लिंक जांचें',
      riskGreen: 'सुरक्षित — स्वच्छ और विश्वसनीय लिंक',
      riskYellow: 'सावधान — पहले पुष्टि करें',
      riskRed: 'बड़ा खतरा — धोखाधड़ी की संभावना',
      whyHeading: 'खतरा क्यों बताया गया',
      nextStepsHeading: 'अब आगे क्या करें',
      aiExplanationHeading: 'साथी AI की सरल समझाइश',
      caregiverAlertedNotice: 'इस बड़े खतरे के लिए केयरगिवर का WhatsApp अलर्ट तुरंत तैयार हो गया है।',
      openWhatsappAlertBtn: 'केयरगिवर को WhatsApp अलर्ट भेजें',
      helplineDirectoryTitle: 'एक-टैप 1930 और बैंक हेल्पलाइन नंबर',
      call1930Btn: '1930 साइबर हेल्पलाइन पर कॉल करें',
      portalLinkLabel: 'cybercrime.gov.in पर रिपोर्ट करें',
    },
    scamGym: {
      sectionTitle: 'अभ्यास: स्कैम जिम और सुरक्षित सैंडबॉक्स',
      sectionSubtitle: 'बिना किसी नुकसान के नकली लिंक खोलने और AI ठग की कॉल को संभालने का अभ्यास करें।',
      sandboxTitle: 'मॉक बैंकिंग और सुरक्षित ब्राउज़िंग सैंडबॉक्स',
      sandboxSubtitle: 'यहाँ किसी भी संदिग्ध लिंक या APK पर क्लिक करके देखें कि CyberRakshak कैसे बचाता है और केयरगिवर को सूचित करता है।',
      pretendBalanceLabel: 'अभ्यास पेंशन बैलेंस (नकली)',
      sandboxHint: 'जांचने के लिए नीचे किसी भी लिंक या ऐप पर टैप करें:',
      callGymTitle: 'AI आवाज़ वाला नकली कॉल अभ्यास',
      callGymSubtitle: 'ठगी का प्रकार चुनें और शांति से मना करने का अभ्यास करें।',
      startCallBtn: 'कॉल शुरू / रीसेट करें',
      replyPlaceholder: 'कॉल करने वाले को अपना जवाब लिखें या बोलें...',
      sendReplyBtn: 'जवाब भेजें',
      refuseHangupBtn: 'फोन काटें और 1930 मिलाएं',
      redFlagReplayTitle: 'खतरे के संकेत रीप्ले',
      safeTipTitle: 'सुनहरा नियम',
      lessonsPassedLabel: 'अभ्यास पूरे किए',
    },
    news: {
      sectionTitle: 'वरिष्ठ नागरिकों से जुड़े ताज़ा साइबर फ्रॉड समाचार',
      sectionSubtitle: 'नागपुर, महाराष्ट्र और भारत में बुज़ुर्गों को निशाना बनाने वाले ताज़ा ऑनलाइन और व्हाट्सऐप घोटालों की खबरें।',
      filterAll: 'सभी खबरें',
      filterArrest: 'डिजिटल अरेस्ट',
      filterKyc: 'नकली KYC / APK',
      filterOtp: 'OTP और पेंशन',
      practiceThisBtn: 'स्कैम जिम में अभ्यास करें',
      askAssistantBtn: 'साथी से इसके बारे में पूछें',
    },
    caregiver: {
      sectionTitle: 'केयरगिवर सुरक्षा डैशबोर्ड',
      sectionSubtitle: 'बुज़ुर्ग के अभ्यास की प्रगति देखें, निजी चैट पढ़े बिना खतरे के अलर्ट पाएं और स्टोरेज/मैसेज स्कैन चलाएं।',
      familyCardTitle: 'पंजीकृत परिवार सुरक्षा जोड़ी',
      seniorLabel: 'वरिष्ठ नागरिक',
      guardianLabel: 'केयरगिवर / परिजन',
      permissionsLabel: 'सक्रिय अनुमतियाँ',
      learningProgressTitle: 'वरिष्ठ नागरिक अभ्यास प्रगति',
      alertsFeedTitle: 'ताज़ा संदिग्ध गतिविधि और WhatsApp अलर्ट',
      noAlertsYet: 'अभी कोई खतरा अलर्ट नहीं है। जांचने के लिए सैंडबॉक्स में कोई संदिग्ध लिंक खोलकर देखें।',
      privacyMaskedNotice: 'गोपनीयता मोड चालू: केवल खतरे का कारण दिख रहा है; पूरा SMS छिपा है।',
      privacySharedNotice: 'सहमति मोड चालू: वरिष्ठ की अनुमति से संदिग्ध अंश दिख रहा है।',
      togglePrivacyBtn: 'गोपनीयता सहमति बदलें',
      runDeviceScanBtn: 'स्टोरेज, SMS और WhatsApp स्कैन चलाएं',
      deviceScanTitle: 'जांची गई फ़ाइलें, ऐप्स और मैसेज',
      blockedPermissionNote: 'परिवार सेटअप में यह अनुमति बंद है — गोपनीयता के कारण छोड़ा गया।',
      sendWhatsappBtn: 'WhatsApp अलर्ट खोलें',
      statusDispatched: 'WhatsApp अलर्ट तैयार / दर्ज',
      statusNeedsPermission: 'WhatsApp अनुमति बंद',
    },
    assistant: {
      drawerTitle: 'साथी AI — आवाज़ और चैट सहायक',
      personaSubtitle: 'आपकी अपनी भाषा में बोलने और सुनने वाला सुरक्षित सहायक',
      inputPlaceholder: 'अपना सवाल लिखें या माइक दबाकर बोलें...',
      sendBtn: 'पूछें',
      listenBtn: 'बोलें (माइक)',
      listeningState: 'सुन रहा हूँ... अब बोलिए',
      transcribingState: 'आपकी आवाज़ समझी जा रही है...',
      speakReplyToggle: 'जवाब बोलकर सुनाएं',
      micUnavailableHint: 'यदि माइक उपलब्ध नहीं है, तो नीचे दिए त्वरित वॉइस सवाल चुनें या टाइप करें।',
      sampleQuestionsLabel: 'त्वरित वॉइस प्रश्न',
      sampleQuestions: [
        'पुलिस वीडियो कॉल करके डिजिटल अरेस्ट बोल रही है, क्या सच है?',
        'बैंक के नाम से KYC लिंक आया है, क्या खोलूँ?',
        'पेंशन के लिए AnyDesk ऐप डालने को कहा है, क्या करूँ?',
      ],
      welcomeMessage: 'नमस्ते! मैं साथी हूँ, आपका साइबर सुरक्षा सहायक। किसी भी संदिग्ध कॉल, SMS या लिंक के बारे में बोलकर या लिखकर पूछें।',
      processingTitle: 'साथी आपका जवाब तैयार कर रहा है',
      processingStep1: 'आपका सवाल समझा जा रहा है...',
      processingStep2: 'साइबर सुरक्षा नियम देखे जा रहे हैं...',
      processingStep3: 'सरल भाषा में उत्तर बनाया जा रहा है...',
      preparingAudio: 'आवाज़ तैयार की जा रही है...',
      replayBtn: 'सुनें',
      liveVoiceStartBtn: 'लाइव वॉइस कॉल (Astra)',
      liveVoiceStopBtn: 'लाइव कॉल बंद करें',
      liveVoiceConnecting: 'लाइव वॉइस जुड़ रहा है...',
      liveVoiceActive: 'लाइव वॉइस चालू — आराम से बोलें',
      liveVoiceSpeaking: 'साथी बोल रहा है...',
      liveVoiceFallback: 'लाइव माइक उपलब्ध नहीं होने पर तेज़ चैट और आवाज़ मोड चालू है।',
      stopAudioBtn: 'आवाज़ रोकें',
    },
    warningModal: {
      title: 'खतरा रोका गया — संदिग्ध लिंक या ऐप मिला',
      blockedTargetLabel: 'संदिग्ध वेबसाइट / ऐप / मैसेज',
      whatsappPrepared: 'केयरगिवर को सूचना भेजी गई',
      whatsappSentBanner: 'आपके केयरगिवर के लिए WhatsApp और डैशबोर्ड अलर्ट भेज दिया गया है।',
      guestBanner: 'खतरा सुरक्षित रूप से रोक दिया गया है। WhatsApp अलर्ट पाने के लिए केयरगिवर जोड़ें।',
      openWhatsappBtn: 'अभी WhatsApp पर अलर्ट भेजें',
      addCaregiverBtn: 'साइन इन / केयरगिवर जोड़ें',
      dismissBtn: 'बंद करें और सुरक्षित रहें',
      call1930Btn: '1930 हेल्पलाइन मिलाएं',
    },
    footer: {
      manifesto: 'वरिष्ठ नागरिकों को सिर्फ एक और कोर्स नहीं चाहिए — उन्हें अभ्यास का मैदान, दूसरी नज़र और परिवार का सुरक्षा कवच चाहिए।',
      hackathonCredit: 'CyberRakshak · वरिष्ठ नागरिकों के लिए डिजिटल साक्षरता व साइबर फ्रॉड सुरक्षा सहायक · YCCE HACKkumbh नागपुर',
    },
    siteUpdates: {
      openStudioBtn: 'वेबसाइट अपडेट / फीचर जोड़ें',
      studioTitle: 'वेबसाइट अपडेट और नए फीचर जोड़ें',
      studioSubtitle: 'मौजूदा वेबसाइट को बदले बिना नए सुरक्षा मॉड्यूल, कस्टम कार्ड, खबरें, सुरक्षित डोमेन और हेल्पलाइन नंबर जोड़ें।',
      tabModules: 'सुरक्षा मॉड्यूल',
      tabCustomFeature: 'नया फीचर कार्ड',
      tabContent: 'खबरें / डोमेन / नंबर',
      tabBackup: 'एक्सपोर्ट / इम्पोर्ट',
      sectionHeading: 'वेबसाइट में जोड़े गए नए फीचर',
      sectionSubheading: 'अपडेट स्टूडियो से चालू किए गए अतिरिक्त सुरक्षा टूल्स।',
      addBtn: 'वेबसाइट में जोड़ें',
      saveBtn: 'बदलाव सेव करें',
      resetBtn: 'जोड़े गए अपडेट हटाएं',
      exportBtn: 'कॉन्फ़िग JSON डाउनलोड करें',
      importBtn: 'कॉन्फ़िग JSON अपलोड करें',
      savedToast: 'वेबसाइट अपडेट सेव और लागू हो गए।',
      modSosTitle: 'आपातकालीन SOS त्वरित कार्ड',
      modSosDesc: 'एक टैप में 1930 कॉल, साइबरक्राइम पोर्टल और परिवार को WhatsApp SOS बटन।',
      modTipTitle: 'दैनिक सुरक्षा सुझाव पट्टी',
      modTipDesc: 'आपकी चुनी हुई भाषा में सुरक्षित कॉल व इंटरनेट उपयोग की सरल याद।',
      modContactsTitle: 'विश्वसनीय संपर्क डायल बुक',
      modContactsDesc: 'परिवार, बैंक मैनेजर या डॉक्टर के नंबर सुरक्षित रखकर एक टैप में कॉल करें।',
      modPinTitle: 'PIN और UPI सुरक्षा जांच सूची',
      modPinDesc: 'UPI, सिम लॉक और पासवर्ड सुरक्षित रखने के 4 आसान नियम जांचें।',
    },
  },
  mr: {
    brandName: 'CyberRakshak',
    hero: {
      dockHome: 'मुख्यपृष्ठ',
      dockPractice: 'स्कॅम जिम',
      dockProtect: 'सुरक्षित आहे का',
      dockNews: 'ताज्या बातम्या',
      dockCaregiver: 'केअरगिव्हर',
      headlineLine1: 'फसवणुकीपूर्वीच',
      headlineLine2: 'सुरक्षित पाऊल',
      lede: 'ज्येष्ठ नागरिकांसाठी आवाजाद्वारे सराव, तात्काळ लिंक तपासणी आणि कुटुंबाचे WhatsApp सुरक्षा कवच.',
      exploreCta: 'स्कॅम जिम सुरू करा',
      playAria: 'CyberRakshak आवाज परिचय ऐका',
      stat1Label: 'भारतातील सायबर तोटा (2025)',
      stat1Value: '₹19,800+ कोटी',
      stat2Label: 'महाराष्ट्र (देशात सर्वाधिक)',
      stat2Value: '₹3,203 कोटी',
      card1Label: 'कौटुंबिक कवच',
      card1Title: 'आधी सुरक्षित सराव करा.',
      card2Label: 'हेल्पलाइन 1930',
      card2Title: 'धोक्याची खूण ओळखा',
      discover: 'पुढे पहा',
      ghostWord: 'रक्षक',
      floatingLanguage: 'भाषा',
      floatingSignIn: 'साइन इन',
      floatingSignedIn: 'कुटुंब जोडलेले',
      floatingAskSaathi: 'साथीला विचारा',
    },
    commandBar: {
      modeLabel: 'मोड निवडा',
      seniorMode: 'ज्येष्ठ नागरिक मोड',
      caregiverMode: 'केअरगिव्हर मोड',
      languageLabel: 'भाषा',
      setupProfileBtn: 'साइन इन / कुटुंब सेटअप',
      editProfileBtn: 'माहिती बदला',
      helpline1930: '1930 हेल्पलाइन',
      askVoiceBtn: 'साथीला बोलून विचारा',
    },
    onboarding: {
      eyebrow: 'ऐच्छिक केअरगिव्हर सुरक्षा जोडणी',
      title: 'ज्येष्ठ नागरिक आणि केअरगिव्हर जोडा',
      subtitle: 'साथी AI आणि स्कॅम जिम साइन इन शिवाय लगेच वापरता येतात. संशयास्पद लिंक उघडताच WhatsApp अलर्ट मिळवण्यासाठी माहिती भरा.',
      seniorSectionTitle: 'ज्येष्ठ नागरिकाची माहिती',
      caregiverSectionTitle: 'केअरगिव्हर / कुटुंबातील जबाबदार व्यक्ती',
      permissionsSectionTitle: 'सुरक्षा परवानग्या (सोप्या व संमतीने)',
      nameLabel: 'पूर्ण नाव',
      phoneLabel: '10 अंकी मोबाईल / WhatsApp नंबर',
      emailOptionalLabel: 'ईमेल (ऐच्छिक)',
      seniorNamePlaceholder: 'उदा. माधवराव देशमुख',
      caregiverNamePlaceholder: 'उदा. स्नेहा देशमुख',
      phonePlaceholder: 'उदा. 9823012345',
      emailPlaceholder: 'name@example.com',
      permWhatsappTitle: 'केअरगिव्हरला WhatsApp अलर्ट',
      permWhatsappDesc: 'धोकादायक लिंक, बनावट अ‍ॅप किंवा कॉल आढळताच केअरगिव्हरला WhatsApp वर सूचना पाठवा.',
      permMessagesTitle: 'मेसेज (SMS) लिंक तपासणी',
      permMessagesDesc: 'बँक KYC, वीज बिल किंवा लॉटरी SMS मधील बनावट लिंक तपासा.',
      permStorageTitle: 'स्टोरेज व अ‍ॅप फसवणूक स्कॅन',
      permStorageDesc: 'डाऊनलोड केलेल्या संशयास्पद APK फाईल्स, स्क्रीन-शेअरिंग अ‍ॅप्स आणि फ्रॉड कॉल्स शोधा.',
      privacyShareLabel: 'केअरगिव्हरला संशयास्पद मेसेजचा छोटा भाग दाखवा (बंद = फक्त इशाऱ्याचे कारण)',
      submitBtn: 'सुरक्षा कवच सुरू करा',
      demoFillBtn: 'नागपूर नमुना कुटुंब भरा',
      skipBtn: 'आत्तासाठी वगळा',
      errRequiredName: 'कृपया किमान 2 अक्षरांचे अचूक नाव टाका.',
      errInvalidPhone: 'कृपया 6–9 ने सुरू होणारा 10 अंकी मोबाईल नंबर टाका.',
      errInvalidEmail: 'वैध ईमेल टाका किंवा रिकामा ठेवा.',
      errPermission: 'सुरक्षा सुरू करण्यासाठी किमान एक परवानगी चालू करा.',
      lockedNotice: 'साथी AI, स्कॅम जिम आणि लिंक तपासणी आता थेट वापरता येते. ऐच्छिक: WhatsApp अलर्टसाठी साइन इन करा.',
    },
    seniorHome: {
      greetingPrefix: 'नमस्कार,',
      subtitle: 'मोठे बटणे आणि सोपी मराठी. खालील पर्याय निवडा किंवा माइक दाबून बोला.',
      tileSafeTitle: '1. हे सुरक्षित आहे का?',
      tileSafeDesc: 'कोणताही SMS किंवा वेब लिंक तपासून पाहा की ती खरी आहे की फसवणूक.',
      tileGymTitle: '2. स्कॅम जिम सराव',
      tileGymDesc: 'खरा ठग फोन करण्यापूर्वी नकली बँक स्क्रीन व कॉलचा सुरक्षित सराव करा.',
      tileVoiceTitle: '3. साथी AI शी बोला',
      tileVoiceDesc: 'मराठी, वऱ्हाडी, गोंडी, हिंदी किंवा इंग्रजीत बोलून कोणतीही शंका विचारा.',
      tileNewsTitle: '4. ताज्या फ्रॉड बातम्या',
      tileNewsDesc: 'ज्येष्ठ नागरिकांवर होणाऱ्या नवीन सायबर हल्ल्यांची माहिती व 1930 मदत.',
    },
    stats: {
      sectionTitle: 'ज्येष्ठ नागरिकांना फक्त पोस्टर नाही, तर सरावाची गरज आहे',
      sectionSubtitle: 'निष्क्रिय जाहिरातींपेक्षा स्वतःच्या भाषेतील सराव आणि कुटुंबाची सोबत अधिक प्रभावी ठरते.',
      sourceNote: 'स्रोत: I4C (गृह मंत्रालय): राष्ट्रीय सायबर गुन्हे पोर्टल व सर्वोच्च न्यायालय अहवाल, 2025',
      statIndiaLabel: '2025 मध्ये भारतातील सायबर फसवणूक तोटा',
      statIndiaSub: 'राष्ट्रीय पोर्टल आकडेवारी',
      statMhLabel: '2025 मध्ये महाराष्ट्रातील तोटा',
      statMhSub: 'देशातील सर्वाधिक',
      statArrestLabel: '2025 मधील डिजिटल अरेस्ट तक्रारी (₹1,211 कोटी)',
      statArrestSub: 'बनावट पोलीस व्हिडिओ कॉल',
      funnelTitle: 'सायबर फसवणुकीचे 4 टप्पे कसे काम करतात',
      step1Title: '1. विश्वास',
      step1Desc: 'पोलीस, CBI, बँक किंवा महावितरणच्या नावाने खोटा फोन.',
      step2Title: '2. भीती',
      step2Desc: '"व्हिडिओ कॉलवर थांबा" किंवा "आज खाते बंद होईल" अशी दहशत.',
      step3Title: '3. घाई',
      step3Desc: 'गडबडीत OTP दिला जातो किंवा पैसे ट्रान्सफर होतात.',
      step4Title: '4. नुकसान',
      step4Desc: 'फोन बंद होताच आयुष्यभराची बचत लुटली जाते.',
      comparisonTitle: 'सध्याचे प्रयत्न विरुद्ध CyberRakshak',
      colGap: 'घटक',
      colToday: 'आजचे प्रयत्न',
      colSaathi: 'CyberRakshak',
      gapRows: [
        { aspect: 'शिक्षण', today: 'एकतर्फी व्हिडिओ व पोस्टर्स', saathi: 'बनावट कॉल व मॉक बँकिंग सँडबॉक्स सराव' },
        { aspect: 'सोय', today: 'सर्वांसाठी सारख्याच किचकट सूचना', saathi: 'मराठी, वऱ्हाडी, गोंडी, हिंदीत मोठे अक्षर व आवाज' },
        { aspect: 'वेळ', today: 'फसवणूक झाल्यावर मदत केंद्र', saathi: 'कृती करण्यापूर्वी लिंक व मेसेज तपासून कारण सांगते' },
        { aspect: 'कुटुंब', today: 'नातेवाईकांना उशिरा कळते', saathi: 'केअरगिव्हरला तात्काळ WhatsApp अलर्ट आणि संमती नियंत्रण' },
      ],
    },
    protect: {
      sectionTitle: 'हे सुरक्षित आहे का? — तात्काळ मेसेज व लिंक तपासणी',
      sectionSubtitle: 'कोणताही SMS, WhatsApp मेसेज, अ‍ॅप किंवा लिंक येथे टाका. धोका असल्यास तुम्हाला आणि केअरगिव्हरला WhatsApp वर लगेच सूचना मिळेल.',
      inputPlaceholder: 'येथे SMS, लिंक किंवा अ‍ॅपचे नाव पेस्ट करा (उदा. sbi-kyc-update.xyz)',
      analyzeBtn: 'सुरक्षा तपासा',
      analyzingBtn: 'तपासणी सुरू आहे...',
      loadSampleKyc: 'बनावट KYC SMS तपासा',
      loadSampleArrest: 'डिजिटल अरेस्ट तपासा',
      loadSampleSafe: 'खरी SBI लिंक तपासा',
      riskGreen: 'सुरक्षित — स्वच्छ आणि विश्वसनीय लिंक',
      riskYellow: 'सावधान — आधी खात्री करा',
      riskRed: 'अतिशय धोकादायक — फसवणूक',
      whyHeading: 'धोका का दाखवला गेला',
      nextStepsHeading: 'पुढे काय करावे',
      aiExplanationHeading: 'साथी AI चे सोपे स्पष्टीकरण',
      caregiverAlertedNotice: 'या मोठ्या धोक्यासाठी केअरगिव्हरचा WhatsApp अलर्ट तयार केला आहे.',
      openWhatsappAlertBtn: 'केअरगिव्हरला WhatsApp अलर्ट पाठवा',
      helplineDirectoryTitle: 'एक-क्लिक 1930 व बँक हेल्पलाइन यादी',
      call1930Btn: '1930 सायबर हेल्पलाइनवर कॉल करा',
      portalLinkLabel: 'cybercrime.gov.in वर तक्रार नोंदवा',
    },
    scamGym: {
      sectionTitle: 'सराव: स्कॅम जिम व सुरक्षित सँडबॉक्स',
      sectionSubtitle: 'कोणत्याही खऱ्या पैशाच्या धोक्याशिवाय नकली लिंक्स व AI ठग कॉलचा सराव करा.',
      sandboxTitle: 'मॉक बँकिंग व सुरक्षित ब्राउझिंग सँडबॉक्स',
      sandboxSubtitle: 'येथे संशयास्पद लिंक किंवा APK वर क्लिक करून पाहा की CyberRakshak कसे अडवतो आणि केअरगिव्हरला कळवतो.',
      pretendBalanceLabel: 'सराव पेन्शन शिल्लक (नकली)',
      sandboxHint: 'चाचणीसाठी खालील कोणत्याही लिंकवर टॅप करा:',
      callGymTitle: 'AI आवाजातील बनावट कॉल सराव',
      callGymSubtitle: 'फसवणुकीचा प्रकार निवडा आणि शांतपणे नकार देण्याचा सराव करा.',
      startCallBtn: 'कॉल सुरू / रीसेट करा',
      replyPlaceholder: 'कॉल करणाऱ्याला तुमचे उत्तर लिहा किंवा बोला...',
      sendReplyBtn: 'उत्तर पाठवा',
      refuseHangupBtn: 'फोन ठेवा आणि 1930 ला कळवा',
      redFlagReplayTitle: 'धोक्याच्या खुणा रीप्ले',
      safeTipTitle: 'सुवर्ण नियम',
      lessonsPassedLabel: 'पूर्ण केलेले सराव',
    },
    news: {
      sectionTitle: 'ज्येष्ठ नागरिकांसाठी ताज्या सायबर फसवणूक बातम्या',
      sectionSubtitle: 'नागपूर, विदर्भ, महाराष्ट्र आणि देशभरात ज्येष्ठांना लक्ष्य करणाऱ्या ताज्या ऑनलाइन घोटाळ्यांची माहिती.',
      filterAll: 'सर्व बातम्या',
      filterArrest: 'डिजिटल अरेस्ट',
      filterKyc: 'बनावट KYC / APK',
      filterOtp: 'OTP व पेन्शन',
      practiceThisBtn: 'स्कॅम जिममध्ये सराव करा',
      askAssistantBtn: 'साथीला याबद्दल विचारा',
    },
    caregiver: {
      sectionTitle: 'केअरगिव्हर सुरक्षा डॅशबोर्ड',
      sectionSubtitle: 'ज्येष्ठांचा सराव प्रगती अहवाल पहा, खाजगी मेसेज न वाचता अलर्ट मिळवा आणि परवानगीनुसार स्टोरेज/SMS स्कॅन चालवा.',
      familyCardTitle: 'जोडलेली कुटुंब सुरक्षा जोडी',
      seniorLabel: 'ज्येष्ठ नागरिक',
      guardianLabel: 'केअरगिव्हर / पालक',
      permissionsLabel: 'सक्रिय सुरक्षा परवानग्या',
      learningProgressTitle: 'ज्येष्ठांचा सराव प्रवास',
      alertsFeedTitle: 'तात्काळ संशयास्पद घटना व WhatsApp अलर्ट',
      noAlertsYet: 'अद्याप कोणताही धोका अलर्ट नाही. तपासण्यासाठी सँडबॉक्समध्ये संशयास्पद लिंक उघडून पहा.',
      privacyMaskedNotice: 'गोपनीयता मोड सुरू: फक्त इशाऱ्याचे कारण दिसते; मूळ SMS लपवलेला आहे.',
      privacySharedNotice: 'संमती मोड सुरू: ज्येष्ठांच्या संमतीने छोटा भाग दिसत आहे.',
      togglePrivacyBtn: 'गोपनीयता संमती बदला',
      runDeviceScanBtn: 'स्टोरेज, SMS व WhatsApp स्कॅन चालवा',
      deviceScanTitle: 'तपासलेले अ‍ॅप्स, APK व मेसेज',
      blockedPermissionNote: 'कुटुंब सेटअपमध्ये ही परवानगी बंद आहे — गोपनीयतेसाठी वगळले.',
      sendWhatsappBtn: 'WhatsApp अलर्ट उघडा',
      statusDispatched: 'WhatsApp अलर्ट तयार / नोंदवला',
      statusNeedsPermission: 'WhatsApp परवानगी बंद',
    },
    assistant: {
      drawerTitle: 'साथी AI — आवाज आणि चॅट मार्गदर्शक',
      personaSubtitle: 'तुमच्या भाषेत बोलणारा व ऐकणारा विश्वासू सुरक्षा मित्र',
      inputPlaceholder: 'तुमचा प्रश्न लिहा किंवा माइक दाबून बोला...',
      sendBtn: 'विचारा',
      listenBtn: 'बोला (माइक)',
      listeningState: 'ऐकत आहे... आता बोला',
      transcribingState: 'तुमचा आवाज समजून घेत आहे...',
      speakReplyToggle: 'उत्तर वाचून दाखवा',
      micUnavailableHint: 'माइक उपलब्ध नसल्यास खालील नमुना आवाज प्रश्न निवडा किंवा टाइप करा.',
      sampleQuestionsLabel: 'त्वरित आवाज प्रश्न',
      sampleQuestions: [
        'पोलीस व्हिडिओ कॉलवर डिजिटल अरेस्ट म्हणतात, खरे असते का?',
        'बँक KYC लिंकवर आजच क्लिक करा असे आले आहे, काय करू?',
        'पेन्शनसाठी AnyDesk अ‍ॅप घ्यायला सांगितले आहे, सुरक्षित आहे का?',
      ],
      welcomeMessage: 'नमस्कार! मी साथी, तुमचा सायबर सुरक्षा मित्र. कोणताही संशयास्पद कॉल, SMS किंवा लिंकबद्दल लिहून किंवा बोलून विचारा.',
      processingTitle: 'साथी तुमचे उत्तर तयार करत आहे',
      processingStep1: 'तुमचा प्रश्न समजून घेत आहे...',
      processingStep2: 'सायबर सुरक्षा नियम तपासत आहे...',
      processingStep3: 'सोप्या भाषेत उत्तर तयार करत आहे...',
      preparingAudio: 'आवाज तयार करत आहे...',
      replayBtn: 'ऐका',
      liveVoiceStartBtn: 'थेट आवाज कॉल (Astra)',
      liveVoiceStopBtn: 'थेट कॉल थांबवा',
      liveVoiceConnecting: 'थेट आवाज जोडत आहे...',
      liveVoiceActive: 'थेट आवाज सुरू — मोकळेपणाने बोला',
      liveVoiceSpeaking: 'साथी बोलत आहे...',
      liveVoiceFallback: 'थेट माइक उपलब्ध नसल्यास जलद चॅट व आवाज मोड सुरू राहील.',
      stopAudioBtn: 'आवाज थांबवा',
    },
    warningModal: {
      title: 'धोका अडवला — संशयास्पद लिंक किंवा अ‍ॅप आढळले',
      blockedTargetLabel: 'अडवलेली वेबसाइट / अ‍ॅप / मेसेज',
      whatsappPrepared: 'केअरगिव्हरला सूचना पाठवली',
      whatsappSentBanner: 'तुमच्या केअरगिव्हरसाठी WhatsApp आणि डॅशबोर्ड अलर्ट तयार झाला आहे.',
      guestBanner: 'हा धोका सुरक्षितपणे अडवला आहे. WhatsApp अलर्ट मिळवण्यासाठी केअरगिव्हर जोडा.',
      openWhatsappBtn: 'आता WhatsApp वर अलर्ट पाठवा',
      addCaregiverBtn: 'साइन इन / केअरगिव्हर जोडा',
      dismissBtn: 'बंद करा आणि सुरक्षित राहा',
      call1930Btn: '1930 हेल्पलाइनवर कॉल करा',
    },
    footer: {
      manifesto: 'ज्येष्ठ नागरिकांना फक्त दुसरा अभ्यासक्रम नको, तर सरावाचे मैदान, दुसरी नजर आणि कुटुंबाचे सुरक्षा कवच हवे आहे.',
      hackathonCredit: 'CyberRakshak · ज्येष्ठ नागरिकांसाठी डिजिटल साक्षरता व सायबर फसवणूक संरक्षण · YCCE HACKkumbh नागपूर',
    },
    siteUpdates: {
      openStudioBtn: 'वेबसाइट अपडेट / फीचर जोडा',
      studioTitle: 'वेबसाइट अपडेट व नवीन फीचर्स जोडा',
      studioSubtitle: 'आधीची वेबसाइट न बदलता नवीन सुरक्षा विभाग, कस्टम कार्ड, बातम्या, सुरक्षित डोमेन आणि हेल्पलाइन क्रमांक जोडा.',
      tabModules: 'सुरक्षा विभाग',
      tabCustomFeature: 'नवीन फीचर कार्ड',
      tabContent: 'बातम्या / डोमेन / नंबर',
      tabBackup: 'एक्सपोर्ट / इम्पोर्ट',
      sectionHeading: 'वेबसाइटवर जोडलेले नवीन फीचर्स',
      sectionSubheading: 'अपडेट स्टुडिओद्वारे सुरू केलेल्या अतिरिक्त सुरक्षा सुविधा.',
      addBtn: 'वेबसाइटवर जोडा',
      saveBtn: 'बदल सेव्ह करा',
      resetBtn: 'जोडलेले अपडेट काढा',
      exportBtn: 'JSON कॉन्फिग डाऊनलोड करा',
      importBtn: 'JSON कॉन्फिग अपलोड करा',
      savedToast: 'वेबसाइट अपडेट सेव्ह व लागू झाले आहेत.',
      modSosTitle: 'तातडीचे SOS सुरक्षा कार्ड',
      modSosDesc: 'एका क्लिकवर १९३० कॉल, सायबरक्राइम पोर्टल आणि कुटुंबाला WhatsApp SOS.',
      modTipTitle: 'दैनंदिन सुरक्षा सल्ला पट्टी',
      modTipDesc: 'तुमच्या निवडलेल्या भाषेत सुरक्षित कॉल व इंटरनेट वापराची सोपी आठवण.',
      modContactsTitle: 'विश्वासू संपर्क डायल बुक',
      modContactsDesc: 'कुटुंब, बँक व्यवस्थापक किंवा डॉक्टरांचे नंबर जतन करून थेट कॉल करा.',
      modPinTitle: 'PIN व UPI सुरक्षा तपासणी',
      modPinDesc: 'UPI, सिम लॉक आणि पासवर्ड सुरक्षित ठेवण्याचे ४ सोपे नियम तपासा.',
    },
  },
  vrh: {
    brandName: 'CyberRakshak',
    hero: {
      dockHome: 'घर',
      dockPractice: 'स्कॅम जिम',
      dockProtect: 'धोका हाय का',
      dockNews: 'ताज्या बातम्या',
      dockCaregiver: 'केअरगिव्हर',
      headlineLine1: 'फसवाफसवी आधीच',
      headlineLine2: 'सावध राखणारा साथी',
      lede: 'आपल्या नागपूर-विदर्भातल्या आजी-आजोबांसाठी बोलीभाषेत सराव, लिंक तपासणी आन घरच्यांचा व्हॉट्सअ‍ॅप पहारा.',
      exploreCta: 'सराव सुरू करा',
      playAria: 'CyberRakshak आवाज माहिती ऐका',
      stat1Label: 'देशातला सायबर तोटा (2025)',
      stat1Value: '₹19,800+ कोटी',
      stat2Label: 'महाराष्ट्र (नंबर एकवर)',
      stat2Value: '₹3,203 कोटी',
      card1Label: 'घरचा पहारा',
      card1Title: 'आधीच सराव करून बघा.',
      card2Label: 'मदत १९३०',
      card2Title: 'लबाडी लगेच ओळखा',
      discover: 'खाली बघा',
      ghostWord: 'रक्षक',
      floatingLanguage: 'बोली',
      floatingSignIn: 'साइन इन',
      floatingSignedIn: 'घर जोडलं हाये',
      floatingAskSaathi: 'साथीले विचारा',
    },
    commandBar: {
      modeLabel: 'पद्धत निवडा',
      seniorMode: 'आजी-आजोबा मोड',
      caregiverMode: 'घरचा केअरगिव्हर मोड',
      languageLabel: 'बोली / भाषा',
      setupProfileBtn: 'साइन इन / घरची नोंदणी',
      editProfileBtn: 'माहिती बदला',
      helpline1930: '१९३० मदत केंद्र',
      askVoiceBtn: 'साथीले बोलून विचारा',
    },
    onboarding: {
      eyebrow: 'ऐच्छिक घरची सुरक्षा नोंदणी',
      title: 'आजी-आजोबा आन घरच्या मानसाची माहिती भरा',
      subtitle: 'साथी AI आन स्कॅम जिम नोंदणीबिगर लगेच चालतेत. खोटारडी लिंक उघडल्यावर WhatsApp खबर पाठवायले ही माहिती भरा जी.',
      seniorSectionTitle: 'वडीलधाऱ्या मानसाची माहिती',
      caregiverSectionTitle: 'घरचा केअरगिव्हर (पोरगा / पोरगी / नातू)',
      permissionsSectionTitle: 'सुरक्षेच्या परवानग्या (सोप्या भाषेत)',
      nameLabel: 'पुरं नाव',
      phoneLabel: '१० आकडी मोबाईल / WhatsApp नंबर',
      emailOptionalLabel: 'ईमेल (असलं तर टाका)',
      seniorNamePlaceholder: 'जसं: माधवराव देशमुख',
      caregiverNamePlaceholder: 'जसं: स्नेहा देशमुख',
      phonePlaceholder: 'जसं: 9823012345',
      emailPlaceholder: 'name@example.com',
      permWhatsappTitle: 'घरच्याले WhatsApp अलर्ट',
      permWhatsappDesc: 'वाइट लिंक, खोटं अ‍ॅप किंवा ठग कॉल आल्यावर घरच्या मानसाले लगेच व्हॉट्सअ‍ॅपवर खबर द्या.',
      permMessagesTitle: 'SMS मॅसेज तपासणी',
      permMessagesDesc: 'बँक KYC, वीज बिल किंवा लॉटरीच्या खोट्या मॅसेजमधली लिंक तपासा.',
      permStorageTitle: 'मोबाईल स्टोरेज आन अ‍ॅप तपासणी',
      permStorageDesc: 'मोबाईलमधलं खोटं APK अ‍ॅप किंवा स्क्रीन दाखवनारं अ‍ॅप लपून बसलं हाये का ते बघा.',
      privacyShareLabel: 'घरच्याले संशयास्पद मॅसेजचा थोडा भाग दाखवा (बंद ठेवला तर फक्त धोक्याचं कारन दिसीन)',
      submitBtn: 'सुरक्षा कवच चालू करा',
      demoFillBtn: 'नागपूर नमुना कुटुंब भरा',
      skipBtn: 'आत्ता सोडून द्या',
      errRequiredName: 'भाऊ/ताई, किमान २ अक्षरांचं पुरं नाव टाका.',
      errInvalidPhone: '६ ते ९ ने सुरू होनारा १० आकडी खरा मोबाईल नंबर टाका.',
      errInvalidEmail: 'बरोबर ईमेल टाका नाहीतर रिकामा सोडा.',
      errPermission: 'सुरक्षा सुरू करायले किमान एक परवानगी चालू ठेवा.',
      lockedNotice: 'साथी AI, स्कॅम जिम आन लिंक तपासणी नोंदणीबिगरबी चालते. WhatsApp अलर्टसाठी हवं तर साइन इन करा जी.',
    },
    seniorHome: {
      greetingPrefix: 'रामराम जी,',
      subtitle: 'एकदम सोपी आन मोठी बटणं. खालील एक बटन दाबा नायतर माइकवर तोंडानं बोला.',
      tileSafeTitle: '१. ही लिंक खरी हाये का?',
      tileSafeDesc: 'कोनताबी मॅसेज किंवा लिंक इथं टाकून बघा की खरी हाये का फसवी.',
      tileGymTitle: '२. स्कॅम जिम सराव',
      tileGymDesc: 'खरा ठग फोन लावायच्या आधी इथं नकली बँक आन फोनचा सराव करा.',
      tileVoiceTitle: '३. साथी AI संगं बोला',
      tileVoiceDesc: 'आपल्या वऱ्हाडीत, मराठीत किंवा हिंदीत बोलून मनातली शंका विचारा.',
      tileNewsTitle: '४. ताज्या फसवणुकीच्या बातम्या',
      tileNewsDesc: 'नागपूर-विदर्भात वयस्कर लोकांसंगं होनारे नवे घोटाळे वाचा आन १९३० ची मदत घ्या.',
    },
    stats: {
      sectionTitle: 'आजी-आजोबांले फक्त पोस्टर नाय, हाताशी सराव लागते',
      sectionSubtitle: 'टीव्हीवरच्या जाहिरातींपेक्षा आपल्या बोलीभाषेत सराव आन घरच्यांचा आधार लय कामात येते.',
      sourceNote: 'माहितीचा आधार: I4C (गृह मंत्रालय) सायबर क्राईम रिपोर्ट, २०२५',
      statIndiaLabel: '२०२५ मधी देशातला सायबर लुटमारीचा आकडा',
      statIndiaSub: 'सगळ्या भारताचा तोटा',
      statMhLabel: '२०२५ मधी महाराष्ट्रात गेलेले पैसे',
      statMhSub: 'देशात सगळ्यात जास्त',
      statArrestLabel: '२०२५ मधले डिजिटल अरेस्ट गुन्हे (₹1,211 कोटी)',
      statArrestSub: 'खोट्या पोलिसांचे व्हिडिओ कॉल',
      funnelTitle: 'ठग लोकं ४ पायऱ्यात कसं फसवतत बघा',
      step1Title: '१. विश्वास',
      step1Desc: 'पोलीस, CBI, बँक किंवा महावितरणचा साहेब बनून फोन करतेत.',
      step2Title: '२. भीती',
      step2Desc: '"व्हिडिओ कॉलवर थांबा" नायतर "आज खातं बंद होईन" म्हनून घाबरवतेत.',
      step3Title: '३. घाई',
      step3Desc: 'घाईगर्दीत मानूस OTP सांगते नायतर पैसे टाकून देते.',
      step4Title: '४. नुकसान',
      step4Desc: 'फोन ठेवताच आयुष्यभराची कमाई गायब होऊन जाते.',
      comparisonTitle: 'जुने उपाय आन आपला CyberRakshak',
      colGap: 'बाब',
      colToday: 'आजचे उपाय',
      colSaathi: 'CyberRakshak',
      gapRows: [
        { aspect: 'शिकनं', today: 'फक्त व्हिडिओ आन पोस्टर', saathi: 'नकली फोन आन बँकेच्या सँडबॉक्समधी सराव' },
        { aspect: 'सोपंपना', today: 'कठीण इंग्रजी चेतावन्या', saathi: 'वऱ्हाडी, मराठी, गोंडी, हिंदीत मोठे अक्षर आन आवाज' },
        { aspect: 'वेळ', today: 'पैसे गेल्यावर तक्रार', saathi: 'टिचकी मारण्याआधीच लिंक खरी का खोटी ते सांगते' },
        { aspect: 'घरचे', today: 'घरच्यांले उशिरा कळते', saathi: 'घरच्या केअरगिव्हरले लगेच WhatsApp वर खबर जाते' },
      ],
    },
    protect: {
      sectionTitle: 'धोका हाय का? — मॅसेज आन लिंक तपासणी',
      sectionSubtitle: 'आलेला SMS, व्हॉट्सअ‍ॅप निरोप किंवा लिंक इथं टाका. लबाडी दिसली तर तुमाले आन घरच्याले लगेच व्हॉट्सअ‍ॅपवर खबर जाईन.',
      inputPlaceholder: 'इथं मॅसेज, लिंक किंवा अ‍ॅपचं नाव टाका (जसं: sbi-kyc-update.xyz)',
      analyzeBtn: 'आत्ता तपासा',
      analyzingBtn: 'तपासणी चालू हाये...',
      loadSampleKyc: 'खोटा KYC मॅसेज तपासा',
      loadSampleArrest: 'डिजिटल अरेस्ट तपासा',
      loadSampleSafe: 'खरी SBI लिंक तपासा',
      riskGreen: 'सुरक्षित — स्वच्छ आन खरी वेबसाइट',
      riskYellow: 'जरा जपून — आधी घरच्याले विचारा',
      riskRed: 'लय मोठा धोका — पक्की फसवणूक',
      whyHeading: 'हा धोका का वाटला',
      nextStepsHeading: 'आता पुढे काय करायचं',
      aiExplanationHeading: 'साथी AI चं सोपं सांगनं',
      caregiverAlertedNotice: 'हा मोठा धोका दिसल्यानं घरच्या केअरगिव्हरले WhatsApp अलर्ट तयार केला हाये.',
      openWhatsappAlertBtn: 'घरच्याले WhatsApp वर अलर्ट धाडा',
      helplineDirectoryTitle: '१९३० सायबर आन बँक मदत नंबर',
      call1930Btn: '१९३० वर लगेच फोन लावा',
      portalLinkLabel: 'cybercrime.gov.in वर तक्रार करा',
    },
    scamGym: {
      sectionTitle: 'सराव: स्कॅम जिम आन सुरक्षित सँडबॉक्स',
      sectionSubtitle: 'इथं पैशाचा काईबी धोका नाय. खोट्या लिंक्स उघडून आन ठगाच्या फोनले कसं उत्तर द्यायचं याचा सराव करा.',
      sandboxTitle: 'नकली बँक आन सुरक्षित ब्राउझर सँडबॉक्स',
      sandboxSubtitle: 'खालील खोट्या लिंकवर टिचकी मारून बघा कसं CyberRakshak तुमाले थांबवते आन घरच्याले अलर्ट धाडते.',
      pretendBalanceLabel: 'सरावाची पेन्शन रक्कम (नकली)',
      sandboxHint: 'बघायसाठी खालील कोणत्याबी लिंकवर बोट ठेवा:',
      callGymTitle: 'AI आवाजातला खोटा फोन सराव',
      callGymSubtitle: 'ठगीचा प्रकार निवडा आन धीरानं नाही म्हनायचा सराव करा.',
      startCallBtn: 'फोन सुरू / नवीन करा',
      replyPlaceholder: 'त्या फोनवर तुमचं उत्तर लिहा किंवा बोला...',
      sendReplyBtn: 'उत्तर द्या',
      refuseHangupBtn: 'फोन कापा आन १९३० लावा',
      redFlagReplayTitle: 'फसवणुकीच्या खुणा',
      safeTipTitle: 'पक्का नियम',
      lessonsPassedLabel: 'सराव झालेले प्रकार',
    },
    news: {
      sectionTitle: 'वयस्कर मानसांसंगं झालेल्या ताज्या सायबर फसवणुकीच्या बातम्या',
      sectionSubtitle: 'नागपूर, विदर्भ आन महाराष्ट्रात आजी-आजोबांले फसवनारे ताजे घोटाळे वाचा आन सावध राहा.',
      filterAll: 'सगळ्या बातम्या',
      filterArrest: 'डिजिटल अरेस्ट',
      filterKyc: 'खोटी KYC / APK',
      filterOtp: 'OTP आन पेन्शन',
      practiceThisBtn: 'स्कॅम जिममधी सराव करा',
      askAssistantBtn: 'साथीले याबद्दल विचारा',
    },
    caregiver: {
      sectionTitle: 'केअरगिव्हर सुरक्षा डॅशबोर्ड',
      sectionSubtitle: 'आजी-आजोबांनी किती सराव केला ते बघा, खाजगी मॅसेज न वाचता धोक्याचे अलर्ट मिळवा आन मोबाईल स्कॅन करा.',
      familyCardTitle: 'नोंदवलेली कुटुंब सुरक्षा जोडी',
      seniorLabel: 'आजी / आजोबा',
      guardianLabel: 'केअरगिव्हर / घरचा मानूस',
      permissionsLabel: 'चालू असलेल्या परवानग्या',
      learningProgressTitle: 'सरावाची प्रगती',
      alertsFeedTitle: 'ताजे संदिग्ध अलर्ट आन WhatsApp निरोप',
      noAlertsYet: 'अजून कोनताबी मोठा अलर्ट नाय आला. तपासाले सँडबॉक्समधली खोटी लिंक दाबून बघा.',
      privacyMaskedNotice: 'गोपनीयता सुरू: फक्त धोक्याचं कारन दिसते; पुरा SMS लपवला हाये.',
      privacySharedNotice: 'संमती सुरू: वडीलधाऱ्यांच्या संमतीनं थोडा भाग दिसत हाये.',
      togglePrivacyBtn: 'गोपनीयता संमती बदला',
      runDeviceScanBtn: 'स्टोरेज, SMS आन WhatsApp स्कॅन करा',
      deviceScanTitle: 'तपासलेले अ‍ॅप्स, APK आन मॅसेज',
      blockedPermissionNote: 'ही परवानगी बंद ठेवली हाये — त्यामुळे स्कॅन केल्लं नाय.',
      sendWhatsappBtn: 'WhatsApp अलर्ट उघडा',
      statusDispatched: 'WhatsApp अलर्ट तयार हाये',
      statusNeedsPermission: 'WhatsApp परवानगी बंद',
    },
    assistant: {
      drawerTitle: 'साथी AI — बोलनारा आन ऐकनारा मदतनीस',
      personaSubtitle: 'तुमच्याच बोलीभाषेत सोप्या शब्दात मदत करणारा मित्र',
      inputPlaceholder: 'प्रश्न लिहा नाहीतर माइक दाबून बोला...',
      sendBtn: 'विचारा',
      listenBtn: 'बोला (माइक)',
      listeningState: 'ऐकून राहिलो... बोला जी',
      transcribingState: 'तुमचं बोलनं समजून घेत हाये...',
      speakReplyToggle: 'उत्तर बोलून ऐकवा',
      micUnavailableHint: 'माइक चालत नसन तर खाली दिलेल्या प्रश्नावर टिचकी मारा नायतर लिहा.',
      sampleQuestionsLabel: 'झटपट बोलण्याचे प्रश्न',
      sampleQuestions: [
        'पोलीस व्हिडिओ कॉलवर डिजिटल अरेस्ट सांगून राहिले, खरं असते का?',
        'बँकेचा मॅसेज आला आज KYC बंद होईन म्हनून, लिंक दाबू का?',
        'पेन्शनसाठी AnyDesk अ‍ॅप टाकाले सांगून राहिले, काय करू?',
      ],
      welcomeMessage: 'रामराम जी! मी साथी हाये, तुमचा सायबर सुरक्षा मित्र. कोनताबी संशयास्पद फोन, मॅसेज किंवा लिंकबद्दल मला बोलून किंवा लिहून विचारा.',
      processingTitle: 'साथी तुमचं उत्तर तयार करून राहिला हाये',
      processingStep1: 'तुमचा प्रश्न समजून घेत हाये...',
      processingStep2: 'सायबर सुरक्षेचे नियम पाहत हाये...',
      processingStep3: 'सोप्या भाषेत उत्तर लिहीत हाये...',
      preparingAudio: 'आवाज तयार होत हाये...',
      replayBtn: 'ऐका',
      liveVoiceStartBtn: 'थेट बोलना कॉल (Astra)',
      liveVoiceStopBtn: 'बोलना कॉल बंद करा',
      liveVoiceConnecting: 'थेट आवाज जोडून राहिलो...',
      liveVoiceActive: 'थेट आवाज चालू — बिनधास्त बोला जी',
      liveVoiceSpeaking: 'साथी बोलून राहिला हाये...',
      liveVoiceFallback: 'थेट माइक नसलं तर जलद चॅट आन आवाज मोड सुरू राहील.',
      stopAudioBtn: 'आवाज थांबवा',
    },
    warningModal: {
      title: 'थांबा! मोठा धोका अडवला हाये',
      blockedTargetLabel: 'अडवलेली लिंक / अ‍ॅप / मॅसेज',
      whatsappPrepared: 'घरच्या केअरगिव्हरले खबर पाठवली',
      whatsappSentBanner: 'तुमच्या घरच्या केअरगिव्हरसाठी WhatsApp आन डॅशबोर्ड अलर्ट तयार केला हाये.',
      guestBanner: 'हा धोका इथंच अडवला हाये. घरच्याले WhatsApp अलर्ट पाठवायले साइन इन करा.',
      openWhatsappBtn: 'आत्ता WhatsApp वर अलर्ट पाठवा',
      addCaregiverBtn: 'साइन इन / घरचा मानूस जोडा',
      dismissBtn: 'बंद करा आन सावध राहा',
      call1930Btn: '१९३० हेल्पलाइन लावा',
    },
    footer: {
      manifesto: 'आजी-आजोबांले फक्त भाषण नाय, तर सरावाचं मैदान, दुसरी नजर आन घरच्यांचं सुरक्षा कवच लागते.',
      hackathonCredit: 'CyberRakshak · ज्येष्ठ नागरिकांसाठी सायबर सुरक्षा व डिजिटल साक्षरता साथी · YCCE HACKkumbh नागपूर',
    },
    siteUpdates: {
      openStudioBtn: 'वेबसाइट अपडेट / नवे फीचर जोडा',
      studioTitle: 'वेबसाइट अपडेट आन नवे फीचर्स जोडा',
      studioSubtitle: 'आधीची वेबसाइट न बदलता नवे सुरक्षा भाग, कार्ड, बातम्या, सुरक्षित डोमेन आन मदत नंबर जोडा.',
      tabModules: 'सुरक्षा विभाग',
      tabCustomFeature: 'नवीन फीचर कार्ड',
      tabContent: 'बातम्या / डोमेन / नंबर',
      tabBackup: 'एक्सपोर्ट / इम्पोर्ट',
      sectionHeading: 'वेबसाइटवर जोडलेले नवे फीचर्स',
      sectionSubheading: 'अपडेट स्टुडिओतून चालू केलेल्या नव्या सुरक्षा सोयी.',
      addBtn: 'वेबसाइटवर जोडा',
      saveBtn: 'बदल सेव्ह करा',
      resetBtn: 'जोडलेले अपडेट काढा',
      exportBtn: 'JSON फाइल घ्या',
      importBtn: 'JSON फाइल टाका',
      savedToast: 'वेबसाइटचे नवे अपडेट सेव्ह झाले.',
      modSosTitle: 'तातडीचा SOS मदत बॉक्स',
      modSosDesc: 'एका बटनात १९३० फोन, सायबर पोर्टल आन घरच्याले WhatsApp SOS.',
      modTipTitle: 'रोजची सुरक्षा टीप पट्टी',
      modTipDesc: 'तुमच्या बोलीभाषेत फोन आन इंटरनेट जपून वापरायची रोजची आठवण.',
      modContactsTitle: 'घरचे आन कामाचे नंबर बुक',
      modContactsDesc: 'पोरं, डॉक्टर किंवा बँक मॅनेजरचे नंबर ठेवून लगेच फोन लावा.',
      modPinTitle: 'PIN आन UPI तपासणी यादी',
      modPinDesc: 'UPI, सिम लॉक आन पिन सुरक्षित ठेवण्याचे ४ सोपे नियम तपासा.',
    },
  },
  gon: {
    brandName: 'CyberRakshak',
    hero: {
      dockHome: 'लोन (होम)',
      dockPractice: 'स्कॅम जिम',
      dockProtect: 'सुरक्षा जांच',
      dockNews: 'ताजा खबर',
      dockCaregiver: 'रखवार (केयरगिव्हर)',
      headlineLine1: 'धोखा अगाडीच',
      headlineLine2: 'होशियार सुरक्षा',
      lede: 'नागपूर-विदर्भ ना बुजुर्ग मानूस ले गोठ ते अभ्यास, तात्काळ लिंक जांच अनी कुटुंब ना व्हॉट्सअ‍ॅप रक्षण.',
      exploreCta: 'अभ्यास सुरू कयका',
      playAria: 'CyberRakshak आवाज माहिती केहना',
      stat1Label: 'भारत ते सायबर नुकसान (2025)',
      stat1Value: '₹19,800+ कोटी',
      stat2Label: 'महाराष्ट्र (पहिल्या नंबर)',
      stat2Value: '₹3,203 कोटी',
      card1Label: 'कुटुंब रक्षण',
      card1Title: 'अगाडी सुरक्षित सराव कयका.',
      card2Label: 'मदत १९३०',
      card2Title: 'खोटा खूण ओळखना',
      discover: 'तळ्ळा हुडा',
      ghostWord: 'रक्षक',
      floatingLanguage: 'भाका',
      floatingSignIn: 'साइन इन',
      floatingSignedIn: 'कुटुंब जोडला मंता',
      floatingAskSaathi: 'साथी ले पुछका',
    },
    commandBar: {
      modeLabel: 'रूप निवडा',
      seniorMode: 'बुजुर्ग मोड',
      caregiverMode: 'रखवार मोड',
      languageLabel: 'भाका (भाषा)',
      setupProfileBtn: 'साइन इन / कुटुंब नोंदणी',
      editProfileBtn: 'माहिती बदला',
      helpline1930: '१९३० हेल्पलाइन',
      askVoiceBtn: 'साथी संगे गोठ कयका',
    },
    onboarding: {
      eyebrow: 'ऐच्छिक कुटुंब सुरक्षा नोंदणी',
      title: 'बुजुर्ग अनी कुटुंब रखवार ले जोडा',
      subtitle: 'साथी AI अनी स्कॅम जिम साइन इन शिवाय लगेच चलता. संदिग्ध लिंक उघडताच रखवार ले WhatsApp खबर पठोना ले ही माहिती भरा.',
      seniorSectionTitle: 'बुजुर्ग मानूस ना नाव अनी नंबर',
      caregiverSectionTitle: 'रखवार / घरचा मानूस',
      permissionsSectionTitle: 'सुरक्षा परवानगी (सोपी संमती)',
      nameLabel: 'पूरा नाव',
      phoneLabel: '१० अंकी मोबाईल / WhatsApp नंबर',
      emailOptionalLabel: 'ईमेल (असलं ते भरा)',
      seniorNamePlaceholder: 'जसं: माधवराव मडावी',
      caregiverNamePlaceholder: 'जसं: स्नेहा मडावी',
      phonePlaceholder: 'जसं: 9823012345',
      emailPlaceholder: 'name@example.com',
      permWhatsappTitle: 'रखवार ले WhatsApp अलर्ट',
      permWhatsappDesc: 'संदिग्ध लिंक या खोटा अ‍ॅप दिसले ते तात्काळ रखवार ले व्हॉट्सअ‍ॅपवर खबर पठोना.',
      permMessagesTitle: 'SMS मॅसेज जांच',
      permMessagesDesc: 'बँक KYC, बिजली बिल या लॉटरी मॅसेज ते लपलेला खोटा लिंक तपासना.',
      permStorageTitle: 'स्टोरेज अनी अ‍ॅप सुरक्षा स्कॅन',
      permStorageDesc: 'मोबाईल ते आलेला खोटा APK अ‍ॅप या स्क्रीन शेअर अ‍ॅप ओळखना.',
      privacyShareLabel: 'रखवार ले मॅसेज ना छोटा तुकडा दाखवा (बंद = फक्त धोक्या ना कारण)',
      submitBtn: 'सुरक्षा रक्षण सुरू कयका',
      demoFillBtn: 'नागपूर नमुना कुटुंब भरा',
      skipBtn: 'आता सोडून द्या',
      errRequiredName: 'कृपया किमान २ अक्षरांचे पूरा नाव लिहा.',
      errInvalidPhone: '६ ते ९ पासून सुरू वंता १० अंकी खरा नंबर टाका.',
      errInvalidEmail: 'बरोबर ईमेल लिहा या रिकामा सोडा.',
      errPermission: 'सुरक्षा सुरू कयना ले किमान एक परवानगी चालू कयका.',
      lockedNotice: 'साथी AI, स्कॅम जिम अनी लिंक जांच नोंदणी शिवाय बी चलता. WhatsApp अलर्ट साठी साइन इन कयका.',
    },
    seniorHome: {
      greetingPrefix: 'सेवा जोहार,',
      subtitle: 'मोटा बटण अनी सोपी भाका. खाली एक बटण दाबा या माइकवर बोला.',
      tileSafeTitle: '१. इद सुरक्षित मंता का?',
      tileSafeDesc: 'कोणता बी SMS या लिंक टाकसी तपासा की खरा मंता का धोका.',
      tileGymTitle: '२. स्कॅम जिम अभ्यास',
      tileGymDesc: 'खोटा फोन अनी नकली बँक स्क्रीनवर बिना धोका सराव कयका.',
      tileVoiceTitle: '३. साथी AI संगे गोठ कयका',
      tileVoiceDesc: 'गोंडी, वऱ्हाडी, मराठी, हिंदी या इंग्रजी ते बोलून प्रश्न पुछका.',
      tileNewsTitle: '४. ताजा सायबर धोका खबर',
      tileNewsDesc: 'विदर्भ-महाराष्ट्र ते बुजुर्ग मानूस ना विरुद्ध ताजा ठगी वाचा अनी १९३० लावा.',
    },
    stats: {
      sectionTitle: 'बुजुर्ग मानूस ले फक्त पोस्टर आयो, हातात सराव पाहिजे',
      sectionSubtitle: 'आपल्या भाका ते सराव अनी घरच्या मानसांचा सहारा खरा रक्षण देता.',
      sourceNote: 'स्रोत: I4C (गृह मंत्रालय) सायबर गुन्हे अहवाल, २०२५',
      statIndiaLabel: '२०२५ ते भारत ना सायबर नुकसान',
      statIndiaSub: 'संपूर्ण भारत पोर्टल',
      statMhLabel: '२०२५ ते महाराष्ट्र ना नुकसान',
      statMhSub: 'देशाते सर्वाधिक',
      statArrestLabel: '२०२५ डिजिटल अरेस्ट तक्रारी (₹1,211 कोटी)',
      statArrestSub: 'खोटा पोलीस व्हिडिओ कॉल',
      funnelTitle: 'ठग मानूस ४ पावलात कसे फसवतात',
      step1Title: '१. विश्वास',
      step1Desc: 'पोलीस, CBI या बँक ना नाव ते खोटा फोन येता.',
      step2Title: '२. भीती',
      step2Desc: '"व्हिडिओ कॉल चालू ठेवा" या "खाता बंद वंता" वेहसी घाबरवतात.',
      step3Title: '३. घाई',
      step3Desc: 'घाई ते OTP सांगतात या पैसा पठोतात.',
      step4Title: '४. नुकसान',
      step4Desc: 'कॉल कटताच जमा पैसा गायब वंता.',
      comparisonTitle: 'जुने उपाय अनी CyberRakshak',
      colGap: 'बाब',
      colToday: 'आज ना उपाय',
      colSaathi: 'CyberRakshak',
      gapRows: [
        { aspect: 'शिकना', today: 'फक्त व्हिडिओ अनी पोस्टर', saathi: 'नकली फोन अनी बँक सँडबॉक्स सराव' },
        { aspect: 'भाका', today: 'कठीण इंग्रजी सूचना', saathi: 'गोंडी, वऱ्हाडी, मराठी, हिंदी ते मोटा अक्षर अनी आवाज' },
        { aspect: 'वेळ', today: 'पैसा गेल्यावर मदत', saathi: 'क्लिक अगाडीच लिंक तपासून कारण वेहता' },
        { aspect: 'कुटुंब', today: 'घरच्यांले उशिरा कळता', saathi: 'रखवार ले तात्काळ WhatsApp अलर्ट पठोता' },
      ],
    },
    protect: {
      sectionTitle: 'इद सुरक्षित मंता का? — मॅसेज अनी लिंक जांच',
      sectionSubtitle: 'कोणता बी SMS, लिंक या अ‍ॅप नाव इथं टाका. धोका दिसले ते रखवार ले WhatsApp वर खबर जाईन.',
      inputPlaceholder: 'इथं SMS, लिंक या अ‍ॅप नाव टाका (जसं: sbi-kyc-update.xyz)',
      analyzeBtn: 'सुरक्षा तपासा',
      analyzingBtn: 'तपासणी चालू मंता...',
      loadSampleKyc: 'खोटा KYC SMS तपासा',
      loadSampleArrest: 'डिजिटल अरेस्ट तपासा',
      loadSampleSafe: 'खरी SBI लिंक तपासा',
      riskGreen: 'सुरक्षित — साफ अनी खरी वेबसाइट',
      riskYellow: 'सावधान — अगाडी खात्री कयका',
      riskRed: 'मोठा धोका — पक्की ठगी',
      whyHeading: 'धोका का दाखवला',
      nextStepsHeading: 'आता काय कयना',
      aiExplanationHeading: 'साथी AI ना सोपा अर्थ',
      caregiverAlertedNotice: 'या मोठ्या धोक्यासाठी रखवार ले WhatsApp अलर्ट तयार कयता मंता.',
      openWhatsappAlertBtn: 'रखवार ले WhatsApp अलर्ट पठोका',
      helplineDirectoryTitle: '१९३० सायबर अनी बँक मदत नंबर',
      call1930Btn: '१९३० हेल्पलाइन फोन कयका',
      portalLinkLabel: 'cybercrime.gov.in वर तक्रार कयका',
    },
    scamGym: {
      sectionTitle: 'अभ्यास: स्कॅम जिम अनी सुरक्षित सँडबॉक्स',
      sectionSubtitle: 'खरा पैसा ना धोका शिवाय नकली लिंक अनी खोटा फोन ना सराव कयका.',
      sandboxTitle: 'नकली बँक अनी सुरक्षित सँडबॉक्स',
      sandboxSubtitle: 'खोट्या लिंकवर टिचकी मारून हुडा की CyberRakshak कसा अडवता अनी रखवार ले खबर देता.',
      pretendBalanceLabel: 'सराव पेन्शन रक्कम (नकली)',
      sandboxHint: 'चाचणी ले कोणता बी लिंक दाबा:',
      callGymTitle: 'AI आवाज खोटा कॉल सराव',
      callGymSubtitle: 'ठगी निवडा अनी शांत मना कयना ना सराव कयका.',
      startCallBtn: 'कॉल सुरू / पुन्हा कयका',
      replyPlaceholder: 'फोनवर तुमचा उत्तर लिहा या बोला...',
      sendReplyBtn: 'उत्तर पठोका',
      refuseHangupBtn: 'फोन कापा अनी १९३० लावा',
      redFlagReplayTitle: 'धोका खूण रीप्ले',
      safeTipTitle: 'सोनेरी नियम',
      lessonsPassedLabel: 'सराव पूर्ण झाले',
    },
    news: {
      sectionTitle: 'बुजुर्ग मानूस ले ताजा सायबर धोका खबर',
      sectionSubtitle: 'गडचिरोली, नागपूर, विदर्भ अनी भारत ते बुजुर्ग मानूस ले लक्ष्य करनारी ताजा ठगी बातमी.',
      filterAll: 'सगळी खबर',
      filterArrest: 'डिजिटल अरेस्ट',
      filterKyc: 'खोटी KYC / APK',
      filterOtp: 'OTP अनी पेन्शन',
      practiceThisBtn: 'स्कॅम जिम ते सराव कयका',
      askAssistantBtn: 'साथी ले पुछका',
    },
    caregiver: {
      sectionTitle: 'रखवार (केयरगिव्हर) सुरक्षा डॅशबोर्ड',
      sectionSubtitle: 'बुजुर्ग ना सराव प्रगती हुडा, खाजगी मॅसेज न वाचता अलर्ट पाहा अनी मोबाईल स्कॅन चालवा.',
      familyCardTitle: 'नोंदवलेली कुटुंब सुरक्षा जोडी',
      seniorLabel: 'बुजुर्ग मानूस',
      guardianLabel: 'रखवार / परिजन',
      permissionsLabel: 'चालू परवानग्या',
      learningProgressTitle: 'सराव प्रगती',
      alertsFeedTitle: 'ताजा संदिग्ध घटना अनी WhatsApp अलर्ट',
      noAlertsYet: 'आता कोनता बी अलर्ट आयो. तपासायला सँडबॉक्स मधली खोटा लिंक उघडून हुडा.',
      privacyMaskedNotice: 'गोपनीयता चालू: फक्त धोक्या ना कारण दिसता; मूळ मॅसेज लपवला मंता.',
      privacySharedNotice: 'संमती चालू: बुजुर्ग संमती ने छोटा भाग दिसत मंता.',
      togglePrivacyBtn: 'गोपनीयता बदला',
      runDeviceScanBtn: 'स्टोरेज, SMS अनी WhatsApp स्कॅन कयका',
      deviceScanTitle: 'तपासलेला अ‍ॅप, APK अनी मॅसेज',
      blockedPermissionNote: 'ही परवानगी बंद मंता — त्यामुळे स्कॅन केल्ला आयो.',
      sendWhatsappBtn: 'WhatsApp अलर्ट उघडा',
      statusDispatched: 'WhatsApp अलर्ट तयार मंता',
      statusNeedsPermission: 'WhatsApp परवानगी बंद',
    },
    assistant: {
      drawerTitle: 'साथी AI — आवाज अनी गोठ सहायक',
      personaSubtitle: 'तुमच्या भाका ते मदत करणारा शांत मित्र',
      inputPlaceholder: 'प्रश्न लिहा या माइक दाबून बोला...',
      sendBtn: 'पुछका',
      listenBtn: 'बोला (माइक)',
      listeningState: 'ऐकून राहिलो... बोला जी',
      transcribingState: 'तुमचा आवाज समजत मंता...',
      speakReplyToggle: 'उत्तर बोलून ऐकवा',
      micUnavailableHint: 'माइक नसेल ते खाली प्रश्न निवडा या टाइप कयका.',
      sampleQuestionsLabel: 'झटपट आवाज प्रश्न',
      sampleQuestions: [
        'पोलीस व्हिडिओ कॉलवर डिजिटल अरेस्ट म्हणतात, खरा वंता का?',
        'बँक KYC लिंकवर आजच क्लिक करा वेहता, काय कयना?',
        'पेन्शन साठी AnyDesk अ‍ॅप टाकाले सांगतात, सुरक्षित मंता का?',
      ],
      welcomeMessage: 'सेवा जोहार! मी साथी मंता, तुमचा सायबर सुरक्षा मित्र. कोणता बी संशयास्पद कॉल, मॅसेज या लिंक बद्दल बोलून या लिहून पुछका.',
      processingTitle: 'साथी तुमचा उत्तर तयार कयत मंता',
      processingStep1: 'तुमचा प्रश्न समजत मंता...',
      processingStep2: 'सायबर सुरक्षा नियम हुडत मंता...',
      processingStep3: 'सोप्या भाका ते उत्तर बनत मंता...',
      preparingAudio: 'आवाज तयार वंता...',
      replayBtn: 'केहना (ऐका)',
      liveVoiceStartBtn: 'सीधा गोठ कॉल (Astra)',
      liveVoiceStopBtn: 'सीधा कॉल बंद कयका',
      liveVoiceConnecting: 'सीधा आवाज जोडत मंता...',
      liveVoiceActive: 'सीधा आवाज चालू — आराम ने गोठ कयका',
      liveVoiceSpeaking: 'साथी बोलत मंता...',
      liveVoiceFallback: 'सीधा माइक नसेल ते जलद चॅट अनी आवाज मोड चालू राहील.',
      stopAudioBtn: 'आवाज थांबवा',
    },
    warningModal: {
      title: 'थांबा! मोठा धोका अडवला मंता',
      blockedTargetLabel: 'अडवलेली लिंक / अ‍ॅप / मॅसेज',
      whatsappPrepared: 'रखवार ले खबर पठवली',
      whatsappSentBanner: 'तुमच्या रखवार साठी WhatsApp अनी डॅशबोर्ड अलर्ट पठवला मंता.',
      guestBanner: 'हा धोका सुरक्षित अडवला मंता. रखवार ले WhatsApp अलर्ट साठी साइन इन कयका.',
      openWhatsappBtn: 'आता WhatsApp वर अलर्ट पठोका',
      addCaregiverBtn: 'साइन इन / रखवार जोडा',
      dismissBtn: 'बंद कयका अनी सुरक्षित राहा',
      call1930Btn: '१९३० हेल्पलाइन लावा',
    },
    footer: {
      manifesto: 'बुजुर्ग मानूस ले फक्त कोर्स आयो, तर सरावाचे मैदान, दुसरी नजर अनी कुटुंब ना सुरक्षा कवच पाहिजे.',
      hackathonCredit: 'CyberRakshak · बुजुर्ग मानूस साठी डिजिटल साक्षरता अनी सायबर सुरक्षा · YCCE HACKkumbh नागपूर',
    },
    siteUpdates: {
      openStudioBtn: 'वेबसाइट अपडेट / फीचर जोडा',
      studioTitle: 'वेबसाइट अपडेट अनी नवे फीचर जोडा',
      studioSubtitle: 'आधीचा वेबसाइट न बदलता नवे सुरक्षा भाग, कार्ड, ताजा खबर, सुरक्षित डोमेन अनी मदत नंबर जोडा.',
      tabModules: 'सुरक्षा विभाग',
      tabCustomFeature: 'नवीन फीचर कार्ड',
      tabContent: 'खबर / डोमेन / नंबर',
      tabBackup: 'एक्सपोर्ट / इम्पोर्ट',
      sectionHeading: 'वेबसाइटवर जोडलेले नवे फीचर',
      sectionSubheading: 'अपडेट स्टुडिओतून चालू केल्ला नवे सुरक्षा टूल्स.',
      addBtn: 'वेबसाइटवर जोडा',
      saveBtn: 'बदल सेव्ह कयका',
      resetBtn: 'जोडलेला अपडेट काढा',
      exportBtn: 'JSON फाइल घ्या',
      importBtn: 'JSON फाइल टाका',
      savedToast: 'वेबसाइटचे नवे अपडेट सेव्ह झाले.',
      modSosTitle: 'तातकाळ SOS मदत कार्ड',
      modSosDesc: 'एका बटनात १९३० फोन, सायबर पोर्टल अनी घरच्याले WhatsApp SOS.',
      modTipTitle: 'रोजची सुरक्षा सूचना पट्टी',
      modTipDesc: 'तुमच्या भाका ते फोन अनी इंटरनेट जपून वापरायची आठवण.',
      modContactsTitle: 'घरचे अनी जरूरी नंबर बुक',
      modContactsDesc: 'परिजन, डॉक्टर या बँक मानूस ना नंबर जतन कयसी लगेच फोन लावा.',
      modPinTitle: 'PIN अनी UPI तपासणी यादी',
      modPinDesc: 'UPI, सिम लॉक अनी पासवर्ड सुरक्षित ठेवायचे ४ सोपे नियम तपासा.',
    },
  },
};
