"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full bg-surface-container-lowest rounded-xl shadow-sm border border-border/50 overflow-hidden">
      <div className="p-4 border-b bg-surface flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface">PulseCareAI Assistant</h2>
          <p className="text-sm text-on-surface-variant">Your personal health companion</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
