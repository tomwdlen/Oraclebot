"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { useState, useEffect, useRef } from "react";

// Component to listen for ChatKit errors
function ChatKitErrorListener({ ref, onError }: { ref: React.RefObject<any>, onError: (error: string) => void }) {
  useEffect(() => {
    const instance = ref.current;
    if (!instance) return;

    const handleError = (e: any) => {
      console.error("ChatKit error event:", e);
      onError("Chat error occurred. Please check the browser console (F12) for details.");
    };

    instance.addEventListener('error', handleError);
    instance.addEventListener('chatkit.error', handleError);

    return () => {
      instance.removeEventListener('error', handleError);
      instance.removeEventListener('chatkit.error', handleError);
    };
  }, [ref, onError]);

  return null;
}

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const { control, ref } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          console.log("Using existing client secret");
          return existing;
        }

        try {
          setError(null);
          console.log("Creating new ChatKit session...");

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
            let errorMessage = "Failed to create ChatKit session";
            try {
              const errorData = await res.json();
              errorMessage = errorData.error || errorData.details || errorMessage;
              console.error("API error:", errorData);
            } catch {
              // If JSON parsing fails, try text
              try {
                errorMessage = await res.text() || errorMessage;
              } catch {
                // Use default error message
              }
            }
            throw new Error(errorMessage);
          }

          const data = await res.json();
          if (!data.client_secret) {
            throw new Error("No client secret returned from server");
          }

          console.log("ChatKit session created successfully");
          setIsLoading(false);
          return data.client_secret as string;
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Error creating session:", err);
          setError(errorMessage);
          setIsLoading(false);
          // Don't throw - let the error state handle it
          throw err;
        }
      }
    }
  });

  useEffect(() => {
    // Check if ChatKit script is loaded
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    const checkChatKit = () => {
      attempts++;
      
      // Check multiple possible ways ChatKit might be exposed
      const chatKitAvailable = 
        typeof window !== "undefined" && (
          (window as any).ChatKit ||
          (window as any).chatkit ||
          document.querySelector('script[src*="chatkit"]')
        );

      if (chatKitAvailable) {
        setScriptLoaded(true);
        // Only set loading to false if we have a client secret or if it's been a while
        if (attempts > 10) {
          setIsLoading(false);
        }
      } else if (attempts < maxAttempts) {
        setTimeout(checkChatKit, 100);
      } else {
        // Script didn't load after max attempts
        setScriptLoaded(false);
        setIsLoading(false);
        if (!error) {
          setError("ChatKit script failed to load. Please refresh the page.");
        }
      }
    };
    
    checkChatKit();
  }, [error]);

  if (error) {
    return (
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          minHeight: "100vh"
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            padding: "2rem",
            borderRadius: "8px",
            background: "#ffffff",
            border: "1px solid #e5e5e5",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            color: "#1a1a1a"
          }}
        >
          <h2 style={{ marginTop: 0, color: "#C74634", fontWeight: 600 }}>Error</h2>
          <p style={{ color: "#312D2A" }}>{error}</p>
          <p style={{ fontSize: "0.875rem", color: "#7F7F7F", marginTop: "1rem" }}>
            Please check your environment variables and ensure OPENAI_API_KEY and
            NEXT_PUBLIC_CHATKIT_WORKFLOW_ID are set correctly.
          </p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              background: "#C74634",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 500,
              transition: "background 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#A6392A";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#C74634";
            }}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        minHeight: "100vh",
        background: "#f5f5f5"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "640px",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(49, 45, 42, 0.15), 0 2px 4px rgba(49, 45, 42, 0.1)",
          background: "#ffffff",
          border: "1px solid #E5E5E5",
          position: "relative"
        }}
      >
        {isLoading && !error && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              color: "#1a1a1a",
              zIndex: 10
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                className="loading-spinner"
                style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid #E5E5E5",
                  borderTopColor: "#C74634",
                  borderRadius: "50%",
                  margin: "0 auto 1rem"
                }}
              />
              <p style={{ color: "#312D2A", fontWeight: 500 }}>Loading chat...</p>
              {!scriptLoaded && (
                <p style={{ fontSize: "0.875rem", color: "#7F7F7F", marginTop: "0.5rem" }}>
                  Loading ChatKit script...
                </p>
              )}
            </div>
          </div>
        )}
        {!error && (
          <>
            <style dangerouslySetInnerHTML={{__html: `
              /* ChatKit Branding - Oracle360.co.uk Style */
              :root {
                --oracle-red: #C74634;
                --oracle-bark: #312D2A;
                --oracle-gray: #7F7F7F;
                --oracle-light-gray: #E5E5E5;
              }
              
              openai-chatkit {
                --chatkit-background: #ffffff !important;
                --chatkit-text: #312D2A !important;
                --chatkit-border: #E5E5E5 !important;
                --chatkit-primary: #C74634 !important;
                --chatkit-primary-hover: #A6392A !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              }
              
              openai-chatkit * {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              }
            `}} />
            <ChatKit 
              control={control} 
              ref={ref}
              className="w-full h-full"
            />
            <ChatKitErrorListener ref={ref} onError={setError} />
          </>
        )}
      </div>
    </main>
  );
}
