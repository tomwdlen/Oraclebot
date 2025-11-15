// app/api/session/route.js

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY env var" },
        { status: 500 }
      );
    }

    const workflowId = "wf_69175b19ef4881908900db8e4e055c1e0d90724cc952e602";

    const upstream = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: workflowId },   // 👈 THIS is the required `workflow`
        user: "oracle360-site",         // can be any user id string
        chatkit_configuration: {
          file_upload: { enabled: false }
        }
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      // Pass through error so you can see it in the browser
      return Response.json({ error: data }, { status: upstream.status });
    }

    return Response.json({ client_secret: data.client_secret });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
