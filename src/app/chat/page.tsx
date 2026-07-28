"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div className="surface-card overflow-hidden flex flex-col" style={{ height: "calc(100vh - 10rem)" }}>
      <ChatInterface />
    </div>
  );
}
