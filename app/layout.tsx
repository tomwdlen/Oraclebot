import type { Metadata } from "next";
import Script from "next/script";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Oracle Guide Chat",
  description: "Chat UI powered by OpenAI Agent Builder workflow"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
