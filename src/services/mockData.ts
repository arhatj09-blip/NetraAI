import {
  KPIMetric,
  VectorDataPoint,
  SentimentDistribution,
  SentimentTimelinePoint,
  PlatformVariancePoint,
  BenchmarkRow,
  TrendingTopicItem,
  InferredDemographic,
  NetworkInfluencer,
  IngestionLogEntry,
  PipelineStage,
  PlatformDistribution,
  PlatformType,
  ChatMessage
} from '../types/intelligence';

export const platformDistributionData: PlatformDistribution = {
  xRecords: 184392,
  socialRecords: 90000,
  telegramRecords: 62799,
  totalRecords: 274392,
};

export const getKPIMetrics = (platform: PlatformType): KPIMetric[] => {
  switch (platform) {
    case 'x':
      return [
        { id: '1', label: 'Total Posts', value: '184.4K', trend: '+12% Trend', trendPositive: true, accentColor: '#3b82f6' },
        { id: '2', label: 'Positive', value: '64.2%', trend: '+3%', trendPositive: true, accentColor: '#10b981' },
        { id: '3', label: 'Negative', value: '18.4%', trend: '-5%', trendPositive: false, accentColor: '#ef4444' },
        { id: '4', label: 'Neutral', value: '17.4%', statusText: 'Stable', accentColor: '#9ca3af' },
        { id: '5', label: 'Engagement', value: '5.8%', statusText: 'High', accentColor: '#6366f1' },
        { id: '6', label: 'Communities', value: '184', statusText: 'Spreading', accentColor: '#a855f7' },
      ];
    case 'social':
      return [
        { id: '1', label: 'Total Signals', value: '90.0K', trend: '+8.4%', trendPositive: true, accentColor: '#6366f1' },
        { id: '2', label: 'Positive', value: '58.0%', trend: '+1.5%', trendPositive: true, accentColor: '#10b981' },
        { id: '3', label: 'Negative', value: '19.0%', trend: '-2.0%', trendPositive: false, accentColor: '#ef4444' },
        { id: '4', label: 'Neutral', value: '23.0%', statusText: 'Active Debate', accentColor: '#9ca3af' },
        { id: '5', label: 'Avg Engagement', value: '76.4%', statusText: 'High Signal', accentColor: '#f59e0b' },
        { id: '6', label: 'Monitored Channels', value: '112', statusText: 'Indexed', accentColor: '#a855f7' },
      ];
    case 'telegram':
      return [
        { id: '1', label: 'Alpha Messages', value: '62.8K', trend: '+42.1%', trendPositive: true, accentColor: '#0ea5e9' },
        { id: '2', label: 'Positive', value: '88.0%', trend: '+14%', trendPositive: true, accentColor: '#10b981' },
        { id: '3', label: 'Negative', value: '4.0%', trend: '-1.5%', trendPositive: true, accentColor: '#ef4444' },
        { id: '4', label: 'Neutral', value: '8.0%', statusText: 'Targeted', accentColor: '#9ca3af' },
        { id: '5', label: 'Propagation', value: '96.2', statusText: 'Rapid', accentColor: '#0ea5e9' },
        { id: '6', label: 'Private Groups', value: '50', statusText: 'Infiltrated', accentColor: '#a855f7' },
      ];
    default:
      return [
        { id: '1', label: 'Total Records', value: '274.4K', trend: '+12% Trend', trendPositive: true, accentColor: '#3b82f6' },
        { id: '2', label: 'Net Sentiment', value: '72% Pos', statusText: 'Aggregated', trendPositive: true, accentColor: '#10b981' },
        { id: '3', label: 'Risk Signal', value: '11%', trend: '-2% Spike', trendPositive: false, accentColor: '#ef4444' },
        { id: '4', label: 'Trend Score', value: '92.4', statusText: 'Fast Scaling', accentColor: '#f59e0b' },
        { id: '5', label: 'Engagement', value: '5.2%', statusText: 'Stable', accentColor: '#6366f1' },
        { id: '6', label: 'Communities', value: '312', statusText: 'Interconnected', accentColor: '#a855f7' },
      ];
  }
};

