import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2,
  Loader2,
  Sparkles,
  BrainCircuit,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { chatWithGemini, getThinkingResponse } from "../services/geminiService";

interface Message {
  role: "user" | "model";
  text: string;
  isThinking?: boolean;
}

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hello! I am your NLC Virtual Assistant. How can I help you with land-related matters today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Show welcome tooltip for 8 seconds then hide it
    const timer = setTimeout(() => {
      setShowWelcomeTooltip(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response;
      if (isThinkingMode) {
        response = await getThinkingResponse(input);
      } else {
        response = await chatWithGemini(input, messages);
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: response || "Sorry, I encountered an error.",
          isThinking: isThinkingMode,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {!isOpen && (
          <>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => {
                setIsOpen(true);
                setShowWelcomeTooltip(false);
              }}
              className="bg-white text-emerald-600 p-2 rounded-full shadow-2xl hover:shadow-emerald-200/50 transition-all group relative overflow-hidden border-2 border-emerald-600"
            >
              <img
                src="/LOGO.png"
                alt="NLC Logo"
                className="h-10 w-10 object-contain"
              />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </motion.button>

            {/* Welcome Tooltip */}
            {showWelcomeTooltip && (
              <motion.div
                role="tooltip"
                aria-live="polite"
                aria-label="AI Assistant Welcome Message"
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className="absolute bottom-0 right-20 bg-white rounded-2xl shadow-2xl border-2 border-emerald-600 p-4 w-72"
              >
                <button
                  onClick={() => setShowWelcomeTooltip(false)}
                  aria-label="Close welcome message"
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg flex-shrink-0">
                    <Bot className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">
                      Need Assistance?
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      I'm your AI assistant! Click the button to ask me anything
                      about land-related matters, complaints, or NLC services.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                    <Sparkles className="h-3 w-3" />
                    Powered by AI
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(true);
                      setShowWelcomeTooltip(false);
                    }}
                    className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Chat Now
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
              isMinimized ? "h-16 w-72" : "h-[600px] w-[400px]"
            }`}
          >
            {/* Header */}
            <div
              className="bg-emerald-600 p-4 text-white flex items-center justify-between cursor-pointer"
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="flex items-center gap-2">
                <div className="bg-white p-1 rounded-lg">
                  <img
                    src="/LOGO.png"
                    alt="NLC Logo"
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <div>
                  <div className="font-bold text-sm leading-none">
                    NLC Support Agent
                  </div>
                  <div className="text-[10px] opacity-80 flex items-center gap-1">
                    <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                          msg.role === "user"
                            ? "bg-emerald-600 text-white rounded-tr-none"
                            : "bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm"
                        }`}
                      >
                        {msg.isThinking && (
                          <div className="flex items-center gap-1 text-[8px] font-bold text-purple-500 uppercase tracking-widest mb-1">
                            <BrainCircuit className="h-2 w-2" /> Deep Analysis
                          </div>
                        )}
                        <div className="markdown-body">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                        <span className="text-xs text-slate-400 italic">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <button
                      onClick={() => setIsThinkingMode(!isThinkingMode)}
                      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        isThinkingMode
                          ? "text-purple-600"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <BrainCircuit
                        className={`h-3 w-3 ${isThinkingMode ? "animate-pulse" : ""}`}
                      />
                      Thinking Mode {isThinkingMode ? "ON" : "OFF"}
                    </button>
                    <div className="text-[10px] text-slate-300 italic">
                      {isThinkingMode
                        ? "Deep reasoning enabled"
                        : "Fast response mode"}
                    </div>
                  </div>
                  <div className="relative flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      placeholder={
                        isThinkingMode
                          ? "Ask a complex legal question..."
                          : "Ask me anything..."
                      }
                      className={`flex-1 bg-slate-50 border rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                        isThinkingMode
                          ? "border-purple-200 focus:ring-2 focus:ring-purple-500"
                          : "border-slate-200 focus:ring-2 focus:ring-emerald-500"
                      }`}
                    />
                    <button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className={`text-white p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md ${
                        isThinkingMode
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatbot;
