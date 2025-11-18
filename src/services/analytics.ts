// Step 349: Analytics Service
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

class AnalyticsService {
  private enabled: boolean = false;
  private events: AnalyticsEvent[] = [];

  initialize() {
    this.enabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
  }

  trackEvent(name: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date(),
    };

    this.events.push(event);

    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(event);
    }
  }

  trackPageView(page: string) {
    this.trackEvent('page_view', { page });
  }

  trackUserAction(action: string, details?: Record<string, any>) {
    this.trackEvent('user_action', { action, ...details });
  }

  private async sendToAnalytics(event: AnalyticsEvent) {
    // Send to analytics service (e.g., Google Analytics, Mixpanel)
    console.log('[Analytics]', event);
  }

  getEvents() {
    return this.events;
  }
}

export default new AnalyticsService();
