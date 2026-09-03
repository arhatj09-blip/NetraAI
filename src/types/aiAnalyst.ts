export interface AIAnalystContext {
  platform: string;
  hashtag?: string;
  startDate?: string;
  endDate?: string;
  section?: string;
  topic?: string;
  filters?: Record<string, string>;
}

export interface AnalyticalMetric {
  label: string;
  value: string;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string; // e.g. 'emerald', 'blue', 'amber', 'purple'
}

export interface AIActionChip {
  id: string;
  label: string;
  actionType: 'scroll_section' | 'filter_hashtag' | 'custom';
  target?: string;
}

export interface AIAnalystChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  metrics?: AnalyticalMetric[];
  bulletPoints?: string[];
  actionChips?: AIActionChip[];
  summaryQuote?: string;
  contextSnapshot?: AIAnalystContext;
  isError?: boolean;
}
