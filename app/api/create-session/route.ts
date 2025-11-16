import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY environment variable");
      return Response.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Check for workflow ID
    const workflowId = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID;
    if (!workflowId) {
      console.error("Missing NEXT_PUBLIC_CHATKIT_WORKFLOW_ID env var");
      return Response.json(
        { error: "ChatKit workflow ID not configured" },
        { status: 500 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const userId =
      (body && typeof body.userId === "string" && body.userId) || "anonymous";

    // Create ChatKit session
    try {
      const session = await openai.beta.chatkit.sessions.create({
        workflow: {
          id: workflowId
        },
        user: userId
      });

      if (!session.client_secret) {
        throw new Error("No client secret returned from OpenAI");
      }

      return Response.json({ client_secret: session.client_secret });
    } catch (openaiError: any) {
      console.error("OpenAI API error:", openaiError);
      
      // Provide more helpful error messages
      if (openaiError.status === 401) {
        return Response.json(
          { error: "Invalid OpenAI API key" },
          { status: 401 }
        );
      }
      
      if (openaiError.status === 404) {
        return Response.json(
          { error: "Workflow not found. Please check your workflow ID." },
          { status: 404 }
        );
      }

      return Response.json(
        {
          error: "Failed to create session",
          details: openaiError.message || "Unknown error"
        },
        { status: openaiError.status || 500 }
      );
    }
  } catch (err) {
    console.error("Unexpected error creating ChatKit session", err);
    return Response.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
