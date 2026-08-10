"use client";

import React, { useState } from "react";
import { CheckSquare, Square, User, Clock, AlertTriangle, CheckCircle2, Bell, BellRing } from "lucide-react";
import { TaskItem, MemoryStore } from "@/lib/memory-store";
import { NotificationManager } from "@/lib/notification-manager";

interface ActionItemsListProps {
  tasks: TaskItem[];
  onTaskToggle?: (updatedTasks: TaskItem[]) => void;
}

export function ActionItemsList({ tasks, onTaskToggle }: ActionItemsListProps) {
  const [notifiedTasks, setNotifiedTasks] = useState<Record<string, boolean>>({});

  const handleToggle = (id: string) => {
    const updated = MemoryStore.toggleTask(id);
    if (onTaskToggle) {
      onTaskToggle(updated);
    }
  };

  const handleSetReminder = async (task: TaskItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const granted = await NotificationManager.requestPermission();
    if (granted) {
      NotificationManager.scheduleTaskReminder(task.title, 1);
      setNotifiedTasks((prev) => ({ ...prev, [task.id]: true }));
      alert(`Đã bật nhắc nhở cho công việc "${task.title}". Bạn sẽ nhận được thông báo trong 1 phút!`);
    } else {
      alert("Bạn cần cấp quyền Thông báo (Notification) trên trình duyệt để nhận nhắc nhở.");
    }
  };

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-2.5 h-2.5" /> Cao
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Trung bình
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Thấp
          </span>
        );
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 text-xs">
        Chưa có việc cần làm (Task) nào được trích xuất.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Công việc Cần làm (Action Items) ({tasks.length})
        </h3>
        <span className="text-xs text-slate-400">
          Đã xong {tasks.filter((t) => t.completed).length}/{tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => handleToggle(task.id)}
            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
              task.completed
                ? "bg-slate-950/40 border-slate-800/50 opacity-60 line-through"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
            }`}
          >
            <button className="mt-0.5 text-cyan-400 shrink-0 hover:scale-110 transition-transform">
              {task.completed ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs font-semibold ${task.completed ? "text-slate-500" : "text-slate-200"}`}>
                  {task.title}
                </span>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(task.priority)}
                  <button
                    onClick={(e) => handleSetReminder(task, e)}
                    className={`p-1 rounded-md transition-all ${
                      notifiedTasks[task.id]
                        ? "text-cyan-400 bg-cyan-500/10"
                        : "text-slate-500 hover:text-cyan-400 hover:bg-slate-800"
                    }`}
                    title="Bật thông báo nhắc nhở"
                  >
                    {notifiedTasks[task.id] ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                {task.assignee && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-cyan-400" /> {task.assignee}
                  </span>
                )}
                {task.deadline && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Clock className="w-3 h-3" /> Deadline: {task.deadline}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
