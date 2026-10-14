export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function askNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  return Notification.requestPermission();
}

// Browser notifications only appear while the app is open in a tab
export function sendNotification(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body });
  } catch {
    // some browsers only allow notifications from a service worker
  }
}