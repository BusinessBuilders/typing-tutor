// Step 340: Crash Reporting Service
export interface CrashReport {
  error: Error;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

class CrashReportingService {
  private enabled: boolean = true;
  private reports: CrashReport[] = [];

  initialize() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleError.bind(this));
      window.addEventListener('unhandledrejection', this.handleRejection.bind(this));
    }
  }

  private handleError(event: ErrorEvent) {
    this.captureError(event.error, { type: 'error', message: event.message });
  }

  private handleRejection(event: PromiseRejectionEvent) {
    this.captureError(new Error(String(event.reason)), { type: 'unhandledrejection' });
  }

  captureError(error: Error, context?: Record<string, any>) {
    if (!this.enabled) return;

    const report: CrashReport = {
      error,
      context,
      timestamp: new Date(),
    };

    this.reports.push(report);
    console.error('[Crash Report]', report);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToServer(report);
    }
  }

  private async sendToServer(report: CrashReport) {
    try {
      // Send to crash reporting service (e.g., Sentry, Bugsnag)
      await fetch('/api/crash-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error('Failed to send crash report:', error);
    }
  }

  getReports() {
    return this.reports;
  }

  clearReports() {
    this.reports = [];
  }
}

export default new CrashReportingService();
