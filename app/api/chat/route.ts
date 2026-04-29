import { NextRequest } from "next/server"
import { Ollama } from "ollama"

const ollama = new Ollama({ host: process.env.OLLAMA_HOST ?? "http://localhost:11434" })
const MODEL = process.env.OLLAMA_MODEL ?? "llama3.2"

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array is required" }, { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const ollamaStream = await ollama.chat({ model: MODEL, messages, stream: true })

        for await (const chunk of ollamaStream) {
          const content = chunk.message.content
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
      } catch (error) {
        console.error("[/api/chat] Ollama error:", error)
        const errMsg = error instanceof Error ? error.message : String(error)
        const message = errMsg.includes("ECONNREFUSED")
          ? "Ollama is not running. Start it with: ollama serve"
          : `Failed to get a response from the model. (${errMsg})`
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
