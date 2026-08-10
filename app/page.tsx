"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Mic, FileText, CheckCircle2, Bot, Trash2, Cpu, Search, Key } from "lucide-react";
import { AudioRecorderHub } from "@/components/audio-recorder-hub";
import { MeetingSummaryCard } from "@/components/meeting-summary-card";
import { ActionItemsList } from "@/components/action-items-list";
import { CalendarEventsList } from "@/components/calendar-events-list";
import { MemoryChatAssistant } from "@/components/memory-chat-assistant";
import { ApiKeyModal } from "@/components/api-key-modal";
import { MemoryStore, MeetingEntry, TaskItem, CalendarEvent } from "@/lib/memory-store";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"record" | "meetings" | "tasks" | "chat">("record");
  const [meetings, setMeetings] = useState<MeetingEntry[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMeeting, setCurrentMeeting] = useState<MeetingEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Search & Filter state for meetings log
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // API Key Settings Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const loadData = useCallback(() => {
    const loadedMeetings = MemoryStore.getMeetings();
    const loadedTasks = MemoryStore.getTasks();
    const loadedEvents = MemoryStore.getEvents();

    setMeetings(loadedMeetings);
    setTasks(loadedTasks);
    setEvents(loadedEvents);

    if (loadedMeetings.length > 0 && !currentMeeting) {
      setCurrentMeeting(loadedMeetings[0]);
    }
  }, [currentMeeting]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAnalyze = async (transcript: string, durationSeconds: number) => {
    setIsAnalyzing(true);
    try {
      const apiKey = typeof window !== "undefined" ? localStorage.getItem("AMBIENT_AI_GEMINI_KEY") : undefined;

      const response = await fetch("/api/audio/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, apiKey }),
      });

      const json = await response.json();

      if (json.success && json.data) {
        const data = json.data;
        const meetingId = `mtg_${Date.now()}`;

        const newTasks: TaskItem[] = (data.tasks || []).map((t: any, i: number) => ({
          id: `task_${meetingId}_${i}`,
          title: t.title,
          assignee: t.assignee,
          deadline: t.deadline,
          priority: t.priority || "medium",
          completed: false,
          meetingId,
          createdAt: new Date().toISOString(),
        }));

        const newEvents: CalendarEvent[] = (data.events || []).map((e: any, i: number) => ({
          id: `evt_${meetingId}_${i}`,
          title: e.title,
          description: e.description,
          location: e.location,
          startTime: e.startTime,
          endTime: e.endTime,
          participants: e.participants,
          meetingId,
          createdAt: new Date().toISOString(),
        }));

        const newMeeting: MeetingEntry = {
          id: meetingId,
          title: data.title || "Ghi chú Cuộc họp Mới",
          timestamp: new Date().toISOString(),
          durationSeconds: durationSeconds || 30,
          transcript,
          summary: data.summary || "Đã trích xuất tóm tắt thành công.",
          topics: data.topics || [],
          tasks: newTasks,
          events: newEvents,
          keyInsights: data.keyInsights || [],
        };

        MemoryStore.saveMeeting(newMeeting);
        setCurrentMeeting(newMeeting);
        loadData();
      }
    } catch (err) {
      console.error("Analysis process error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearAll = () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu trí nhớ cuộc họp cá nhân?")) {
      MemoryStore.clearAll();
      setMeetings([]);
      setTasks([]);
      setEvents([]);
      setCurrentMeeting(null);
    }
  };

  // Filtered Meetings list
  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.transcript.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTopic =
      selectedTopic === "all" || (m.topics && m.topics.includes(selectedTopic));

    return matchesSearch && matchesTopic;
  });

  // Extract all unique topics
  const allTopics = Array.from(new Set(meetings.flatMap((m) => m.topics || [])));

  return (
    <main className="min-h-screen bg-[#060c18] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Cpu className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              Ambient AI Assistant
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                Phase 2
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Trợ lý AI Cuộc họp & Ghi chú Trí nhớ Thông minh</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="p-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all text-xs font-medium flex items-center gap-1.5 border border-slate-800"
            title="Cài đặt API Key"
          >
            <Key className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">API Key</span>
          </button>

          <button
            onClick={handleClearAll}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-medium flex items-center gap-1.5"
            title="Xóa dữ liệu bộ nhớ"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Xóa bộ nhớ</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 max-w-fit mx-auto sm:mx-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("record")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "record"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Mic className="w-4 h-4" /> Thu âm & Phân tích
          </button>

          <button
            onClick={() => setActiveTab("meetings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "meetings"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <FileText className="w-4 h-4" /> Nhật ký Cuộc họp ({meetings.length})
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "tasks"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Tasks & Calendar ({tasks.length + events.length})
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "chat"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Bot className="w-4 h-4" /> Tra cứu Trí nhớ AI
          </button>
        </div>

        {/* Tab Content Views */}
        {activeTab === "record" && (
          <div className="space-y-6">
            <AudioRecorderHub onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

            {currentMeeting && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest pt-2">
                  <Sparkles className="w-4 h-4" /> Kết quả Phân tích AI Mới Nhất
                </div>
                <MeetingSummaryCard meeting={currentMeeting} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ActionItemsList tasks={currentMeeting.tasks} onTaskToggle={loadData} />
                  <CalendarEventsList events={currentMeeting.events} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "meetings" && (
          <div className="space-y-4">
            {/* Search & Topic Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tiêu đề, tóm tắt hoặc nội dung cuộc họp..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {allTopics.length > 0 && (
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">Tất cả chủ đề ({allTopics.length})</option>
                  {allTopics.map((t, idx) => (
                    <option key={idx} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar list */}
              <div className="lg:col-span-1 space-y-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 h-[600px] overflow-y-auto">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Kết quả ({filteredMeetings.length}/{meetings.length})
                </h3>
                {filteredMeetings.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">Không tìm thấy bản ghi cuộc họp phù hợp.</p>
                ) : (
                  filteredMeetings.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setCurrentMeeting(m)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        currentMeeting?.id === m.id
                          ? "bg-cyan-500/20 border-cyan-500/40 text-white shadow-lg"
                          : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <h4 className="text-xs font-bold truncate mb-1">{m.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{m.summary}</p>
                      <div className="text-[10px] text-slate-500 mt-2">
                        {new Date(m.timestamp).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Main detail view */}
              <div className="lg:col-span-2 space-y-6">
                {currentMeeting ? (
                  <>
                    <MeetingSummaryCard meeting={currentMeeting} />
                    <ActionItemsList tasks={currentMeeting.tasks} onTaskToggle={loadData} />
                    <CalendarEventsList events={currentMeeting.events} />
                  </>
                ) : (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                    Chọn một cuộc họp từ danh sách bên trái để xem chi tiết tóm tắt & việc cần làm.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActionItemsList tasks={tasks} onTaskToggle={loadData} />
            <CalendarEventsList events={events} />
          </div>
        )}

        {activeTab === "chat" && (
          <div className="max-w-4xl mx-auto">
            <MemoryChatAssistant />
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-8 text-center text-xs text-slate-500 mt-auto">
        Ambient AI Assistant — Powered by Google Gemini & Web Audio Engine | Dark Cyber Edition
      </footer>
    </main>
  );
}
