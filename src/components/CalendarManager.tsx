import React, { useState, useEffect } from "react";
import {
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  CalendarEventItem
} from "../workspace";
import {
  Calendar,
  Clock,
  Plus,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Clipboard,
  Sparkles,
  Heart
} from "lucide-react";

interface CalendarManagerProps {
  onShowToast: (message: string) => void;
  theme?: "Light" | "Dark";
  language?: string;
}

const CALENDAR_TRANSLATIONS: Record<string, Record<string, string>> = {
  Eng: {
    title: "Google Calendar Planner",
    desc: "Visualize your scheduled study sessions and upcoming deadlines directly in your calendar.",
    upcomingHeading: "Upcoming Calendar Events",
    loadingEvents: "Loading calendar events...",
    noEvents: "No upcoming events found on your Google Calendar.",
    scheduleSession: "Schedule Study/Breathing Session",
    topicPlaceholder: "Enter session topic (e.g., Physics Practice, Box Breathing)",
    durationLabel: "Duration:",
    mins30: "30 Minutes",
    mins60: "1 Hour",
    mins90: "1.5 Hours",
    scheduleButton: "Add to Google Calendar",
    scheduling: "Scheduling session...",
    validationError: "Please enter a session topic and select a future time.",
    calendarConfirm: "Do you want to add the event '{topic}' for {dateTime} to your Google Calendar?",
    calendarSuccess: "Successfully scheduled your '{topic}' session!",
    launchCalendar: "Open Google Calendar"
  },
  Span: {
    title: "Planificador de Google Calendar",
    desc: "Visualiza tus sesiones de estudio programadas y las próximas fechas límite directamente en tu calendario.",
    upcomingHeading: "Próximos eventos del calendario",
    loadingEvents: "Cargando eventos del calendario...",
    noEvents: "No se encontraron eventos próximos en tu Google Calendar.",
    scheduleSession: "Programar sesión de estudio o relajación",
    topicPlaceholder: "Tema de la sesión (ej. Práctica de Física, Respiración)",
    durationLabel: "Duración:",
    mins30: "30 minutos",
    mins60: "1 hora",
    mins90: "1.5 horas",
    scheduleButton: "Añadir a Google Calendar",
    scheduling: "Programando sesión...",
    validationError: "Por favor, introduce un tema y selecciona una hora futura.",
    calendarConfirm: "¿Quieres añadir el evento '{topic}' para {dateTime} a tu Google Calendar?",
    calendarSuccess: "¡Sesión '{topic}' programada correctamente!",
    launchCalendar: "Abrir Google Calendar"
  },
  Hindi: {
    title: "गूगल कैलेंडर प्लानर",
    desc: "अपने कैलेंडर में सीधे अपनी निर्धारित अध्ययन सत्रों और आगामी समय-सीमाओं की कल्पना करें।",
    upcomingHeading: "आगामी कैलेंडर ईवेंट",
    loadingEvents: "कैलेंडर ईवेंट लोड हो रहे हैं...",
    noEvents: "आपके Google कैलेंडर पर कोई आगामी ईवेंट नहीं मिले।",
    scheduleSession: "अध्ययन/श्वसन सत्र शेड्यूल करें",
    topicPlaceholder: "सत्र का विषय दर्ज करें (जैसे, भौतिकी अभ्यास, बॉक्स श्वास)",
    durationLabel: "अवधि:",
    mins30: "30 मिनट",
    mins60: "1 घंटा",
    mins90: "1.5 घंटे",
    scheduleButton: "गूगल कैलेंडर में जोड़ें",
    scheduling: "सत्र शेड्यूल किया जा रहा है...",
    validationError: "कृपया सत्र का विषय दर्ज करें और भविष्य का समय चुनें।",
    calendarConfirm: "क्या आप अपने Google कैलेंडर में {dateTime} के लिए '{topic}' ईवेंट जोड़ना चाहते हैं?",
    calendarSuccess: "आपका '{topic}' सत्र सफलतापूर्वक शेड्यूल किया गया!",
    launchCalendar: "गूगल कैलेंडर खोलें"
  },
  Bengali: {
    title: "গুগল ক্যালেন্ডার প্ল্যানার",
    desc: "আপনার ক্যালেন্ডারে সরাসরি আপনার নির্ধারিত অধ্যয়নের সেশন এবং আসন্ন সময়সীমাগুলি দেখুন।",
    upcomingHeading: "আসন্ন ক্যালেন্ডার ইভেন্ট",
    loadingEvents: "ক্যালেন্ডার ইভেন্ট লোড হচ্ছে...",
    noEvents: "আপনার গুগল ক্যালেন্ডারে কোনো আসন্ন ইভেন্ট পাওয়া যায়নি।",
    scheduleSession: "অধ্যয়ন/শ্বাস সেশন শিডিউল করুন",
    topicPlaceholder: "সেশনের বিষয় লিখুন (যেমন, পদার্থবিজ্ঞান অনুশীলন, বক্স ব্রিদিং)",
    durationLabel: "সময়কাল:",
    mins30: "৩০ মিনিট",
    mins60: "১ ঘণ্টা",
    mins90: "১.৫ ঘণ্টা",
    scheduleButton: "গুগল ক্যালেন্ডারে যুক্ত করুন",
    scheduling: "সেশন শিডিউল করা হচ্ছে...",
    validationError: "অনুগ্রহ করে একটি সেশনের বিষয় লিখুন এবং ভবিষ্যতের সময় নির্বাচন করুন।",
    calendarConfirm: "আপনি কি আপনার গুগল ক্যালেন্ডারে {dateTime} এর জন্য '{topic}' ইভেন্টটি যুক্ত করতে চান?",
    calendarSuccess: "আপনার '{topic}' সেশন সফলভাবে শিডিউল করা হয়েছে!",
    launchCalendar: "গুগল ক্যালেন্ডার খুলুন"
  },
  French: {
    title: "Planificateur Google Agenda",
    desc: "Visualisez vos sessions d'étude planifiées et vos échéances à venir directement dans votre calendrier.",
    upcomingHeading: "Événements à venir",
    loadingEvents: "Chargement des événements...",
    noEvents: "Aucun événement à venir trouvé dans votre Google Agenda.",
    scheduleSession: "Planifier une séance d'étude ou de respiration",
    topicPlaceholder: "Sujet de la séance (ex : Révision de Physique, Cohérence cardiaque)",
    durationLabel: "Durée :",
    mins30: "30 Minutes",
    mins60: "1 Heure",
    mins90: "1,5 Heure",
    scheduleButton: "Ajouter à Google Agenda",
    scheduling: "Planification en cours...",
    validationError: "Veuillez entrer un sujet et choisir une heure future.",
    calendarConfirm: "Voulez-vous ajouter l'événement '{topic}' le {dateTime} à votre Google Agenda ?",
    calendarSuccess: "Séance '{topic}' planifiée avec succès !",
    launchCalendar: "Ouvrir Google Agenda"
  }
};

