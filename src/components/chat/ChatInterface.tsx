"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { usePulseCareStore } from "@/lib/store";
import type { ChatMessage } from "@/lib/db";

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-none bg-muted border border-border px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            className="size-1.5 rounded-full bg-primary/60"
            aria-hidden
          />
        ))}
        <span className="sr-only">PulseCare is typing</span>
      </div>
    </div>
  );
}

// ─── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const time = new Date(msg.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn("flex w-full gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <span className="grid size-7 shrink-0 mt-auto place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          P
        </span>
      )}
      <div className={cn("max-w-[78%] space-y-1", isUser && "items-end flex flex-col")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-card border border-border rounded-bl-none"
          )}
        >
          {isUser ? (
            msg.content
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">{time}</span>
      </div>
    </motion.div>
  );
}

// ─── Suggested prompts ─────────────────────────────────────────────────────────

const SUGGESTED_EN = [
  "What is a healthy blood pressure?",
  "How can I manage my diabetes?",
  "I have a headache — what should I do?",
  "What foods should I avoid with hypertension?",
];

const SUGGESTED_HI = [
  "स्वस्थ रक्तचाप क्या होना चाहिए?",
  "मधुमेह को कैसे नियंत्रित करें?",
  "मुझे सिरदर्द है — क्या करूं?",
  "उच्च रक्तचाप में क्या न खाएं?",
];

// ─── Main component ────────────────────────────────────────────────────────────

export function ChatInterface() {
  const {
    chatMessages, chatLanguage, addChatMessage, clearChat, setChatLanguage,
    profile, todayLogs,
  } = usePulseCareStore();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recogRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  // Build patient context from store
  const getContext = useCallback(() => {
    const vitalsToday = todayLogs.filter((l) => l.type === "vitals").at(-1);
    const sugarToday = todayLogs.filter((l) => l.type === "sugar").at(-1);
    return {
      name: profile?.name,
      age: profile?.age,
      condition: profile?.condition,
      lastBP: vitalsToday?.systolic && vitalsToday?.diastolic
        ? `${vitalsToday.systolic}/${vitalsToday.diastolic}`
        : undefined,
      lastSugar: sugarToday?.bloodSugar,
      language: chatLanguage,
    };
  }, [profile, todayLogs, chatLanguage]);

  // Voice
  const startVoice = useCallback(() => {
    const SR =
      window.SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported in this browser."); return; }
    const r = new SR();
    r.lang = chatLanguage === "hi" ? "hi-IN" : "en-IN";
    r.interimResults = false;
    r.onresult = (e) => {
      setInput((prev) => (prev ? prev + " " : "") + e.results[0][0].transcript);
      setListening(false);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  }, [chatLanguage]);

  const stopVoice = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput("");

    await addChatMessage({ role: "user", content: text, language: chatLanguage });
    setIsTyping(true);

    try {
      // Build messages array for API — only non-system messages
      const history = chatMessages
        .filter((m) => m.role !== "system")
        .slice(-10)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      history.push({ role: "user", content: text });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context: getContext() }),
      });
      const data = await res.json();
      await addChatMessage({ role: "assistant", content: data.content, language: chatLanguage });
    } catch {
      await addChatMessage({
        role: "assistant",
        content: chatLanguage === "hi"
          ? "मुझे खेद है, कनेक्शन में समस्या है। कृपया पुनः प्रयास करें।"
          : "Sorry, I couldn't reach the server. Please try again.",
        language: chatLanguage,
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const suggested = chatLanguage === "hi" ? SUGGESTED_HI : SUGGESTED_EN;
  const visibleMessages = chatMessages.filter((m) => m.role !== "system");

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 bg-background/60 backdrop-blur-sm shrink-0">
        <div>
          <h2 className="font-semibold text-sm">PulseCare Assistant</h2>
          <p className="text-xs text-muted-foreground">
            {profile ? `Context: ${profile.name} · ${profile.condition}` : "Context-aware health chat"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChatLanguage(chatLanguage === "en" ? "hi" : "en")}
            className="h-8 rounded-full gap-1.5 text-xs"
            aria-label="Toggle language"
          >
            <Globe className="size-3.5" aria-hidden />
            {chatLanguage === "en" ? "हिंदी" : "English"}
          </Button>
          {/* Clear chat */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { if (confirm("Clear all chat history?")) clearChat(); }}
            className="size-8 rounded-full text-muted-foreground hover:text-destructive"
            aria-label="Clear chat history"
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>

      {/* ── Messages ── */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollRef as React.RefObject<HTMLDivElement>}>
        <div className="space-y-4 p-4 max-w-3xl mx-auto pb-2">
          {visibleMessages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              <div className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="font-medium">
                {chatLanguage === "hi" ? "नमस्ते! मैं PulseCare हूँ।" : "Hi! I'm PulseCare."}
              </p>
              <p className="text-sm mt-1">
                {chatLanguage === "hi"
                  ? "अपना स्वास्थ्य प्रश्न पूछें।"
                  : "Ask me anything about your health."}
              </p>
            </motion.div>
          )}

          {visibleMessages.map((msg, i) => (
            <MessageBubble key={msg.id ?? i} msg={msg} />
          ))}

          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* ── Input area ── */}
      <div className="border-t border-border/70 bg-background/60 backdrop-blur-sm px-4 py-3 shrink-0">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Suggested prompts */}
          {visibleMessages.length < 2 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {suggested.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="whitespace-nowrap text-xs border border-border rounded-full px-3 py-1.5 bg-background hover:bg-primary/5 hover:border-primary/40 transition-colors shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card/80 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={chatLanguage === "hi" ? "अपना प्रश्न लिखें…" : "Type your health question…"}
              rows={1}
              className="flex-1 min-h-[44px] max-h-28 resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent p-2 text-sm"
              aria-label="Chat message input"
            />
            <div className="flex gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={listening ? stopVoice : startVoice}
                className={cn(
                  "size-10 rounded-full transition-all",
                  listening
                    ? "bg-destructive/10 text-destructive animate-pulse"
                    : "text-muted-foreground hover:text-primary"
                )}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
              >
                {listening ? <MicOff className="size-4" aria-hidden /> : <Mic className="size-4" aria-hidden />}
              </Button>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="size-10 rounded-full"
                aria-label="Send message"
              >
                <Send className="size-4" aria-hidden />
              </Button>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            PulseCare provides guidance only — not a medical diagnosis. For emergencies call 108.
          </p>
        </div>
      </div>
    </div>
  );
}
