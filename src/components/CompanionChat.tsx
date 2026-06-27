import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, ParsedJournalAnalysis } from "../types";
import { Send, Sparkles, Zap, Brain, Globe, Heart } from "lucide-react";

interface CompanionChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, modelMode: string) => Promise<void>;
  parsedContext: ParsedJournalAnalysis | null;
  isGenerating: boolean;
  theme?: "Light" | "Dark";
  language?: string;
}

const CHAT_TRANSLATIONS: Record<string, Record<string, string>> = {
  Eng: {
    compTitle: "Empathetic Companion",
    compSubtitle: "Tailored Coping & De-stressing",
    onlineListening: "Online & Listening",
    standard: "Standard",
    quick: "Quick",
    think: "Think",
    search: "Search",
    welcomeMsg: "Hi, I'm your mindful scholar companion. Tell me what's on your mind. We can discuss physics mock tests, syllabus stress, or take a quick breathing break.",
    thinking: "Thinking...",
    chatPlaceholder: "Chat with companion...",
    searchPlaceholder: "Ask a question with Google Search Grounding...",
    fastModeActive: "⚡ Fast Mode Active",
    groundingSources: "Grounding Sources:",
  },
  Span: {
    compTitle: "Acompañante Empático",
    compSubtitle: "Afrontamiento y relajación a tu medida",
    onlineListening: "En línea y escuchando",
    standard: "Estándar",
    quick: "Rápido",
    think: "Pensar",
    search: "Buscar",
    welcomeMsg: "Hola, soy tu compañero de Mindful Scholar. Cuéntame qué tienes en mente. Podemos hablar de simulacros, estrés del temario o tomar un respiro.",
    thinking: "Pensando...",
    chatPlaceholder: "Chatea con tu compañero...",
    searchPlaceholder: "Pregunta con búsqueda de Google...",
    fastModeActive: "⚡ Modo rápido activo",
    groundingSources: "Fuentes de fundamentación:",
  },
  Hindi: {
    compTitle: "सहानुभूतिपूर्ण साथी",
    compSubtitle: "तैयाর मुकाबला और तनाव-मुक्ति",
    onlineListening: "ऑनलाइन और सुन रहा है",
    standard: "मानक",
    quick: "त्वरित",
    think: "सोचें",
    search: "खोज",
    welcomeMsg: "नमस्ते, मैं आपका माइंडफुल स्कॉलर साथी हूँ। मुझे बताएं कि आपके दिमाग में क्या है। हम मॉक टेस्ट, सिलेबस के तनाव या सांस लेने के ब्रेक पर चर्चा कर सकते हैं।",
    thinking: "सोच रहा है...",
    chatPlaceholder: "साथी से चैट करें...",
    searchPlaceholder: "गूगल सर्च ग्राउंडिंग के साथ प्रश्न पूछें...",
    fastModeActive: "⚡ त्वरित मोड सक्रिय",
    groundingSources: "सत्यापन स्रोत:",
  },
  Bengali: {
    compTitle: "সহানুভুতিশীল সঙ্গী",
    compSubtitle: "মানসিক চাপ কমানো এবং মানিয়ে নেওয়া",
    onlineListening: "অনলাইন এবং শুনছে",
    standard: "সাধারণ",
    quick: "দ্রুত",
    think: "চিন্তা",
    search: "অনুসন্ধান",
    welcomeMsg: "হ্যালো, আমি আপনার মাইন্ডফুল স্কলার সঙ্গী। আপনার মনে কী আছে তা আমাকে বলুন। আমরা মক টেস্ট, সিলেবাসের চাপ বা একটি দ্রুত শ্বাস-প্রশ্বাসের বিরতি নিয়ে আলোচনা করতে পারি।",
    thinking: "চিন্তা করছে...",
    chatPlaceholder: "সঙ্গীর সাথে চ্যাট করুন...",
    searchPlaceholder: "গুগল সার্চ গ্রাউন্ডিং দিয়ে প্রশ্ন জিজ্ঞাসা করুন...",
    fastModeActive: "⚡ দ্রুত মোড সক্রিয়",
    groundingSources: "উত্সসমূহ:",
  },
  French: {
    compTitle: "Compagnon Empathique",
    compSubtitle: "Adaptation et relaxation sur mesure",
    onlineListening: "En ligne et à l'écoute",
    standard: "Standard",
    quick: "Rapide",
    think: "Penser",
    search: "Recherche",
    welcomeMsg: "Bonjour, je suis votre compagnon Mindful Scholar. Dites-moi ce que vous avez en tête. Nous pouvons parler d'examens, de stress ou respirer.",
    thinking: "Réflexion...",
    chatPlaceholder: "Discutez avec votre compagnon...",
    searchPlaceholder: "Posez une question avec recherche Google...",
    fastModeActive: "⚡ Mode rapide actif",
    groundingSources: "Sources de validation:",
  }
};

