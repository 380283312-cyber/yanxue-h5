"use client";

// TODO: 此文件为临时方案，待 /api/chat 经 nginx 代理稳定工作后移除，勿在生产环境长期使用

import type { Message } from "@/lib/minimax";

export async function streamChatDirect({
  messages,
  onChunk,
  onDone,
  onError,
}: {
  messages: Message[];
  onChunk?: (text: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_MINIMAX_API_KEY;
  const model = process.env.NEXT_PUBLIC_MINIMAX_MODEL ?? "MiniMax-M2.7";

  if (!apiKey) {
    onError?.(new Error("API Key 未配置"));
    return;
  }

  try {
    const response = await fetch("https://api.minimax.chat/anthropic/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, max_tokens: 8192, messages, stream: true }),
    });

    if (!response.ok) {
      const err = await response.text().catch(() => "");
      throw new Error(`API error: ${response.status} ${err}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let done = false;

    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      if (value) {
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") { done = true; break; }
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta") {
                const text = parsed.delta?.text ?? "";
                if (text) onChunk?.(text);
              } else if (parsed.type === "message_stop") {
                done = true;
              } else if (parsed.error) {
                throw new Error(parsed.error?.message ?? "Unknown error");
              }
            } catch {
              // skip parse errors for non-JSON lines
            }
          }
        }
      }
    }
    onDone?.();
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}