export default function CalendarManager({
  onShowToast,
  theme = "Light",
  language = "Eng"
}: CalendarManagerProps) {
  const isDark = theme === "Dark";
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Custom session form states
  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionDuration, setSessionDuration] = useState(60); // minutes
  const [isScheduling, setIsScheduling] = useState(false);

  const lct = (key: string): string => {
    const langSet = CALENDAR_TRANSLATIONS[language] || CALENDAR_TRANSLATIONS["Eng"];
    return langSet[key] || CALENDAR_TRANSLATIONS["Eng"][key] || key;
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoadingEvents(true);
    setEventsError(null);
    try {
      const fetchedEvents = await fetchGoogleCalendarEvents();
      setEvents(fetchedEvents);
    } catch (err: any) {
      console.warn("Could not fetch calendar events automatically:", err.message);
      setEventsError("Could not retrieve Google Calendar events. Make sure calendar scope is verified.");
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleCreateCustomEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTopic.trim() || !sessionDate || !sessionTime) {
      alert(lct("validationError"));
      return;
    }

    const startDateTimeStr = `${sessionDate}T${sessionTime}:00`;
    const startDateObj = new Date(startDateTimeStr);

    if (isNaN(startDateObj.getTime())) {
      alert("Invalid date/time combination.");
      return;
    }

    const endDateObj = new Date(startDateObj.getTime() + sessionDuration * 60 * 1000);
    const friendlyTimeStr = startDateObj.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });

    const confirmMessage = lct("calendarConfirm")
      .replace("{topic}", sessionTopic)
      .replace("{dateTime}", friendlyTimeStr);

    let isConfirmed = false;
    try {
      isConfirmed = window.confirm(confirmMessage);
    } catch (err) {
      isConfirmed = true; // Fallback in environments where window.confirm is locked
    }

    if (!isConfirmed) return;

    setIsScheduling(true);
    try {
      const summary = sessionTopic.trim();
      const isBreathing = summary.toLowerCase().includes("breath") || summary.toLowerCase().includes("mindful") || summary.toLowerCase().includes("meditat");
      const categoryEmoji = isBreathing ? "🧘" : "📚";

      await createGoogleCalendarEvent({
        summary: `${categoryEmoji} ${summary}`,
        description: `Mindful Scholar study block scheduled for personal focus and workload optimization. (${sessionDuration}m session)`,
        start: startDateObj.toISOString(),
        end: endDateObj.toISOString()
      });

      onShowToast(lct("calendarSuccess").replace("{topic}", summary));
      setSessionTopic("");
      setSessionDate("");
      setSessionTime("");
      
      // Reload calendar events
      loadEvents();
    } catch (err: any) {
      console.error("Custom session create failed:", err);
      alert("Could not save event to Google Calendar. Make sure calendar scopes are fully allowed.");
    } finally {
      setIsScheduling(false);
    }
  };

  const formatEventTime = (event: CalendarEventItem) => {
    const startStr = event.start.dateTime || event.start.date;
    if (!startStr) return "N/A";

    const dateObj = new Date(startStr);
    if (isNaN(dateObj.getTime())) return startStr;

    // If it's an all-day event
    if (event.start.date && !event.start.dateTime) {
      return dateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      }) + " (All Day)";
    }

    return dateObj.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  return (
    <div className={`rounded-[24px] p-6 border transition-all shadow-sm ${
      isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#cb997e]" />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
            {lct("title")}
          </h3>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
          isDark ? "bg-[#2e221c] text-[#dca694]" : "bg-[#f9e5d8] text-[#7b5c54]"
        }`}>
          Calendar API Active
        </span>
      </div>
      <p className={`text-xs leading-relaxed mb-6 ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
        {lct("desc")}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* EVENT SCHEDULE LIST */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
              {lct("upcomingHeading")}
            </h4>
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noreferrer"
              className={`text-[10px] font-semibold flex items-center gap-1 hover:underline ${
                isDark ? "text-[#81a290]" : "text-[#5a6a4e]"
              }`}
            >
              {lct("launchCalendar")} <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {eventsError ? (
            <div className={`p-4 rounded-xl border border-dashed text-center ${
              isDark ? "bg-[#0e1612]/30 border-rose-900/50 text-rose-400" : "bg-rose-50/50 border-rose-100 text-rose-600"
            }`}>
              <p className="text-xs italic flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {eventsError}
              </p>
              <button
                onClick={loadEvents}
                className={`mt-2 text-xs font-semibold underline ${isDark ? "text-[#81a290]" : "text-[#5a6a4e]"}`}
              >
                Reconnect Calendar
              </button>
            </div>
          ) : loadingEvents ? (
            <div className="flex items-center justify-center py-10 gap-2 text-xs text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{lct("loadingEvents")}</span>
            </div>
          ) : events.length === 0 ? (
            <div className={`text-center py-8 text-xs rounded-xl border italic ${
              isDark ? "bg-[#0e1612] border-[#25372e] text-[#93a298]" : "bg-[#fdfaf5] border-[#e6e2da] text-[#6b705c]"
            }`}>
              {lct("noEvents")}
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {events.map((event) => {
                const isDeStress = event.summary.includes("🧘") || event.summary.toLowerCase().includes("meet") || event.summary.toLowerCase().includes("breath");
                return (
                  <div
                    key={event.id}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 transition-colors ${
                      isDark
                        ? "bg-[#0e1612]/40 border-[#25372e] hover:bg-[#16221c]/40"
                        : "bg-[#fdfaf5] border-[#e6e2da] hover:bg-slate-50"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      isDeStress
                        ? isDark ? "bg-rose-950/40 text-rose-400" : "bg-rose-50 text-rose-600"
                        : isDark ? "bg-emerald-950/40 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h5 className={`text-xs font-bold truncate ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                        {event.summary}
                      </h5>
                      <p className={`text-[10px] ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
                        {formatEventTime(event)}
                      </p>
                      {event.description && (
                        <p className="text-[9px] text-gray-400 italic truncate max-w-[200px]">
                          {event.description}
                        </p>
                      )}
                    </div>
                    {event.htmlLink && (
                      <a
                        href={event.htmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-gray-400 hover:text-[#cb997e] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CUSTOM SESSION FORM */}
        <div className={`p-4 rounded-2xl border ${
          isDark ? "bg-[#0e1612]/30 border-[#25372e]" : "bg-[#fcfaf7] border-[#ede9e2]"
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1 ${
            isDark ? "text-[#81a290]" : "text-[#5a6a4e]"
          }`}>
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{lct("scheduleSession")}</span>
          </h4>

          <form onSubmit={handleCreateCustomEvent} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder={lct("topicPlaceholder")}
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
                required
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none transition-all ${
                  isDark
                    ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] focus:border-[#81a290]"
                    : "bg-white border border-[#e6e2da] text-[#333d29] focus:border-[#5a6a4e]"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  required
                  className={`w-full px-3 py-1.5 rounded-xl text-xs focus:outline-none transition-all ${
                    isDark
                      ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] focus:border-[#81a290] color-scheme-dark"
                      : "bg-white border border-[#e6e2da] text-[#333d29] focus:border-[#5a6a4e]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  required
                  className={`w-full px-3 py-1.5 rounded-xl text-xs focus:outline-none transition-all ${
                    isDark
                      ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] focus:border-[#81a290] color-scheme-dark"
                      : "bg-white border border-[#e6e2da] text-[#333d29] focus:border-[#5a6a4e]"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                {lct("durationLabel")}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[30, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSessionDuration(mins)}
                    className={`py-1 rounded-lg text-[10px] font-medium transition-all ${
                      sessionDuration === mins
                        ? isDark
                          ? "bg-[#cb997e] text-[#0e1612] font-semibold"
                          : "bg-[#5a6a4e] text-white font-semibold"
                        : isDark
                          ? "bg-[#0e1612] border border-[#25372e] text-[#93a298] hover:bg-[#16221c]"
                          : "bg-white border border-[#e6e2da] text-[#6b705c] hover:bg-slate-50"
                    }`}
                  >
                    {mins === 30 ? lct("mins30") : mins === 60 ? lct("mins60") : lct("mins90")}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isScheduling}
              className={`w-full py-2.5 rounded-xl font-serif italic text-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                isDark
                  ? "bg-[#cb997e] text-[#0e1612] hover:bg-[#b7866b]"
                  : "bg-[#cb997e] text-white hover:bg-[#b7866b]"
              }`}
            >
              {isScheduling ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{lct("scheduling")}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lct("scheduleButton")}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
