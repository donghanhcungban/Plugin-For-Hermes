"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, Database, Search } from "lucide-react";
import { ChatMessage, MemoryStore } from "@/lib/memory-store";

export function MemoryChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = MemoryStore.getChatHistory();
    if (history.length === 0) {
      const initialMessage: ChatMessage = {
        id: "msg_welcome",
        sender: "assistant",
        content:
          "Xin chào! Tôi là Trợ lý AI Ký nhớ Cá nhân. Bạn có thể hỏi tôi bất kỳ thông tin nào về các cuộc họp, việc cần làm hay lịch hẹn trong quá khứ.",
        timestamp: new Date().toISOString(),
      };
      setMessages([initialMessage]);
    } else {
      setMessages(history);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendQuery = async () => {
    if (!inputQuery.trim() || isQuerying) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      content: inputQuery,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    MemoryStore.saveChatMessage(userMsg);
    const queryText = inputQuery;
    setInputQuery("");
    setIsQuerying(true);

    try {
      // Build context from meetings
      const meetings = MemoryStore.getMeetings();
      const meetingsContext = meetings
        .map(
          (m) =>
            `--- Cuộc họp: ${m.title} (${new Date(m.timestamp).toLocaleDateString("vi-VN")}) ---\n` +
            `Tóm tắt: ${m.summary}\n` +
            `Nội dung: ${m.transcript}\n` +
            `Tasks: ${m.tasks.map((t) => t.title).join("; ")}\n` +
            `Events: ${m.events.map((e) => `${e.title} lúc ${e.startTime}`).join("; ")}`
        )
        .join("\n\n");

      const response = await fetch("/api/memory/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          meetingsContext,
        }),
      });

      const json = await response.json();

      let assistantAnswer = "Tôi không thể tìm thấy câu trả lời trong dữ liệu trí nhớ hiện tại.";
      let citations: string[] = [];

      if (json.success && json.data) {
        assistantAnswer = json.data.answer;
        citations = json.data.citations || [];
      }

      const assistantMsg: ChatMessage = {
        id: `msg_ast_${Date.now()}`,
        sender: "assistant",
        content: assistantAnswer,
        timestamp: new Date().toISOString(),
        citations,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      MemoryStore.saveChatMessage(assistantMsg);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Bot className="w-4 h-4 text-cyan-400" />
            Trợ lý Tra cứu Trí nhớ (Memory RAG Assistant)
          </h3>
          <p className="text-xs text-slate-400">
            Hỏi đáp tự nhiên về toàn bộ dữ liệu cuộc họp, lịch trình và công việc quá khứ
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono">
          <Database className="w-3 h-3" /> Live Memory
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === "user"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-indigo-600 text-white"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 rounded-tr-none"
                  : "bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1">
                  <Search className="w-3 h-3 text-cyan-400" />
                  <span>Trích dẫn: {msg.citations.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isQuerying && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 w-max">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>AI đang lục lại bộ nhớ cuộc họp...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="flex items-center gap-2 shrink-0 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendQuery()}
          placeholder="Hỏi AI: 'Tuần này tôi có cuộc họp nào quan trọng?', 'Nam đã hứa gửi slide chưa?'..."
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
        />
        <button
          onClick={handleSendQuery}
          disabled={isQuerying || !inputQuery.trim()}
          className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
