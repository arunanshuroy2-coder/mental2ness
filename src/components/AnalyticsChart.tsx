import React from "react";
import { JournalEntry } from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface AnalyticsChartProps {
  entries: JournalEntry[];
  theme?: "Light" | "Dark";
}

export default function AnalyticsChart({ entries, theme = "Light" }: AnalyticsChartProps) {
  const isDark = theme === "Dark";

  // Sort entries oldest first to show chronology
  const sortedEntries = [...entries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7); // Keep last 7 logs

  const chartData = sortedEntries.map((entry) => {
    const d = new Date(entry.date);
    const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
    const score = entry.parsedAnalysis ? entry.parsedAnalysis.sentimentScore : 0.0;

    // Categorize
    let moodLabel = "Neutral";
    if (score > 0.4) moodLabel = "Positive";
    else if (score < -0.4) moodLabel = "Distressed";

    return {
      date: dateStr,
      score: Number(score.toFixed(2)),
      mood: moodLabel,
    };
  });

  if (chartData.length < 2) {
    return (
      <div className={`flex flex-col items-center justify-center text-center py-10 rounded-3xl p-6 transition-all ${
        isDark ? "bg-[#16221c] border border-[#25372e]" : "bg-white border border-[#e6e2da]"
      }`}>
        <p className={`text-sm font-serif italic ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
          Not enough journal entries to map trends yet.
        </p>
        <p className={`text-[11px] mt-1 ${isDark ? "text-[#93a298]/80" : "text-[#6b705c]"}`}>
          Keep logging daily. Once you have 2 or more logs, your emotional pattern will map here.
        </p>
      </div>
    );
  }

  // Custom styling for the tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-xl shadow-md text-xs border transition-all ${
          isDark
            ? "bg-[#0e1612] border-[#25372e] text-[#e1eae5]"
            : "bg-[#fdfaf5] border-[#e6e2da] text-[#333d29]"
        }`}>
          <p className={`font-serif italic ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>{data.date}</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                data.score > 0.2
                  ? "bg-emerald-500"
                  : data.score < -0.2
                  ? "bg-rose-500"
                  : "bg-amber-500"
              }`}
            ></span>
            <span className="font-bold">Score: {data.score}</span>
          </div>
          <p className={`text-[10px] uppercase tracking-wider font-semibold mt-0.5 ${
            isDark ? "text-[#93a298]" : "text-[#6b705c]"
          }`}>
            State: {data.mood}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-3xl p-6 transition-all border shadow-sm ${
      isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
    }`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${
            isDark ? "text-[#e1eae5]" : "text-[#6b705c]"
          }`}>
            Semantic Mood Pattern Tracker
          </h3>
          <p className={`text-[11px] ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
            Visualizing semantic vector shifts over the last 7 logged days
          </p>
        </div>
        <div className={`text-right text-[10px] font-semibold ${
          isDark ? "text-[#81a290]" : "text-[#5a6a4e]"
        }`}>
          Sentiment Matrix (-1.0 to 1.0)
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#23352b" : "#f1eeeb"} />
            <XAxis
              dataKey="date"
              tick={{ fill: isDark ? "#93a298" : "#6b705c", fontSize: 9, fontWeight: 500 }}
              axisLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
              tickLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
            />
            <YAxis
              domain={[-1.0, 1.0]}
              tick={{ fill: isDark ? "#93a298" : "#6b705c", fontSize: 9 }}
              axisLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
              tickLine={{ stroke: isDark ? "#25372e" : "#e6e2da" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#cb997e" strokeDasharray="3 3" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="score"
              stroke={isDark ? "#81a290" : "#5a6a4e"}
              strokeWidth={3}
              activeDot={{ r: 6, fill: "#cb997e", stroke: isDark ? "#16221c" : "white", strokeWidth: 2 }}
              dot={{ r: 4, stroke: isDark ? "#81a290" : "#5a6a4e", strokeWidth: 2, fill: isDark ? "#16221c" : "white" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={`grid grid-cols-3 gap-3 text-center mt-4 pt-4 border-t ${
        isDark ? "border-[#25372e]" : "border-[#f1eeeb]"
      }`}>
        <div>
          <div className="text-xs font-serif italic text-rose-500">-1.0 to -0.3</div>
          <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
            isDark ? "text-[#93a298]/80" : "text-[#a6a29a]"
          }`}>
            Study Overwhelm
          </p>
        </div>
        <div>
          <div className="text-xs font-serif italic text-amber-500">-0.2 to 0.2</div>
          <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
            isDark ? "text-[#93a298]/80" : "text-[#a6a29a]"
          }`}>
            Balanced
          </p>
        </div>
        <div>
          <div className="text-xs font-serif italic text-emerald-500">0.3 to 1.0</div>
          <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
            isDark ? "text-[#93a298]/80" : "text-[#a6a29a]"
          }`}>
            Resourceful
          </p>
        </div>
      </div>
    </div>
  );
}
