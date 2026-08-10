import { MeetingEntry } from "@/lib/memory-store";

/**
 * Converts a MeetingEntry object into a formatted Markdown string and triggers download
 */
export function exportMeetingToMarkdown(meeting: MeetingEntry): void {
  const formattedDate = new Date(meeting.timestamp).toLocaleString("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const markdownLines: string[] = [
    `# 📝 ${meeting.title}`,
    "",
    `> **Thời gian:** ${formattedDate} | **Thời lượng:** ${meeting.durationSeconds} giây`,
    meeting.topics && meeting.topics.length > 0
      ? `> **Chủ đề:** ${meeting.topics.join(", ")}`
      : "",
    "",
    "---",
    "",
    "## 📌 Tóm tắt Tổng quan",
    "",
    meeting.summary,
    "",
  ];

  if (meeting.keyInsights && meeting.keyInsights.length > 0) {
    markdownLines.push("## 💡 Đúc kết & Quyết định Quan trọng");
    markdownLines.push("");
    meeting.keyInsights.forEach((insight) => {
      markdownLines.push(`- ${insight}`);
    });
    markdownLines.push("");
  }

  if (meeting.tasks && meeting.tasks.length > 0) {
    markdownLines.push("## ✅ Việc cần làm (Action Items)");
    markdownLines.push("");
    meeting.tasks.forEach((task) => {
      const status = task.completed ? "[x]" : "[ ]";
      const priorityTag = `\`[Ưu tiên: ${task.priority.toUpperCase()}]\``;
      const assigneeTag = task.assignee ? `**(Phụ trách: ${task.assignee})**` : "";
      const deadlineTag = task.deadline ? `*(Hạn: ${task.deadline})*` : "";
      markdownLines.push(`- ${status} **${task.title}** ${priorityTag} ${assigneeTag} ${deadlineTag}`);
    });
    markdownLines.push("");
  }

  if (meeting.events && meeting.events.length > 0) {
    markdownLines.push("## 📅 Lịch hẹn Trích xuất");
    markdownLines.push("");
    meeting.events.forEach((event) => {
      const location = event.location ? `| Địa điểm: ${event.location}` : "";
      const participants = event.participants ? `| Tham gia: ${event.participants.join(", ")}` : "";
      markdownLines.push(`### 🔹 ${event.title}`);
      markdownLines.push(`- **Thời gian:** ${new Date(event.startTime).toLocaleString("vi-VN")} ${location} ${participants}`);
      if (event.description) {
        markdownLines.push(`- **Mô tả:** ${event.description}`);
      }
      markdownLines.push("");
    });
  }

  markdownLines.push("## 📜 Nội dung Ghi âm Chi tiết (Transcript)");
  markdownLines.push("");
  markdownLines.push("```text");
  markdownLines.push(meeting.transcript);
  markdownLines.push("```");
  markdownLines.push("");
  markdownLines.push("---");
  markdownLines.push("*Báo cáo được tự động tạo bởi Ambient AI Assistant*");

  const fullMarkdown = markdownLines.join("\n");

  const blob = new Blob([fullMarkdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${meeting.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_summary.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
