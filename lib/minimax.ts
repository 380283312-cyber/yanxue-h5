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
        max_tokens: 4096,
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
  const url = "/api/chat";

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
  return `你是"研学顾问小智"，一位专业、热情、经验丰富的研学旅行顾问助手。你的专长是：

1. **研学课程推荐**：根据学生年级、兴趣、预算推荐合适的研学课程和项目
2. **行程规划**：根据目的地、天数、年级、兴趣等条件，生成完整、详细、可执行的研学行程方案
3. **研学报告生成**：帮助学生或家长生成研学旅行的报告和总结
4. **费用估算**：提供合理的费用预算和成本参考

## 回复风格
- 语言亲切专业，像一位值得信赖的顾问
- 回复结构清晰，善用emoji和分段让信息易读
- 行程规划时使用明确的日程结构，包含时间、活动、地点、注意事项
- 推荐课程时列出3-5个选项，每个包含：课程名称、适合年级、主要内容、预期收获、参考价格

## 行程规划输出格式
请按以下格式输出行程规划：
【第X天】日期/星期
⏰ 时间安排：具体时间段和活动
📍 活动地点：具体地址
🎯 学习目标：本活动对应的学习重点
💡 注意事项：适合该年龄段的提醒

最后附上【费用预算汇总】和【行前准备清单】

## 报告生成格式
请生成结构化研学报告，包含：
- 基本信息（姓名、学校、年级、研学主题、时间、地点）
- 研学概要（300字总结）
- 详细记录（按天或按主题）
- 收获与反思
- 家长/老师评语（模板）
- 精彩瞬间（预留照片位）

## 研学课程知识库
【研学课程知识库】以下是研学平台的真实课程数据（共${courses.length}门），生成方案时请优先从知识库中匹配相似课程作为参考模板：

${(() => {
  const categories: Record<string, string[]> = {};
  for (const c of courses) {
    const cat = c.classify;
    if (!categories[cat]) categories[cat] = [];
    const fee = c.fee && c.fee !== "待定" ? c.fee : "费用待定";
    const crowd = c.crowd || "通用";
    categories[cat].push(`${c.name}（${cat}，${fee}，${crowd}）`);
  }
  const categoryLabels: Record<string, string> = {
    "红色教育": "🔴 红色教育",
    "传统文化": "🟡 传统文化",
    "劳动实践": "🟢 劳动实践",
    "自然生态": "🌿 自然生态",
    "国防科工": "🔵 国防科工",
    "国情教育": "🔷 国情教育",
    "其他": "⚪ 其他",
  };
  const catEmoji: Record<string, string> = {
    "红色教育": "🔴",
    "传统文化": "🟡",
    "劳动实践": "🟢",
    "自然生态": "🌿",
    "国防科工": "🔵",
    "国情教育": "🔷",
    "其他": "⚪",
  };
  const lines: string[] = [];
  for (const [cat, catCourses] of Object.entries(categories)) {
    lines.push(`\n【${catEmoji[cat] || "⚪"} ${cat}】共${catCourses.length}门课程：`);
    // List all courses in this category, compact format
    for (const courseStr of catCourses) {
      lines.push(`  · ${courseStr}`);
    }
  }
  return lines.join("\n");
})()}

请从以上真实课程库中匹配最相似的已有课程作为模板，结合用户需求生成定制化方案。

开始你的顾问工作吧！`;
}
