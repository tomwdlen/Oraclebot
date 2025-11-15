export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    const workflow_id = "wf_69175b19ef4881908900db8e4e055c1e0d90724cc952e602";

    const res = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ workflow_id })
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data }, { status: 500 });
    }

    return Response.json({ client_secret: data.client_secret });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
