import React, { useState, useEffect } from "react";
import {
  fetchGoogleClassroomCourses,
  fetchGoogleClassroomCourseWork,
  createGoogleCalendarEvent,
  ClassroomCourse,
  ClassroomCourseWork
} from "../workspace";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface ClassroomManagerProps {
  onImportTask: (topic: string, durationMinutes?: number) => void;
  onShowToast: (message: string) => void;
  theme?: "Light" | "Dark";
  language?: string;
}

const CLASSROOM_TRANSLATIONS: Record<string, Record<string, string>> = {
  Eng: {
    title: "Google Classroom Integration",
    desc: "Sync your active school assignments directly with your mindfulness workspace and study tracker.",
    coursesHeading: "Your Active Courses",
    loadingCourses: "Loading active courses...",
    selectCourse: "Select a course to view upcoming assignments",
    noCourses: "No active Google Classroom courses found.",
    assignmentsHeading: "Coursework & Assignments",
    loadingAssignments: "Loading assignments...",
    noAssignments: "No coursework assignments found for this course.",
    dueDateLabel: "Due Date:",
    notSpecified: "Not specified",
    syncSyllabus: "Import as Study Task",
    addToCalendar: "Schedule Study Block",
    viewInClassroom: "View Assignment",
    syncSuccess: "Assignment imported to your Syllabus Checklist!",
    calendarSuccess: "Calendar event scheduled!",
    calendarConfirm: "Do you want to schedule a 1-hour study block in your Google Calendar for '{title}'?",
    studyBlockDescription: "Mindful Scholar study block for: {title}. Focus session to complete assignment."
  },
  Span: {
    title: "Integración con Google Classroom",
    desc: "Sincroniza tus tareas escolares activas directamente con tu espacio de bienestar y tu planificador.",
    coursesHeading: "Tus Cursos Activos",
    loadingCourses: "Cargando cursos activos...",
    selectCourse: "Selecciona un curso para ver las tareas pendientes",
    noCourses: "No se encontraron cursos activos en Google Classroom.",
    assignmentsHeading: "Trabajo del Curso y Tareas",
    loadingAssignments: "Cargando tareas...",
    noAssignments: "No se encontraron tareas para este curso.",
    dueDateLabel: "Fecha de entrega:",
    notSpecified: "No especificada",
    syncSyllabus: "Importar como tarea",
    addToCalendar: "Programar bloque de estudio",
    viewInClassroom: "Ver tarea",
    syncSuccess: "¡Tarea importada a tu lista de temario!",
    calendarSuccess: "¡Bloque de estudio programado en tu calendario!",
    calendarConfirm: "¿Quieres programar un bloque de estudio de 1 hora en tu Google Calendar para '{title}'?",
    studyBlockDescription: "Bloque de estudio de Mindful Scholar para: {title}. Sesión de concentración para completar la tarea."
  },
  Hindi: {
    title: "गूगल क्लासरूम एकीकरण",
    desc: "अपने सक्रिय स्कूल असाइनमेंट को सीधे अपने माइंडफुलनेस वर्कस्पेस और स्टडी ट्रैकर के साथ सिंक करें।",
    coursesHeading: "आपके सक्रिय पाठ्यक्रम",
    loadingCourses: "सक्रिय पाठ्यक्रम लोड हो रहे हैं...",
    selectCourse: "आगामी असाइनमेंट देखने के लिए एक पाठ्यक्रम चुनें",
    noCourses: "कोई सक्रिय Google क्लासरूम पाठ्यक्रम नहीं मिला।",
    assignmentsHeading: "कोर्सवर्क और असाइनमेंट",
    loadingAssignments: "असाइनमेंट लोड हो रहे हैं...",
    noAssignments: "इस पाठ्यक्रम के लिए कोई असाइनमेंट नहीं मिला।",
    dueDateLabel: "नियत तिथि:",
    notSpecified: "निर्दिष्ट नहीं",
    syncSyllabus: "अध्ययन कार्य के रूप में आयात करें",
    addToCalendar: "स्टडी ब्लॉक शेड्यूल करें",
    viewInClassroom: "असाइनमेंट देखें",
    syncSuccess: "असाइनमेंट आपके पाठ्यक्रम चेकलिस्ट में आयात हो गया है!",
    calendarSuccess: "कैलेंडर ईवेंट शेड्यूल किया गया!",
    calendarConfirm: "क्या आप '{title}' के लिए अपने Google कैलेंडर में 1 घंटे का स्टडी ब्लॉक शेड्यूल करना चाहते हैं?",
    studyBlockDescription: "माइंडफुल स्कॉलर स्टडी ब्लॉक: {title}। असाइनमेंट पूरा करने के लिए फोकस सत्र।"
  },
  Bengali: {
    title: "গুগল ক্লাসরুম ইন্টিগ্রেশন",
    desc: "আপনার সক্রিয় স্কুল অ্যাসাইনমেন্টগুলি সরাসরি আপনার মাইন্ডফুলনেস ওয়ার্কস্পেস এবং স্টাডি ট্র্যাকারের সাথে সিংক করুন।",
    coursesHeading: "আপনার সক্রিয় কোর্স",
    loadingCourses: "সক্রিয় কোর্স লোড হচ্ছে...",
    selectCourse: "আসন্ন অ্যাসাইনমেন্ট দেখতে একটি কোর্স নির্বাচন করুন",
    noCourses: "কোনো সক্রিয় গুগল ক্লাসরুম কোর্স পাওয়া যায়নি।",
    assignmentsHeading: "কোর্সের কাজ এবং অ্যাসাইনমেন্ট",
    loadingAssignments: "অ্যাসাইনমেন্ট লোড হচ্ছে...",
    noAssignments: "এই কোর্সের জন্য কোনো অ্যাসাইনমেন্ট পাওয়া যায়নি।",
    dueDateLabel: "নিয়ত তারিখ:",
    notSpecified: "নির্দিষ্ট করা নেই",
    syncSyllabus: "স্টাডি টাস্ক হিসেবে ইম্পোর্ট করুন",
    addToCalendar: "স্টাডি ব্লক শিডিউল করুন",
    viewInClassroom: "অ্যাসাইনমেন্ট দেখুন",
    syncSuccess: "অ্যাসাইনমেন্ট আপনার সিলেবাস চেকলিস্টে ইম্পোর্ট করা হয়েছে!",
    calendarSuccess: "ক্যালেন্ডার ইভেন্ট শিডিউল করা হয়েছে!",
    calendarConfirm: "আপনি কি আপনার গুগল ক্যালেন্ডারে '{title}' এর জন্য ১ ঘণ্টার স্টাডি ব্লক শিডিউল করতে চান?",
    studyBlockDescription: "মাইন্ডফুল স্কলার স্টাডি ব্লক: {title}। অ্যাসাইনমেন্ট সম্পন্ন করার জন্য ফোকাস সেশন।"
  },
  French: {
    title: "Intégration Google Classroom",
    desc: "Synchronisez vos devoirs scolaires actifs directement avec votre espace bien-être et votre planificateur d'étude.",
    coursesHeading: "Vos Cours Actifs",
    loadingCourses: "Chargement des cours actifs...",
    selectCourse: "Sélectionnez un cours pour afficher les devoirs à venir",
    noCourses: "Aucun cours Google Classroom actif trouvé.",
    assignmentsHeading: "Travaux de classe",
    loadingAssignments: "Chargement des devoirs...",
    noAssignments: "Aucun devoir trouvé pour ce cours.",
    dueDateLabel: "Date d'échéance :",
    notSpecified: "Non spécifié",
    syncSyllabus: "Importer comme tâche",
    addToCalendar: "Planifier un créneau d'étude",
    viewInClassroom: "Voir le devoir",
    syncSuccess: "Devoir importé dans votre programme d'étude !",
    calendarSuccess: "Événement d'agenda planifié !",
    calendarConfirm: "Voulez-vous planifier un créneau d'étude d'une heure dans votre Google Agenda pour '{title}' ?",
    studyBlockDescription: "Créneau d'étude Mindful Scholar pour : {title}. Session de concentration pour terminer le devoir."
  }
};

