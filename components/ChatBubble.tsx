"use client";

import { useRef, useEffect } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatBubbleProps {
  message: ChatMessage;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  if (message.isTyping) {
    return (
      <div className="chat-bubble-wrap ai">
        <div className="chat-bubble-typing" aria-label="AI正在输入">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-bubble-wrap ${isUser ? "user" : "ai"}`}>
      <span className="chat-bubble-time">{formatTime(message.timestamp)}</span>
      <div className="chat-bubble">{message.content}</div>
    </div>
  );
}
