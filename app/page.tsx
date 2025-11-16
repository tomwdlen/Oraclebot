"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";

export default function HomePage() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          return existing;
        }

        const res = await fetch("/api/create-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: "oracle-" + crypto.randomUUID()
          })
        });

        if (!res.ok) {
          throw new Error("Failed to create ChatKit session");
        }

        const data = await res.json();
        return data.client_secret as string;
      }
    }
  });

  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "640px",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          background: "#020617"
        }}
      >
        <ChatKit control={control} className="w-full h-full" />
      </div>
    </main>
  );
}
