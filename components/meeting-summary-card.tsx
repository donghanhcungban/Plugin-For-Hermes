"use client";

import React from "react";
import { FileText, Tag, Lightbulb, Clock, Calendar, Download } from "lucide-react";
import { MeetingEntry } from "@/lib/memory-store";
import { exportMeetingToMarkdown } from "@/lib/markdown-exporter";

interface MeetingSummaryCardProps {
  meeting: MeetingEntry;
}

export function MeetingSummaryCard({ meeting }: MeetingSummaryCardProps) {
  const formattedDate = new Date(meeting.timestamp).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            {meeting.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> {meeting.durationSeconds}s
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportMeetingToMarkdown(meeting)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Xuất Markdown (.md)
          </button>
        </div>
      </div>

      {/* Topics badges */}
      {meeting.topics && meeting.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {meeting.topics.map((topic, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            >
              <Tag className="w-3 h-3" /> {topic}
            </span>
          ))}
        </div>
      )}

      {/* Summary Content */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Tóm tắt Tổng quan (Executive Summary)
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          {meeting.summary}
        </p>
      </div>

      {/* Key Insights */}
      {meeting.keyInsights && meeting.keyInsights.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Đúc kết Quan trọng (Key Insights)
          </h4>
          <ul className="space-y-2">
            {meeting.keyInsights.map((insight, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-300 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
