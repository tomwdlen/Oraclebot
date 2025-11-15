'use client';

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadChat() {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();

        if (!res.ok || !data.client_secret) {
          setError("Failed to load session: " + JSON.stringify(data));
          return;
        }

        const client_secret = data.client_secret;

        // Load ChatKit script
        const script = document.createElement("script");
        script.src = "https://cdn.platform.openai.com/deployments/chatkit/chatkit.js";
        script.onload = () => {
          const chat = new window.ChatKit({
            target: containerRef.current,
            api: {
              getClientSecret: async () => client_secret
            },
            theme: {
              brandColor: "#0E7C86",
              radius: 18,
              fontFamily: "system-ui, sans-serif"
            },
            features: {
              attachments: false,
              suggestions: [
                "What services do you offer?",
                "How much does it cost?",
                "What is your process?"
              ]
            }
          });

          chat.render();
        };
        document.body.appendChild(script);
      } catch (err) {
        setError(String(err));
      }
    }

    loadChat();
  }, []);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "system-ui"
    }}>
      {error ? (
        <div style={{ color: "red" }}>Error: {error}</div>
      ) : (
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%"
          }}
        >
          Loading chat…
        </div>
      )}
    </div>
  );
}