export const vectorSpaceData: VectorDataPoint[] = [
  { topic: 'AI Agents', trend: 84, sentiment: 71, influence: 91, platform: 'x', color: '#3b82f6' },
  { topic: 'AI Jobs', trend: 67, sentiment: 52, influence: 78, platform: 'social', color: '#6366f1' },
  { topic: 'Regulation', trend: 42, sentiment: 41, influence: 66, platform: 'telegram', color: '#0ea5e9' },
  { topic: 'GPT-5', trend: 76, sentiment: 68, influence: 82, platform: 'x', color: '#3b82f6' },
  { topic: 'LLMOps', trend: 55, sentiment: 80, influence: 40, platform: 'social', color: '#6366f1' },
  { topic: 'Ethics', trend: 88, sentiment: 45, influence: 70, platform: 'telegram', color: '#0ea5e9' },
  { topic: 'Agentic Workflows', trend: 92, sentiment: 85, influence: 88, platform: 'x', color: '#3b82f6' },
  { topic: 'Open Source Models', trend: 65, sentiment: 78, influence: 58, platform: 'social', color: '#6366f1' },
];

export const sentimentDistributionData: Record<PlatformType, SentimentDistribution> = {
  all: { positive: 72, neutral: 17, negative: 11 },
  x: { positive: 68, neutral: 12, negative: 20 },
  social: { positive: 58, neutral: 23, negative: 19 },
  telegram: { positive: 88, neutral: 8, negative: 4 },
};

export const sentimentTimelineData: Record<string, SentimentTimelinePoint[]> = {
  '1H': [
    { time: '11:00', value: 68 },
    { time: '11:15', value: 70 },
    { time: '11:30', value: 69 },
    { time: '11:45', value: 72 },
  ],
  '6H': [
    { time: '06:00', value: 62 },
    { time: '07:00', value: 65 },
    { time: '08:00', value: 63 },
    { time: '09:00', value: 70 },
    { time: '10:00', value: 75 },
    { time: '11:00', value: 72 },
  ],
  '24H': [
    { time: '00:00', value: 60 },
    { time: '04:00', value: 65 },
    { time: '08:00', value: 63 },
    { time: '12:00', value: 70 },
    { time: '16:00', value: 75 },
    { time: '20:00', value: 72 },
    { time: '22:00', value: 80 },
    { time: '23:45', value: 85 },
  ],
  '7D': [
    { time: 'Mon', value: 58 },
    { time: 'Tue', value: 62 },
    { time: 'Wed', value: 65 },
    { time: 'Thu', value: 70 },
    { time: 'Fri', value: 76 },
    { time: 'Sat', value: 82 },
    { time: 'Sun', value: 88 },
  ],
};

export const platformVarianceData: PlatformVariancePoint[] = [
  { platform: 'X (Twitter)', positivity: 68, color: '#3b82f6' },
  { platform: 'Social Media Platforms', positivity: 58, color: '#6366f1' },
  { platform: 'Telegram', positivity: 88, color: '#0ea5e9' },
];

export const benchmarkComparisonData: BenchmarkRow[] = [
  {
    metric: 'Sentiment (Pos / Neu / Neg)',
    xValue: '68% / 12% / 20%',
    socialValue: '58% / 23% / 19%',
    telegramValue: '88% / 8% / 4%',
  },
  {
    metric: 'Total Mentions',
    xValue: '8,421',
    socialValue: '3,109',
    telegramValue: '1,270',
  },
  {
    metric: 'Growth (24H)',
    xValue: '+18.4%',
    socialValue: '+7.8%',
    telegramValue: '+42.1%',
  },
  {
    metric: 'Engagement Rank',
    xValue: '#1 High',
    socialValue: '#2 Stable',
    telegramValue: '#3 Growth',
  },
  {
    metric: 'Dominant Emotion',
    xValue: 'Excitement (62%)',
    socialValue: 'Curiosity (54%)',
    telegramValue: 'Optimism (82%)',
  },
];

