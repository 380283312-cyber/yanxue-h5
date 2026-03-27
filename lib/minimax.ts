export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatStreamOptions {
  messages: Message[];
  apiKey: string;
  model?: string;
  onChunk?: (text: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

const DEFAULT_MODEL = "MiniMax-M2.7";

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
    const response = await fetch(url, {
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

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`MiniMax API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

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

        // Process SSE lines
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

              // Handle different event types from MiniMax streaming
              if (parsed.type === "content_block_delta") {
                const text = parsed.delta?.text ?? parsed.delta?.partial ?? "";
                if (text) {
                  onChunk?.(text);
                }
              } else if (parsed.type === "message_delta") {
                // Done
              } else if (parsed.type === "message_stop") {
                done = true;
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch {
              // Skip malformed JSON lines
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

开始你的顾问工作吧！`;
}
