import React, { useState } from "react";
import { JournalEntry } from "../types";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from "recharts";
import {
  TrendingUp,
  Activity,
  Heart,
  Calendar,
  Sparkles,
  AlertCircle,
  Clock,
  PieChart as PieIcon,
  Smile,
  BarChart2
} from "lucide-react";

interface AnalyticsChartProps {
  entries: JournalEntry[];
  theme?: "Light" | "Dark";
}

export default function AnalyticsChart({ entries, theme = "Light" }: AnalyticsChartProps) {
  const isDark = theme === "Dark";
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");
  const [activeTab, setActiveTab] = useState<"trends" | "triggers" | "bento">("trends");

  // Helper to map stress intensity string to numerical score
  const getStressNum = (intensity: string | undefined): number => {
    if (!intensity) return 1;
    const norm = intensity.toLowerCase().trim();
    if (norm.includes("high")) return 3;
    if (norm.includes("med")) return 2;
    return 1; // "Low" or undefined fallback
  };

  const getStressLabel = (num: number): string => {
    if (num === 3) return "High";
    if (num === 2) return "Medium";
    return "Low";
  };

  // Filter entries based on the selected timeframe
  const now = new Date();
  const filterDateLimit = new Date();
  if (timeframe === "week") {
    filterDateLimit.setDate(now.getDate() - 7);
  } else {
    filterDateLimit.setDate(now.getDate() - 30);
  }

  // Filter and sort oldest first for chronological chart plotting
  const filteredEntries = [...entries]
    .filter((entry) => new Date(entry.date) >= filterDateLimit)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Empty state handling
  if (entries.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center text-center py-16 rounded-[32px] p-8 transition-all border ${
        isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
      }`}>
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-[#cb997e] mb-4">
          <Heart className="w-6 h-6 text-emerald-500 fill-emerald-500/20" />
        </div>
        <h3 className={`text-sm font-bold uppercase tracking-wider font-sans mb-1 ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
          No Wellness Logs Found
        </h3>
        <p className={`text-xs max-w-sm leading-relaxed mb-4 ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
          Unlock the private vault and start writing your mindful journal entries. Your personalized mood charts, stress metrics, and trigger trends will map here in real-time.
        </p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = filteredEntries.map((entry) => {
    const d = new Date(entry.date);
    const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
    const score = entry.parsedAnalysis ? entry.parsedAnalysis.sentimentScore : 0.0;
    const stressNum = getStressNum(entry.parsedAnalysis?.stressIntensity);

    let moodLabel = "Balanced";
    if (score > 0.3) moodLabel = "Optimistic";
    else if (score < -0.3) moodLabel = "Distressed";

    return {
      date: dateStr,
      score: Number(score.toFixed(2)),
      stress: stressNum,
      mood: moodLabel,
      trigger: entry.parsedAnalysis?.primaryTrigger || "None",
      originalDate: d
    };
  });

  // Calculate statistics over the selected timeframe
  const totalLogs = filteredEntries.length;
  
  // Average sentiment score
  const avgSentiment = filteredEntries.reduce(
    (acc, e) => acc + (e.parsedAnalysis ? e.parsedAnalysis.sentimentScore : 0),
    0
  ) / (totalLogs || 1);

  // High stress counts
  const highStressCount = filteredEntries.filter(
    (e) => e.parsedAnalysis?.stressIntensity?.toLowerCase().includes("high")
  ).length;

  // Aggregate Primary Triggers
  const triggerCounts: Record<string, number> = {};
  filteredEntries.forEach((entry) => {
    const trigger = entry.parsedAnalysis?.primaryTrigger || "None";
    if (trigger && trigger !== "None") {
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    }
  });

  const triggerData = Object.entries(triggerCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Aggregate Emotion Tags
  const emotionCounts: Record<string, number> = {};
  filteredEntries.forEach((entry) => {
    const tags = entry.parsedAnalysis?.emotionTags || [];
    tags.forEach((tag) => {
      emotionCounts[tag] = (emotionCounts[tag] || 0) + 1;
    });
  });

  const topEmotions = Object.entries(emotionCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const topStressor = triggerData.length > 0 ? triggerData[0].name : "None Identified";

  // Determine Overall Mood Tag
  let overallMoodText = "Balanced";
  let overallMoodEmoji = "🧘";
  if (avgSentiment > 0.2) {
    overallMoodText = "Optimistic & Positive";
    overallMoodEmoji = "🌟";
  } else if (avgSentiment < -0.2) {
    overallMoodText = "Overwhelmed / High Stress";
    overallMoodEmoji = "🌧️";
  }

  // Custom tooltips
  const MoodTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3.5 rounded-2xl shadow-xl text-xs border max-w-[220px] transition-all duration-150 ${
          isDark ? "bg-[#0e1612] border-[#25372e] text-[#e1eae5]" : "bg-[#fdfaf5] border-[#e6e2da] text-[#333d29]"
        }`}>
          <p className="font-bold border-b pb-1 mb-1.5 opacity-80">{data.date}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span>Mood Sentiment:</span>
              <span className={`font-semibold ${data.score > 0.2 ? "text-emerald-500" : data.score < -0.2 ? "text-rose-500" : "text-amber-500"}`}>
                {data.score} ({data.mood})
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Stress Index:</span>
              <span className={`font-semibold ${data.stress === 3 ? "text-rose-500 animate-pulse" : data.stress === 2 ? "text-amber-500" : "text-emerald-500"}`}>
                {getStressLabel(data.stress)}
              </span>
            </div>
            {data.trigger !== "None" && (
              <div className="pt-1 mt-1 border-t text-[10px] italic text-gray-400">
                Primary Trigger: {data.trigger}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const TriggerTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-xl shadow-lg text-xs border transition-all ${
          isDark ? "bg-[#0e1612] border-[#25372e] text-[#e1eae5]" : "bg-[#fdfaf5] border-[#e6e2da] text-[#333d29]"
        }`}>
          <p className="font-semibold">{data.name}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Identified {data.count} times in journal logs</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-[32px] p-6 border transition-all shadow-sm ${
      isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
    }`}>
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isDark ? "text-[#e1eae5]" : "text-[#333d29]"
          }`}>
            <BarChart2 className="w-5 h-5 text-[#cb997e]" />
            Mental Wellness Analytics
          </h3>
          <p className={`text-[11px] mt-0.5 ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
            Decrypted and compiled local metrics for self-reflection
          </p>
        </div>

        {/* TIMEFRAME SELECTOR */}
        <div className={`flex p-1 rounded-xl shrink-0 self-start sm:self-auto ${
          isDark ? "bg-[#0e1612]" : "bg-[#f5f2eb]"
        }`}>
          <button
            onClick={() => setTimeframe("week")}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              timeframe === "week"
                ? isDark
                  ? "bg-[#cb997e] text-[#0e1612] shadow"
                  : "bg-[#5a6a4e] text-white shadow"
                : "text-gray-400 hover:text-gray-500"
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setTimeframe("month")}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              timeframe === "month"
                ? isDark
                  ? "bg-[#cb997e] text-[#0e1612] shadow"
                  : "bg-[#5a6a4e] text-white shadow"
                : "text-gray-400 hover:text-gray-500"
            }`}
          >
            Past 30 Days
          </button>
        </div>
      </div>

      {/* DASHBOARD TABS */}
      <div className="flex border-b border-[#25372e]/40 dark:border-gray-200/40 pb-px mb-6 overflow-x-auto scrollbar-none gap-1">
        {[
          { id: "trends", label: "Mood & Stress Trends", icon: TrendingUp },
          { id: "triggers", label: "Stressors & Emotions", icon: PieIcon },
          { id: "bento", label: "Bento Summary Insights", icon: Sparkles }
        ].map((tab) => {
          const isTabActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isTabActive
                  ? isDark
                    ? "border-[#cb997e] text-[#cb997e]"
                    : "border-[#5a6a4e] text-[#5a6a4e]"
                  : "border-transparent text-gray-400 hover:text-gray-500"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* FALLBACK FOR SCANT DATA */}
      {chartData.length === 0 ? (
        <div className={`flex flex-col items-center justify-center text-center py-12 rounded-2xl border border-dashed ${
          isDark ? "bg-[#0e1612]/30 border-rose-950/40 text-gray-400" : "bg-rose-50/20 border-rose-100 text-gray-500"
        }`}>
          <AlertCircle className="w-6 h-6 text-amber-500 mb-2 animate-bounce" />
          <p className="text-xs font-serif italic">No logs mapped in the past {timeframe === "week" ? "7" : "30"} days.</p>
          <p className="text-[10px] mt-1 max-w-xs leading-relaxed">
            Please select the alternative timeframe or add active journals to analyze this window.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: MOOD & STRESS TRENDS */}
          {activeTab === "trends" && (
            <div className="space-y-6">
              {/* Graph 1: Semantic Mood Pattern Tracker */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                    Semantic Sentiment Index
                  </h4>
                  <span className="text-[9px] font-mono text-gray-400">
                    Range: -1.0 (Overwhelmed) to +1.0 (Optimistic)
                  </span>
                </div>
                
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isDark ? "#81a290" : "#5a6a4e"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={isDark ? "#81a290" : "#5a6a4e"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#23352b" : "#f1eeeb"} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: isDark ? "#93a298" : "#6b705c", fontSize: 8, fontWeight: 600 }}
                        axisLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
                        tickLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
                      />
                      <YAxis
                        domain={[-1.0, 1.0]}
                        tick={{ fill: isDark ? "#93a298" : "#6b705c", fontSize: 9 }}
                        axisLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
                        tickLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
                      />
                      <Tooltip content={<MoodTooltip />} />
                      <ReferenceLine y={0} stroke="#cb997e" strokeDasharray="3 3" strokeWidth={1} />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke={isDark ? "#81a290" : "#5a6a4e"}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#sentimentGradient)"
                        activeDot={{ r: 6, fill: "#cb997e", stroke: isDark ? "#16221c" : "white", strokeWidth: 2 }}
                        dot={{ r: 3, stroke: isDark ? "#81a290" : "#5a6a4e", strokeWidth: 1.5, fill: isDark ? "#16221c" : "white" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graph 2: Stress Intensity Metrics Over Time */}
              <div className="space-y-2 pt-4 border-t border-[#25372e]/20 dark:border-gray-200/20">
                <div className="flex justify-between items-center px-1">
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                    Stress Intensity Graph
                  </h4>
                  <span className="text-[9px] font-mono text-gray-400">
                    Levels: 1 (Low) | 2 (Medium) | 3 (High)
                  </span>
                </div>

                <div className="h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      barSize={18}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#23352b" : "#f1eeeb"} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: isDark ? "#93a298" : "#6b705c", fontSize: 8, fontWeight: 600 }}
                        axisLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
                        tickLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
                      />
                      <YAxis
                        domain={[0, 3]}
                        ticks={[1, 2, 3]}
                        tickFormatter={(v) => getStressLabel(v)}
                        tick={{ fill: isDark ? "#93a298" : "#6b705c", fontSize: 8 }}
                        axisLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
                        tickLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
                      />
                      <Tooltip content={<MoodTooltip />} />
                      <Bar dataKey="stress" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => {
                          let color = isDark ? "#81a290" : "#5a6a4e"; // Low
                          if (entry.stress === 3) color = "#f43f5e"; // High
                          else if (entry.stress === 2) color = "#f59e0b"; // Medium
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STRESSORS & EMOTIONS */}
          {activeTab === "triggers" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Aggregated triggers chart (7 cols) */}
              <div className="md:col-span-7 space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                  Identified Emotional Triggers
                </h4>
                
                {triggerData.length === 0 ? (
                  <div className={`p-8 text-center rounded-2xl border italic text-xs ${
                    isDark ? "bg-[#0e1612] border-[#25372e] text-[#93a298]" : "bg-[#fdfaf5] border-[#e6e2da] text-[#6b705c]"
                  }`}>
                    No core stressful triggers extracted yet. Keep logging.
                  </div>
                ) : (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={triggerData}
                        layout="vertical"
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        barSize={14}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#23352b" : "#f1eeeb"} />
                        <XAxis
                          type="number"
                          tick={{ fill: isDark ? "#93a298" : "#6b705c", fontSize: 8 }}
                          axisLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
                          tickLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fill: isDark ? "#e1eae5" : "#333d29", fontSize: 8, fontWeight: 600 }}
                          width={110}
                          axisLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
                          tickLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
                        />
                        <Tooltip content={<TriggerTooltip />} />
                        <Bar dataKey="count" fill={isDark ? "#cb997e" : "#cb997e"} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Right Column: Emotional Cloud (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                  Top Emotional State Tags
                </h4>

                {topEmotions.length === 0 ? (
                  <p className="text-xs italic text-gray-400">No emotional tags extracted yet.</p>
                ) : (
                  <div className={`p-4 rounded-2xl border flex flex-wrap gap-2 items-center justify-center min-h-[160px] ${
                    isDark ? "bg-[#0e1612]/30 border-[#25372e]" : "bg-[#fcfaf7] border-[#ede9e2]"
                  }`}>
                    {topEmotions.map((item, idx) => {
                      // Visual sizing proportional to density
                      const baseSize = item.count > 3 ? "text-xs font-bold" : "text-[10px] font-medium";
                      const countIndicator = item.count > 1 ? ` (${item.count}x)` : "";
                      
                      return (
                        <span
                          key={item.tag}
                          className={`px-3 py-1.5 rounded-full flex items-center gap-1 transition-all ${baseSize} ${
                            idx === 0
                              ? isDark ? "bg-rose-950/40 border border-rose-500/30 text-rose-300" : "bg-rose-50 border border-rose-100 text-rose-700"
                              : idx === 1
                              ? isDark ? "bg-amber-950/40 border border-amber-500/30 text-amber-300" : "bg-amber-50 border border-amber-100 text-amber-700"
                              : idx === 2
                              ? isDark ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border border-emerald-100 text-emerald-700"
                              : isDark ? "bg-[#25372e] text-gray-300" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.tag}
                          <span className="opacity-60 text-[8px] font-mono">{countIndicator}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BENTO SUMMARY INSIGHTS */}
          {activeTab === "bento" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1: Emotional Vibe */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isDark ? "bg-[#0e1612]/40 border-[#25372e]" : "bg-[#fdfaf5] border-[#e6e2da]"
              }`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-lg">{overallMoodEmoji}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Overall Mood Vibe
                  </span>
                </div>
                <h4 className={`text-sm font-bold ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                  {overallMoodText}
                </h4>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Calculated from an average sentiment score of <span className="font-mono font-bold text-[#cb997e]">{avgSentiment.toFixed(2)}</span>.
                </p>
              </div>

              {/* Card 2: Stress Incidents */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isDark ? "bg-[#0e1612]/40 border-[#25372e]" : "bg-[#fdfaf5] border-[#e6e2da]"
              }`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Stress Peak Density
                  </span>
                </div>
                <h4 className={`text-sm font-bold ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                  {highStressCount} High Stress Logs
                </h4>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  You logged <span className="font-bold text-rose-500">{highStressCount} intense anxiety</span> events in this window. Keep up with your box-breathing drills.
                </p>
              </div>

              {/* Card 3: Top Primary Stressor */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isDark ? "bg-[#0e1612]/40 border-[#25372e]" : "bg-[#fdfaf5] border-[#e6e2da]"
              }`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Top Primary Trigger
                  </span>
                </div>
                <h4 className={`text-sm font-bold truncate ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`} title={topStressor}>
                  {topStressor}
                </h4>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Identified as your single most recurring stress factor from semantic journal texts in this period.
                </p>
              </div>

              {/* Comprehensive Diagnostic Insights Card (3-cols wide) */}
              <div className={`sm:col-span-2 lg:col-span-3 p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isDark ? "bg-[#16221c] border-[#cb997e]/20" : "bg-[#fcfaf7] border-[#cb997e]/30"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#cb997e] animate-pulse" />
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                    Personal Coping Summary & Study Recommendations
                  </h4>
                </div>
                <p className={`text-[11px] leading-relaxed italic ${isDark ? "text-[#93a298]" : "text-[#5a6a4e]"}`}>
                  {avgSentiment < -0.1 ? (
                    "Your metrics suggest heightened academic anxiety and fatigue. Focus heavily on prioritizing short, manageable revision sessions (under 25 minutes) and implement at least two restorative 10-minute breaks today. Make sure to schedule sleep discipline checks on your Google Calendar."
                  ) : avgSentiment > 0.15 ? (
                    "Fantastic! Your emotional state is resilient and highly resourceful. You are in a prime condition for deeper focused work. Consider booking deep-focus study slots via Google Calendar, and use Google Classroom to import coursework checklist items to keep the momentum going."
                  ) : (
                    "Your metrics indicate a balanced, steady pace. Continue maintaining a consistent sleep regimen and utilize the box-breathing widget periodically to ground yourself between study blocks. Importing assignments directly from Google Classroom will help maintain this high structural efficiency."
                  )}
                </p>
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-400/10 text-[9px] text-gray-400 font-mono">
                  <span>Total Analysed Logs: {totalLogs}</span>
                  <span>Active Streak: {totalLogs > 0 ? "Continuous" : "Inactive"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