export default function ClassroomManager({
  onImportTask,
  onShowToast,
  theme = "Light",
  language = "Eng"
}: ClassroomManagerProps) {
  const isDark = theme === "Dark";
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourse | null>(null);
  const [courseWorkList, setCourseWorkList] = useState<ClassroomCourseWork[]>([]);
  
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  
  const [schedulingEventId, setSchedulingEventId] = useState<string | null>(null);

  const ct = (key: string): string => {
    const langSet = CLASSROOM_TRANSLATIONS[language] || CLASSROOM_TRANSLATIONS["Eng"];
    return langSet[key] || CLASSROOM_TRANSLATIONS["Eng"][key] || key;
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoadingCourses(true);
    setCoursesError(null);
    try {
      const activeCourses = await fetchGoogleClassroomCourses();
      setCourses(activeCourses);
      if (activeCourses.length > 0) {
        // Auto-select first course
        handleSelectCourse(activeCourses[0]);
      }
    } catch (err: any) {
      console.warn("Could not load Classroom courses automatically:", err.message);
      setCoursesError("Could not connect to Google Classroom. Make sure classroom.courses.readonly scope is authorized.");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSelectCourse = async (course: ClassroomCourse) => {
    setSelectedCourse(course);
    setLoadingAssignments(true);
    setAssignmentsError(null);
    setCourseWorkList([]);
    try {
      const coursework = await fetchGoogleClassroomCourseWork(course.id);
      setCourseWorkList(coursework);
    } catch (err: any) {
      console.error("Could not load coursework:", err);
      setAssignmentsError("Could not retrieve coursework. Make sure classroom.coursework.me.readonly scope is authorized.");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleScheduleStudyBlock = async (assignment: ClassroomCourseWork) => {
    const title = assignment.title;
    const confirmMessage = ct("calendarConfirm").replace("{title}", title);
    
    let isConfirmed = false;
    try {
      isConfirmed = window.confirm(confirmMessage);
    } catch (e) {
      isConfirmed = true; // Fallback in environments where window.confirm is restricted
    }
    
    if (!isConfirmed) return;

    setSchedulingEventId(assignment.id);
    try {
      // Schedule study block starting 1 hour from now for 1 hour
      const startTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour later
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour study duration

      await createGoogleCalendarEvent({
        summary: `📚 Study Focus: ${title}`,
        description: ct("studyBlockDescription").replace("{title}", title),
        start: startTime.toISOString(),
        end: endTime.toISOString()
      });

      onShowToast(`${ct("calendarSuccess")} ("Study Focus: ${title}")`);
    } catch (err: any) {
      console.error("Failed to schedule study block:", err);
      onShowToast("Failed to create Google Calendar study block. Ensure calendar scope is verified.");
    } finally {
      setSchedulingEventId(null);
    }
  };

  const formatDueDate = (assignment: ClassroomCourseWork) => {
    if (!assignment.dueDate) return ct("notSpecified");
    const { year, month, day } = assignment.dueDate;
    const dateObj = new Date(year, month - 1, day);
    
    if (isNaN(dateObj.getTime())) return ct("notSpecified");
    
    return dateObj.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className={`rounded-[24px] p-6 border transition-all shadow-sm ${
      isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#5a6a4e]" />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
            {ct("title")}
          </h3>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
          isDark ? "bg-[#25372e] text-[#81a290]" : "bg-[#e6ebe0] text-[#5a6a4e]"
        }`}>
          Classroom API Active
        </span>
      </div>
      <p className={`text-xs leading-relaxed mb-6 ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
        {ct("desc")}
      </p>

      <div className="space-y-6">
        {/* COURSES SECTION */}
        <div>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
            isDark ? "text-[#e1eae5]" : "text-[#333d29]"
          }`}>
            <span>{ct("coursesHeading")}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </h4>

          {coursesError ? (
            <div className={`p-4 rounded-xl border border-dashed text-center ${
              isDark ? "bg-[#0e1612]/30 border-rose-900/50 text-rose-400" : "bg-rose-50/50 border-rose-100 text-rose-600"
            }`}>
              <p className="text-xs italic flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {coursesError}
              </p>
              <button
                onClick={loadCourses}
                className={`mt-2 text-xs font-semibold underline ${isDark ? "text-[#81a290]" : "text-[#5a6a4e]"}`}
              >
                Reconnect Google Classroom
              </button>
            </div>
          ) : loadingCourses ? (
            <div className="flex items-center justify-center py-6 gap-2 text-xs text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{ct("loadingCourses")}</span>
            </div>
          ) : courses.length === 0 ? (
            <div className={`text-center py-6 text-xs rounded-xl border italic ${
              isDark ? "bg-[#0e1612] border-[#25372e] text-[#93a298]" : "bg-[#fdfaf5] border-[#e6e2da] text-[#6b705c]"
            }`}>
              {ct("noCourses")}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => {
                const isSelected = selectedCourse?.id === course.id;
                return (
                  <button
                    key={course.id}
                    onClick={() => handleSelectCourse(course)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? isDark
                          ? "bg-[#cb997e] text-[#0e1612] font-semibold"
                          : "bg-[#5a6a4e] text-white font-semibold"
                        : isDark
                          ? "bg-[#0e1612] border border-[#25372e] text-[#93a298] hover:bg-[#16221c]"
                          : "bg-[#fdfaf5] border border-[#e6e2da] text-[#6b705c] hover:bg-slate-50"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[140px]">{course.name}</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ASSIGNMENTS LIST */}
        {selectedCourse && (
          <div className={`rounded-2xl p-4 border transition-all ${
            isDark ? "bg-[#0e1612]/40 border-[#25372e]" : "bg-[#fcfaf7] border-[#ede9e2]"
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? "text-[#81a290]" : "text-[#5a6a4e]"
              }`}>
                {ct("assignmentsHeading")} ({selectedCourse.name})
              </h4>
              {selectedCourse.alternateLink && (
                <a
                  href={selectedCourse.alternateLink}
                  target="_blank"
                  rel="noreferrer"
                  className={`text-[10px] font-semibold flex items-center gap-1 hover:underline ${
                    isDark ? "text-[#cb997e]" : "text-[#b7866b]"
                  }`}
                >
                  Go to Class <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {assignmentsError ? (
              <p className="text-xs italic text-rose-500 py-4 text-center">
                {assignmentsError}
              </p>
            ) : loadingAssignments ? (
              <div className="flex items-center justify-center py-10 gap-2 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{ct("loadingAssignments")}</span>
              </div>
            ) : courseWorkList.length === 0 ? (
              <p className={`text-xs text-center py-8 italic ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {ct("noAssignments")}
              </p>
            ) : (
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                {courseWorkList.map((work) => (
                  <div
                    key={work.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all ${
                      isDark
                        ? "bg-[#16221c] border-[#25372e]/80 hover:border-[#81a290]/40"
                        : "bg-white border-[#e6e2da]/80 hover:border-[#5a6a4e]/40"
                    }`}
                  >
                    <div className="space-y-1">
                      <h5 className={`text-xs font-bold ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                        {work.title}
                      </h5>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-[#cb997e]" />
                          <span>{ct("dueDateLabel")} {formatDueDate(work)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      <button
                        onClick={() => {
                          onImportTask(work.title, 45);
                          onShowToast(ct("syncSuccess"));
                        }}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark
                            ? "bg-[#25372e] text-[#81a290] hover:bg-[#2c4538]"
                            : "bg-[#e6ebe0] text-[#5a6a4e] hover:bg-[#d4d9cc]"
                        }`}
                        title="Add to study checklist"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{ct("syncSyllabus")}</span>
                      </button>

                      <button
                        onClick={() => handleScheduleStudyBlock(work)}
                        disabled={schedulingEventId === work.id}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark
                            ? "bg-[#2e221c] text-[#cb997e] hover:bg-[#3d2d26] disabled:opacity-50"
                            : "bg-[#f9e5d8] text-[#b7866b] hover:bg-[#edd1be] disabled:opacity-50"
                        }`}
                        title="Schedule 1h Google Calendar block"
                      >
                        {schedulingEventId === work.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Calendar className="w-3 h-3" />
                        )}
                        <span>{ct("addToCalendar")}</span>
                      </button>

                      {work.alternateLink && (
                        <a
                          href={work.alternateLink}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-1.5 rounded-lg border text-gray-400 hover:text-emerald-500 transition-colors ${
                            isDark ? "border-[#25372e] bg-[#0e1612]" : "border-[#e6e2da] bg-white"
                          }`}
                          title={ct("viewInClassroom")}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