export const trendingTopicsData: TrendingTopicItem[] = [
  { tag: '#AgentDev', mentions: '14,201 mentions', growth: '+124%', status: 'Spiking', score: 94, progressPercent: 85 },
  { tag: '#GPT5Architecture', mentions: '8,932 mentions', growth: '+82%', status: 'High Volume', score: 86, progressPercent: 70 },
  { tag: '#OpenAI_DevDay', mentions: '6,412 mentions', growth: '+45%', status: 'Stable', score: 76, progressPercent: 55 },
  { tag: '#LLMOps', mentions: '5,120 mentions', growth: '+112%', status: 'Breakout', score: 82, progressPercent: 65 },
  { tag: '#AgenticDesign', mentions: '4,320 mentions', growth: '+67%', status: 'Rising', score: 68, progressPercent: 45 },
];

// ─── Rising Hashtags (X page panel) ──────────────────────────────────────────
export interface XRisingHashtag {
  tag: string;
  growth: string;
  mentions: string;
  status: 'Rising' | 'Spiking' | 'Stable' | 'Declining';
  velocity: string;
}

export const xRisingHashtags: XRisingHashtag[] = [
  { tag: '#AgentDev',  growth: '+242%', mentions: '14,201', status: 'Spiking', velocity: '+1,840/hr' },
  { tag: '#AI_Safety', growth: '+184%', mentions: '9,428',  status: 'Spiking', velocity: '+920/hr'  },
  { tag: '#GPTNext',   growth: '+112%', mentions: '6,812',  status: 'Rising',  velocity: '+610/hr'  },
  { tag: '#LLMOps',    growth: '+98%',  mentions: '5,120',  status: 'Rising',  velocity: '+480/hr'  },
];

// ─── Per-hashtag Trend Intelligence (popup data) ──────────────────────────────
export interface HashtagTrendData {
  /** Growth timeline points across the active date range */
  timeline: SentimentTimelinePoint[];
  /** Sentiment distribution for this hashtag */
  sentiment: { positive: number; neutral: number; negative: number };
  /** Emotion breakdown — same 7 emotions as emotionalPulseData */
  emotions: { emotion: string; value: number }[];
  /** Synthetic demographics — clearly labelled as prototype-generated */
  syntheticDemographics: {
    gender: { label: string; value: number; color: string }[];
    ageGroups: { range: string; percentage: number }[];
    regions: { region: string; percentage: number; color: string }[];
  };
}

