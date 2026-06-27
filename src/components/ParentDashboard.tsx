import React, { useState } from "react";
import { JournalEntry, SyllabusTask } from "../types";
import {
  Heart,
  TrendingUp,
  Activity,
  Award,
  Calendar,
  ShieldCheck,
  Video,
  Send,
  AlertTriangle,
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Clipboard,
  Info,
  Sparkles,
  Smile,
  Frown,
  BookOpen,
  Clock
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from "recharts";

interface ParentDashboardProps {
  entries: JournalEntry[];
  studentName: string;
  onLogout: () => void;
  onCreateMeetSpace: () => Promise<{ meetingUri: string; meetingCode: string }>;
  onSendChatMessage: (spaceId: string, text: string) => Promise<void>;
  theme?: "Light" | "Dark";
  language?: string;
}

export default function ParentDashboard({
  entries,
  studentName = "Alex Chen",
  onLogout,
  onCreateMeetSpace,
  onSendChatMessage,
  theme = "Light",
  language = "Eng"
}: ParentDashboardProps) {
  const isDark = theme === "Dark";
  const [copiedLink, setCopiedLink] = useState(false);
  const [meetResult, setMeetResult] = useState<{ meetingUri: string; meetingCode: string } | null>(null);
  const [creatingMeet, setCreatingMeet] = useState(false);
  const [meetError, setMeetError] = useState<string | null>(null);

  const [chatSpaceId, setChatSpaceId] = useState("");
  const [supportMessage, setSupportMessage] = useState(`Keep going, ${studentName}! I'm so proud of your hard work and study progress.`);
  const [sendingChat, setSendingChat] = useState(false);
  const [chatSuccess, setChatSuccess] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  // Active sub-section
  const [activeSubTab, setActiveSubTab] = useState<"telemetry" | "guidance">("telemetry");

  // Calculate stats
  const totalLogs = entries.length;
  const recentEntries = [...entries].reverse().slice(0, 10);

  // Get current stress index
  let stressIntensityLevel = "None";
  let stressColor = "text-emerald-500 bg-emerald-50 border-emerald-100";
  let academicAnxietyTriggered = false;
  let activeIndicators: string[] = [];

  const latestEntry = entries[entries.length - 1];
  if (latestEntry && latestEntry.parsedAnalysis) {
    stressIntensityLevel = latestEntry.parsedAnalysis.stressIntensity || "Medium";
    academicAnxietyTriggered = latestEntry.parsedAnalysis.copingPlan.hasAcademicAnxiety;
    activeIndicators = latestEntry.parsedAnalysis.emotionTags || [];
  } else {
    // Look at past entries to aggregate
    const allTags = entries.flatMap((e) => e.parsedAnalysis?.emotionTags || []);
    activeIndicators = Array.from(new Set(allTags)).slice(0, 5);
    if (entries.some((e) => e.parsedAnalysis?.stressIntensity === "High")) {
      stressIntensityLevel = "High";
    } else if (entries.length > 0) {
      stressIntensityLevel = "Medium";
    }
  }

  if (stressIntensityLevel === "High") {
    stressColor = isDark
      ? "text-rose-400 bg-rose-950/40 border-rose-900/50 animate-pulse"
      : "text-rose-600 bg-rose-50 border-rose-100 animate-pulse";
  } else if (stressIntensityLevel === "Medium") {
    stressColor = isDark
      ? "text-amber-400 bg-amber-950/40 border-amber-900/50"
      : "text-amber-600 bg-amber-50 border-amber-100";
  } else if (stressIntensityLevel !== "None") {
    stressColor = isDark
      ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/50"
      : "text-emerald-600 bg-emerald-50 border-emerald-100";
  }

  // Calculate Syllabus progress
  let syllabusTasks: SyllabusTask[] = [];
  let completedSyllabusCount = 0;
  let totalSyllabusCount = 0;

  // Search for latest tasks generated
  const latestWithTasks = [...entries]
    .reverse()
    .find((e) => e.parsedAnalysis?.copingPlan?.biteSizedSyllabusTracker);

  if (latestWithTasks && latestWithTasks.parsedAnalysis?.copingPlan?.biteSizedSyllabusTracker) {
    syllabusTasks = latestWithTasks.parsedAnalysis.copingPlan.biteSizedSyllabusTracker;
    totalSyllabusCount = syllabusTasks.length;
    completedSyllabusCount = syllabusTasks.filter((t) => t.completed).length;
  }

  // Get overall emotional trend data for Recharts
  const emotionalStabilityData = entries.map((e, idx) => {
    const sentiment = e.parsedAnalysis ? e.parsedAnalysis.sentimentScore : 0;
    // Map -1.0 to 1.0 -> 0 to 100 Stability Score
    const stabilityScore = Math.round((sentiment + 1) * 50);
    const dateObj = new Date(e.date);
    const formattedDate = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });
    return {
      index: idx + 1,
      date: formattedDate,
      "Wellness Score": stabilityScore,
      Stress: e.parsedAnalysis?.stressIntensity === "High" ? 80 : e.parsedAnalysis?.stressIntensity === "Medium" ? 50 : 20,
    };
  });

  // Aggregate triggers frequency
  const triggerCounts: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.parsedAnalysis) {
      const primary = e.parsedAnalysis.primaryTrigger;
      if (primary) {
        triggerCounts[primary] = (triggerCounts[primary] || 0) + 1;
      }
      e.parsedAnalysis.emotionTags?.forEach((tag) => {
        triggerCounts[tag] = (triggerCounts[tag] || 0) + 1;
      });
    }
  });

  const triggerChartData = Object.entries(triggerCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const colors = ["#cb997e", "#a3b18a", "#5a6a4e", "#ddb892", "#90e0ef"];

  // Handle Google Meet Schedule
  const handleCreateMeet = async () => {
    setCreatingMeet(true);
    setMeetError(null);
    setMeetResult(null);
    try {
      const res = await onCreateMeetSpace();
      setMeetResult(res);
    } catch (err: any) {
      console.error(err);
      setMeetError("Failed to initiate Google Meet session automatically. Check permission scopes.");
    } finally {
      setCreatingMeet(false);
    }
  };

  const copyMeetUrl = () => {
    if (meetResult) {
      navigator.clipboard.writeText(meetResult.meetingUri);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Handle Google Chat share
  const handleSendChatSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatSpaceId.trim() || !supportMessage.trim()) return;

    setSendingChat(true);
    setChatSuccess(null);
    setChatError(null);

    try {
      await onSendChatMessage(chatSpaceId, `💝 *Parent Encouragement Note for ${studentName}:*\n_"${supportMessage}"_\n\nKeep up the great work! ✨`);
      setChatSuccess("Your words of support were successfully posted into Alex's Study space!");
    } catch (err: any) {
      console.error(err);
      setChatError("Could not share to Google Chat. Make sure your Space ID is valid and Chat scopes are accepted.");
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-300 ${
      isDark ? "bg-[#0e1612] text-[#e1eae5]" : "bg-[#fdfaf5] text-[#333d29]"
    } p-4 md:p-8`}>
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className={`text-4xl font-serif italic ${isDark ? "text-[#e1eae5]" : "text-[#4a5d4e]"}`}>
              Mindful Scholar
            </h1>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold border ${
              isDark
                ? "bg-[#1d2f26] border-[#2c4538] text-[#81a290]"
                : "bg-[#e6ebe0] border-[#d4d9cc] text-[#5a6a4e]"
            }`}>
              Parent Portal
            </span>
            <div className={`text-[10px] flex items-center gap-1.5 px-3 py-0.5 rounded-full border ${
              isDark ? "bg-[#111a15] border-[#25372e] text-[#93a298]" : "bg-white border-[#e6e2da] text-[#6b705c]"
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>PII Masking & Encryption Active</span>
            </div>
          </div>
          <p className="text-xs font-medium opacity-75 uppercase tracking-widest">
            Parental Wellness Dashboard & Exam Stress Monitoring
          </p>
        </div>

        <div className={`flex items-center gap-4 px-5 py-3 rounded-3xl border w-full md:w-auto justify-between md:justify-start transition-all ${
          isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-serif border-2 ${
              isDark ? "bg-[#33463c] border-[#25372e]" : "bg-[#b7b7a4] border-[#e6ebe0]"
            }`}>
              {studentName ? studentName.split(" ").map((n) => n[0]).join("") : "S"}
            </div>
            <div className="text-left">
              <p className={`text-xs font-bold ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                Student: {studentName}
              </p>
              <div className={`flex items-center gap-1 text-[10px] font-medium ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
                <Award className="w-3.5 h-3.5 text-[#cb997e]" />
                <span>Connected & Monitored</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className={`p-1.5 rounded-lg border ml-4 transition-colors ${
              isDark
                ? "bg-[#0e1612] border-[#25372e] text-[#93a298] hover:text-[#e1eae5] hover:bg-rose-955/30"
                : "bg-[#fdfaf5] border-[#e6e2da] text-[#6b705c] hover:text-rose-600 hover:bg-rose-50"
            }`}
            title="Log Out Parent Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Stat 1: Stress Gauge */}
        <div className={`rounded-3xl p-5 border transition-all shadow-sm ${
          isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
        }`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
            Recent Exam Stress Index
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-serif italic font-bold px-3 py-0.5 rounded-xl border ${stressColor}`}>
              {stressIntensityLevel === "None" ? "Relaxed" : stressIntensityLevel}
            </span>
          </div>
          <p className={`text-[11px] mt-2 leading-relaxed ${isDark ? "text-[#93a298]/80" : "text-[#6b705c]/80"}`}>
            {stressIntensityLevel === "High"
              ? "Critical test anxiety noted. Needs family support & breathing break."
              : stressIntensityLevel === "Medium"
              ? "Moderate study load stress. Adaptive revision coping is active."
              : "Child is handling exam preparations calmly."}
          </p>
        </div>

        {/* Stat 2: Active Indicators */}
        <div className={`rounded-3xl p-5 border transition-all shadow-sm ${
          isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
        }`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
            Top Emotional Indicators
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-[44px] overflow-hidden">
            {activeIndicators.length > 0 ? (
              activeIndicators.map((tag, idx) => (
                <span
                  key={idx}
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                    isDark
                      ? "bg-[#121c17] border-[#25372e] text-[#81a290]"
                      : "bg-[#e6ebe0] border-[#d4d9cc] text-[#5a6a4e]"
                  }`}
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className={`text-xs italic ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
                No indicators logged yet.
              </span>
            )}
          </div>
          <p className={`text-[11px] mt-3 leading-relaxed ${isDark ? "text-[#93a298]/80" : "text-[#6b705c]/80"}`}>
            Representing low-friction mood logs submitted by {studentName} this week.
          </p>
        </div>

        {/* Stat 3: Syllabus Completion */}
        <div className={`rounded-3xl p-5 border transition-all shadow-sm ${
          isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
        }`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
            Syllabus Task Completion
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-serif font-bold ${isDark ? "text-[#81a290]" : "text-[#5a6a4e]"}`}>
              {totalSyllabusCount > 0 ? Math.round((completedSyllabusCount / totalSyllabusCount) * 100) : 0}%
            </span>
            <span className={`text-[11px] font-semibold ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
              ({completedSyllabusCount}/{totalSyllabusCount} revision tasks)
            </span>
          </div>
          <div className="w-full bg-[#e6ebe0]/60 dark:bg-[#111a15] rounded-full h-2 mt-2 border overflow-hidden dark:border-[#25372e]">
            <div
              className="bg-[#cb997e] h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalSyllabusCount > 0 ? (completedSyllabusCount / totalSyllabusCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Stat 4: Logging Consistency */}
        <div className={`rounded-3xl p-5 border transition-all shadow-sm ${
          isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
        }`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
            Journal Logging History
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif font-bold text-[#cb997e]">{totalLogs}</span>
            <span className={`text-[11px] font-semibold ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
              Secured Logs
            </span>
          </div>
          <p className={`text-[11px] mt-2.5 leading-relaxed ${isDark ? "text-[#93a298]/80" : "text-[#6b705c]/80"}`}>
            Journals are client-encrypted using military-grade security for extreme student trust.
          </p>
        </div>
      </div>

      {/* SEGMENTED CONTROL TAB FOR TELEMETRY VS SUPPORT GUIDANCE */}
      <div className="flex gap-2 p-1.5 bg-[#e6ebe0]/50 dark:bg-[#0e1612]/50 border dark:border-[#25372e] rounded-2xl mb-6">
        <button
          onClick={() => setActiveSubTab("telemetry")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeSubTab === "telemetry"
              ? isDark
                ? "bg-[#81a290] text-[#0e1612]"
                : "bg-[#5a6a4e] text-white"
              : isDark
              ? "text-[#93a298] hover:bg-[#16221c]"
              : "text-[#6b705c] hover:bg-white"
          }`}
        >
          <TrendingUp className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          Wellness Graphs & Syllabus Tracking
        </button>
        <button
          onClick={() => setActiveSubTab("guidance")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeSubTab === "guidance"
              ? isDark
                ? "bg-[#81a290] text-[#0e1612]"
                : "bg-[#5a6a4e] text-white"
              : isDark
              ? "text-[#93a298] hover:bg-[#16221c]"
              : "text-[#6b705c] hover:bg-white"
          }`}
        >
          <Heart className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          AI Guidance & Interactive Communication
        </button>
      </div>

      {/* SUB-TAB 1: TELEMETRY GRAPHS & SYLLABUS LIST */}
      {activeSubTab === "telemetry" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recharts Graphical Analysis */}
          <div className={`lg:col-span-2 rounded-[32px] p-6 border shadow-sm transition-all space-y-6 ${
            isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
          }`}>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
                Student Emotional Stability Trend
              </h3>
              <p className={`text-[11px] ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
                Historical timeline mapping mood stability based on daily semantic journal processing.
              </p>
            </div>

            {emotionalStabilityData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={emotionalStabilityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="date" stroke={isDark ? "#81a290" : "#5a6a4e"} fontSize={9} />
                    <YAxis stroke={isDark ? "#81a290" : "#5a6a4e"} fontSize={9} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#0e1612" : "#ffffff",
                        borderColor: isDark ? "#25372e" : "#e6e2da",
                        color: isDark ? "#e1eae5" : "#333d29",
                        borderRadius: "12px",
                        fontSize: "11px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Wellness Score"
                      stroke="#cb997e"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 1 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border border-dashed rounded-2xl italic text-xs">
                Not enough historical logs yet. Graphs will populate automatically.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-[#25372e]">
              {/* Trigger Frequency Bar Chart */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
                  Trigger & Stress Factor Frequencies
                </h4>
                {triggerChartData.length > 0 ? (
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={triggerChartData} layout="vertical" margin={{ left: -15, right: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke={isDark ? "#93a298" : "#6b705c"} fontSize={8} width={80} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#0e1612" : "#ffffff",
                            borderColor: isDark ? "#25372e" : "#e6e2da",
                            fontSize: "10px",
                          }}
                        />
                        <Bar dataKey="count" fill="#5a6a4e" radius={[0, 4, 4, 0]}>
                          {triggerChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center border border-dashed rounded-xl italic text-[10px]">
                    No triggers noted yet.
                  </div>
                )}
              </div>

              {/* Secure Log Timeline */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
                  Cryptographic Log History (Timeline)
                </h4>
                <div className="space-y-2 max-h-[128px] overflow-y-auto pr-1">
                  {recentEntries.length > 0 ? (
                    recentEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-2 rounded-lg border text-[10px] flex justify-between items-center ${
                          isDark ? "bg-[#0e1612]/40 border-[#25372e]" : "bg-[#fdfaf5] border-[#e6e2da]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#cb997e]" />
                          <span className="font-semibold">
                            {new Date(entry.date).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-sm uppercase tracking-wider text-[8px] font-bold ${
                          entry.parsedAnalysis?.stressIntensity === "High"
                            ? "bg-rose-500/10 text-rose-500"
                            : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {entry.parsedAnalysis?.stressIntensity || "Low"} Stress
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 italic text-[10px] text-gray-500">
                      No logs generated.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Child's Adaptive Syllabus Tracker */}
          <div className={`rounded-[32px] p-6 border shadow-sm transition-all flex flex-col justify-between ${
            isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
          }`}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
                    Adaptive Syllabus Progress
                  </h3>
                  <p className={`text-[11px] ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
                    Active study and revision plan assigned by the AI companion to manage cognitive overload.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {syllabusTasks.length > 0 ? (
                  syllabusTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${
                        task.completed
                          ? isDark
                            ? "bg-[#0e1612]/30 border-[#25372e]/50 opacity-60 line-through"
                            : "bg-[#fdfaf5]/40 border-[#e6e2da] opacity-70 line-through"
                          : isDark
                          ? "bg-[#0e1612] border-[#25372e]"
                          : "bg-[#fdfaf5] border-[#e6e2da]"
                      }`}
                    >
                      <span className={`mt-0.5 shrink-0 ${task.completed ? "text-emerald-500" : isDark ? "text-[#81a290]" : "text-[#5a6a4e]"}`}>
                        <ShieldCheck className="w-4.5 h-4.5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-tight ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                          {task.topic}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            task.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : task.difficulty === "Medium"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-rose-500/10 text-rose-500"
                          }`}>
                            {task.difficulty}
                          </span>
                          <span className={`text-[10px] flex items-center gap-1 ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
                            <Clock className="w-3 h-3" /> {task.durationMinutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-12 text-xs italic ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
                    No academic syllabus tasks active. Tasks generate automatically when student logs their mock tests or exam fears.
                  </div>
                )}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-[11px] leading-relaxed mt-4 ${
              isDark ? "bg-[#0e1612]/40 border-[#25372e] text-[#93a298]" : "bg-[#fdfaf5]/60 border-[#e6e2da] text-[#6b705c]"
            }`}>
              <Info className="w-4 h-4 text-[#cb997e] inline mr-1.5 -mt-0.5 shrink-0" />
              <span>
                As {studentName} completes these items in their app workspace, completion rates sync instantly here. No parental nagging required!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI GUIDANCE & DIRECT COMMUNICATIONS */}
      {activeSubTab === "guidance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* AI Parental Response Guidance */}
          <div className={`rounded-[32px] p-6 border shadow-sm transition-all space-y-4 ${
            isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#cb997e]" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
                How to Support {studentName} Today
              </h3>
            </div>
            <p className={`text-xs ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
              AI-generated, empathetic recommendations tailored to recent stress indices & study logs.
            </p>

            <div className="space-y-4 pt-2">
              <div className={`p-4 rounded-2xl border ${
                isDark ? "bg-[#0e1612]/40 border-[#25372e]" : "bg-[#fdfaf5] border-[#e6e2da]"
              }`}>
                <h4 className="text-xs font-bold text-[#cb997e] uppercase tracking-wider mb-1.5">
                  1. Academic Pressure Assessment
                </h4>
                <p className="text-xs leading-relaxed">
                  {academicAnxietyTriggered
                    ? `Alex is feeling highly pressured regarding upcoming mock tests and syllabus completion timeline. Avoid highlighting grades or comparing mock test outcomes. Remind them that learning is incremental and mistakes are essential milestones.`
                    : `Academic pressure is moderate. Alex is making steady progress. Support them by showing interest in their learning process rather than their scores.`}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? "bg-[#0e1612]/40 border-[#25372e]" : "bg-[#fdfaf5] border-[#e6e2da]"
              }`}>
                <h4 className="text-xs font-bold text-[#cb997e] uppercase tracking-wider mb-1.5">
                  2. Empathy & Communication Anchors
                </h4>
                <p className="text-xs leading-relaxed">
                  Try asking open-ended questions like: <span className="italic">"I noticed you've been working hard on physics. How are you feeling about your study pace?"</span> or <span className="italic">"Would you like to take a quick walk or play a board game to clear your head?"</span>
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? "bg-[#0e1612]/40 border-[#25372e]" : "bg-[#fdfaf5] border-[#e6e2da]"
              }`}>
                <h4 className="text-xs font-bold text-[#cb997e] uppercase tracking-wider mb-1.5">
                  3. Physical Health Indicators
                </h4>
                <p className="text-xs leading-relaxed">
                  {activeIndicators.includes("Sleep Deprived")
                    ? `Alex has flagged sleep deprivation in recent logs. Gently intervene by encouraging a hard stop to screen time or cramming after 10:30 PM. Rest will significantly boost mock test performance.`
                    : `Encourage healthy eating, hydration, and minor physical activity. Ensuring they get at least 7 hours of sleep will strengthen memory retrieval before examinations.`}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Workspace Tools */}
          <div className="space-y-6">
            
            {/* Meet Scheduler */}
            <div className={`rounded-[32px] p-6 border shadow-sm transition-all space-y-4 ${
              isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#cb997e]" />
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
                    Schedule Instant De-Stress Talk
                  </h3>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                  isDark ? "bg-[#2e221c] text-[#dca694]" : "bg-[#f9e5d8] text-[#7b5c54]"
                }`}>
                  Google Meet API
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
                Initiate a safe, secure, 15-minute quick de-stress talk session. We will generate an official Google Meet space instantly.
              </p>

              {!meetResult ? (
                <button
                  onClick={handleCreateMeet}
                  disabled={creatingMeet}
                  className="w-full py-3 bg-[#cb997e] text-white hover:bg-[#b7866b] transition-colors rounded-2xl font-serif italic text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Video className="w-4 h-4" />
                  {creatingMeet ? "Generating Secure Space..." : "Initiate Google Meet Space"}
                </button>
              ) : (
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? "bg-[#251812]/50 border-[#5e3823]" : "bg-[#fcf7f4] border-[#edd1be]"
                }`}>
                  <p className={`text-xs font-semibold ${isDark ? "text-[#dca694]" : "text-[#7b5c54]"}`}>
                    🎉 Google Meet Room created successfully!
                  </p>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border select-all ${
                    isDark ? "bg-[#0e1612] border-[#25372e] text-[#e1eae5]" : "bg-white border-[#e9e3d0] text-[#333d29]"
                  }`}>
                    <span className="text-xs font-mono break-all flex-1">{meetResult.meetingUri}</span>
                    <button
                      onClick={copyMeetUrl}
                      className="p-1 rounded text-gray-400 hover:text-gray-600"
                      title="Copy link"
                    >
                      <Clipboard className="w-4 h-4" />
                    </button>
                  </div>
                  {copiedLink && (
                    <span className="text-[10px] text-emerald-500 font-bold block">Copied link to clipboard!</span>
                  )}
                  <div className="flex gap-2">
                    <a
                      href={meetResult.meetingUri}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-xs font-medium py-2 bg-[#5a6a4e] text-white hover:bg-[#4a5d4e] transition-colors rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Launch Room <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setMeetResult(null)}
                      className={`text-xs px-3 rounded-xl border transition-colors ${
                        isDark ? "bg-[#0e1612] border-[#25372e] text-[#93a298]" : "bg-white border-[#e6e2da] text-gray-500"
                      }`}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
              {meetError && (
                <p className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded-xl border border-rose-100 font-semibold">
                  {meetError}
                </p>
              )}
            </div>

            {/* Google Chat supportive encourager */}
            <div className={`rounded-[32px] p-6 border shadow-sm transition-all space-y-4 ${
              isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#5a6a4e]" />
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
                    Post Encouragement Note
                  </h3>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                  isDark ? "bg-[#111a15] border-[#25372e] text-[#81a290]" : "bg-[#e6ebe0] text-[#5a6a4e]"
                }`}>
                  Google Chat API
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
                Send quick, positive reinforcement directly to {studentName}'s study workspace space or family group room.
              </p>

              <form onSubmit={handleSendChatSupport} className="space-y-3">
                <div className="space-y-1.5">
                  <label className={`text-[10px] uppercase font-bold tracking-wider block ${
                    isDark ? "text-[#93a298]" : "text-[#6b705c]"
                  }`}>
                    Google Chat Space ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Study Space ID (e.g. spaces/AAAAxxxxx)"
                    value={chatSpaceId}
                    onChange={(e) => setChatSpaceId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none transition-all ${
                      isDark
                        ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] focus:border-[#81a290]"
                        : "bg-[#fdfaf5] border border-[#e6e2da] text-[#333d29] focus:border-[#5a6a4e]"
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-[10px] uppercase font-bold tracking-wider block ${
                    isDark ? "text-[#93a298]" : "text-[#6b705c]"
                  }`}>
                    Message
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Type warm support message..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none transition-all ${
                      isDark
                        ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] focus:border-[#81a290]"
                        : "bg-[#fdfaf5] border border-[#e6e2da] text-[#333d29] focus:border-[#5a6a4e]"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingChat || !chatSpaceId.trim()}
                  className="w-full py-2.5 bg-[#5a6a4e] text-white hover:bg-[#4a5d4e] transition-colors rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingChat ? "Sending note..." : "Post Encouragement to Workspace"}
                </button>
              </form>

              {chatSuccess && (
                <p className="text-xs p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-medium">
                  {chatSuccess}
                </p>
              )}
              {chatError && (
                <p className="text-xs p-2.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl font-medium">
                  {chatError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER LICENSE/LEGAL ADVICE NOTIFICATION */}
      <footer className="mt-8 pt-4 border-t border-[#f1eeeb] dark:border-[#25372e] text-center text-[10px] opacity-65 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2026 Mindful Scholar Systems. All data decrypted client-side only.</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Parents cannot access full journal text bodies to enforce student safe expression.
        </span>
      </footer>
    </div>
  );
}