export default function CompanionChat({
  messages,
  onSendMessage,
  parsedContext,
  isGenerating,
  theme = "Light",
  language = "Eng",
}: CompanionChatProps) {
  const isDark = theme === "Dark";
  const [inputText, setInputText] = useState("");
  const [modelMode, setModelMode] = useState<"standard" | "low-latency" | "high-thinking" | "search-grounding">("standard");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ct = (key: string): string => {
    const langSet = CHAT_TRANSLATIONS[language] || CHAT_TRANSLATIONS["Eng"];
    return langSet[key] || CHAT_TRANSLATIONS["Eng"][key] || key;
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const textToSend = inputText;
    setInputText("");
    await onSendMessage(textToSend, modelMode);
  };

  return (
    <div className={`flex flex-col h-full rounded-[32px] p-6 border transition-all ${
      isDark ? "bg-[#16221c] border-[#25372e]" : "bg-[#e6ebe0] border-[#d4d9cc]"
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className={`text-xl font-serif italic flex items-center gap-1.5 ${
            isDark ? "text-[#e1eae5]" : "text-[#333d29]"
          }`}>
            <Heart className="w-5 h-5 text-rose-500 fill-rose-50/10" />
            {ct("compTitle")}
          </h2>
          <p className={`text-[10px] uppercase tracking-widest font-bold ${
            isDark ? "text-[#93a298]" : "text-[#333d29]/60"
          }`}>
            {ct("compSubtitle")}
          </p>
        </div>
        <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase animate-pulse shrink-0 ${
          isDark ? "bg-[#81a290]/15 text-[#81a290]" : "bg-[#5a6a4e]/10 text-[#5a6a4e]"
        }`}>
          {ct("onlineListening")}
        </div>
      </div>

      {/* Model Mode Selection */}
      <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl mb-4 text-[9px] font-bold text-center border transition-all ${
        isDark ? "bg-[#0e1612]/50 border-[#25372e]" : "bg-white/50 border-transparent"
      }`}>
        <button
          type="button"
          onClick={() => setModelMode("standard")}
          className={`py-1 px-1.5 rounded-lg transition-colors flex flex-col items-center gap-0.5 cursor-pointer ${
            modelMode === "standard"
              ? isDark
                ? "bg-[#81a290] text-[#0e1612]"
                : "bg-[#5a6a4e] text-white"
              : isDark
              ? "text-[#81a290] hover:bg-[#1d2f26]"
              : "text-[#5a6a4e] hover:bg-white/40"
          }`}
          title="Standard Gemini 3.5 Flash Model"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{ct("standard")}</span>
        </button>

        <button
          type="button"
          onClick={() => setModelMode("low-latency")}
          className={`py-1 px-1.5 rounded-lg transition-colors flex flex-col items-center gap-0.5 cursor-pointer ${
            modelMode === "low-latency"
              ? isDark
                ? "bg-[#81a290] text-[#0e1612]"
                : "bg-[#5a6a4e] text-white"
              : isDark
              ? "text-[#81a290] hover:bg-[#1d2f26]"
              : "text-[#5a6a4e] hover:bg-white/40"
          }`}
          title="Low Latency Responses (Gemini 3.1 Flash Lite)"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{ct("quick")}</span>
        </button>

        <button
          type="button"
          onClick={() => setModelMode("high-thinking")}
          className={`py-1 px-1.5 rounded-lg transition-colors flex flex-col items-center gap-0.5 cursor-pointer ${
            modelMode === "high-thinking"
              ? isDark
                ? "bg-[#81a290] text-[#0e1612]"
                : "bg-[#5a6a4e] text-white"
              : isDark
              ? "text-[#81a290] hover:bg-[#1d2f26]"
              : "text-[#5a6a4e] hover:bg-white/40"
          }`}
          title="High Thinking Deep Intelligence (Gemini 3.1 Pro)"
        >
          <Brain className="w-3.5 h-3.5" />
          <span>{ct("think")}</span>
        </button>

        <button
          type="button"
          onClick={() => setModelMode("search-grounding")}
          className={`py-1 px-1.5 rounded-lg transition-colors flex flex-col items-center gap-0.5 cursor-pointer ${
            modelMode === "search-grounding"
              ? isDark
                ? "bg-[#81a290] text-[#0e1612]"
                : "bg-[#5a6a4e] text-white"
              : isDark
              ? "text-[#81a290] hover:bg-[#1d2f26]"
              : "text-[#5a6a4e] hover:bg-white/40"
          }`}
          title="Search Grounded Expert Advice (Gemini 3.5 with Web Search)"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{ct("search")}</span>
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin scrollbar-thumb-sage">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full p-4">
            <Sparkles className={`w-8 h-8 opacity-40 mb-2 ${isDark ? "text-[#81a290]" : "text-[#5a6a4e]"}`} />
            <p className={`text-xs italic leading-relaxed ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
              "{ct("welcomeMsg")}"
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed border transition-all ${
                  m.sender === "user"
                    ? isDark
                      ? "bg-[#81a290] text-[#0e1612] border-transparent rounded-tr-none shadow-sm font-semibold"
                      : "bg-[#5a6a4e] text-white border-transparent rounded-tr-none shadow-sm"
                    : isDark
                    ? "bg-[#0e1612] text-[#e1eae5] border-[#25372e] rounded-tl-none shadow-sm"
                    : "bg-white text-[#333d29] border-white/40 rounded-tl-none shadow-sm"
                }`}
              >
                {m.fallbackActive && (
                  <span className="block text-[8px] uppercase tracking-widest text-[#cb997e] font-bold mb-1">
                    {ct("fastModeActive")}
                  </span>
                )}
                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* Grounding Sources */}
                {m.groundingSources && m.groundingSources.length > 0 && (
                  <div className={`mt-2 pt-2 text-[10px] space-y-1 border-t ${
                    isDark ? "border-[#25372e] text-[#93a298]" : "border-[#e6e2da] text-[#6b705c]"
                  }`}>
                    <p className={`font-bold uppercase tracking-wider text-[8px] ${
                      isDark ? "text-[#81a290]" : "text-[#5a6a4e]"
                    }`}>
                      {ct("groundingSources")}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {m.groundingSources.map((chunk: any, cidx) => (
                        <a
                          key={cidx}
                          href={chunk.web?.uri || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className={`px-1.5 py-0.5 rounded border transition-all truncate max-w-[150px] ${
                            isDark
                              ? "bg-[#121c17] border-[#25372e] hover:bg-[#1d2f26] text-[#81a290]"
                              : "bg-[#fdfaf5] border-[#e6e2da] text-[#6b705c] hover:bg-[#e6ebe0]"
                          }`}
                          title={chunk.web?.title || chunk.web?.uri}
                        >
                          {chunk.web?.title || `Source ${cidx + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className={`text-[8px] opacity-40 mt-1 px-1 ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))
        )}

        {isGenerating && (
          <div className={`flex items-center gap-2 text-xs font-serif italic p-2 rounded-xl max-w-[120px] transition-colors ${
            isDark ? "text-[#81a290] bg-[#0e1612]/40" : "text-[#5a6a4e] bg-white/40"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? "bg-[#81a290]" : "bg-[#5a6a4e]"}`}></span>
            <span className={`w-1.5 h-1.5 rounded-full animate-bounce delay-150 ${isDark ? "bg-[#81a290]" : "bg-[#5a6a4e]"}`}></span>
            <span className={`w-1.5 h-1.5 rounded-full animate-bounce delay-300 ${isDark ? "bg-[#81a290]" : "bg-[#5a6a4e]"}`}></span>
            <span>{ct("thinking")}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder={
            modelMode === "search-grounding"
              ? ct("searchPlaceholder")
              : ct("chatPlaceholder")
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isGenerating}
          className={`flex-1 px-4 py-3 rounded-2xl text-xs focus:outline-none transition-all ${
            isDark
              ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] placeholder:text-[#e1eae5]/30 focus:border-[#81a290]"
              : "bg-white border border-[#e6e2da] text-[#333d29] placeholder:text-[#333d29]/40 focus:border-[#5a6a4e]"
          }`}
        />
        <button
          type="submit"
          disabled={isGenerating || !inputText.trim()}
          className={`p-3 rounded-2xl disabled:opacity-50 transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
            isDark
              ? "bg-[#81a290] hover:bg-[#719280] text-[#0e1612]"
              : "bg-[#5a6a4e] text-white hover:bg-[#4a5d4e]"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
