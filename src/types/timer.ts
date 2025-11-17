export interface Timer {
  id: string;
  name: string;
  seconds: number;
  isRunning: boolean;
  notificationEnabled: boolean;
  notificationInterval: number;
  lastNotificationAt: number;
}