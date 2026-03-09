import { handleChatMessage } from "@/lib/gemini/xat-handler"

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.messages || !Array.isArray(body.messages)) {
    return new Response(JSON.stringify({ error: "Cal un array de messages" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const stream = await handleChatMessage({
      messages: body.messages,
      model: body.model,
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (err) {
    console.error("Error xat:", err)
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Error desconegut",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
