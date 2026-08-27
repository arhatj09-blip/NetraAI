export type PlatformType = 'all' | 'x' | 'reddit' | 'telegram';

export interface KPIMetric {
  id: string;
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  statusText?: string;
  accentColor: string;
}

export interface VectorDataPoint {
  topic: string;
  trend: number;
  sentiment: number;
  influence: number;
  platform: PlatformType;
  color: string;
}

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentTimelinePoint {
  time: string;
  value: number;
}

export interface PlatformVariancePoint {
  platform: string;
  positivity: number;
  color: string;
}

export interface BenchmarkRow {
  metric: string;
  xValue: string;
  redditValue: string;
  telegramValue: string;
  xDetail?: string;
  redditDetail?: string;
  telegramDetail?: string;
}

export interface TrendingTopicItem {
  tag: string;
  mentions: string;
  growth: string;
  status: string;
  score?: number;
  progressPercent?: number;
}

export interface InferredDemographic {
  ageGroups: { range: string; percentage: number }[];
  professionalInterests: { field: string; percentage: number; color: string }[];
}

export interface NetworkInfluencer {
  id: string;
  name: string;
  handle: string;
  influenceScore: number;
  avatarColor: string;
  connections: number;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  chartType?: 'sentiment-donut' | 'platform-variance' | 'sentiment-timeline' | 'topic-bars';
  analystSummary?: string;
}

export interface IngestionLogEntry {
  id: string;
  timestamp: string;
  type: string;
  recordCount: string;
  status: 'complete' | 'processing' | 'pending';
  detail: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'complete' | 'processing' | 'queued';
  icon: string;
}

export interface PlatformDistribution {
  xRecords: number;
  redditRecords: number;
  telegramRecords: number;
  totalRecords: number;
}
