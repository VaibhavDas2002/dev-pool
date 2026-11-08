"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, SessionUser } from "@/types";
import { formatChatTime, formatRelativeTime } from "@/lib/utils/date";
import { getInitials, getAvatarColor, getAvatarStyle } from "@/lib/utils";
import { Send, Trash2, ShieldCheck, Smile, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChatBoxProps {
  currentUser: {
    id: string;
    full_name: string;
    role: "member" | "admin";
  };
  initialMessages?: ChatMessage[];
  compact?: boolean;
}

export function ChatBox({ currentUser, initialMessages = [], compact = false }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for new messages every 4 seconds or on mount
  useEffect(() => {
    let isMounted = true;
    const fetchChat = async () => {
      try {
        const res = await fetch("/api/chat");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.messages) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        // Silent fail on network blips
      }
    };

    fetchChat();
    const interval = setInterval(fetchChat, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    if (text.length > 500) {
      toast.error("Message too long (max 500 characters)");
      return;
    }

    try {
      setIsSending(true);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setInputText("");
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Message could not be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      setDeletingId(messageId);
      const res = await fetch("/api/chat/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: messageId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not delete");
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_deleted: true } : m))
      );
      toast.success("Message removed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete message");
    } finally {
      setDeletingId(null);
    }
  };

  const addQuickEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const quickEmojis = ["🎓", "🍜", "📜", "🎉", "❤️", "👍", "☕", "🔥"];

  return (
    <div className={`flex flex-col rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden ${
      compact ? "h-[450px]" : "h-[calc(100vh-13rem)] min-h-[480px] md:h-[720px]"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-tight">College Reunion Discussion</h3>
            <p className="text-xs text-slate-500">Live chat with your B.Tech batchmates</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-600">Live</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="h-14 w-14 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
              <MessageSquare className="h-7 w-7" />
            </div>
            <p className="font-bold text-slate-800">No messages yet</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Be the first to say hi! Ask about the certificate collection procedure or propose a meeting spot.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.user_id === currentUser.id;
            const prevMsg = messages[index - 1];
            const isConsecutive = prevMsg && prevMsg.user_id === msg.user_id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-end group ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-[11px] mb-0.5 shadow-sm ring-1 ring-black/5 ${
                      isConsecutive ? "opacity-0" : getAvatarColor(msg.sender_name || "Friend")
                    }`}
                    style={isConsecutive ? undefined : getAvatarStyle(msg.sender_name || "Friend")}
                  >
                    {!isConsecutive && getInitials(msg.sender_name || "Friend")}
                  </div>
                )}

                <div
                  className={`flex flex-col max-w-[82%] sm:max-w-[70%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  {!isConsecutive && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-xs font-bold text-slate-700">
                        {isMe ? "You" : msg.sender_name}
                      </span>
                      {msg.sender_role === "admin" && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                          Admin
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {formatChatTime(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <div className="relative group/msg">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm shadow-2xs ${
                        msg.is_deleted
                          ? "bg-slate-100 text-slate-400 italic border border-slate-200"
                          : isMe
                          ? "bg-indigo-600 text-white rounded-br-xs"
                          : "bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs"
                      }`}
                    >
                      {msg.is_deleted ? "This message was deleted." : msg.message}
                    </div>

                    {/* Delete button (Only for self or admin) */}
                    {!msg.is_deleted && (isMe || currentUser.role === "admin") && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={deletingId === msg.id}
                        className={`absolute -top-2 ${
                          isMe ? "-left-6" : "-right-6"
                        } opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-600 rounded-full hover:bg-white shadow-xs`}
                        title={isMe ? "Delete your message" : "Admin moderate message"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis & Input Form */}
      <div className="border-t border-slate-100 bg-white p-3 sm:p-4 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-base">
          <span className="text-xs text-slate-400 mr-1 shrink-0">Quick:</span>
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addQuickEmoji(emoji)}
              className="hover:scale-125 transition-transform p-0.5 rounded text-lg select-none"
            >
              {emoji}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message to the batch..."
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            maxLength={500}
          />
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 h-10 w-10 sm:w-auto sm:px-4 rounded-xl shrink-0"
            disabled={!inputText.trim() || isSending}
            isLoading={isSending}
          >
            <Send className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

