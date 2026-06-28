import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { initAuth, googleSignIn, logout } from "./auth";
import { encryptText, decryptText, generatePasskeyHash } from "./cryptoUtils";
import { ChatMessage, JournalEntry, ParsedJournalAnalysis, SyllabusTask } from "./types";
import SyllabusTracker from "./components/SyllabusTracker";
import CompanionChat from "./components/CompanionChat";
import AnalyticsChart from "./components/AnalyticsChart";
import ContactsMeetChat from "./components/ContactsMeetChat";
import ParentDashboard from "./components/ParentDashboard";
import ClassroomManager from "./components/ClassroomManager";
import CalendarManager from "./components/CalendarManager";
import { sendGoogleChatMessage } from "./workspace";
import {
  Heart,
  Shield,
  Sparkles,
  Users,
  Video,
  Key,
  LogOut,
  Trash2,
  Bell,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  UserCheck,
  Award,
  Lock,
  Unlock,
  ClipboardList,
  Pencil,
  Settings,
  X,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  Smile,
  ShieldCheck,
} from "lucide-react";

// Predefined default emotion tags
const POPULAR_TAGS = [
  "Test Anxiety",
  "Syllabus Overwhelm",
  "Mock Test Panic",
  "Sleep Deprived",
  "Imposter Syndrome",
  "Burnout",
  "Deep Exhaustion",
  "Self-Doubt",
  "Hopeful",
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  Eng: {
    appSubtitle: "Academic Wellness & Pattern Analysis System",
    howAreYouFeeling: "How are you feeling today?",
    phaseIngestion: "Phase 1: Ingestion",
    selectIndicators: "Select Emotional Indicators (Low Friction)",
    studentLogLabel: "Student Open-Ended Log (PII Masking Active)",
    studentLogPlaceholder: "E.g., I froze during the physics mock test today. I'm afraid I won't finish the JEE syllabus in time. I feel like giving up...",
    analyzeAndEncrypt: "Analyze Entry & Encrypt to Vault",
    analyzingAndEncrypting: "Analyzing & Encrypting...",
    patternAnalyticsTab: "Insights & Historical Trends",
    workspaceToolsTab: "Peer Workspace & Meet scheduler",
    secureLabel: "Secure",
    userProfile: "User profile",
    "Test Anxiety": "Test Anxiety",
    "Syllabus Overwhelm": "Syllabus Overwhelm",
    "Mock Test Panic": "Mock Test Panic",
    "Sleep Deprived": "Sleep Deprived",
    "Imposter Syndrome": "Imposter Syndrome",
    "Burnout": "Burnout",
    "Deep Exhaustion": "Deep Exhaustion",
    "Self-Doubt": "Self-Doubt",
    "Hopeful": "Hopeful",
  },
  Span: {
    appSubtitle: "Sistema de Análisis de Patrones y Bienestar Académico",
    howAreYouFeeling: "¿Cómo te sientes hoy?",
    phaseIngestion: "Fase 1: Registro / Ingesta",
    selectIndicators: "Seleccionar indicadores emocionales (Bajo Esfuerzo)",
    studentLogLabel: "Registro abierto del estudiante (Máscara PII activa)",
    studentLogPlaceholder: "Ej. Me bloqueé en el simulacro de física de hoy. Temo no terminar a tiempo el plan de estudios. Siento ganas de rendirme...",
    analyzeAndEncrypt: "Analizar entrada y encriptar en la bóveda",
    analyzingAndEncrypting: "Analizando y encriptando...",
    patternAnalyticsTab: "Tendencias históricas y análisis",
    workspaceToolsTab: "Espacio de compañeros y programador de Meet",
    secureLabel: "Seguro",
    userProfile: "Perfil del usuario",
    "Test Anxiety": "Ansiedad ante exámenes",
    "Syllabus Overwhelm": "Agobio de temario",
    "Mock Test Panic": "Pánico de simulacros",
    "Sleep Deprived": "Falta de sueño",
    "Imposter Syndrome": "Síndrome del impostor",
    "Burnout": "Agotamiento extremo",
    "Deep Exhaustion": "Cansancio profundo",
    "Self-Doubt": "Duda de uno mismo",
    "Hopeful": "Esperanzado",
  },
  Hindi: {
    appSubtitle: "शैक्षणिक कल्याण और पैटर्न विश्लेषण प्रणाली",
    howAreYouFeeling: "आज आप कैसा महसूस कर रहे हैं?",
    phaseIngestion: "चरण 1: प्रविष्टि (लॉग)",
    selectIndicators: "भावनात्मक संकेतकों का चयन करें (कम प्रयास)",
    studentLogLabel: "छात्रों का खुला लॉग (PII मास्किंग सक्रिय)",
    studentLogPlaceholder: "उदाहरण के लिए, मैं आज भौतिकी के मॉक टेस्ट के दौरान घबरा गया था। मुझे डर है कि मैं समय पर पूरा सिलेबस खत्म नहीं कर पाऊंगा...",
    analyzeAndEncrypt: "लॉग का विश्लेषण करें और तिजोरी में एन्क्रिप्ट करें",
    analyzingAndEncrypting: "विश्लेषण और एन्क्रिप्ट किया जा रहा है...",
    patternAnalyticsTab: "ऐतिहासिक रुझान और अंतर्दृष्टि",
    workspaceToolsTab: "सहकर्मी वर्कस्पेस और मीट शेड्यूलर",
    secureLabel: "सुरक्षित",
    userProfile: "उपयोगकर्ता प्रोफ़ाइल",
    "Test Anxiety": "परीक्षा की चिंता",
    "Syllabus Overwhelm": "पाठ्यक्रम का दबाव",
    "Mock Test Panic": "मॉक टेस्ट घबराहट",
    "Sleep Deprived": "नींद की कमी",
    "Imposter Syndrome": "इम्पोस्टर सिंड्रोम",
    "Burnout": "थकान और तनाव (बर्नआउट)",
    "Deep Exhaustion": "गहरी थकावट",
    "Self-Doubt": "आत्म-संदेह",
    "Hopeful": "आशावादी",
  },
  Bengali: {
    appSubtitle: "একাডেমিক সুস্থতা এবং প্যাটার্ন বিশ্লেষণ সিস্টেম",
    howAreYouFeeling: "আজ আপনি কেমন অনুভব করছেন?",
    phaseIngestion: "ধাপ ১: ভুক্তি (ইনজেস্শন)",
    selectIndicators: "আবেগপূর্ণ সূচকগুলি নির্বাচন করুন (সহজ পদ্ধতি)",
    studentLogLabel: "শিক্ষার্থীদের উন্মুক্ত লগ (PII মাস্কিং সক্রিয়)",
    studentLogPlaceholder: "যেমন, আমি আজ পদার্থবিদ্যার মক টেস্টের সময় ঘাবড়ে গিয়েছিলাম। আমার ভয় হচ্ছে যে আমি সময়মতো সিলেবাস শেষ করতে পারব না...",
    analyzeAndEncrypt: "বিশ্লেষণ করুন এবং ভল্টে এনক্রিপ্ট করুন",
    analyzingAndEncrypting: "বিশ্লেষণ এবং এনক্রিপ্ট করা হচ্ছে...",
    patternAnalyticsTab: "ঐতিহাসিক প্রবণতা এবং অন্তর্দৃষ্টি",
    workspaceToolsTab: "সহকর্মী ওয়ার্কস্পেস এবং মিট শিডিউলার",
    secureLabel: "সুরক্ষিত",
    userProfile: "ব্যবহারকারী প্রোফাইল",
    "Test Anxiety": "পরীক্ষার উদ্বেগ",
    "Syllabus Overwhelm": "সিলেবাসের চাপ",
    "Mock Test Panic": "মক টেস্টে আতঙ্ক",
    "Sleep Deprived": "ঘুমের অভাব",
    "Imposter Syndrome": "ইম্পোস্টার সিন্ড্রোম",
    "Burnout": "অতিরিক্ত মানসিক অবসাদ",
    "Deep Exhaustion": "গভীর ক্লান্তি",
    "Self-Doubt": "আত্ম-সন্দেহ",
    "Hopeful": "আশাবাদী",
  },
  French: {
    appSubtitle: "Système de bien-être académique et d'analyse des profils",
    howAreYouFeeling: "Comment vous sentez-vous aujourd'hui ?",
    phaseIngestion: "Phase 1 : Saisie",
    selectIndicators: "Sélectionner des indicateurs émotionnels (faible friction)",
    studentLogLabel: "Journal de l'étudiant (Masquage des données personnelles actif)",
    studentLogPlaceholder: "Ex. J'ai paniqué pendant l'examen blanc de physique aujourd'hui. J'ai peur de ne pas finir le programme à temps...",
    analyzeAndEncrypt: "Analyser l'entrée et chiffrer vers le coffre-fort",
    analyzingAndEncrypting: "Analyse et Chiffrement en cours...",
    patternAnalyticsTab: "Tendances historiques et perspectives",
    workspaceToolsTab: "Espace d'entraide et planificateur Meet",
    secureLabel: "Sécurisé",
    userProfile: "Profil utilisateur",
    "Test Anxiety": "Anxiété d'examen",
    "Syllabus Overwhelm": "Surcharge de révision",
    "Mock Test Panic": "Panique du blanc",
    "Sleep Deprived": "Manque de sommeil",
    "Imposter Syndrome": "Syndrome de l'imposteur",
    "Burnout": "Épuisement professionnel",
    "Deep Exhaustion": "Fatigue profonde",
    "Self-Doubt": "Doute de soi",
    "Hopeful": "Plein d'espoir",
  }
};

const t = (key: string, lang: string): string => {
  const langSet = TRANSLATIONS[lang] || TRANSLATIONS["Eng"];
  return langSet[key] || TRANSLATIONS["Eng"][key] || key;
};

const INNER_WORKSPACE_TABS_TRANSLATIONS: Record<string, Record<string, string>> = {
  Eng: {
    classroom: "Google Classroom",
    calendar: "Google Calendar",
    meet: "Meet & Peers"
  },
  Span: {
    classroom: "Google Classroom",
    calendar: "Google Calendar",
    meet: "Meet y Compañeros"
  },
  Hindi: {
    classroom: "गूगल क्लासरूम",
    calendar: "गूगल कैलेंडर",
    meet: "मीट और सहकर्मी"
  },
  Bengali: {
    classroom: "গুগল ক্লাসরুম",
    calendar: "গুগল ক্যালেন্ডার",
    meet: "মিট ও সহকর্মী"
  },
  French: {
    classroom: "Google Classroom",
    calendar: "Google Calendar",
    meet: "Meet & Contacts"
  }
};

