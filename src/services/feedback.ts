// Step 348: Feedback System
export interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  message: string;
  rating?: number;
  email?: string;
  screenshot?: string;
  timestamp: Date;
}

class FeedbackService {
  private feedbacks: Feedback[] = [];

  async submitFeedback(feedback: Omit<Feedback, 'id' | 'timestamp'>): Promise<boolean> {
    const newFeedback: Feedback = {
      ...feedback,
      id: `feedback-${Date.now()}`,
      timestamp: new Date(),
    };

    this.feedbacks.push(newFeedback);

    if (process.env.NODE_ENV === 'production') {
      return await this.sendToServer(newFeedback);
    }

    return true;
  }

  private async sendToServer(feedback: Feedback): Promise<boolean> {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      return true;
    } catch (error) {
      console.error('Failed to send feedback:', error);
      return false;
    }
  }

  getFeedbacks() {
    return this.feedbacks;
  }
}

export default new FeedbackService();