export const hashtagTrendIntelligence: Record<string, HashtagTrendData> = {
  '#AgentDev': {
    timeline: [
      { time: 'Aug 01', value: 18 }, { time: 'Aug 05', value: 34 },
      { time: 'Aug 09', value: 52 }, { time: 'Aug 13', value: 68 },
      { time: 'Aug 17', value: 85 }, { time: 'Aug 21', value: 94 },
      { time: 'Aug 25', value: 124 }, { time: 'Aug 27', value: 140 },
    ],
    sentiment: { positive: 74, neutral: 16, negative: 10 },
    emotions: [
      { emotion: 'Excitement', value: 91 }, { emotion: 'Curiosity', value: 76 },
      { emotion: 'Support',    value: 68 }, { emotion: 'Anxiety',   value: 38 },
      { emotion: 'Fear',       value: 22 }, { emotion: 'Sadness',   value: 14 },
      { emotion: 'Anger',      value:  8 },
    ],
    syntheticDemographics: {
      gender:    [{ label: 'Male', value: 72, color: '#3b82f6' }, { label: 'Female', value: 24, color: '#ec4899' }, { label: 'Other', value: 4, color: '#a855f7' }],
      ageGroups: [{ range: '18-24', percentage: 38 }, { range: '25-34', percentage: 40 }, { range: '35-44', percentage: 16 }, { range: '45+', percentage: 6 }],
      regions:   [{ region: 'North America', percentage: 44, color: '#3b82f6' }, { region: 'Europe', percentage: 28, color: '#6366f1' }, { region: 'Asia-Pacific', percentage: 18, color: '#10b981' }, { region: 'Other', percentage: 10, color: '#9ca3af' }],
    },
  },
  '#AI_Safety': {
    timeline: [
      { time: 'Aug 01', value: 22 }, { time: 'Aug 05', value: 38 },
      { time: 'Aug 09', value: 55 }, { time: 'Aug 13', value: 72 },
      { time: 'Aug 17', value: 88 }, { time: 'Aug 21', value: 102 },
      { time: 'Aug 25', value: 118 }, { time: 'Aug 27', value: 130 },
    ],
    sentiment: { positive: 52, neutral: 28, negative: 20 },
    emotions: [
      { emotion: 'Excitement', value: 48 }, { emotion: 'Curiosity', value: 82 },
      { emotion: 'Support',    value: 60 }, { emotion: 'Anxiety',   value: 74 },
      { emotion: 'Fear',       value: 58 }, { emotion: 'Sadness',   value: 32 },
      { emotion: 'Anger',      value: 40 },
    ],
    syntheticDemographics: {
      gender:    [{ label: 'Male', value: 58, color: '#3b82f6' }, { label: 'Female', value: 36, color: '#ec4899' }, { label: 'Other', value: 6, color: '#a855f7' }],
      ageGroups: [{ range: '18-24', percentage: 28 }, { range: '25-34', percentage: 38 }, { range: '35-44', percentage: 22 }, { range: '45+', percentage: 12 }],
      regions:   [{ region: 'North America', percentage: 36, color: '#3b82f6' }, { region: 'Europe', percentage: 34, color: '#6366f1' }, { region: 'Asia-Pacific', percentage: 20, color: '#10b981' }, { region: 'Other', percentage: 10, color: '#9ca3af' }],
    },
  },
  '#GPTNext': {
    timeline: [
      { time: 'Aug 01', value: 10 }, { time: 'Aug 05', value: 28 },
      { time: 'Aug 09', value: 44 }, { time: 'Aug 13', value: 62 },
      { time: 'Aug 17', value: 78 }, { time: 'Aug 21', value: 88 },
      { time: 'Aug 25', value: 98 }, { time: 'Aug 27', value: 110 },
    ],
    sentiment: { positive: 68, neutral: 20, negative: 12 },
    emotions: [
      { emotion: 'Excitement', value: 86 }, { emotion: 'Curiosity', value: 90 },
      { emotion: 'Support',    value: 58 }, { emotion: 'Anxiety',   value: 42 },
      { emotion: 'Fear',       value: 28 }, { emotion: 'Sadness',   value: 18 },
      { emotion: 'Anger',      value: 12 },
    ],
    syntheticDemographics: {
      gender:    [{ label: 'Male', value: 66, color: '#3b82f6' }, { label: 'Female', value: 28, color: '#ec4899' }, { label: 'Other', value: 6, color: '#a855f7' }],
      ageGroups: [{ range: '18-24', percentage: 44 }, { range: '25-34', percentage: 36 }, { range: '35-44', percentage: 14 }, { range: '45+', percentage: 6 }],
      regions:   [{ region: 'North America', percentage: 40, color: '#3b82f6' }, { region: 'Europe', percentage: 26, color: '#6366f1' }, { region: 'Asia-Pacific', percentage: 24, color: '#10b981' }, { region: 'Other', percentage: 10, color: '#9ca3af' }],
    },
  },
  '#LLMOps': {
    timeline: [
      { time: 'Aug 01', value: 14 }, { time: 'Aug 05', value: 26 },
      { time: 'Aug 09', value: 42 }, { time: 'Aug 13', value: 58 },
      { time: 'Aug 17', value: 72 }, { time: 'Aug 21', value: 82 },
      { time: 'Aug 25', value: 92 }, { time: 'Aug 27', value: 98 },
    ],
    sentiment: { positive: 72, neutral: 18, negative: 10 },
    emotions: [
      { emotion: 'Excitement', value: 78 }, { emotion: 'Curiosity', value: 88 },
      { emotion: 'Support',    value: 64 }, { emotion: 'Anxiety',   value: 36 },
      { emotion: 'Fear',       value: 20 }, { emotion: 'Sadness',   value: 16 },
      { emotion: 'Anger',      value: 10 },
    ],
    syntheticDemographics: {
      gender:    [{ label: 'Male', value: 76, color: '#3b82f6' }, { label: 'Female', value: 20, color: '#ec4899' }, { label: 'Other', value: 4, color: '#a855f7' }],
      ageGroups: [{ range: '18-24', percentage: 32 }, { range: '25-34', percentage: 44 }, { range: '35-44', percentage: 18 }, { range: '45+', percentage: 6 }],
      regions:   [{ region: 'North America', percentage: 48, color: '#3b82f6' }, { region: 'Europe', percentage: 24, color: '#6366f1' }, { region: 'Asia-Pacific', percentage: 20, color: '#10b981' }, { region: 'Other', percentage: 8, color: '#9ca3af' }],
    },
  },
};

