import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const userId =
      (body && typeof body.userId === "string" && body.userId) || "anonymous";

    const workflowId = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID;
    if (!workflowId) {
      console.error("Missing NEXT_PUBLIC_CHATKIT_WORKFLOW_ID env var");
      return new Response("Workflow id not configured", { status: 500 });
    }

    const session = await openai.chatkit.sessions.create({
      workflow: {
        id: workflowId
      },
      user: userId
    });

    return Response.json({ client_secret: session.client_secret });
  } catch (err) {
    console.error("Error creating ChatKit session", err);
    return new Response("Failed to create session", { status: 500 });
  }
}
