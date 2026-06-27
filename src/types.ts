export interface SyllabusTask {
  topic: string;
  difficulty: "Easy" | "Medium" | "Deep" | string;
  durationMinutes: number;
  completed: boolean;
}

export interface MindfulnessExercise {
  title: string;
  description: string;
}

export interface CopingPlan {
  hasAcademicAnxiety: boolean;
  encouragingMessage: string;
  biteSizedSyllabusTracker?: SyllabusTask[];
  mindfulnessExercise: MindfulnessExercise;
}

export interface ParsedJournalAnalysis {
  sentimentScore: number; // -1.0 to 1.0
  emotionTags: string[];
  primaryTrigger: string;
  stressIntensity: "Low" | "Medium" | "High" | string;
  isDistressCrisis: boolean;
  piiMaskedText: string;
  copingPlan: CopingPlan;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  encryptedText: string; // AES-GCM encrypted base64 payload
  isEncrypted: boolean;
  piiMaskedText: string; // Stored unencrypted for light visual logs if desired, or fully empty till unlocked
  parsedAnalysis: ParsedJournalAnalysis | null;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string; // ISO string
  groundingSources?: any[] | null;
  fallbackActive?: boolean;
}

export interface ReminderSetting {
  enabled: boolean;
  time: string; // "HH:MM" format
}
