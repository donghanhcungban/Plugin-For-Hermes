"use client";

import React from "react";
import { Calendar, MapPin, Users, ExternalLink, Download, Clock } from "lucide-react";
import { CalendarEvent } from "@/lib/memory-store";
import { generateGoogleCalendarUrl, downloadIcsFile } from "@/lib/ics-exporter";

interface CalendarEventsListProps {
  events: CalendarEvent[];
}

export function CalendarEventsList({ events }: CalendarEventsListProps) {
  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 text-xs">
        Chưa có lịch hẹn (Calendar Event) nào được trích xuất.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-cyan-400" />
          Lịch hẹn Trích xuất ({events.length})
        </h3>
        <span className="text-xs text-slate-400">Xuất trực tiếp sang Google/Apple Calendar</span>
      </div>

      <div className="space-y-4">
        {events.map((event) => {
          const googleUrl = generateGoogleCalendarUrl(event);
          const formattedStart = new Date(event.startTime).toLocaleString("vi-VN", {
            dateStyle: "medium",
            timeStyle: "short",
          });

          return (
            <div
              key={event.id}
              className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  {event.title}
                </h4>

                <div className="flex items-center gap-2">
                  <a
                    href={googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" /> Google Calendar
                  </a>
                  <button
                    onClick={() => downloadIcsFile(event)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all"
                  >
                    <Download className="w-3 h-3" /> File .ICS
                  </button>
                </div>
              </div>

              {event.description && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg">
                  {event.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                  <Clock className="w-3.5 h-3.5" /> {formattedStart}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400" /> {event.location}
                  </span>
                )}
                {event.participants && event.participants.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> {event.participants.join(", ")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
