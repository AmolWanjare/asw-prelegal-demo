"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import type { ChatMsg } from "./ChatLayout";

interface ChatPanelProps {
  messages: ChatMsg[];
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  onSend: (message: string) => void;
  onGenerate: () => void;
  onStartOver: () => void;
}

export function ChatPanel({
  messages,
  isLoading,
  isComplete,
  error,
  onSend,
  onGenerate,
  onStartOver,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
  }, [input, isLoading, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-charcoal flex items-center justify-center">
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-light">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-charcoal font-display">AI Assistant</h2>
              <p className="text-[11px] text-warm-gray">Mutual NDA Drafter</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStartOver}
            className="text-xs text-warm-gray hover:text-charcoal transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 document-scroll">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-amber-muted mx-auto mb-4 flex items-center justify-center">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-sm text-warm-gray">
              Start a conversation to draft your NDA
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-amber-muted text-amber">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="bg-white border border-border rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-warm-gray-light rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-warm-gray-light rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-warm-gray-light rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-sm text-center px-4 py-3 bg-error-light border border-error/20 rounded-lg">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {isComplete && (
          <div className="mx-auto max-w-sm text-center px-5 py-4 bg-amber-muted border border-amber-border rounded-xl">
            <p className="text-sm font-medium text-charcoal mb-3">
              Your NDA is ready!
            </p>
            <button
              type="button"
              onClick={onGenerate}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-purple hover:bg-purple-hover rounded-lg transition-all duration-200 shadow-sm"
            >
              Generate NDA
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-white/90 backdrop-blur-sm px-5 py-4">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl border border-border bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-light focus:outline-none focus:border-charcoal-30 focus:ring-1 focus:ring-charcoal-10 disabled:opacity-50 transition-all"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white bg-purple hover:bg-purple-hover transition-all duration-200 disabled:opacity-30 shadow-sm"
            aria-label="Send message"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
