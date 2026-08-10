/**
 * Utility for managing local memory storage (LocalStorage & State)
 */

export interface TaskItem {
  id: string;
  title: string;
  assignee?: string;
  deadline?: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  meetingId?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime?: string;
  participants?: string[];
  meetingId?: string;
  createdAt: string;
}

export interface MeetingEntry {
  id: string;
  title: string;
  timestamp: string;
  durationSeconds: number;
  transcript: string;
  summary: string;
  topics: string[];
  tasks: TaskItem[];
  events: CalendarEvent[];
  keyInsights: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: string[];
}

const STORAGE_KEYS = {
  MEETINGS: "ambient_ai_meetings",
  TASKS: "ambient_ai_tasks",
  EVENTS: "ambient_ai_events",
  CHAT: "ambient_ai_chat",
};

export class MemoryStore {
  static getMeetings(): MeetingEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEETINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveMeeting(meeting: MeetingEntry): void {
    if (typeof window === "undefined") return;
    const meetings = this.getMeetings();
    const existingIndex = meetings.findIndex((m) => m.id === meeting.id);

    if (existingIndex >= 0) {
      meetings[existingIndex] = meeting;
    } else {
      meetings.unshift(meeting); // Newer first
    }

    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));

    // Synchronize tasks and events
    if (meeting.tasks.length > 0) {
      this.addTasks(meeting.tasks);
    }
    if (meeting.events.length > 0) {
      this.addEvents(meeting.events);
    }
  }

  static deleteMeeting(id: string): void {
    if (typeof window === "undefined") return;
    const meetings = this.getMeetings().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  }

  static getTasks(): TaskItem[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addTasks(newTasks: TaskItem[]): void {
    const tasks = this.getTasks();
    const updated = [...newTasks, ...tasks];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
  }

  static toggleTask(id: string): TaskItem[] {
    const tasks = this.getTasks();
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
    return updated;
  }

  static getEvents(): CalendarEvent[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addEvents(newEvents: CalendarEvent[]): void {
    const events = this.getEvents();
    const updated = [...newEvents, ...events];
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
  }

  static getChatHistory(): ChatMessage[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveChatMessage(msg: ChatMessage): void {
    const chat = this.getChatHistory();
    chat.push(msg);
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chat));
  }

  static clearAll(): void {
    if (typeof window === "undefined") return;
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  }
}
