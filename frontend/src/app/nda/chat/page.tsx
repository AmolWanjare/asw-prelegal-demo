"use client";

import { useEffect, useState } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { AuthGate } from "@/components/chat/AuthGate";
import { checkAuth } from "@/lib/chatApi";

export default function ChatPage() {
  const [authState, setAuthState] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  useEffect(() => {
    checkAuth().then((ok) =>
      setAuthState(ok ? "authenticated" : "unauthenticated")
    );
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-charcoal-20 border-t-charcoal rounded-full" />
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return <AuthGate onAuthenticated={() => setAuthState("authenticated")} />;
  }

  return <ChatLayout />;
}
