/**
 * Utility for exporting Calendar Events to .ics files or Google Calendar links
 */

export interface CalendarEventPayload {
  title: string;
  description?: string;
  location?: string;
  startTime: string; // ISO String or YYYY-MM-DDTHH:mm:ss
  endTime?: string;
  participants?: string[];
}

/**
 * Generates a Google Calendar Quick Add URL
 */
export function generateGoogleCalendarUrl(event: CalendarEventPayload): string {
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(
    `${event.description || ""}\n\nThành phần: ${event.participants?.join(", ") || "N/A"}`.trim()
  );
  const location = encodeURIComponent(event.location || "");

  const start = formatToIsoCompact(event.startTime);
  const end = event.endTime
    ? formatToIsoCompact(event.endTime)
    : formatToIsoCompact(addHours(event.startTime, 1));

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

/**
 * Downloads a .ics file for Apple Calendar, Outlook, etc.
 */
export function downloadIcsFile(event: CalendarEventPayload): void {
  const startCompact = formatToIsoCompact(event.startTime);
  const endCompact = event.endTime
    ? formatToIsoCompact(event.endTime)
    : formatToIsoCompact(addHours(event.startTime, 1));

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ambient AI Assistant//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description || "")}`,
    `LOCATION:${escapeIcsText(event.location || "")}`,
    `DTSTART:${startCompact}`,
    `DTEND:${endCompact}`,
    `STATUS:CONFIRMED`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatToIsoCompact(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Fallback to current time if invalid
    return new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function addHours(dateStr: string, hours: number): string {
  const d = new Date(dateStr);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
