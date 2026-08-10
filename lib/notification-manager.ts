/**
 * Browser Notification Manager Utility for Ambient Reminders
 */

export class NotificationManager {
  static async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  static async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn("Notification permission not granted.");
      return;
    }

    try {
      new Notification(title, {
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        ...options,
      });
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  }

  static scheduleTaskReminder(taskTitle: string, delayMinutes: number = 1): void {
    setTimeout(() => {
      this.sendNotification(`⏰ Nhắc nhở Công việc: ${taskTitle}`, {
        body: `Đã đến hạn thực hiện công việc "${taskTitle}". Hãy kiểm tra lại trong Ambient AI Assistant.`,
      });
    }, delayMinutes * 60 * 1000);
  }
}