export const emotionalPulseData = [
  { emotion: 'Excitement', value: 84 },
  { emotion: 'Curiosity', value: 72 },
  { emotion: 'Support', value: 65 },
  { emotion: 'Anxiety', value: 45 },
  { emotion: 'Fear', value: 32 },
  { emotion: 'Sadness', value: 28 },
  { emotion: 'Anger', value: 15 },
];

export const inferredDemographicsData: InferredDemographic = {
  ageGroups: [
    { range: '18-24', percentage: 42 },
    { range: '25-34', percentage: 35 },
    { range: '35-44', percentage: 15 },
    { range: '45+', percentage: 8 },
  ],
  professionalInterests: [
    { field: 'Software / IT / AI Dev', percentage: 64, color: '#3b82f6' },
    { field: 'Students & Researchers', percentage: 22, color: '#10b981' },
    { field: 'Business & Finance', percentage: 14, color: '#f59e0b' },
  ],
};

export const topInfluencersData: NetworkInfluencer[] = [
  { id: '1', name: 'TechGuruX', handle: '@TechGuruX', influenceScore: 98.4, avatarColor: '#3b82f6', connections: 412 },
  { id: '2', name: 'DataVoyager', handle: '@DataVoyager', influenceScore: 92.1, avatarColor: '#10b981', connections: 284 },
  { id: '3', name: 'AnalystPro', handle: '@AnalystPro', influenceScore: 87.6, avatarColor: '#f59e0b', connections: 195 },
  { id: '4', name: 'AlphaSeeker', handle: '@AlphaSeeker', influenceScore: 84.3, avatarColor: '#8b5cf6', connections: 156 },
];

export const initialIngestionLogs: IngestionLogEntry[] = [
  { id: 'log-1', timestamp: '11:45 PM', type: 'Batch Sync', recordCount: '+327 records', status: 'complete', detail: 'Analytics recalculation complete across 12 nodes' },
  { id: 'log-2', timestamp: '11:30 PM', type: 'Batch Sync', recordCount: '+412 records', status: 'complete', detail: 'X & Social Media Feeds ingestion verified' },
  { id: 'log-3', timestamp: '11:15 PM', type: 'Batch Sync', recordCount: '+289 records', status: 'complete', detail: 'Telegram channel batch synchronized' },
  { id: 'log-4', timestamp: '11:00 PM', type: 'Batch Sync', recordCount: '+512 records', status: 'complete', detail: 'Vector clustering updated' },
];

export const pipelineStages: PipelineStage[] = [
  { id: '1', name: 'Data Ingestion', status: 'complete', icon: 'database' },
  { id: '2', name: 'Sentiment Analysis', status: 'complete', icon: 'smile' },
  { id: '3', name: 'Emotion NLP', status: 'complete', icon: 'activity' },
  { id: '4', name: 'Entity Extraction', status: 'complete', icon: 'fingerprint' },
  { id: '5', name: 'Topic Clustering', status: 'complete', icon: 'layers' },
  { id: '6', name: 'Trend Calculation', status: 'complete', icon: 'trending-up' },
  { id: '7', name: 'Network Mapping', status: 'complete', icon: 'share-2' },
  { id: '8', name: 'Insight Generation', status: 'processing', icon: 'sparkles' },
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: 'Hello. I am the NetraAI Analyst. I have processed 274,392 records from X (Twitter) and social media platforms in the last 15 minutes. How can I assist your intelligence operations today?',
    timestamp: '11:45 PM',
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Show me the cross-platform sentiment breakdown for #AIAgents.',
    timestamp: '11:46 PM',
  },
  {
    id: 'msg-3',
    sender: 'ai',
    text: 'Currently, #AIAgents displays a strongly positive aggregate sentiment (72%), though there is variance between platforms. Telegram shows high optimism at 88%, while X and public channels average 64% positive.',
    timestamp: '11:46 PM',
    chartType: 'platform-variance',
    analystSummary: 'Public discourse indicates strong focus on multi-modal agent architecture and enterprise deployment stability.',
  },
];
