"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChatPanel } from "./ChatPanel";
import { NDAPreview } from "@/components/preview/NDAPreview";
import { DocumentFieldsPreview } from "@/components/preview/DocumentFieldsPreview";
import { useNDAStore, initialFormData } from "@/lib/ndaStore";
import { useDocumentStore } from "@/lib/documentStore";
import { getDocumentEntry } from "@/lib/documentCatalog";
import type { NDAFormData } from "@/lib/ndaSchema";
import {
  sendChatMessage,
  loadSession,
  deleteSession,
} from "@/lib/chatApi";

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function serverDataToFormData(
  serverData: Record<string, unknown>
): NDAFormData {
  const base = { ...initialFormData };
  const { party1, party2, ...top } = serverData;

  for (const [k, v] of Object.entries(top)) {
    if (v != null && k in base) {
      (base as Record<string, unknown>)[k] = v;
    }
  }

  if (party1 && typeof party1 === "object") {
    base.party1 = { ...base.party1 };
    for (const [k, v] of Object.entries(party1 as Record<string, unknown>)) {
      if (v != null) (base.party1 as Record<string, unknown>)[k] = v;
    }
  }
  if (party2 && typeof party2 === "object") {
    base.party2 = { ...base.party2 };
    for (const [k, v] of Object.entries(party2 as Record<string, unknown>)) {
      if (v != null) (base.party2 as Record<string, unknown>)[k] = v;
    }
  }

  return base;
}

export function ChatLayout() {
  const router = useRouter();
  const { updateForm, updateParty1, updateParty2 } = useNDAStore();
  const { setDocumentType: storeSetDocType, setDocumentData: storeSetDocData } = useDocumentStore();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<Record<string, unknown>>({});
  const [documentType, setDocumentType] = useState<string>("generic");

  // Restore session or auto-start a new one
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const stored = sessionStorage.getItem("chat_session_id");
    if (stored) {
      const id = parseInt(stored, 10);
      if (!isNaN(id)) {
        loadSession(id)
          .then((data) => {
            setSessionId(data.session_id);
            setIsComplete(data.is_complete);
            setDocumentData(data.document_data);
            setDocumentType(data.document_type);
            setMessages(
              data.messages.map((m) => ({
                id: String(m.id),
                role: m.role,
                content: m.content,
              }))
            );
          })
          .catch(() => {
            sessionStorage.removeItem("chat_session_id");
            autoGreet();
          });
        return;
      }
    }
    autoGreet();
  }, []);

  const autoGreet = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await sendChatMessage(
        "Hello, I need help drafting a legal document.",
        null,
        "generic"
      );
      setSessionId(response.session_id);
      sessionStorage.setItem("chat_session_id", String(response.session_id));
      setMessages([
        {
          id: `assistant-${response.message_id}`,
          role: "assistant",
          content: response.reply,
        },
      ]);
      setDocumentData(response.document_data);
      setDocumentType(response.document_type);
      setIsComplete(response.is_complete);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start chat");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSend = useCallback(
    async (message: string) => {
      setError(null);
      const userMsg: ChatMsg = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const response = await sendChatMessage(message, sessionId);

        if (!sessionId) {
          setSessionId(response.session_id);
          sessionStorage.setItem(
            "chat_session_id",
            String(response.session_id)
          );
        }

        const assistantMsg: ChatMsg = {
          id: `assistant-${response.message_id}`,
          role: "assistant",
          content: response.reply,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        setDocumentData(response.document_data);
        setDocumentType(response.document_type);
        setIsComplete(response.is_complete);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const handleGenerate = useCallback(() => {
    if (documentType === "mutual_nda") {
      const ndaData = serverDataToFormData(documentData);
      const { party1, party2, ...topLevel } = ndaData;
      updateForm(topLevel);
      updateParty1(party1);
      updateParty2(party2);
      router.push("/nda/preview");
    } else {
      storeSetDocType(documentType);
      storeSetDocData(documentData);
      router.push(`/document/${documentType}/preview`);
    }
  }, [documentData, documentType, updateForm, updateParty1, updateParty2, router, storeSetDocType, storeSetDocData]);

  const handleStartOver = useCallback(async () => {
    if (sessionId) {
      try {
        await deleteSession(sessionId);
      } catch {
        // ok to ignore
      }
    }
    sessionStorage.removeItem("chat_session_id");
    setSessionId(null);
    setMessages([]);
    setDocumentData({});
    setDocumentType("generic");
    setIsComplete(false);
    setError(null);
    // Re-greet so the chat is not left empty
    autoGreet();
  }, [sessionId, autoGreet]);

  const docEntry = getDocumentEntry(documentType);
  const subtitle = docEntry?.name
    ? `${docEntry.name} Drafter`
    : "Legal Document Drafter";
  const completionLabel = docEntry?.name || "Document";

  // Determine which preview to show
  const isNDA = documentType === "mutual_nda";
  const ndaData = isNDA ? serverDataToFormData(documentData) : null;

  return (
    <div className="flex h-screen bg-cream">
      {/* Left panel — Chat */}
      <div className="w-[45%] min-w-[360px] flex flex-col border-r border-border bg-cream">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          isComplete={isComplete}
          error={error}
          onSend={handleSend}
          onGenerate={handleGenerate}
          onStartOver={handleStartOver}
          subtitle={subtitle}
          completionLabel={completionLabel}
        />
      </div>

      {/* Right panel — Live preview */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Preview header */}
        <div className="shrink-0 px-6 py-3 border-b border-border bg-white/80 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber animate-pulse" />
            <span className="text-xs font-medium text-warm-gray uppercase tracking-wider">
              Live Preview
            </span>
          </div>
        </div>

        {/* Scrollable preview */}
        <div className="flex-1 overflow-y-auto px-6 py-6 document-scroll">
          <div className="max-w-2xl mx-auto">
            {isNDA && ndaData ? (
              <NDAPreview data={ndaData} hideDownload />
            ) : (
              <DocumentFieldsPreview
                data={documentData}
                documentType={documentType}
                hideDownload
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
