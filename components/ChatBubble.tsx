"use client";

import { useState } from "react";

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

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <button
      onClick={handleCopy}
      title="复制"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "11px",
        color: copied ? "#01c3a3" : "rgba(0,0,0,0.25)",
        padding: "2px 4px",
        borderRadius: "4px",
        transition: "color 0.15s",
        flexShrink: 0,
      }}
    >
      {copied ? "✓" : "复制"}
    </button>
  );
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  if (message.isTyping) {
    return (
      <div className="chat-bubble-wrap ai">
        <div className="chat-bubble-typing ai-thinking" aria-label="AI正在思考">
          <span className="ai-thinking-text">🤖 正在思考</span>
          <div className="typing-dots">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-bubble-wrap ${isUser ? "user" : "ai"}`}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span className="chat-bubble-time">{formatTime(message.timestamp)}</span>
        {!isUser && <CopyBtn text={message.content} />}
      </div>
      <div className="chat-bubble">{message.content}</div>
    </div>
  );
}