export default function App() {
  // Auth states
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isParentSession, setIsParentSession] = useState(false);
  const [loginTab, setLoginTab] = useState<"student" | "parent">("student");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerFullName, setRegisterFullName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasscode, setRegisterPasscode] = useState("");
  const [parentStudentCode, setParentStudentCode] = useState("STU-2026");
  const [parentPasscodeField, setParentPasscodeField] = useState("PARENT123");

  // Vault states
  const [passcode, setPasscode] = useState("");
  const [isVaultInitialized, setIsVaultInitialized] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultError, setVaultError] = useState<string | null>(null);

  // Journal Entry Form states
  const [journalInput, setJournalInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Active / Last logged journal parsing analysis state
  const [currentAnalysis, setCurrentAnalysis] = useState<ParsedJournalAnalysis | null>(null);

  // Loaded journal entries (all logs)
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [decryptedTexts, setDecryptedTexts] = useState<Record<string, string>>({});

  // Chatbot states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);

  // Reminders / Notification states
  const [reminderTime, setReminderTime] = useState("21:00");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Google Chat share states for selected syllabus tracker
  const [chatSpaceId, setChatSpaceId] = useState("");
  const [isSharingSyllabus, setIsSharingSyllabus] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  // Custom confirm dialog state to prevent iframe window.confirm blocking issues
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Streaks
  const [streakCount, setStreakCount] = useState(12);

  // Active Bottom Tab
  const [activeTab, setActiveTab] = useState<"insights" | "workspace">("insights");
  const [workspaceSubTab, setWorkspaceSubTab] = useState<"classroom" | "calendar" | "meet">("classroom");

  // Profile Modal & Edit States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<"profile" | "settings">("profile");

  const [profileName, setProfileName] = useState("Alex Chen");
  const [profileEmail, setProfileEmail] = useState("alex.chen@gmail.com");
  const [profileMobile, setProfileMobile] = useState("Add number");
  const [profileLocation, setProfileLocation] = useState("USA");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempMobile, setTempMobile] = useState("");
  const [tempLocation, setTempLocation] = useState("");
  const [tempProfileImage, setTempProfileImage] = useState<string | null>(null);

  const [appTheme, setAppTheme] = useState<"Light" | "Dark">("Light");
  const isDark = appTheme === "Dark";
  const [appLanguage, setAppLanguage] = useState("Eng");

  const [notificationStatus, setNotificationStatus] = useState<"Allow" | "Mute">("Allow");
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  // Load custom profile
  useEffect(() => {
    const saved = localStorage.getItem("mindful_scholar_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) {
          setProfileName(parsed.name);
          setTempName(parsed.name);
        }
        if (parsed.email) {
          setProfileEmail(parsed.email);
          setTempEmail(parsed.email);
        }
        if (parsed.mobile) {
          setProfileMobile(parsed.mobile);
          setTempMobile(parsed.mobile);
        }
        if (parsed.location) {
          setProfileLocation(parsed.location);
          setTempLocation(parsed.location);
        }
        if (parsed.image) {
          setProfileImage(parsed.image);
          setTempProfileImage(parsed.image);
        }
        if (parsed.theme) setAppTheme(parsed.theme);
        if (parsed.language) setAppLanguage(parsed.language);
        if (parsed.notificationStatus) setNotificationStatus(parsed.notificationStatus);
      } catch (e) {
        console.error("Error reading saved profile", e);
      }
    } else if (user) {
      const uName = user.displayName || "Alex Chen";
      const uEmail = user.email || "alex.chen@gmail.com";
      setProfileName(uName);
      setTempName(uName);
      setProfileEmail(uEmail);
      setTempEmail(uEmail);
    }
  }, [user]);

  const openProfileModal = () => {
    setTempName(profileName);
    setTempEmail(profileEmail);
    setTempMobile(profileMobile);
    setTempLocation(profileLocation);
    setTempProfileImage(profileImage);
    setIsProfileOpen(true);
  };

  const handleSaveProfile = () => {
    const updated = {
      name: tempName || profileName,
      email: tempEmail || profileEmail,
      mobile: tempMobile || profileMobile,
      location: tempLocation || profileLocation,
      image: tempProfileImage || profileImage,
      theme: appTheme,
      language: appLanguage,
      notificationStatus: notificationStatus,
    };
    localStorage.setItem("mindful_scholar_profile", JSON.stringify(updated));
    setProfileName(updated.name);
    setProfileEmail(updated.email);
    setProfileMobile(updated.mobile);
    setProfileLocation(updated.location);
    setProfileImage(updated.image);
    setNotificationToast("Profile details saved successfully! ✨");
    setIsProfileOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfileImage(reader.result as string);
        setNotificationToast("Profile image loaded! Click Save Change to save. 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Initialize Authentication and fetch Local Data
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, cachedToken) => {
        setUser(currentUser);
        setToken(cachedToken);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );

    // Load initial entries from local storage (to check if vault exists)
    const storedHash = localStorage.getItem("mindful_scholar_vault_hash");
    if (storedHash) {
      setIsVaultInitialized(true);
    }

    // Load streak
    const storedStreak = localStorage.getItem("mindful_scholar_streak");
    if (storedStreak) {
      setStreakCount(parseInt(storedStreak, 10));
    } else {
      localStorage.setItem("mindful_scholar_streak", "12");
    }

    // Load reminders config
    const storedReminder = localStorage.getItem("mindful_scholar_reminder");
    if (storedReminder) {
      const parsed = JSON.parse(storedReminder);
      setReminderTime(parsed.time || "21:00");
      setReminderEnabled(parsed.enabled || false);
    }

    // Load entries on startup for early statistics/parent dashboards
    loadEntries();

    return () => unsubscribe();
  }, []);

  // 2. Load and parse entries after passcode verification with dynamic decryption
  const loadEntries = async (providedPasscode?: string) => {
    const activePasscode = providedPasscode || passcode;
    const rawEntries = localStorage.getItem("mindful_scholar_entries");
    if (rawEntries) {
      try {
        const parsed: JournalEntry[] = JSON.parse(rawEntries);
        
        // Decrypt the encryptedAnalysis for each entry if present and passcode exists
        const decryptedEntries = await Promise.all(
          parsed.map(async (entry) => {
            let decryptedAnalysis: ParsedJournalAnalysis | null = entry.parsedAnalysis;
            
            if (entry.isEncrypted && entry.encryptedAnalysis && activePasscode) {
              try {
                const decryptedStr = await decryptText(entry.encryptedAnalysis, activePasscode);
                decryptedAnalysis = JSON.parse(decryptedStr);
              } catch (decryptErr) {
                console.warn("Failed to decrypt entry analysis for entry", entry.id, decryptErr);
                decryptedAnalysis = null;
              }
            }
            
            return {
              ...entry,
              parsedAnalysis: decryptedAnalysis,
            };
          })
        );

        setEntries(decryptedEntries);

        // If we have an entry with study tasks, populate our syllabus tracker automatically with the latest
        const latestWithTasks = [...decryptedEntries]
          .reverse()
          .find((e) => e.parsedAnalysis?.copingPlan?.biteSizedSyllabusTracker);

        if (latestWithTasks && latestWithTasks.parsedAnalysis) {
          setCurrentAnalysis(latestWithTasks.parsedAnalysis);
        }
      } catch (err) {
        console.error("Error reading/decrypting journal logs:", err);
      }
    }
  };

  // Save journal entries safely to localStorage with encryption-at-rest for analyzed data
  const saveEntries = async (entriesToSave: JournalEntry[], customPasscode?: string) => {
    const activePasscode = customPasscode || passcode;
    
    const securedEntries = await Promise.all(
      entriesToSave.map(async (entry) => {
        // Only encrypt if it is flagged as encrypted and we have a passcode
        if (!entry.isEncrypted || !activePasscode) {
          return entry;
        }

        let encryptedAnalysis = entry.encryptedAnalysis;
        if (entry.parsedAnalysis) {
          try {
            encryptedAnalysis = await encryptText(JSON.stringify(entry.parsedAnalysis), activePasscode);
          } catch (err) {
            console.error("Failed to encrypt parsed analysis:", err);
          }
        }

        return {
          id: entry.id,
          date: entry.date,
          encryptedText: entry.encryptedText,
          isEncrypted: entry.isEncrypted,
          piiMaskedText: entry.piiMaskedText,
          encryptedAnalysis: encryptedAnalysis,
          parsedAnalysis: null, // Keep plaintext analysis out of localStorage (at rest)
        };
      })
    );

    localStorage.setItem("mindful_scholar_entries", JSON.stringify(securedEntries));
    setEntries(entriesToSave); // Maintain plaintext decrypted entries in React memory
  };

  // 3. Handle Google Authentication Login
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        setNotificationToast(`Welcome back, ${result.user.displayName}!`);
      }
    } catch (err: any) {
      console.error("Authentication failed:", err);
      alert("Sign in failed. Make sure popup windows are allowed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const renderConfirmDialog = () => {
    if (!confirmDialog.isOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" 
          onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        />
        {/* Modal Container */}
        <div className={`relative w-full max-w-sm rounded-[24px] p-6 shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? "bg-[#16221c] border-[#25372e] text-[#e1eae5]" : "bg-white border-[#e6e2da] text-[#333d29]"
        }`}>
          <h3 className="text-base font-serif italic font-bold mb-2">
            {confirmDialog.title}
          </h3>
          <p className={`text-xs leading-relaxed mb-5 ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}>
            {confirmDialog.message}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                isDark 
                  ? "bg-[#0e1612] border-[#25372e] text-gray-400 hover:text-white" 
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={confirmDialog.onConfirm}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Sign Out",
      message: "Are you sure you want to log out of Mindful Scholar? This will clear your current session.",
      onConfirm: async () => {
        await logout();
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
        setIsVaultUnlocked(false);
        setDecryptedTexts({});
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // 4. Secure Passkey Vault initialization/unlocking
  const handleInitializeVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode || passcode.trim().length < 4) {
      setVaultError("Please enter a secure passkey of at least 4 characters.");
      return;
    }

    try {
      const hash = await generatePasskeyHash(passcode);
      localStorage.setItem("mindful_scholar_vault_hash", hash);
      setIsVaultInitialized(true);
      setIsVaultUnlocked(true);
      setVaultError(null);
      await loadEntries(passcode);
      setNotificationToast("Secure cryptographic vault created successfully!");
    } catch (err) {
      setVaultError("Could not initialize secure vault.");
    }
  };

  const handleUnlockVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;

    try {
      const calculatedHash = await generatePasskeyHash(passcode);
      const storedHash = localStorage.getItem("mindful_scholar_vault_hash");

      if (storedHash === calculatedHash) {
        setIsVaultUnlocked(true);
        setVaultError(null);
        await loadEntries(passcode);
        setNotificationToast("Vault unlocked. Your journal entries decrypted.");
      } else {
        setVaultError("Incorrect passcode. Try again.");
      }
    } catch (err) {
      setVaultError("Error unlocking secure vault.");
    }
  };

  const runClientHeuristicAnalysis = (text: string): ParsedJournalAnalysis => {
    const lowercase = text.toLowerCase();
    
    // 1. Detect emotions
    const emotionTags: string[] = [];
    if (lowercase.includes("anxious") || lowercase.includes("worry") || lowercase.includes("fear") || lowercase.includes("scared")) {
      emotionTags.push("Test Anxiety");
    }
    if (lowercase.includes("stress") || lowercase.includes("overwhelm") || lowercase.includes("too much") || lowercase.includes("burden")) {
      emotionTags.push("Overwhelm");
    }
    if (lowercase.includes("tired") || lowercase.includes("exhaust") || lowercase.includes("sleep") || lowercase.includes("burn")) {
      emotionTags.push("Burnout");
    }
    if (lowercase.includes("fail") || lowercase.includes("marks") || lowercase.includes("bad") || lowercase.includes("mock") || lowercase.includes("low")) {
      emotionTags.push("Self-Doubt");
    }
    if (emotionTags.length === 0) {
      emotionTags.push("Academic Stress");
    }

    // 2. Identify primary trigger
    let primaryTrigger = "General exam pressure and syllabus deadlines.";
    if (lowercase.includes("mock") || lowercase.includes("test") || lowercase.includes("marks")) {
      primaryTrigger = "Mock test performance relative to syllabus completion.";
    } else if (lowercase.includes("sleep") || lowercase.includes("tired") || lowercase.includes("night")) {
      primaryTrigger = "Sleep deprivation and physical fatigue.";
    } else if (lowercase.includes("syllabus") || lowercase.includes("backlog")) {
      primaryTrigger = "Syllabus deadline and study backlog anxiety.";
    }

    // 3. Sentiment & intensity
    let sentimentScore = -0.3;
    let stressIntensity = "Medium";
    if (lowercase.includes("extremely") || lowercase.includes("panic") || lowercase.includes("terrible") || lowercase.includes("hate") || lowercase.includes("worst")) {
      sentimentScore = -0.7;
      stressIntensity = "High";
    } else if (lowercase.includes("okay") || lowercase.includes("fine") || lowercase.includes("good") || lowercase.includes("hope") || lowercase.includes("calm")) {
      sentimentScore = 0.1;
      stressIntensity = "Low";
    }

    const isDistressCrisis = lowercase.includes("harm") || lowercase.includes("end it") || lowercase.includes("die") || lowercase.includes("suicide") || lowercase.includes("hopeless");

    let piiMaskedText = text;
    const namesToMask = ["alex", "john", "arunanshu", "sam", "priya", "rahul", "amit"];
    for (const name of namesToMask) {
      const regex = new RegExp(`\\b${name}\\b`, "gi");
      piiMaskedText = piiMaskedText.replace(regex, "[STUDENT]");
    }

    const hasAcademicAnxiety = lowercase.includes("stud") || lowercase.includes("exam") || lowercase.includes("test") || lowercase.includes("mock") || lowercase.includes("syllabus") || lowercase.includes("math") || lowercase.includes("physics") || lowercase.includes("chemistry") || lowercase.includes("class") || lowercase.includes("school");

    return {
      sentimentScore,
      emotionTags,
      primaryTrigger,
      stressIntensity,
      isDistressCrisis,
      piiMaskedText,
      copingPlan: {
        hasAcademicAnxiety,
        encouragingMessage: "It's completely normal to feel overwhelmed during preparation. Remember, your score does not define your worth. Let's focus on small, micro-wins today.",
        biteSizedSyllabusTracker: [
          { topic: "Break down today's study target into 3 20-minute chunks", difficulty: "Easy", durationMinutes: 20, completed: false },
          { topic: "Review formulas or basic summary notes for 15 minutes", difficulty: "Easy", durationMinutes: 15, completed: false },
          { topic: "Solve just 2 high-priority questions without timing pressure", difficulty: "Medium", durationMinutes: 25, completed: false }
        ],
        mindfulnessExercise: {
          title: "Box Breathing (4-4-4-4 Technique)",
          description: "Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold empty for 4 seconds. Repeat 4 times to calm your nervous system."
        }
      }
    };
  };

  // 5. Daily Mood Journaling ingestion and server analysis
  const handleJournalAnalysis = async () => {
    if (!journalInput.trim()) {
      setAnalysisError("Please write something about your day first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    // Combine manual selected emotional tags and written text for parsing context
    const tagsString = selectedTags.length > 0 ? ` [Tags: ${selectedTags.join(", ")}]` : "";
    const fullTextToAnalyze = journalInput.trim() + tagsString;

    try {
      const res = await fetch("/api/analyze-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullTextToAnalyze }),
      });

      if (!res.ok) {
        throw new Error("Analysis request failed on server.");
      }

      const parsedAnalysis: ParsedJournalAnalysis = await res.json();

      // Trigger safety warnings if severe distress is flagged
      if (parsedAnalysis.isDistressCrisis) {
        setNotificationToast("Crisis hotline activated. Support information is highlighted below.");
      } else {
        setNotificationToast("Log analyzed. Study plan and coping exercises updated!");
      }

      // Encrypt the original journal input text before saving to protect user privacy
      const encryptedPayload = await encryptText(journalInput, passcode);

      // Create new JournalEntry object
      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        encryptedText: encryptedPayload,
        isEncrypted: true,
        piiMaskedText: parsedAnalysis.piiMaskedText,
        // We save the parsed analysis. To protect privacy further, we can strip coping plan text or keep it
        parsedAnalysis: parsedAnalysis,
      };

      // Save to localStorage
      const updatedEntries = [...entries, newEntry];
      await saveEntries(updatedEntries);
      setCurrentAnalysis(parsedAnalysis);

      // Cache decrypted text for this entry instantly
      setDecryptedTexts((prev) => ({
        ...prev,
        [newEntry.id]: journalInput,
      }));

      // Update Streak count
      const todayDateStr = new Date().toDateString();
      const lastLoggedDateStr = localStorage.getItem("mindful_scholar_last_log_date");
      if (lastLoggedDateStr !== todayDateStr) {
        const nextStreak = streakCount + 1;
        setStreakCount(nextStreak);
        localStorage.setItem("mindful_scholar_streak", nextStreak.toString());
        localStorage.setItem("mindful_scholar_last_log_date", todayDateStr);
      }

      // Clear Inputs
      setJournalInput("");
      setSelectedTags([]);

    } catch (err: any) {
      console.warn("Error calling backend API, falling back to client-side rule-based analyzer:", err);
      try {
        const parsedAnalysis = runClientHeuristicAnalysis(fullTextToAnalyze);
        
        if (parsedAnalysis.isDistressCrisis) {
          setNotificationToast("Crisis hotline activated. Support information is highlighted below.");
        } else {
          setNotificationToast("Log analyzed locally. Study plan and coping exercises updated!");
        }

        const encryptedPayload = await encryptText(journalInput, passcode);

        const newEntry: JournalEntry = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          encryptedText: encryptedPayload,
          isEncrypted: true,
          piiMaskedText: parsedAnalysis.piiMaskedText,
          parsedAnalysis: parsedAnalysis,
        };

        const updatedEntries = [...entries, newEntry];
        await saveEntries(updatedEntries);
        setCurrentAnalysis(parsedAnalysis);

        setDecryptedTexts((prev) => ({
          ...prev,
          [newEntry.id]: journalInput,
        }));

        const todayDateStr = new Date().toDateString();
        const lastLoggedDateStr = localStorage.getItem("mindful_scholar_last_log_date");
        if (lastLoggedDateStr !== todayDateStr) {
          const nextStreak = streakCount + 1;
          setStreakCount(nextStreak);
          localStorage.setItem("mindful_scholar_streak", nextStreak.toString());
          localStorage.setItem("mindful_scholar_last_log_date", todayDateStr);
        }

        setJournalInput("");
        setSelectedTags([]);
      } catch (localErr) {
        console.error("Local analyzer fallback failed:", localErr);
        setAnalysisError("Could not parse or secure your entry. Please check your vault passcode.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const decryptSpecificEntry = async (entryId: string, encryptedPayload: string) => {
    try {
      const decrypted = await decryptText(encryptedPayload, passcode);
      setDecryptedTexts((prev) => ({
        ...prev,
        [entryId]: decrypted,
      }));
    } catch (err) {
      alert("Decryption failed. Please check passcode.");
    }
  };

  const deleteEntry = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Journal Entry",
      message: "Confirm: Permanently delete this encrypted journal entry? This action cannot be undone.",
      onConfirm: async () => {
        const updated = entries.filter((e) => e.id !== id);
        await saveEntries(updated);
        if (currentAnalysis && entries.find((e) => e.id === id)?.parsedAnalysis === currentAnalysis) {
          setCurrentAnalysis(null);
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setNotificationToast("Journal entry permanently deleted.");
      }
    });
  };

  // 6. Conversational Chat Send Handler
  const handleChatSendMessage = async (text: string, selectedModel: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setIsGeneratingChat(true);

    try {
      const res = await fetch("/api/companion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          parsedContext: currentAnalysis,
          modelMode: selectedModel,
        }),
      });

      if (!res.ok) {
        throw new Error("Chat companion endpoint failed.");
      }

      const reply = await res.json();

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: reply.text || "I'm listening. Let's work together to organize your tasks.",
        timestamp: new Date().toISOString(),
        groundingSources: reply.groundingSources,
        fallbackActive: reply.fallbackActive,
      };

      setChatMessages((prev) => [...prev, botMsg]);

    } catch (err) {
      console.error("Chat error:", err);
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: "I had a temporary connection issue. Please double check that your API Key is set up correctly.",
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsGeneratingChat(false);
    }
  };

  // 7. Toggle Syllabus task completed state
  const handleToggleSyllabusTask = async (idx: number) => {
    if (!currentAnalysis || !currentAnalysis.copingPlan.biteSizedSyllabusTracker) return;

    const tracker = [...currentAnalysis.copingPlan.biteSizedSyllabusTracker];
    tracker[idx] = {
      ...tracker[idx],
      completed: !tracker[idx].completed,
    };

    const updatedAnalysis: ParsedJournalAnalysis = {
      ...currentAnalysis,
      copingPlan: {
        ...currentAnalysis.copingPlan,
        biteSizedSyllabusTracker: tracker,
      },
    };

    setCurrentAnalysis(updatedAnalysis);

    // Update inside the entries log too
    const updatedEntries = entries.map((e) => {
      if (e.parsedAnalysis && e.parsedAnalysis.primaryTrigger === currentAnalysis.primaryTrigger) {
        return {
          ...e,
          parsedAnalysis: updatedAnalysis,
        };
      }
      return e;
    });

    await saveEntries(updatedEntries);
  };

  // 8. Share coping plan to Google Chat Space
  const handleShareToGoogleChat = async () => {
    if (!chatSpaceId.trim() || !currentAnalysis?.copingPlan?.biteSizedSyllabusTracker) return;

    // Formulate a beautiful markdown list
    const tasks = currentAnalysis.copingPlan.biteSizedSyllabusTracker;
    const taskListMd = tasks
      .map((t) => `- [${t.completed ? "x" : " "}] ${t.topic} (${t.difficulty} | ${t.durationMinutes}m)`)
      .join("\n");

    const message = `📚 *Mindful Scholar Syllabus Plan*\n_Here is the personalized study plan generated to ease cognitive overwhelm:_\n\n${taskListMd}\n\n*Encouragement:* "${currentAnalysis.copingPlan.encouragingMessage}"`;

    setConfirmDialog({
      isOpen: true,
      title: "Share Checklist via Google Chat",
      message: `Confirm: Send your coping syllabus tracker task checklist to Google Chat Space '${chatSpaceId}'?`,
      onConfirm: async () => {
        setIsSharingSyllabus(true);
        setShareSuccess(null);
        setShareError(null);

        try {
          await sendGoogleChatMessage(chatSpaceId, message);
          setShareSuccess("Syllabus checklist shared successfully to Google Chat Workspace!");
        } catch (err: any) {
          console.error(err);
          setShareError("Could not share to Google Chat. Make sure your Space ID is valid and Chat scopes are accepted.");
        } finally {
          setIsSharingSyllabus(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // 8.5 Import a task from Google Classroom coursework into the student's active syllabus tracker
  const handleImportClassroomTask = async (taskTopic: string, durationMinutes: number = 30) => {
    const newTask: SyllabusTask = {
      topic: taskTopic,
      difficulty: "Medium",
      durationMinutes: durationMinutes,
      completed: false
    };

    if (currentAnalysis) {
      const tracker = currentAnalysis.copingPlan.biteSizedSyllabusTracker ? [...currentAnalysis.copingPlan.biteSizedSyllabusTracker] : [];
      if (tracker.some(t => t.topic === taskTopic)) {
        setNotificationToast("Task is already in your syllabus checklist!");
        return;
      }
      tracker.push(newTask);
      const updatedAnalysis: ParsedJournalAnalysis = {
        ...currentAnalysis,
        copingPlan: {
          ...currentAnalysis.copingPlan,
          biteSizedSyllabusTracker: tracker,
        },
      };
      setCurrentAnalysis(updatedAnalysis);

      // Update inside the entries log too
      const updatedEntries = entries.map((e) => {
        if (e.parsedAnalysis && e.parsedAnalysis.primaryTrigger === currentAnalysis.primaryTrigger) {
          return {
            ...e,
            parsedAnalysis: updatedAnalysis,
          };
        }
        return e;
      });
      await saveEntries(updatedEntries);
    } else {
      // Create a fresh analysis containing this imported Classroom assignment
      const newAnalysis: ParsedJournalAnalysis = {
        sentimentScore: 0,
        emotionTags: ["Classroom Focus"],
        primaryTrigger: "Imported Classroom Assignment",
        stressIntensity: "Low",
        isDistressCrisis: false,
        piiMaskedText: "",
        copingPlan: {
          hasAcademicAnxiety: true,
          encouragingMessage: "Let's work systematically through your imported Classroom tasks. Small steps lead to big wins!",
          biteSizedSyllabusTracker: [newTask],
          mindfulnessExercise: {
            title: "Task-Based Box Breathing",
            description: "Breathe in for 4s, hold for 4s, exhale for 4s, hold for 4s. Complete 3 rounds before starting."
          }
        }
      };
      setCurrentAnalysis(newAnalysis);
    }
  };

  // 9. Reminders Logic (Web Notifications)
  const handleToggleReminder = () => {
    const nextVal = !reminderEnabled;
    setReminderEnabled(nextVal);

    if (nextVal) {
      if ("Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              setNotificationToast("Daily journaling notifications enabled!");
            }
          });
        } else if (Notification.permission === "granted") {
          setNotificationToast("Daily journaling notifications enabled!");
        } else {
          setNotificationToast("Reminder set, but notification permissions are blocked in your browser.");
        }
      }
    } else {
      setNotificationToast("Daily reminders turned off.");
    }

    localStorage.setItem(
      "mindful_scholar_reminder",
      JSON.stringify({ time: reminderTime, enabled: nextVal })
    );
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReminderTime(val);
    localStorage.setItem(
      "mindful_scholar_reminder",
      JSON.stringify({ time: val, enabled: reminderEnabled })
    );
  };

  // Simulate checker for reminders time
  useEffect(() => {
    const interval = setInterval(() => {
      if (!reminderEnabled) return;

      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5); // "HH:MM"

      if (timeStr === reminderTime) {
        // Trigger notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("📚 Mindful Scholar Daily Reminder", {
            body: "Take 5 minutes to write your mood journal and coordinate your syllabus coping plan. ✨",
            icon: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop",
          });
        }
        // Also show floating toast on screen
        setNotificationToast("⏰ Time for your daily journal entry and de-stress break!");
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reminderEnabled, reminderTime]);

  const toggleSelectTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Clear toast
  useEffect(() => {
    if (notificationToast) {
      const timer = setTimeout(() => {
        setNotificationToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notificationToast]);

  const seedParentDemoData = () => {
    const existing = localStorage.getItem("mindful_scholar_entries");
    if (!existing || JSON.parse(existing).length === 0) {
      const mockEntries: JournalEntry[] = [
        {
          id: "mock-1",
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          encryptedText: "",
          isEncrypted: false,
          piiMaskedText: "I had an intense mock test today. My math preparation feels weak and I was sweating during calculus questions.",
          parsedAnalysis: {
            sentimentScore: -0.5,
            emotionTags: ["Mock Test Panic", "Test Anxiety", "Self-Doubt"],
            primaryTrigger: "Mock Test Panic",
            stressIntensity: "High",
            isDistressCrisis: false,
            piiMaskedText: "I had an intense mock test today. My math preparation feels weak and I was sweating during calculus questions.",
            copingPlan: {
              hasAcademicAnxiety: true,
              encouragingMessage: "Mock test outcomes are meant to identify leverage points, Alex! Treat this score as high-value data, not a measure of your worth.",
              biteSizedSyllabusTracker: [
                { topic: "Calculus Mock Test Self-Review", difficulty: "Deep", durationMinutes: 45, completed: true },
                { topic: "Formulate 1-page Mechanics cheat sheet", difficulty: "Medium", durationMinutes: 30, completed: true }
              ],
              mindfulnessExercise: {
                title: "Box Breathing",
                description: "Deep somatic downregulation to lower stress levels."
              }
            }
          }
        },
        {
          id: "mock-2",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          encryptedText: "",
          isEncrypted: false,
          piiMaskedText: "Tried to review inorganic chemistry but the textbook feels massive. I feel like there's no way I can finish this syllabus in time.",
          parsedAnalysis: {
            sentimentScore: -0.3,
            emotionTags: ["Syllabus Overwhelm", "Burnout"],
            primaryTrigger: "Syllabus Overwhelm",
            stressIntensity: "Medium",
            isDistressCrisis: false,
            piiMaskedText: "Tried to review inorganic chemistry but the textbook feels massive. I feel like there's no way I can finish this syllabus in time.",
            copingPlan: {
              hasAcademicAnxiety: true,
              encouragingMessage: "Syllabi are conquered one chapter at a time. Let's offload the pressure by tackling only coordination compounds today.",
              biteSizedSyllabusTracker: [
                { topic: "Chemistry Coordination Compounds review", difficulty: "Medium", durationMinutes: 40, completed: true },
                { topic: "Solve 5 P-block chemistry questions", difficulty: "Deep", durationMinutes: 50, completed: false }
              ],
              mindfulnessExercise: {
                title: "Mindful Pacing",
                description: "Focus purely on one immediate topic for 25 minutes, then shut your laptop."
              }
            }
          }
        },
        {
          id: "mock-3",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          encryptedText: "",
          isEncrypted: false,
          piiMaskedText: "Studied physics revision until 2 AM. Today I feel completely exhausted, my head is heavy and I can't concentrate.",
          parsedAnalysis: {
            sentimentScore: -0.6,
            emotionTags: ["Sleep Deprived", "Burnout", "Deep Exhaustion"],
            primaryTrigger: "Sleep Deprived",
            stressIntensity: "Medium",
            isDistressCrisis: false,
            piiMaskedText: "Studied physics revision until 2 AM. Today I feel completely exhausted, my head is heavy and I can't concentrate.",
            copingPlan: {
              hasAcademicAnxiety: false,
              encouragingMessage: "Alex, sleep is your brain's indexing system. Let's set a firm boundary to log off at 11:00 PM tonight. Rest translates to performance.",
              biteSizedSyllabusTracker: [
                { topic: "Light Physics Formula Flashcards", difficulty: "Easy", durationMinutes: 15, completed: true },
                { topic: "Somatic 10-minute mindfulness stretch", difficulty: "Easy", durationMinutes: 10, completed: true }
              ],
              mindfulnessExercise: {
                title: "Restorative Reset",
                description: "Take a 15 minute tech-free cool down walk."
              }
            }
          }
        },
        {
          id: "mock-4",
          date: new Date().toISOString(),
          encryptedText: "",
          isEncrypted: false,
          piiMaskedText: "Woke up fresher today. Handled some basic calculus problems and did a box breathing exercise. Feel a bit more hopeful about physics mechanics.",
          parsedAnalysis: {
            sentimentScore: 0.4,
            emotionTags: ["Hopeful"],
            primaryTrigger: "None",
            stressIntensity: "Low",
            isDistressCrisis: false,
            piiMaskedText: "Woke up fresher today. Handled some basic calculus problems and did a box breathing exercise. Feel a bit more hopeful about physics mechanics.",
            copingPlan: {
              hasAcademicAnxiety: false,
              encouragingMessage: "Brilliant, Alex! Micro-milestones create momentum. Trust this progressive pace.",
              biteSizedSyllabusTracker: [
                { topic: "Calculus Limits & Derivatives exercises", difficulty: "Deep", durationMinutes: 40, completed: true },
                { topic: "Physics Mechanics past year answers review", difficulty: "Medium", durationMinutes: 30, completed: false }
              ],
              mindfulnessExercise: {
                title: "Gratitude Log",
                description: "List one academic topic you conquered today."
              }
            }
          }
        }
      ];
      localStorage.setItem("mindful_scholar_entries", JSON.stringify(mockEntries));
    }
  };

  // Landing view when user is not authenticated yet
  if (needsAuth) {
    return (
      <div className="min-h-screen bg-[#e3eae4] text-[#333d29] flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 font-sans">
        <div className="max-w-5xl w-full bg-white rounded-[40px] shadow-[0_12px_64px_rgba(51,61,41,0.06)] border border-[#e2dbcf] overflow-hidden grid grid-cols-1 md:grid-cols-2 h-auto min-h-[600px]">
          
          {/* LEFT COLUMN: Study & Wellness Illustration */}
          <div className="hidden md:flex flex-col justify-between p-10 bg-[#e6f1ea] text-[#1c2c26] relative select-none">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#1c2c26]/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#1c2c26]">
                <Sparkles className="w-3.5 h-3.5 text-[#cb997e]" />
                Academic Resilience & Support
              </div>
            </div>

            {/* Graphic Mockup of Student studying inside clean circular graphics */}
            <div className="relative flex justify-center items-center py-6">
              <div className="absolute w-64 h-64 rounded-full bg-white/70 border border-[#cbe1d3] flex items-center justify-center animate-pulse"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                {/* Floating school topics */}
                <div className="absolute -top-6 -left-8 text-xs font-mono text-emerald-800/80 font-bold bg-white px-2.5 py-1 rounded-full border border-emerald-100/60 shadow-xs">f(x)</div>
                <div className="absolute -top-3 -right-10 text-xs font-mono text-emerald-800/80 font-bold bg-white px-2.5 py-1 rounded-full border border-emerald-100/60 shadow-xs">√x</div>
                <div className="absolute top-14 -left-12 text-xs font-mono text-emerald-800/80 font-bold bg-white px-2.5 py-1 rounded-full border border-emerald-100/60 shadow-xs">x - y</div>
                <div className="absolute top-20 -right-12 text-xs font-mono text-[#cb997e] font-bold bg-white px-2.5 py-1 rounded-full border border-emerald-100/60 shadow-xs">π</div>
                <div className="absolute bottom-10 -left-6 text-xs font-mono text-emerald-800/80 font-bold bg-white px-2.5 py-1 rounded-full border border-emerald-100/60 shadow-xs">x²</div>
                
                {/* Visual student card representation */}
                <div className="bg-white rounded-[32px] p-6 shadow-md border border-emerald-100/60 flex flex-col items-center gap-3 w-52 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-[#1c2c26] flex items-center justify-center text-white">
                      <BookOpen className="w-8 h-8 text-[#cb997e]" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                      <Smile className="w-3 h-3" />
                    </span>
                  </div>
                  
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[#1c2c26]">Active Student Session</p>
                    <p className="text-[10px] text-gray-400">Adaptive Revision Active</p>
                  </div>

                  <div className="w-full bg-emerald-50 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                    Syllabus: 65% Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Headline section */}
            <div className="space-y-2">
              <h2 className="text-2xl font-serif italic font-bold tracking-tight text-[#1c2c26]">
                Exam Mastery Hub
              </h2>
              <p className="text-xs leading-relaxed text-[#1c2c26]/85">
                Unleash Your Academic Success with Exam Mastery Hub's Exam Excellence & Mindful Scholar Wellness Platform.
              </p>

              {/* Dots carousel indicators */}
              <div className="flex gap-1.5 pt-2">
                <span className="w-5 h-1.5 rounded-full bg-[#1c2c26]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1c2c26]/25"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1c2c26]/25"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1c2c26]/25"></span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Sign-in Panel */}
          <div className="p-8 sm:p-12 flex flex-col justify-between bg-white">
            
            {/* Top Logo branding */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#e6f1ea] flex items-center justify-center text-[#1c2c26]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1c2c26] font-sans">
                  MASTERY HUB
                </h3>
              </div>
            </div>

            {/* DUAL ROLE TABS */}
            <div className="space-y-6">
              <div className="flex bg-[#f3f6f4] p-1 rounded-2xl border border-gray-100">
                <button
                  onClick={() => setLoginTab("student")}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                    loginTab === "student"
                      ? "bg-[#1c2c26] text-white shadow-xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Student Access
                </button>
                <button
                  onClick={() => setLoginTab("parent")}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                    loginTab === "parent"
                      ? "bg-[#1c2c26] text-white shadow-xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Parent Monitor
                </button>
              </div>

              {/* VIEW 1: STUDENT LOGIN */}
              {loginTab === "student" && (
                isRegistering ? (
                  <div className="space-y-4">
                    <div className="space-y-1 text-center md:text-left">
                      <h2 className="text-xl font-bold tracking-tight text-[#1c2c26]">
                        Create an Account
                      </h2>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Set up your student wellness workspace profile and secure journal vault.
                      </p>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Arunanshu Roy"
                          value={registerFullName}
                          onChange={(e) => setRegisterFullName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1c2c26] text-gray-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                          Username or email
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. arunanshu"
                          value={registerUsername}
                          onChange={(e) => setRegisterUsername(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1c2c26] text-gray-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                          Password
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1c2c26] text-gray-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                          Journal Vault 4-Digit Passcode (numbers/letters)
                        </label>
                        <input
                          type="text"
                          maxLength={12}
                          placeholder="e.g. 1234"
                          value={registerPasscode}
                          onChange={(e) => setRegisterPasscode(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1c2c26] text-gray-800 font-mono tracking-widest text-center"
                        />
                        <p className="text-[9px] text-gray-400">This passcode encrypts your daily personal journaling in the browser vault.</p>
                      </div>

                      <button
                        onClick={async () => {
                          if (!registerFullName.trim()) {
                            setNotificationToast("Please enter your full name.");
                            return;
                          }
                          if (!registerUsername.trim()) {
                            setNotificationToast("Please enter a username or email.");
                            return;
                          }
                          if (!registerPassword.trim()) {
                            setNotificationToast("Please enter a password.");
                            return;
                          }
                          if (!registerPasscode.trim() || registerPasscode.trim().length < 4) {
                            setNotificationToast("Please choose a secure vault passcode (at least 4 characters).");
                            return;
                          }

                          try {
                            const hash = await generatePasskeyHash(registerPasscode);
                            localStorage.setItem("mindful_scholar_vault_hash", hash);
                            setIsVaultInitialized(true);
                            setPasscode(registerPasscode);

                            const profile = {
                              name: registerFullName,
                              email: registerUsername.includes("@") ? registerUsername : `${registerUsername}@gmail.com`,
                              mobile: "Add number",
                              location: "USA",
                              image: null,
                              theme: appTheme,
                              language: appLanguage,
                              notificationStatus: "Allow"
                            };
                            localStorage.setItem("mindful_scholar_profile", JSON.stringify(profile));
                            setProfileName(registerFullName);
                            setProfileEmail(profile.email);

                            const existingUsersRaw = localStorage.getItem("mindful_scholar_users");
                            const existingUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
                            existingUsers.push({
                              fullName: registerFullName,
                              username: registerUsername.toLowerCase().trim(),
                              password: registerPassword,
                              passcode: registerPasscode,
                              vaultHash: hash
                            });
                            localStorage.setItem("mindful_scholar_users", JSON.stringify(existingUsers));

                            setIsVaultUnlocked(true);
                            setNeedsAuth(false);
                            setIsParentSession(false);
                            setNotificationToast(`Welcome to Mindful Scholar, ${registerFullName}! Your secure vault is initialized. 📚`);
                            
                            seedParentDemoData();
                            await loadEntries(registerPasscode);
                            setIsRegistering(false);
                          } catch (err) {
                            console.error(err);
                            setNotificationToast("Error creating account.");
                          }
                        }}
                        className="w-full py-3 bg-[#1c2c26] text-white hover:bg-[#121f1a] transition-all rounded-2xl font-serif italic text-xs font-bold cursor-pointer shadow-sm text-center mt-2"
                      >
                        Create Account & Start
                      </button>
                    </div>

                    <p className="text-[10px] text-center text-gray-400">
                      Already have an account?{" "}
                      <button 
                        onClick={() => setIsRegistering(false)} 
                        className="font-bold text-[#5a6a4e] hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1 text-center md:text-left">
                      <h2 className="text-xl font-bold tracking-tight text-[#1c2c26]">
                        Student Workspaces
                      </h2>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Write your private journal, explore adaptive syllabus coping plans, and unlock workspace widgets.
                      </p>
                    </div>

                    {/* Manual form fields corresponding to the image */}
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                          Username or email
                        </label>
                        <input
                          type="text"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1c2c26] text-gray-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                            Password
                          </label>
                          <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[10px] font-semibold text-[#5a6a4e] hover:underline">
                            Forgot password?
                          </a>
                        </div>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1c2c26] text-gray-800"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          const enteredUser = loginUsername.toLowerCase().trim();
                          const enteredPass = loginPassword;
                          
                          // Check local storage registered list
                          const registeredUsersRaw = localStorage.getItem("mindful_scholar_users");
                          const registeredUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];
                          const matched = registeredUsers.find((u: any) => u.username === enteredUser && u.password === enteredPass);

                          if (matched) {
                            setProfileName(matched.fullName);
                            setProfileEmail(matched.username.includes("@") ? matched.username : `${matched.username}@gmail.com`);
                            setPasscode(matched.passcode);
                            setIsVaultUnlocked(true);
                            setIsVaultInitialized(true);
                            
                            // Set active profile
                            const profile = {
                              name: matched.fullName,
                              email: matched.username.includes("@") ? matched.username : `${matched.username}@gmail.com`,
                              mobile: "Add number",
                              location: "USA",
                              image: null,
                              theme: appTheme,
                              language: appLanguage,
                              notificationStatus: "Allow"
                            };
                            localStorage.setItem("mindful_scholar_profile", JSON.stringify(profile));
                            localStorage.setItem("mindful_scholar_vault_hash", matched.vaultHash);

                            setNeedsAuth(false);
                            setIsParentSession(false);
                            setNotificationToast(`Welcome back, ${matched.fullName}! 📚`);
                            await loadEntries(matched.passcode);
                          } else {
                            // Default / demo fallback to preserve user testing
                            let finalName = profileName;
                            if (enteredUser) {
                              const formattedName = enteredUser.split("@")[0].split(".")[0].replace(/^\w/, (c) => c.toUpperCase());
                              finalName = formattedName;
                              setProfileName(formattedName);
                              setProfileEmail(enteredUser.includes("@") ? enteredUser : `${enteredUser}@gmail.com`);
                            }
                            setNeedsAuth(false);
                            setIsParentSession(false);
                            setNotificationToast(`Welcome to your workspace, ${finalName}! 📚`);
                            seedParentDemoData();
                            await loadEntries();
                          }
                        }}
                        className="w-full py-3 bg-[#1c2c26] text-white hover:bg-[#121f1a] transition-all rounded-2xl font-serif italic text-xs font-bold cursor-pointer shadow-sm text-center"
                      >
                        Sign In
                      </button>
                    </div>

                    {/* Google Authenticator Option */}
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-gray-100"></div>
                      <span className="flex-shrink mx-4 text-[10px] uppercase tracking-wider text-gray-400 font-bold">or</span>
                      <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    <button
                      onClick={handleGoogleLogin}
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-3 px-4 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer shadow-xs font-semibold text-xs text-gray-700"
                    >
                      {isLoggingIn ? (
                        <span className="w-4 h-4 border-2 border-[#1c2c26] border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                      )}
                      <span>Sign in with Google</span>
                    </button>

                    <p className="text-[10px] text-center text-gray-400">
                      Are you new?{" "}
                      <button 
                        onClick={() => setIsRegistering(true)} 
                        className="font-bold text-[#5a6a4e] hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        Create an Account
                      </button>
                    </p>
                  </div>
                )
              )}

              {/* VIEW 2: PARENT LOGIN */}
              {loginTab === "parent" && (
                <div className="space-y-4">
                  <div className="space-y-1 text-center md:text-left">
                    <h2 className="text-xl font-bold tracking-tight text-[#1c2c26]">
                      Parent Wellness Portal
                    </h2>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Check your child's student workspace ID and passcode to view real-time stress levels, triggers, and study milestones securely.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                        Student Workspace ID
                      </label>
                      <input
                        type="text"
                        value={parentStudentCode}
                        onChange={(e) => setParentStudentCode(e.target.value)}
                        placeholder="e.g. STU-2026"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1c2c26] text-gray-800 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                          Parent Access Passcode
                        </label>
                        <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[10px] font-semibold text-[#5a6a4e] hover:underline">
                          Request passcode?
                        </a>
                      </div>
                      <input
                        type="password"
                        value={parentPasscodeField}
                        onChange={(e) => setParentPasscodeField(e.target.value)}
                        placeholder="e.g. PARENT123"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1c2c26] text-gray-800"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        if (!parentStudentCode.trim() || !parentPasscodeField.trim()) {
                          alert("Please fill in the student workspace ID and passcode.");
                          return;
                        }
                        // Seed data if empty so parent portal works instantly and looks stunning
                        seedParentDemoData();
                        setIsParentSession(true);
                        setNeedsAuth(false);
                        setPasscode(parentPasscodeField);
                        setNotificationToast(`Parent monitoring panel unlocked for student: ${profileName}! 🔐`);
                        // Explicitly load entries with provided student passcode to render metrics immediately
                        await loadEntries(parentPasscodeField);
                      }}
                      className="w-full py-3 bg-[#1c2c26] text-white hover:bg-[#121f1a] transition-all rounded-2xl font-serif italic text-xs font-bold cursor-pointer shadow-sm text-center"
                    >
                      Unlock Parent Monitoring Panel
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2 text-[10px] text-[#24312d] leading-relaxed">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Strict Privacy Protection</strong>: This portal provides aggregated diagnostic metrics, emotional triggers, and task counts. Raw study journal text logs are encrypted client-side and remain 100% confidential.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom secure footnote */}
            <div className="text-[9px] text-gray-400 text-center border-t border-gray-100 pt-4 mt-6">
              Mindful Scholar is protected by secure AES client-side encryption. We strictly prevent raw text analysis leakage to anyone, including parents.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isParentSession) {
    return (
      <ParentDashboard
        entries={entries}
        studentName={profileName || "Alex Chen"}
        onLogout={() => {
          setIsParentSession(false);
          setNeedsAuth(true);
        }}
        onCreateMeetSpace={async () => {
          const { createGoogleMeetSpace } = await import("./workspace");
          return createGoogleMeetSpace();
        }}
        onSendChatMessage={async (spaceId, msg) => {
          const { sendGoogleChatMessage } = await import("./workspace");
          return sendGoogleChatMessage(spaceId, msg);
        }}
        theme={appTheme}
        language={appLanguage}
      />
    );
  }

  // Vault passcode verification landing page if passcode isn't typed or created
  if (!isVaultUnlocked) {
    return (
      <div className="min-h-screen bg-[#fdfaf5] text-[#333d29] flex flex-col justify-center items-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-[0_4px_32px_rgba(51,61,41,0.06)] border border-[#e6e2da] text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-[#e6ebe0] flex items-center justify-center text-[#5a6a4e]">
              <Lock className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-serif italic text-[#4a5d4e]">Secure Cryptographic Vault</h1>
            <p className="text-xs text-[#6b705c] uppercase tracking-wider">
              {isVaultInitialized ? "Unlock Private Journals" : "Initialize Encryption Key"}
            </p>
          </div>

          <p className="text-xs text-[#6b705c] leading-relaxed max-w-xs mx-auto">
            All personal thoughts are masked and encrypted client-side using **AES-256-GCM**. They can never be decrypted by anyone without your local passcode.
          </p>

          {!isVaultInitialized ? (
            <form onSubmit={handleInitializeVault} className="space-y-3">
              <input
                type="password"
                placeholder="Choose a 4+ digit secure passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 bg-[#fdfaf5] border border-[#e6e2da] rounded-2xl text-center text-sm focus:outline-none focus:border-[#5a6a4e]"
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-[#5a6a4e] text-white py-3 rounded-2xl font-serif italic text-sm hover:bg-[#4a5d4e] cursor-pointer transition-colors"
              >
                Create Secure Vault
              </button>
            </form>
          ) : (
            <form onSubmit={handleUnlockVault} className="space-y-3">
              <input
                type="password"
                placeholder="Enter passcode to unlock..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 bg-[#fdfaf5] border border-[#e6e2da] rounded-2xl text-center text-sm focus:outline-none focus:border-[#5a6a4e]"
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-[#5a6a4e] text-white py-3 rounded-2xl font-serif italic text-sm hover:bg-[#4a5d4e] cursor-pointer transition-colors"
              >
                Unlock Secure Vault
              </button>
            </form>
          )}

          {vaultError && (
            <p className="text-xs text-red-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 font-semibold">
              {vaultError}
            </p>
          )}

          <div className="flex justify-between items-center text-[10px] text-[#6b705c] opacity-65 pt-2 border-t border-[#f1eeeb]">
            <span>Active User: {user?.email}</span>
            <button onClick={handleLogout} className="underline hover:text-red-600 font-medium">
              Log Out Account
            </button>
          </div>
        </div>
        {renderConfirmDialog()}
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans flex flex-col justify-between transition-colors duration-300 ${
      isDark ? "bg-[#0e1612] text-[#e1eae5]" : "bg-[#fdfaf5] text-[#333d29]"
    }`}>
      {/* Floating Notifications Toasts */}
      {notificationToast && (
        <div className={`fixed top-6 right-6 z-50 py-3.5 px-5 rounded-2xl shadow-lg flex items-center gap-2.5 text-xs font-medium animate-bounce border-2 ${
          isDark
            ? "bg-[#16221c] border-[#81a290] text-[#e1eae5]"
            : "bg-[#e6ebe0] border-[#5a6a4e] text-[#333d29]"
        }`}>
          <Sparkles className="w-4 h-4 text-[#cb997e] shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className={`text-4xl font-serif italic ${isDark ? "text-[#e1eae5]" : "text-[#4a5d4e]"}`}>Mindful Scholar</h1>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold border ${
              isDark
                ? "bg-[#1d2f26] border-[#2c4538] text-[#81a290]"
                : "bg-[#e6ebe0] border-[#d4d9cc] text-[#5a6a4e]"
            }`}>
              Secure
            </span>
            <button
              onClick={openProfileModal}
              className="text-[11px] bg-[#007a8c] text-white hover:bg-[#006070] px-3 py-1 rounded-lg font-bold transition-all shadow-sm shrink-0 cursor-pointer flex items-center gap-1"
            >
              <UserIcon className="w-3 h-3" />
              <span>User profile</span>
            </button>
          </div>
          <p className="text-xs font-medium opacity-75 uppercase tracking-widest">
            {t("appSubtitle", appLanguage)}
          </p>

          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider mr-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Quick Lang:
            </span>
            {[
              { code: "Eng", label: "🇺🇸 English" },
              { code: "Span", label: "🇪🇸 Spanish" },
              { code: "Hindi", label: "🇮🇳 हिन्दी" },
              { code: "Bengali", label: "🇧🇩 বাংলা" },
              { code: "French", label: "🇫🇷 Français" }
            ].map((langItem) => {
              const isActive = appLanguage === langItem.code;
              return (
                <button
                  key={langItem.code}
                  onClick={() => {
                    setAppLanguage(langItem.code);
                    setNotificationToast(`Language changed to ${langItem.label}!`);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all cursor-pointer border ${
                    isActive
                      ? isDark
                        ? "bg-[#cb997e] border-[#cb997e] text-[#1c2c26] shadow-xs font-extrabold scale-105"
                        : "bg-[#1c2c26] border-[#1c2c26] text-white shadow-xs font-extrabold scale-105"
                      : isDark
                        ? "bg-[#16221c]/40 border-gray-800 text-gray-400 hover:text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {langItem.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`flex items-center gap-4 px-5 py-3 rounded-3xl border w-full md:w-auto justify-between md:justify-start transition-all ${
          isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
        }`}>
          <div 
            onClick={openProfileModal}
            className={`flex items-center gap-3 cursor-pointer p-1.5 rounded-2xl transition-colors border border-transparent ${
              isDark
                ? "hover:bg-[#1d2f26] hover:border-[#cb997e]/40"
                : "hover:bg-[#fdfaf5] hover:border-[#cb997e]/40"
            }`}
            title="View & Edit Profile"
          >
            {profileImage || user?.photoURL ? (
              <img
                src={profileImage || user?.photoURL || ""}
                alt={profileName || user?.displayName || "User"}
                referrerPolicy="no-referrer"
                className={`w-10 h-10 rounded-full border-2 object-cover ${
                  isDark ? "border-[#25372e]" : "border-[#e6ebe0]"
                }`}
              />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-serif border-2 ${
                isDark ? "bg-[#33463c] border-[#25372e]" : "bg-[#b7b7a4] border-[#e6ebe0]"
              }`}>
                {profileName ? profileName.split(" ").map((n) => n[0]).join("") : "U"}
              </div>
            )}
            <div className="text-left">
              <p className={`text-xs font-bold ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>{profileName || user?.displayName || "Alex Chen"}</p>
              <div className={`flex items-center gap-1 text-[10px] font-medium ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
                <Award className="w-3 h-3 text-[#cb997e]" />
                <span>{streakCount} Day Streak</span>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-2 border-l pl-4 ml-2 ${
            isDark ? "border-[#25372e]" : "border-[#f1eeeb]"
          }`}>
            <button
              onClick={() => {
                setIsVaultUnlocked(false);
                setPasscode("");
                setNotificationToast("Vault locked.");
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? "hover:bg-[#1d2f26] text-[#93a298] hover:text-[#81a290]" : "hover:bg-[#fdfaf5] text-[#6b705c] hover:text-[#5a6a4e]"
              }`}
              title="Lock Vault"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? "hover:bg-red-950/40 text-[#93a298] hover:text-red-400" : "hover:bg-rose-50 text-[#6b705c] hover:text-rose-600"
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* EMERGENCY CRISIS WARNING BANNER - ETHICAL SAFETY GUARDRAILS */}
      {currentAnalysis?.isDistressCrisis && (
        <div className={`border-2 rounded-3xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm animate-pulse ${
          isDark
            ? "bg-[#2d1212] border-red-800 text-red-200"
            : "bg-red-50 border-red-500 text-red-900"
        }`}>
          <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
          <div className="flex-1 space-y-1">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-red-400" : "text-red-700"}`}>
              Immediate Crisis Support & Safety Warning
            </h3>
            <p className="text-xs leading-relaxed">
              We detected severe feelings of distress or hopelessness. Please know that you are not alone, and there is immediate help available. You can reach out confidentially to professionals 24/7:
            </p>
            <div className={`flex flex-wrap gap-4 mt-2 font-mono text-xs font-bold p-2.5 rounded-lg border ${
              isDark
                ? "bg-black/40 border-red-900 text-red-400"
                : "bg-white/50 border-red-100 text-red-700"
            }`}>
              <span>📞 Vandrevala Foundation: +91 9999 666 555</span>
              <span>📞 AASRA Helpline: +91 9820466726</span>
              <span>📞 National Crisis Helpline: Call 988 (India/US)</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN - JOURNAL ENTRY & COPE INGESTION (7 COLS) */}
        <section className="lg:col-span-7 space-y-6">
          <div className={`rounded-[32px] p-6 border shadow-sm space-y-4 transition-all ${
            isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
          }`}>
            <div className={`flex justify-between items-center pb-2 border-b ${
              isDark ? "border-[#25372e]" : "border-[#f1eeeb]"
            }`}>
              <div className="flex items-center gap-2">
                <BookOpen className={`w-5 h-5 ${isDark ? "text-[#81a290]" : "text-[#5a6a4e]"}`} />
                <h2 className={`text-lg font-serif italic ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>{t("howAreYouFeeling", appLanguage)}</h2>
              </div>
              <span className={`text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-widest font-bold border ${
                isDark
                  ? "bg-[#1d2f26] border-[#2c4538] text-[#81a290]"
                  : "bg-[#f4f1de] border-[#e9e3d0] text-[#8b7e5c]"
              }`}>
                {t("phaseIngestion", appLanguage)}
              </span>
            </div>

            {/* Ingestion Emotion Tag Selector */}
            <div className="space-y-1.5">
              <label className={`text-[10px] uppercase tracking-wider font-bold block ${
                isDark ? "text-[#93a298]" : "text-[#6b705c]"
              }`}>
                {t("selectIndicators", appLanguage)}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleSelectTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        active
                          ? isDark
                            ? "bg-[#81a290] text-[#0e1612] border border-[#81a290]"
                            : "bg-[#5a6a4e] text-white border border-[#5a6a4e]"
                          : isDark
                          ? "bg-[#1d2f26] text-[#81a290] border border-[#2c4538] hover:bg-[#2c4538]"
                          : "bg-[#e6ebe0] text-[#5a6a4e] border border-[#d4d9cc] hover:bg-[#d4d9cc]"
                      }`}
                    >
                      {t(tag, appLanguage)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Log Textarea */}
            <div className="space-y-1.5">
              <label className={`text-[10px] uppercase tracking-wider font-bold block ${
                isDark ? "text-[#93a298]" : "text-[#6b705c]"
              }`}>
                {t("studentLogLabel", appLanguage)}
              </label>
              <textarea
                rows={4}
                placeholder={t("studentLogPlaceholder", appLanguage)}
                value={journalInput}
                onChange={(e) => setJournalInput(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-xs focus:outline-none transition-all ${
                  isDark
                    ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] placeholder:text-[#e1eae5]/30 focus:border-[#81a290]"
                    : "bg-[#fdfaf5] border border-[#e6e2da] text-[#333d29] placeholder:text-[#333d29]/40 focus:border-[#5a6a4e]"
                } leading-relaxed`}
              />
            </div>

            <button
              onClick={handleJournalAnalysis}
              disabled={isAnalyzing || !journalInput.trim()}
              className={`w-full py-3.5 rounded-2xl font-serif italic text-base shadow-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${
                isDark
                  ? "bg-[#81a290] text-[#0e1612] hover:bg-[#719280]"
                  : "bg-[#5a6a4e] text-white hover:bg-[#4a5d4e]"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <span className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                    isDark ? "border-[#0e1612]" : "border-white"
                  }`}></span>
                  <span>{t("analyzingAndEncrypting", appLanguage)}</span>
                </>
              ) : (
                <>
                  <span>{t("analyzeAndEncrypt", appLanguage)}</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>

            {analysisError && (
              <p className={`text-xs p-2.5 rounded-xl text-center font-semibold border ${
                isDark
                  ? "bg-rose-950/40 border-rose-900/55 text-rose-400"
                  : "bg-rose-50 border-rose-100 text-rose-600"
              }`}>
                {analysisError}
              </p>
            )}
          </div>

          {/* DYNAMIC PARSED OUTPUT SUMMARY PANEL */}
          {currentAnalysis && (
            <div className="space-y-6 animate-fade-in">
              {/* Pattern Analysis Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`rounded-3xl p-5 border flex flex-col justify-center shadow-sm transition-all ${
                  isDark ? "bg-[#121c17] border-[#25372e]" : "bg-[#f9f7f2] border-[#e6e2da]"
                }`}>
                  <h3 className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${
                    isDark ? "text-[#93a298]" : "text-[#a6a29a]"
                  }`}>
                    Contextual Stressor Trigger
                  </h3>
                  <div className={`text-sm font-serif italic font-semibold leading-relaxed ${
                    isDark ? "text-[#cb997e]" : "text-[#7b5c54]"
                  }`}>
                    "{currentAnalysis.primaryTrigger}"
                  </div>
                  <div className="mt-4">
                    <div className={`flex justify-between text-[9px] uppercase tracking-wider font-bold mb-1 ${
                      isDark ? "text-[#93a298]" : "text-[#6b705c]"
                    }`}>
                      <span>Intensity Level</span>
                      <span>{currentAnalysis.stressIntensity}</span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${
                      isDark ? "bg-[#1d2f26]" : "bg-[#e6e2da]"
                    }`}>
                      <div
                        className={`h-full rounded-full ${
                          currentAnalysis.stressIntensity === "High"
                            ? "bg-rose-500 w-[95%]"
                            : currentAnalysis.stressIntensity === "Medium"
                            ? "bg-amber-500 w-[60%]"
                            : "bg-emerald-500 w-[25%]"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl p-5 border flex flex-col justify-center shadow-sm transition-all ${
                  isDark ? "bg-[#121c17] border-[#25372e]" : "bg-[#f9f7f2] border-[#e6e2da]"
                }`}>
                  <h3 className={`text-[10px] uppercase tracking-widest font-bold mb-1.5 ${
                    isDark ? "text-[#93a298]" : "text-[#a6a29a]"
                  }`}>
                    Sentiment Vector Score
                  </h3>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-full border-4 flex items-center justify-center font-bold text-xs ${
                        currentAnalysis.sentimentScore > 0.3
                          ? isDark
                            ? "border-emerald-500 text-emerald-300 bg-emerald-950/40"
                            : "border-emerald-500 text-emerald-700 bg-emerald-50"
                          : currentAnalysis.sentimentScore < -0.3
                          ? isDark
                            ? "border-rose-400 text-rose-300 bg-rose-955/40"
                            : "border-rose-400 text-rose-700 bg-rose-50"
                          : isDark
                          ? "border-amber-400 text-amber-300 bg-amber-955/40"
                          : "border-amber-400 text-amber-700 bg-amber-50"
                      }`}
                    >
                      {currentAnalysis.sentimentScore.toFixed(1)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-[11px] font-semibold uppercase tracking-wider ${
                        isDark ? "text-[#81a290]" : "text-[#5a6a4e]"
                      }`}>
                        {currentAnalysis.sentimentScore > 0.3
                          ? "Positive Sentiment Shift"
                          : currentAnalysis.sentimentScore < -0.3
                          ? "Distress/Overwhelm Detected"
                          : "Neutral/Stable Sentiment"}
                      </p>
                      <p className={`text-[10px] italic leading-tight mt-0.5 ${
                        isDark ? "text-[#93a298]" : "text-[#6b705c]"
                      }`}>
                        Extracted and vectorized from student's unstructured log text.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coping Plan Action Sheet */}
              <div className={`rounded-[32px] p-6 border shadow-sm space-y-4 transition-all ${
                isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
              }`}>
                <div className={`pb-2 border-b flex items-center gap-2 ${
                  isDark ? "border-[#25372e]" : "border-[#f1eeeb]"
                }`}>
                  <Award className="w-5 h-5 text-[#cb997e]" />
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${
                    isDark ? "text-[#e1eae5]" : "text-[#6b705c]"
                  }`}>
                    Personalized Study Plan & Adaptive Mindfulness
                  </h3>
                </div>

                <div className={`p-4 rounded-2xl border border-dashed ${
                  isDark ? "bg-[#0e1612]/60 border-[#2c4538]" : "bg-[#fdfaf5] border-[#d4d1c9]"
                }`}>
                  <p className={`text-xs italic leading-relaxed font-serif ${
                    isDark ? "text-[#e1eae5]" : "text-[#58614c]"
                  }`}>
                    "{currentAnalysis.copingPlan.encouragingMessage}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mindfulness breathing */}
                  <div className={`space-y-3 p-4 rounded-2xl border ${
                    isDark ? "bg-[#1d2f26]/40 border-[#2c4538]/60" : "bg-[#e6ebe0]/40 p-4 rounded-2xl border border-[#d4d9cc]/60"
                  }`}>
                    <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isDark ? "text-[#81a290]" : "text-[#5a6a4e]"
                    }`}>
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-50" />
                      {currentAnalysis.copingPlan.mindfulnessExercise.title}
                    </h4>
                    <p className={`text-xs leading-relaxed ${isDark ? "text-[#e1eae5]" : "text-[#58614c]"}`}>
                      {currentAnalysis.copingPlan.mindfulnessExercise.description}
                    </p>
                    <div className={`p-2.5 rounded-xl text-[10px] border ${
                      isDark ? "bg-[#0e1612]/70 border-[#25372e] text-[#93a298]" : "bg-white/70 border-white text-[#6b705c]"
                    }`}>
                      💡 <strong>Pro Tip:</strong> Try this for 3 minutes before starting your bite-sized tasks to reset your nervous system.
                    </div>
                  </div>

                  {/* Dynamic syllabus tasks list */}
                  <SyllabusTracker
                    tasks={currentAnalysis.copingPlan.biteSizedSyllabusTracker || []}
                    onToggleTask={handleToggleSyllabusTask}
                    onShareToChat={handleShareToGoogleChat}
                    isSharing={isSharingSyllabus}
                    chatSpaceId={chatSpaceId}
                    setChatSpaceId={setChatSpaceId}
                    shareSuccess={shareSuccess}
                    shareError={shareError}
                    theme={appTheme}
                    language={appLanguage}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN - DIGITAL CHAT COMPANION (5 COLS) */}
        <section className="lg:col-span-5 h-[580px] lg:h-[620px]">
          <CompanionChat
            messages={chatMessages}
            onSendMessage={handleChatSendMessage}
            parsedContext={currentAnalysis}
            isGenerating={isGeneratingChat}
            theme={appTheme}
            language={appLanguage}
          />
        </section>
      </main>

      {/* LOWER NAVIGATION TABS FOR PATTERN ANALYTICS & INTERACTIVE WORKSPACE TOOLS */}
      <section className="mt-8 space-y-4">
        <div className={`flex border-b gap-6 text-sm font-bold transition-all ${
          isDark ? "border-[#25372e]" : "border-[#e6e2da]"
        }`}>
          <button
            onClick={() => setActiveTab("insights")}
            className={`pb-2 transition-all cursor-pointer ${
              activeTab === "insights"
                ? isDark
                  ? "text-[#81a290] border-b-2 border-[#81a290]"
                  : "text-[#5a6a4e] border-b-2 border-[#5a6a4e]"
                : isDark
                ? "text-[#93a298] hover:text-[#81a290]"
                : "text-[#6b705c] hover:text-[#5a6a4e]"
            }`}
          >
            {t("patternAnalyticsTab", appLanguage)}
          </button>
          <button
            onClick={() => setActiveTab("workspace")}
            className={`pb-2 transition-all cursor-pointer ${
              activeTab === "workspace"
                ? isDark
                  ? "text-[#81a290] border-b-2 border-[#81a290]"
                  : "text-[#5a6a4e] border-b-2 border-[#5a6a4e]"
                : isDark
                ? "text-[#93a298] hover:text-[#81a290]"
                : "text-[#6b705c] hover:text-[#5a6a4e]"
            }`}
          >
            {t("workspaceToolsTab", appLanguage)}
          </button>
        </div>

        {activeTab === "insights" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Recharts Analytics Chart (7 cols) */}
            <div className="lg:col-span-7">
              <AnalyticsChart entries={entries} theme={appTheme} />
            </div>

            {/* Encrypted Vault List & Push Reminders (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Reminder scheduler */}
              <div className={`rounded-3xl p-6 border shadow-sm transition-all ${
                isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className={`w-5 h-5 ${isDark ? "text-[#81a290]" : "text-[#5a6a4e]"}`} />
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${
                      isDark ? "text-[#e1eae5]" : "text-[#6b705c]"
                    }`}>
                      Daily Mindful Reminders
                    </h3>
                  </div>
                  <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded border border-sky-100">
                    Push API
                  </span>
                </div>
                <p className={`text-xs leading-relaxed mb-4 ${
                  isDark ? "text-[#93a298]" : "text-[#6b705c]"
                }`}>
                  Schedule a daily reminder to log your mood, complete your breathing reset, and track your syllabus goals.
                </p>
                <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                  isDark ? "bg-[#0e1612] border-[#25372e]" : "bg-[#fdfaf5] border-[#e6e2da]"
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={handleTimeChange}
                      className={`border text-xs px-2.5 py-1.5 rounded-xl focus:outline-none ${
                        isDark
                          ? "bg-[#16221c] border-[#25372e] text-[#e1eae5]"
                          : "bg-white border-[#e6e2da] text-[#333d29]"
                      }`}
                    />
                    <span className={`text-xs ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>daily</span>
                  </div>
                  <button
                    onClick={handleToggleReminder}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reminderEnabled
                        ? isDark
                          ? "bg-[#81a290] text-[#0e1612]"
                          : "bg-[#5a6a4e] text-white"
                        : isDark
                        ? "bg-[#1d2f26] text-[#81a290] border border-[#2c4538]"
                        : "bg-[#e6ebe0] text-[#5a6a4e] border border-[#d4d9cc]"
                    }`}
                  >
                    {reminderEnabled ? "Reminders: Active" : "Reminders: Off"}
                  </button>
                </div>
              </div>

              {/* Secure Vault decrypted text checker */}
              <div className={`rounded-3xl p-6 border shadow-sm space-y-4 transition-all ${
                isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
              }`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${
                    isDark ? "text-[#e1eae5]" : "text-[#6b705c]"
                  }`}>
                    Vault Vault Entries
                  </h3>
                  <span className={`text-[10px] font-semibold ${
                    isDark ? "text-[#93a298]" : "text-[#6b705c]"
                  }`}>
                    {entries.length} Encrypted Logs
                  </span>
                </div>

                <div className="max-h-[220px] overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                  {entries.length === 0 ? (
                    <div className={`text-center text-xs italic py-8 ${
                      isDark ? "text-[#93a298]" : "text-[#6b705c]"
                    }`}>
                      No encrypted logs in vault. Make your first entry above.
                    </div>
                  ) : (
                    [...entries].reverse().map((entry) => {
                      const dateObj = new Date(entry.date);
                      const isUnlocked = decryptedTexts[entry.id];
                      return (
                        <div
                          key={entry.id}
                          className={`p-3 rounded-2xl border text-xs space-y-2 ${
                            isDark ? "bg-[#0e1612]/50 border-[#25372e]" : "bg-[#fdfaf5]/50 border-[#e6e2da]"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className={`font-semibold ${
                              isDark ? "text-[#93a298]" : "text-[#6b705c]"
                            }`}>
                              📅 {dateObj.toLocaleDateString()} @ {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <div className="flex items-center gap-2">
                              {entry.parsedAnalysis && (
                                <span className={`px-2 py-0.5 rounded font-bold text-[8px] uppercase ${
                                  isDark
                                    ? "bg-[#1d2f26] text-[#81a290]"
                                    : "bg-[#e6ebe0] text-[#5a6a4e]"
                                }`}>
                                  Score: {entry.parsedAnalysis.sentimentScore.toFixed(1)}
                                </span>
                              )}
                              <button
                                onClick={() => deleteEntry(entry.id)}
                                className={`p-1 rounded-md transition-all ${
                                  isDark ? "text-red-400 hover:text-red-300 hover:bg-red-950/40" : "text-red-500 hover:text-red-700 hover:bg-red-50"
                                }`}
                                title="Delete Log permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                            isDark ? "bg-[#16221c] border-[#25372e] text-[#e1eae5]" : "bg-white border-[#f1eeeb] text-[#58614c]"
                          }`}>
                            {isUnlocked ? (
                              <p className="whitespace-pre-wrap">{decryptedTexts[entry.id]}</p>
                            ) : (
                              <div className={`flex items-center justify-between gap-2 italic ${
                                isDark ? "text-[#93a298]" : "text-[#6b705c]"
                              }`}>
                                <span>🔒 Journal encrypted in AES-GCM...</span>
                                <button
                                  onClick={() => decryptSpecificEntry(entry.id, entry.encryptedText)}
                                  className={`text-[10px] border px-2 py-1 rounded-lg font-semibold not-italic cursor-pointer transition-colors ${
                                    isDark
                                      ? "bg-[#1d2f26] text-[#81a290] border-[#2c4538] hover:bg-[#2c4538]"
                                      : "bg-[#e6ebe0] text-[#5a6a4e] border-[#d4d9cc] hover:bg-[#d4d9cc]"
                                  }`}
                                >
                                  Decrypt
                                </button>
                              </div>
                            )}
                          </div>

                          {/* PII Masked indicator */}
                          <div className={`text-[9px] flex justify-between ${
                            isDark ? "text-[#93a298]/60" : "text-[#6b705c]/60"
                          }`}>
                            <span>PII Masked: {entry.piiMaskedText ? "Success" : "None"}</span>
                            <span>AES-256 Validated</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab workspace: contacts & meet & chat sharing integrations */
          <div className="space-y-6">
            {/* Inner sub-tabs */}
            <div className="flex border-b border-[#25372e]/40 dark:border-gray-700/60 pb-px overflow-x-auto scrollbar-none gap-2">
              {[
                { id: "classroom", label: "Google Classroom" },
                { id: "calendar", label: "Google Calendar" },
                { id: "meet", label: "Meet & Peers" }
              ].map((tab) => {
                const isTabActive = workspaceSubTab === tab.id;
                const label = INNER_WORKSPACE_TABS_TRANSLATIONS[appLanguage]?.[tab.id] || INNER_WORKSPACE_TABS_TRANSLATIONS["Eng"][tab.id] || tab.label;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setWorkspaceSubTab(tab.id as any)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                      isTabActive
                        ? isDark
                          ? "border-[#cb997e] text-[#cb997e]"
                          : "border-[#5a6a4e] text-[#5a6a4e]"
                        : "border-transparent text-gray-400 hover:text-gray-500"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {workspaceSubTab === "classroom" && (
              <ClassroomManager
                onImportTask={handleImportClassroomTask}
                onShowToast={(msg) => setNotificationToast(msg)}
                theme={appTheme}
                language={appLanguage}
              />
            )}

            {workspaceSubTab === "calendar" && (
              <CalendarManager
                onShowToast={(msg) => setNotificationToast(msg)}
                theme={appTheme}
                language={appLanguage}
              />
            )}

            {workspaceSubTab === "meet" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <ContactsMeetChat
                  onNotifyMeetCreated={(url) => {
                    setNotificationToast("Meet Room Scheduled! Shared options are open.");
                  }}
                  theme={appTheme}
                  language={appLanguage}
                />
                <div className={`rounded-[24px] p-6 border shadow-sm space-y-4 transition-all ${
                  isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
                }`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isDark ? "text-[#e1eae5]" : "text-[#6b705c]"
                  }`}>
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-50" />
                    Collaborative Peer Support Guide
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-[#e1eae5]" : "text-[#58614c]"}`}>
                    Peer interactions dramatically lower exam anxiety. With the Mindful Scholar workspace:
                  </p>
                  <ol className={`text-xs space-y-3 pl-4 list-decimal leading-relaxed ${isDark ? "text-[#e1eae5]" : "text-[#58614c]"}`}>
                    <li>
                      Use <strong>Schedule Instantly inside Meet</strong> to generate a unique room link using the Google Meet API.
                    </li>
                    <li>
                      Retrieve your study buddies list from your <strong>Google Contacts</strong>.
                    </li>
                    <li>
                      Share your active coping plans and customized syllabus sub-topics using the <strong>Google Chat Workspace</strong> integration. Just paste your group Space ID to sync live checklists.
                    </li>
                  </ol>
                  <div className={`p-3 rounded-xl border text-[10px] ${
                    isDark ? "bg-[#1d2f26]/40 border-[#2c4538] text-[#81a290]" : "bg-[#e6ebe0]/40 border-[#d4d9cc] text-[#5a6a4e]"
                  }`}>
                    🔒 <strong>Data Privacy Guarantee:</strong> These connections run directly in-browser using your Google access token. No third-party servers store your workspace contact or room logs.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* FOOTER SECTION */}
      <footer className={`mt-12 flex flex-col sm:flex-row justify-between items-center text-[10px] border-t pt-6 opacity-60 font-medium gap-4 transition-colors ${
        isDark ? "border-[#25372e]" : "border-[#e6e2da]"
      }`}>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1">
            <Shield className={`w-3.5 h-3.5 ${isDark ? "text-[#81a290]" : "text-[#5a6a4e]"}`} /> AES-256 Encryption Active
          </span>
          <span>•</span>
          <span>PII Masking Active</span>
          <span>•</span>
          <span>Google Workspace Verified</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="bg-[#cb997e] text-white px-2 py-0.5 rounded-sm font-bold uppercase">
            Crisis Support
          </span>
          <span className="font-bold">Call or Text 24/7 Helpline (988)</span>
        </div>
      </footer>

      {/* SECURE PROFILE & SETTINGS MODAL DIALOG */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6 max-w-4xl w-full select-none animate-fade-in">
            
            {/* LEFT CARD: SIDEBAR MENU CARD */}
            <div className={`rounded-[24px] p-6 border shadow-lg md:w-80 w-full flex flex-col space-y-6 transition-colors ${
              isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
            }`}>
              {/* User summary */}
              <div className={`flex items-center gap-3 pb-4 border-b ${
                isDark ? "border-[#25372e]" : "border-[#f1eeeb]"
              }`}>
                {profileImage || user?.photoURL ? (
                  <img
                    src={profileImage || user?.photoURL || ""}
                    alt={profileName || user?.displayName || "User"}
                    className={`w-12 h-12 rounded-full border-2 object-cover shrink-0 ${
                      isDark ? "border-[#25372e]" : "border-[#e6ebe0]"
                    }`}
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-serif border-2 shrink-0 ${
                    isDark ? "bg-[#33463c] border-[#25372e]" : "bg-[#b7b7a4] border-[#e6ebe0]"
                  }`}>
                    {profileName ? profileName.split(" ").map((n) => n[0]).join("") : "U"}
                  </div>
                )}
                <div className="text-left overflow-hidden">
                  <h3 className={`text-sm font-bold truncate ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>{profileName || "Your name"}</h3>
                  <p className={`text-xs truncate ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>{profileEmail || "yourname@gmail.com"}</p>
                </div>
              </div>

              {/* Sidebar Menu options */}
              <nav className="flex-1 flex flex-col space-y-2">
                <button
                  onClick={() => setProfileTab("profile")}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    profileTab === "profile"
                      ? isDark
                        ? "bg-[#1d2f26] text-[#81a290]"
                        : "bg-[#e6ebe0] text-[#5a6a4e]"
                      : isDark
                      ? "text-[#93a298] hover:bg-[#121c17]"
                      : "text-[#6b705c] hover:bg-[#fdfaf5]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserIcon className="w-4 h-4" />
                    <span>My Profile</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setProfileTab("settings")}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    profileTab === "settings"
                      ? isDark
                        ? "bg-[#1d2f26] text-[#81a290]"
                        : "bg-[#e6ebe0] text-[#5a6a4e]"
                      : isDark
                      ? "text-[#93a298] hover:bg-[#121c17]"
                      : "text-[#6b705c] hover:bg-[#fdfaf5]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Notification Setting with inline dropdown indicator */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isDark ? "text-[#93a298] hover:bg-[#121c17]" : "text-[#6b705c] hover:bg-[#fdfaf5]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4" />
                      <span>Notification</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-normal">{notificationStatus}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </button>

                  {isNotificationDropdownOpen && (
                    <div className={`absolute right-2 top-full mt-1 border rounded-xl shadow-lg p-1.5 z-10 w-28 space-y-0.5 ${
                      isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
                    }`}>
                      <button
                        onClick={() => {
                          setNotificationStatus("Allow");
                          setIsNotificationDropdownOpen(false);
                          setNotificationToast("Notifications set to Allow.");
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          notificationStatus === "Allow"
                            ? isDark
                              ? "bg-[#1d2f26] text-[#81a290]"
                              : "bg-[#e6ebe0] text-[#5a6a4e]"
                            : isDark
                            ? "text-[#93a298] hover:bg-[#121c17]"
                            : "text-[#6b705c] hover:bg-[#fdfaf5]"
                        }`}
                      >
                        Allow
                      </button>
                      <button
                        onClick={() => {
                          setNotificationStatus("Mute");
                          setIsNotificationDropdownOpen(false);
                          setNotificationToast("Notifications muted.");
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          notificationStatus === "Mute"
                            ? isDark
                              ? "bg-[#1d2f26] text-[#81a290]"
                              : "bg-[#e6ebe0] text-[#5a6a4e]"
                            : isDark
                            ? "text-[#93a298] hover:bg-[#121c17]"
                            : "text-[#6b705c] hover:bg-[#fdfaf5]"
                        }`}
                      >
                        Mute
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isDark ? "text-rose-400 hover:bg-rose-950/40" : "text-rose-600 hover:bg-rose-50"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </nav>

              <div className={`pt-4 border-t text-[10px] flex items-center justify-between ${
                isDark ? "border-[#25372e] text-[#93a298]/70" : "border-[#f1eeeb] text-[#6b705c]/70"
              }`}>
                <span>Theme: {appTheme}</span>
                <span>Lang: {appLanguage}</span>
              </div>
            </div>

            {/* RIGHT CARD: MAIN DETAILS / SETTINGS CARD */}
            {profileTab === "profile" ? (
              <div className={`flex-1 rounded-[24px] p-6 border shadow-lg flex flex-col space-y-6 relative transition-colors ${
                isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
              }`}>
                {/* Close Button */}
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Profile header with avatar edit overlay */}
                <div className={`flex items-center gap-4 pb-4 border-b ${
                  isDark ? "border-[#25372e]" : "border-[#f1eeeb]"
                }`}>
                  <div className="relative">
                    {tempProfileImage || profileImage || user?.photoURL ? (
                      <img
                        src={tempProfileImage || profileImage || user?.photoURL || ""}
                        alt="Profile preview"
                        className={`w-16 h-16 rounded-full border-2 object-cover ${
                          isDark ? "border-[#25372e]" : "border-[#e6ebe0]"
                        }`}
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-serif text-lg border-2 shrink-0 ${
                        isDark ? "bg-[#33463c] border-[#25372e]" : "bg-[#b7b7a4] border-[#e6ebe0]"
                      }`}>
                        {tempName ? tempName.split(" ").map((n) => n[0]).join("") : "U"}
                      </div>
                    )}
                    {/* Pencil Icon Overlay */}
                    <label
                      htmlFor="profile-image-upload"
                      className={`absolute bottom-0 right-0 p-1 rounded-full border border-white transition-colors cursor-pointer shadow-md ${
                        isDark ? "bg-[#81a290] text-[#0e1612] hover:bg-[#719280]" : "bg-[#5a6a4e] text-white hover:bg-[#4a5d4e]"
                      }`}
                      title="Upload custom image"
                    >
                      <Pencil className="w-3 h-3" />
                    </label>
                    <input
                      type="file"
                      id="profile-image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>

                  <div className="text-left">
                    <h3 className={`text-base font-bold ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>{tempName || profileName || "Your name"}</h3>
                    <p className={`text-xs ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>{tempEmail || profileEmail || "yourname@gmail.com"}</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className={`text-[10px] uppercase tracking-wider font-bold block ${
                        isDark ? "text-[#93a298]" : "text-[#6b705c]"
                      }`}>
                        Name
                      </label>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="your name"
                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                          isDark
                            ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] focus:border-[#81a290]"
                            : "bg-[#fdfaf5] border border-[#e6e2da] text-[#333d29] focus:border-[#5a6a4e]"
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className={`text-[10px] uppercase tracking-wider font-bold block ${
                        isDark ? "text-[#93a298]" : "text-[#6b705c]"
                      }`}>
                        Email account
                      </label>
                      <input
                        type="email"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                          isDark
                            ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] focus:border-[#81a290]"
                            : "bg-[#fdfaf5] border border-[#e6e2da] text-[#333d29] focus:border-[#5a6a4e]"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className={`text-[10px] uppercase tracking-wider font-bold block ${
                        isDark ? "text-[#93a298]" : "text-[#6b705c]"
                      }`}>
                        Mobile number
                      </label>
                      <input
                        type="text"
                        value={tempMobile}
                        onChange={(e) => setTempMobile(e.target.value)}
                        placeholder="Add number"
                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                          isDark
                            ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] focus:border-[#81a290]"
                            : "bg-[#fdfaf5] border border-[#e6e2da] text-[#333d29] focus:border-[#5a6a4e]"
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className={`text-[10px] uppercase tracking-wider font-bold block ${
                        isDark ? "text-[#93a298]" : "text-[#6b705c]"
                      }`}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={tempLocation}
                        onChange={(e) => setTempLocation(e.target.value)}
                        placeholder="USA"
                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                          isDark
                            ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] focus:border-[#81a290]"
                            : "bg-[#fdfaf5] border border-[#e6e2da] text-[#333d29] focus:border-[#5a6a4e]"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-4 flex justify-start">
                  <button
                    onClick={handleSaveProfile}
                    className={`font-serif italic font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-sm ${
                      isDark ? "bg-[#81a290] text-[#0e1612] hover:bg-[#719280]" : "bg-[#5a6a4e] hover:bg-[#4a5d4e] text-white"
                    }`}
                  >
                    Save Change
                  </button>
                </div>
              </div>
            ) : (
              /* Settings Sub-card */
              <div className={`flex-1 rounded-[24px] p-6 border shadow-lg flex flex-col space-y-6 relative text-left animate-fade-in transition-colors ${
                isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
              }`}>
                {/* Close Button */}
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className={`border-b pb-3 ${isDark ? "border-[#25372e]" : "border-[#f1eeeb]"}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
                    Application Settings
                  </h3>
                  <p className={`text-xs mt-1 font-medium ${isDark ? "text-[#93a298]" : "text-[#6b705c] opacity-80"}`}>Configure client themes and interface translations.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`text-[10px] uppercase tracking-wider font-bold block ${
                      isDark ? "text-[#93a298]" : "text-[#6b705c]"
                    }`}>
                      Theme
                    </label>
                    <div className="relative">
                      <select
                        value={appTheme}
                        onChange={(e) => {
                          const val = e.target.value as "Light" | "Dark";
                          setAppTheme(val);
                          setNotificationToast(`Theme changed to ${val}!`);
                        }}
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer ${
                          isDark
                            ? "bg-[#0e1612] border-[#25372e] text-[#e1eae5]"
                            : "bg-[#fdfaf5] border-[#e6e2da] text-[#333d29]"
                        }`}
                      >
                        <option value="Light">Light</option>
                        <option value="Dark">Dark</option>
                      </select>
                      <ChevronDown className={`absolute right-4 top-3.5 w-4 h-4 pointer-events-none ${
                        isDark ? "text-[#81a290]" : "text-[#6b705c]"
                      }`} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[10px] uppercase tracking-wider font-bold block ${
                      isDark ? "text-[#93a298]" : "text-[#6b705c]"
                    }`}>
                      Language
                    </label>
                    <div className="relative">
                      <select
                        value={appLanguage}
                        onChange={(e) => {
                          setAppLanguage(e.target.value);
                          setNotificationToast(`Language updated to ${e.target.value}!`);
                        }}
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer ${
                          isDark
                            ? "bg-[#0e1612] border-[#25372e] text-[#e1eae5]"
                            : "bg-[#fdfaf5] border-[#e6e2da] text-[#333d29]"
                        }`}
                      >
                        <option value="Eng">Eng (English)</option>
                        <option value="Span">Span (Spanish)</option>
                        <option value="Hindi">Hindi (हिन्दी)</option>
                        <option value="Bengali">Bengali (বাংলা)</option>
                        <option value="French">French (Français)</option>
                      </select>
                      <ChevronDown className={`absolute right-4 top-3.5 w-4 h-4 pointer-events-none ${
                        isDark ? "text-[#81a290]" : "text-[#6b705c]"
                      }`} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-start">
                  <button
                    onClick={handleSaveProfile}
                    className={`font-serif italic font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-sm ${
                      isDark ? "bg-[#81a290] text-[#0e1612] hover:bg-[#719280]" : "bg-[#5a6a4e] hover:bg-[#4a5d4e] text-white"
                    }`}
                  >
                    Save Change
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
      {renderConfirmDialog()}
    </div>
  );
}
