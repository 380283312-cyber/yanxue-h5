import { courses } from "@/data/courses";

// ── 研学表情体系（全站统一引用）──────────────────────────────────────
export const YANXUE_EMOJI: Record<string, string> = {
  "红色教育": "🚩",
  "传统文化": "🏛️",
  "劳动实践": "🌾",
  "自然生态": "🌿",
  "国防科工": "🚀",
  "国情教育": "🏯",
  "其他":     "📚",
};

export const YANXUE_GRAD: Record<string, string> = {
  "红色教育": "linear-gradient(135deg,#ef4444,#f97316)",
  "传统文化": "linear-gradient(135deg,#f59e0b,#fbbf24)",
  "劳动实践": "linear-gradient(135deg,#22c55e,#86efac)",
  "自然生态": "linear-gradient(135deg,#10b981,#6ee7b7)",
  "国防科工": "linear-gradient(135deg,#3b82f6,#60a5fa)",
  "国情教育": "linear-gradient(135deg,#8b5cf6,#a78bfa)",
  "其他":     "linear-gradient(135deg,#94a3b8,#cbd5e1)",
};

export const YANXUE_TAG_CLASS: Record<string, string> = {
  "红色教育": "tag-red",
  "传统文化": "tag-yellow",
  "劳动实践": "tag-green",
  "自然生态": "tag-teal",
  "国防科工": "tag-blue",
  "国情教育": "tag-purple",
  "其他":     "tag-gray",
};

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatStreamOptions {
  messages: Message[];
  apiKey?: string;
  model?: string;
  onChunk?: (text: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export const FRIENDLY_ERROR_MESSAGE = "网络不稳定，请稍后重试";

const RETRY_DELAYS = [1000, 2000, 3000];
const MAX_RETRIES = 3;

const DEFAULT_MODEL = "MiniMax-M2.7";

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryCount: number = 0
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`MiniMax API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response;
  } catch (err) {
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retryCount + 1);
    }
    throw err;
  }
}

export async function streamChat({
  messages,
  apiKey,
  model = DEFAULT_MODEL,
  onChunk,
  onDone,
  onError,
}: ChatStreamOptions): Promise<void> {
  const url = "https://api.minimax.chat/anthropic/v1/messages";

  try {
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        messages,
        stream: true,
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      if (value) {
        buffer += decoder.decode(value, { stream: !done });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();

            if (data === "[DONE]") {
              done = true;
              break;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "content_block_delta") {
                const text = parsed.delta?.text ?? parsed.delta?.partial ?? "";
                if (text) {
                  onChunk?.(text);
                }
              } else if (parsed.type === "message_delta") {
              } else if (parsed.type === "message_stop") {
                done = true;
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch {
            }
          }
        }
      }
    }

    onDone?.();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    onError?.(new Error(FRIENDLY_ERROR_MESSAGE));
  }
}

export interface ChatAPIOptions {
  messages: Message[];
  onChunk?: (text: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export async function streamChatViaAPI({
  messages,
  onChunk,
  onDone,
  onError,
}: ChatAPIOptions): Promise<void> {
  const baseUrl = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE
    ? process.env.NEXT_PUBLIC_API_BASE
    : '';
  const url = `${baseUrl}/api/chat`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "请求失败");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("响应体不可读");
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      if (value) {
        buffer += decoder.decode(value, { stream: !done });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();

            if (data === "[DONE]") {
              done = true;
              break;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "chunk" && parsed.text) {
                onChunk?.(parsed.text);
              } else if (parsed.type === "done") {
                done = true;
              } else if (parsed.type === "error") {
                throw new Error(parsed.message || FRIENDLY_ERROR_MESSAGE);
              }
            } catch {
            }
          }
        }
      }
    }

    onDone?.();
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error(FRIENDLY_ERROR_MESSAGE));
  }
}

export function buildSystemPrompt(): string {
  return `你是"研学顾问小智"，一位专业、简洁的研学旅行顾问助手。

【能力】课程推荐、行程规划、报告生成、费用估算

【风格】回复精简专业，善用emoji分段。不要冗长铺垫，直接给干货。

【行程格式】
【第X天】
⏰ 时间 - 活动地点
🎯 学习目标
💡 注意事项
最后附【费用预算】【行前清单】

【报告格式】
封面信息 → 研学概要（150字）→ 详细记录 → 收获反思 → 评语模板

【知识库】从以下${courses.length}门真实课程中匹配参考，禁止编造课程名：
${(() => {
  const cats: Record<string, string[]> = {};
  for (const c of courses) {
    if (!cats[c.classify]) cats[c.classify] = [];
    const fee = c.fee && c.fee !== "待定" ? c.fee : "待定";
    cats[c.classify].push(`${c.name}(${fee})`);
  }
  const emoji: Record<string,string> = {"红色教育":"🔴","传统文化":"🟡","劳动实践":"🟢","自然生态":"🌿","国防科工":"🔵","国情教育":"🔷","其他":"⚪"};
  return Object.entries(cats).map(([cat, list]) => `${emoji[cat]||"⚪"}${cat}(${list.length}门): ${list.slice(0,8).join(" / ")}`).join("\n")
    + (Object.values(cats).some(l => l.length > 8) ? "\n（其余从略）" : "");
})()}`;
}
