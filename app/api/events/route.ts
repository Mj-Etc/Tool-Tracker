import { NextRequest } from "next/server";
import { eventHub } from "@/lib/hub";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Subscribe to EventHub
      const unsubscribe = eventHub.subscribe(({ event, data }) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      });

      // Heartbeat ping every 30 seconds
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode("event: ping\ndata: {}\n\n"));
      }, 30000);

      // Handle stream cleanup
      req.signal.addEventListener("abort", () => {
        unsubscribe();
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
