import React from "react";
import { SyllabusTask } from "../types";
import { CheckSquare, Square, Clock, Send, ShieldAlert } from "lucide-react";

interface SyllabusTrackerProps {
  tasks: SyllabusTask[];
  onToggleTask: (index: number) => void;
  onShareToChat: () => void;
  isSharing: boolean;
  chatSpaceId: string;
  setChatSpaceId: (id: string) => void;
  shareSuccess: string | null;
  shareError: string | null;
  theme?: "Light" | "Dark";
  language?: string;
}

const SYLLABUS_TRANSLATIONS: Record<string, Record<string, string>> = {
  Eng: {
    title: "Adaptive Syllabus & Study Tasks",
    done: "Done",
    shareTitle: "Share to Google Chat Workspace",
    shareDesc: "Post this personalized syllabus checklist directly to your study group or counselor space.",
    spacePlaceholder: "Enter Space ID (e.g. spaces/AAAAxxxxx)",
    sharing: "Sharing...",
    shareNow: "Share Now",
    noTasks: "No academic syllabus tasks generated yet. Write a journal log about study, exam, or test stress to get an instant bite-sized revision plan."
  },
  Span: {
    title: "Temario Adaptativo y Tareas de Estudio",
    done: "Terminado",
    shareTitle: "Compartir en el espacio de Google Chat",
    shareDesc: "Publica esta lista de tareas personalizada directamente en tu grupo de estudio o espacio de asesores.",
    spacePlaceholder: "Ingresar ID del espacio (ej. spaces/AAAAxxxxx)",
    sharing: "Compartiendo...",
    shareNow: "Compartir ahora",
    noTasks: "Aún no se han generado tareas académicas. Escribe un diario sobre el estudio o el estrés de los exámenes para obtener un plan de repaso instantáneo."
  },
  Hindi: {
    title: "अनुकूली पाठ्यक्रम और अध्ययन कार्य",
    done: "पूर्ण",
    shareTitle: "Google Chat वर्कस्पेस पर साझा करें",
    shareDesc: "इस व्यक्तिगत पाठ्यक्रम चेकलिस्ट को सीधे अपने अध्ययन समूह या काउंसलर स्पेस पर पोस्ट करें।",
    spacePlaceholder: "स्पेस आईडी दर्ज करें (जैसे spaces/AAAAxxxxx)",
    sharing: "साझा किया जा रहा है...",
    shareNow: "अभी साझा करें",
    noTasks: "अभी तक कोई शैक्षणिक पाठ्यक्रम कार्य जनरेट नहीं हुआ है। त्वरित संशोधन योजना प्राप्त करने के लिए अध्ययन, परीक्षा या टेस्ट तनाव के बारे में जर्नल लॉग लिखें।"
  },
  Bengali: {
    title: "অনুকূল সিলেবাস এবং অধ্যয়নের কাজ",
    done: "সম্পন্ন",
    shareTitle: "গুগল চ্যাট ওয়ার্কস্পেসে শেয়ার করুন",
    shareDesc: "এই ব্যক্তিগতকৃত সিলেবাস চেকলিস্টটি সরাসরি আপনার স্টাডি গ্রুপ বা কাউন্সেলর স্পেসে পোস্ট করুন।",
    spacePlaceholder: "স্পেস আইডি লিখুন (যেমন spaces/AAAAxxxxx)",
    sharing: "শেয়ার করা হচ্ছে...",
    shareNow: "এখনই শেয়ার করুন",
    noTasks: "এখনও পর্যন্ত কোনো একাডেমিক সিলেবাসের কাজ তৈরি করা হয়নি। তাত্ক্ষণিক রিভিশন প্ল্যান পেতে পড়াশোনা, পরীক্ষা বা টেস্টের চাপ নিয়ে একটি জার্নাল লিখুন।"
  },
  French: {
    title: "Programme Adaptatif & Tâches d'Étude",
    done: "Fait",
    shareTitle: "Partager sur Google Chat Workspace",
    shareDesc: "Publiez cette liste de contrôle personnalisée directement dans votre groupe d'étude ou espace de conseil.",
    spacePlaceholder: "Entrer l'ID de l'espace (ex. spaces/AAAAxxxxx)",
    sharing: "Partage...",
    shareNow: "Partager maintenant",
    noTasks: "Aucune tâche académique générée pour l'instant. Écrivez un journal sur le stress des examens pour obtenir un plan de révision instantané."
  }
};

