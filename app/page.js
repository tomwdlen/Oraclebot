"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        // 1) Get client_secret from your backend
        const res = await fetch("/api/session");
        const data = await res.json();

        if (!res.ok || !data.client_secret) {
          setError("Failed to load session: " + JSON.stringify(data));
          return;
        }

        const client_secret = data.client_secret;

        // 2) Load ChatKit script
        const script = document.createElement("script");
        script.src =
          "https://cdn.platform.openai.com/deployments/chatkit/chatkit.js";
        script.async = true;

        script.onerror = () => {
          setError("Could not load ChatKit script.");
        };

        script.onload = () => {
          if (!window.ChatKit) {
            setError("ChatKit object not available on window.");
            return;
          }

          try {
            const chat = new window.ChatKit({
              target: containerRef.current,
              api: {
                getClientSecret: async () => client_secret,
              },
              theme: {
                brandColor: "#967b40",
                radius: 18,
                fontFamily: "Lora, serif",
              },
              features: {
                attachments: false,
                suggestions: [
                  "What services do you offer?",
                  "How much does it cost?",
                  "What is your process?",
                ],
              },
            });

            chat.render();
          } catch (e) {
            setError("ChatKit render error: " + String(e));
          }
        };

        document.body.appendChild(script);
      } catch (e) {
        setError("Init error: " + String(e));
      }
    }

    init();
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
      }}
    >
      {error ? (
        <div
          style={{
            margin: "auto",
            color: "red",
            maxWidth: 600,
            padding: 16,
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </div>
      ) : (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
          Loading chat…
        </div>
      )}
    </div>
  );
}
