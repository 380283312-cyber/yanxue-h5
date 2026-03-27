import { NextRequest, NextResponse } from "next/server";
import { streamChat, buildSystemPrompt, Message } from "@/lib/minimax";

const API_KEY = process.env.MINIMAX_API_KEY ?? "sk-cp-cmgKG7kTdqiTqD1v7jJd3edMnKKNd_MvhEjijbhxz3KhjooC9ULMuYu05oAWLLXk11u68xkx1H30AV5qgPFn7uMTvbYv1o1HppDH3ooLdMPkRbkF4Fxey8E";
const MODEL = process.env.MINIMAX_MODEL ?? "MiniMax-M2.7";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as { messages: Message[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages array" },
        { status: 400 }
      );
    }

    // Inject system prompt at the beginning
    const systemMessage: Message = {
      role: "user",
      content: buildSystemPrompt(),
    };

    // Convert user/assistant history, prepend system instruction
    // MiniMax API expects user/assistant alternating
    const apiMessages: Message[] = [
      { role: "user", content: systemMessage.content + "\n\n请确认你已经理解上述角色设定，并以后续的用户消息开始你的顾问工作。" },
      ...messages,
    ];

    // Use streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          await streamChat({
            messages: apiMessages,
            apiKey: API_KEY,
            model: MODEL,
            onChunk: (text) => {
              fullResponse += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "chunk", text })}\n\n`));
            },
            onDone: () => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", text: fullResponse })}\n\n`));
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            },
            onError: (error) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`));
              controller.close();
            },
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: errorMessage })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
