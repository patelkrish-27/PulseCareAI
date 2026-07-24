"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { chatHistory } from "@/mock/data";

const suggestedPrompts = [
  "What is a healthy blood pressure?",
  "How can I improve my sleep?",
  "I have a headache, what should I do?",
];

export function ChatInterface() {
  const [messages, setMessages] = useState(chatHistory);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: "Based on your symptoms and current vitals, I recommend getting some rest. However, this is not a medical diagnosis. Would you like me to connect you with a healthcare professional?"
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-6 max-w-3xl mx-auto pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex w-full",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-5 py-3 text-sm md:text-base shadow-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-surface-container text-on-surface rounded-bl-none border"
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="max-w-[80%] rounded-2xl px-5 py-4 bg-surface-container text-on-surface rounded-bl-none border flex items-center space-x-2">
                <span className="flex space-x-1">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></span>
                </span>
                <span className="text-xs text-on-surface-variant ml-2">PulseCareAI is typing...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-surface border-t">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {suggestedPrompts.map((prompt, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="whitespace-nowrap rounded-full bg-surface border-border text-on-surface hover:bg-accent hover:text-accent-foreground"
                onClick={() => setInput(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>

          <div className="relative flex items-end gap-2 bg-surface-container-lowest rounded-xl border p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-on-surface-variant hover:text-primary rounded-full">
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your health question..."
              className="min-h-[44px] max-h-32 resize-none border-0 shadow-none focus-visible:ring-0 p-3 bg-transparent text-on-surface"
              rows={1}
            />
            
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-on-surface-variant hover:text-primary rounded-full">
                <Mic className="h-5 w-5" />
                <span className="sr-only">Use voice input</span>
              </Button>
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon" 
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-center text-on-surface-variant">
            PulseCareAI can make mistakes. Consider verifying important health information.
          </p>
        </div>
      </div>
    </div>
  );
}
