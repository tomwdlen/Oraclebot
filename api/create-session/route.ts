// app/api/create-session/route.ts

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WORKFLOW_ID = process.env.CHATKIT_WORKFLOW_ID; // or NEXT_PUBLIC_CHATKIT_WORKFLOW_ID if that's what you used

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  try {
    if (!OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY env var");
      return new Response("Server misconfigured (no API key)", { status: 500 });
    }

    if (!WORKFLOW_ID) {
      console.error("Missing CHATKIT_WORKFLOW_ID env var");
      return new Response("Server misconfigured (no workflow id)", { status: 500 });
    }

    // Parse body for userId, but fall back if missing/bad
    let user = "anonymous";
    try {
      const body = await req.json();
      if (body && typeof body.userId === "string" && body.userId.trim() !== "") {
        user = body.userId;
      }
    } catch {
      // no body / bad JSON – fine, we keep "anonymous"
    }

    // Call ChatKit Sessions HTTP API directly
    const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "chatkit_beta=v1"
      },
      body: JSON.stringify({
        workflow: {
          id: WORKFLOW_ID
          // you could add tracing / version / state_variables here if you want
        },
        user
      })
    });

    const json = await response.json();

    if (!response.ok) {
      console.error("ChatKit session creation failed:", response.status, json);
      return new Response("Failed to create ChatKit session", { status: 500 });
    }

    const clientSecret =
      (json && (json.client_secret || json.clientSecret)) ?? null;

    if (!clientSecret) {
      console.error("No client_secret in ChatKit response:", json);
      return new Response("No client secret from ChatKit", { status: 500 });
    }

    // This shape is what your frontend expects
    return Response.json({ client_secret: clientSecret });
  } catch (err) {
    console.error("Unexpected error creating ChatKit session:", err);
    return new Response("Failed to create session", { status: 500 });
  }
}