export default function SyllabusTracker({
  tasks,
  onToggleTask,
  onShareToChat,
  isSharing,
  chatSpaceId,
  setChatSpaceId,
  shareSuccess,
  shareError,
  theme = "Light",
  language = "Eng",
}: SyllabusTrackerProps) {
  const isDark = theme === "Dark";

  const st = (key: string): string => {
    const langSet = SYLLABUS_TRANSLATIONS[language] || SYLLABUS_TRANSLATIONS["Eng"];
    return langSet[key] || SYLLABUS_TRANSLATIONS["Eng"][key] || key;
  };

  if (tasks.length === 0) {
    return (
      <div className={`text-center py-6 text-sm italic ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
        {st("noTasks")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
          {st("title")}
        </h4>
        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
          isDark ? "bg-[#1d2f26] text-[#81a290]" : "bg-[#e6ebe0] text-[#5a6a4e]"
        }`}>
          {tasks.filter((t) => t.completed).length} / {tasks.length} {st("done")}
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <div
            key={idx}
            onClick={() => onToggleTask(idx)}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              task.completed
                ? isDark
                  ? "bg-[#0e1612]/40 border-[#25372e] opacity-60 line-through"
                  : "bg-[#fdfaf5]/40 border-[#e6e2da] opacity-70 line-through"
                : isDark
                ? "bg-[#16221c] border-[#25372e] hover:border-[#cb997e] hover:shadow-sm"
                : "bg-white border-[#e6e2da] hover:border-[#cb997e] hover:shadow-sm"
            }`}
          >
            <button className={`mt-0.5 ${isDark ? "text-[#81a290]" : "text-[#5a6a4e]"}`}>
              {task.completed ? (
                <CheckSquare className={`w-4.5 h-4.5 ${isDark ? "fill-[#1d2f26]" : "fill-[#e6ebe0]"}`} />
              ) : (
                <Square className="w-4.5 h-4.5" />
              )}
            </button>
            <div className="flex-1">
              <p className={`text-xs font-medium leading-tight ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                {task.topic}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase ${
                    task.difficulty === "Easy"
                      ? isDark
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/55"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : task.difficulty === "Medium"
                      ? isDark
                        ? "bg-amber-955/40 text-amber-400 border border-amber-900/55"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                      : isDark
                      ? "bg-rose-955/40 text-rose-400 border border-rose-900/55"
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}
                >
                  {task.difficulty}
                </span>
                <span className={`flex items-center gap-1 text-[10px] ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
                  <Clock className="w-3 h-3" /> {task.durationMinutes} min
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share to Google Chat Section */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isDark ? "bg-[#121c17] border-[#25372e]" : "bg-[#f9f7f2] border-[#e6e2da]"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
            {st("shareTitle")}
          </label>
        </div>
        <p className={`text-[11px] mb-3 leading-relaxed ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
          {st("shareDesc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder={st("spacePlaceholder")}
            value={chatSpaceId}
            onChange={(e) => setChatSpaceId(e.target.value)}
            className={`flex-1 px-3 py-1.5 rounded-xl text-xs focus:outline-none transition-all ${
              isDark
                ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] focus:border-[#81a290]"
                : "bg-white border border-[#e6e2da] text-[#333d29] focus:border-[#5a6a4e]"
            }`}
          />
          <button
            onClick={onShareToChat}
            disabled={isSharing || !chatSpaceId.trim()}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer ${
              isDark
                ? "bg-[#81a290] hover:bg-[#719280] text-[#0e1612]"
                : "bg-[#5a6a4e] text-white hover:bg-[#4a5d4e]"
            }`}
          >
            <Send className="w-3 h-3" />
            {isSharing ? st("sharing") : st("shareNow")}
          </button>
        </div>

        {shareSuccess && (
          <div className={`mt-2 text-[11px] font-semibold p-2 rounded-lg border ${
            isDark
              ? "bg-[#1d2f26]/60 text-[#81a290] border-[#2c4538]"
              : "bg-[#e6ebe0] text-[#5a6a4e] border-[#d4d9cc]"
          }`}>
            {shareSuccess}
          </div>
        )}
        {shareError && (
          <div className={`mt-2 text-[11px] font-semibold p-2 rounded-lg border flex items-start gap-1 ${
            isDark
              ? "bg-rose-955/40 text-rose-400 border-rose-900/55"
              : "bg-rose-50 text-rose-600 border border-rose-100"
          }`}>
            <ShieldAlert className="w-3 h-3 mt-0.5 shrink-0" />
            <span>{shareError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
