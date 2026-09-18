/**
 * Push & Local Notification Service for Janus
 * Designed to be strictly non-intrusive, contextual, and respecting system permissions.
 * Supports Web Notifications API (Desktop, Android Chrome, PWA, Capacitor WebView).
 */

const PUSH_STORAGE_KEY = 'janus_push_settings_v1';

interface PushSettings {
  enabled: boolean;
  permissionRequested: boolean;
  lastPushDate: string | null;
  dailyPushCount: number;
}

class PushNotificationService {
  private settings: PushSettings;

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): PushSettings {
    try {
      const raw = localStorage.getItem(PUSH_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    return {
      enabled: false,
      permissionRequested: false,
      lastPushDate: null,
      dailyPushCount: 0,
    };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(PUSH_STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public async requestPermissionWithContext(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      this.settings.permissionRequested = true;
      const permission = await Notification.requestPermission();
      this.settings.enabled = permission === 'granted';
      this.saveSettings();
      return permission === 'granted';
    } catch (e) {
      console.warn('Notification permission request error:', e);
      return false;
    }
  }

  /**
   * Dispatches a contextual notification only if:
   * 1. Notifications are supported and granted.
   * 2. Daily limit (max 1 contextual notification per day) is not exceeded.
   * 3. No active flow is disrupted.
   */
  public async sendContextualNotification(payload: {
    title: string;
    body: string;
    tag?: string;
    icon?: string;
    data?: any;
  }): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Reset daily count if date changed
    if (this.settings.lastPushDate !== todayStr) {
      this.settings.lastPushDate = todayStr;
      this.settings.dailyPushCount = 0;
    }

    // Strict throttle: max 1 high-value push per day
    if (this.settings.dailyPushCount >= 1) {
      return false;
    }

    try {
      const options: NotificationOptions = {
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
        badge: '/icon-192.png',
        tag: payload.tag || 'janus_contextual',
        data: payload.data,
      };

      const notif = new Notification(payload.title, options);
      
      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      this.settings.dailyPushCount += 1;
      this.settings.lastPushDate = todayStr;
      this.saveSettings();
      return true;
    } catch (err) {
      console.warn('Could not dispatch notification', err);
      return false;
    }
  }

  public setEnabledManually(enabled: boolean): void {
    this.settings.enabled = enabled;
    this.saveSettings();
  }

  public getSettings(): PushSettings {
    return { ...this.settings };
  }
}

export const pushNotificationService = new PushNotificationService();
