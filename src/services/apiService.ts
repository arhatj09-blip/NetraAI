/**
 * NetraAI API Service
 * Central API helper layer for connecting React Frontend to FastAPI Backend
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }

  return res.json();
}

export interface AnalyticsOverview {
  total_posts: number;
  unique_users: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
    positive_pct: number;
    negative_pct: number;
    neutral_pct: number;
  };
  emotion_distribution: Array<{
    emotion: string;
    count: number;
    percentage: number;
  }>;
  top_topics: Array<{
    topic: string;
    count: number;
    percentage: number;
    avg_probability: number;
  }>;
  top_hashtags: Array<{
    hashtag: string;
    count: number;
    growth_rate: number;
    score: number;
  }>;
  demographics: {
    gender: Array<{ label: string; count: number; percentage: number }>;
    age_groups: Array<{ label: string; count: number; percentage: number }>;
    regions: Array<{ label: string; count: number; percentage: number }>;
  };
  latest_analysis_timestamp: string;
  pipeline_status: {
    status: string;
    last_cycle_id: string | null;
    records_processed: number;
  };
}

export interface SentimentData {
  summary: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
    positive_percentage: number;
    negative_percentage: number;
    neutral_percentage: number;
  };
  timeline: Array<{
    time_period: string;
    time: string;
    positive_posts: number;
    negative_posts: number;
    neutral_posts: number;
    positive_percentage: number;
    negative_percentage: number;
    neutral_percentage: number;
    average_confidence: number;
  }>;
}

export interface EmotionData {
  summary: Array<{
    emotion: string;
    value: number;
    count: number;
    percentage: number;
  }>;
  timeline: Array<{
    time_period: string;
    emotion: string;
    post_count: number;
    percentage: number;
    average_confidence: number;
  }>;
}

export interface NetworkData {
  nodes: Array<{
    id: string;
    user_id: string;
    username: string;
    label: string;
    activity: number;
    connections: number;
    degree: number;
    followers: number;
    followers_count: number;
    verified: boolean;
    x: number;
    y: number;
    z: number;
    pagerank: number;
    betweenness: number;
    activity_ratio: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    source_user_id: string;
    target_user_id: string;
    weight: number;
    interaction_type: string;
  }>;
  events: Array<{
    event_id: number;
    source: string;
    target: string;
    interaction_type: string;
    timestamp: string;
    simulation_bin: number;
    post_id: string;
  }>;
  simulation: {
    duration_seconds: number;
    bin_seconds: number;
    frame_count: number;
    source_timestamps_available: boolean;
  };
}

export interface PostSearchResponse {
  items: Array<{
    id: number;
    post_id: string;
    user_id: string;
    username: string;
    text: string;
    timestamp: string;
    hashtags: string[];
    mentions: string[];
    like_count: number;
    reply_count: number;
    retweet_count: number;
    quote_count: number;
    bookmark_count: number;
    impressions: number;
    followers_count: number;
    following_count: number;
    verified: boolean;
    bio: string;
    location: string;
    language: string;
    sentiment: string;
    sentiment_confidence: number;
    emotion: string;
    emotion_confidence: number;
    emotion_source: string;
    topic: string;
    topic_probability: number;
    gender: string;
    age_group: string;
    region: string;
  }>;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PipelineStatus {
  status: string;
  message: string;
  last_ingestion: string;
  next_refresh: string;
  records_processed: number;
  analytics_updated: string;
  new_analysis_ready: boolean;
  current_cycle_id: string | null;
  last_completed_cycle: string | null;
  new_records_processed: number;
  logical_window_index: number;
  demo_mode: boolean;
  health_index: number;
  active_platforms: string[];
  platform_records: Record<string, number>;
}

export const apiService = {
  getAnalytics: async (params?: { date_from?: string; date_to?: string; topic?: string }): Promise<AnalyticsOverview> => {
    const query = new URLSearchParams();
    if (params?.date_from) query.append('date_from', params.date_from);
    if (params?.date_to) query.append('date_to', params.date_to);
    if (params?.topic) query.append('topic', params.topic);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<AnalyticsOverview>(`${API_BASE}/x/analytics${qs}`);
  },

  getSentiment: async (params?: { date_from?: string; date_to?: string }): Promise<SentimentData> => {
    const query = new URLSearchParams();
    if (params?.date_from) query.append('date_from', params.date_from);
    if (params?.date_to) query.append('date_to', params.date_to);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<SentimentData>(`${API_BASE}/x/sentiment${qs}`);
  },

  getEmotions: async (params?: { date_from?: string; date_to?: string; emotion?: string }): Promise<EmotionData> => {
    const query = new URLSearchParams();
    if (params?.date_from) query.append('date_from', params.date_from);
    if (params?.date_to) query.append('date_to', params.date_to);
    if (params?.emotion) query.append('emotion', params.emotion);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<EmotionData>(`${API_BASE}/x/emotions${qs}`);
  },

  getDemographics: async (params?: { date_from?: string; date_to?: string; topic?: string }) => {
    const query = new URLSearchParams();
    if (params?.date_from) query.append('date_from', params.date_from);
    if (params?.date_to) query.append('date_to', params.date_to);
    if (params?.topic) query.append('topic', params.topic);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson(`${API_BASE}/x/demographics${qs}`);
  },

  getHashtags: async (params?: { limit?: number; start_date?: string; end_date?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    if (params?.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson(`${API_BASE}/x/hashtags${qs}`);
  },

  getHashtagDetail: async (hashtag: string, params?: { start_date?: string; end_date?: string }) => {
    const cleanTag = encodeURIComponent(hashtag.replace(/^#/, ''));
    const query = new URLSearchParams();
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson(`${API_BASE}/x/hashtags/${cleanTag}${qs}`);
  },

  getNetwork: async (params?: { max_nodes?: number; start_date?: string; end_date?: string }): Promise<NetworkData> => {
    const query = new URLSearchParams();
    if (params?.max_nodes) query.append('max_nodes', params.max_nodes.toString());
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<NetworkData>(`${API_BASE}/x/network${qs}`);
  },

  getPosts: async (params?: {
    keyword?: string;
    hashtag?: string;
    date_from?: string;
    date_to?: string;
    sentiment?: string;
    emotion?: string;
    topic?: string;
    gender?: string;
    age_group?: string;
    region?: string;
    page?: number;
    page_size?: number;
  }): Promise<PostSearchResponse> => {
    const query = new URLSearchParams();
    if (params?.keyword) query.append('keyword', params.keyword);
    if (params?.hashtag) query.append('hashtag', params.hashtag);
    if (params?.date_from) query.append('date_from', params.date_from);
    if (params?.date_to) query.append('date_to', params.date_to);
    if (params?.sentiment) query.append('sentiment', params.sentiment);
    if (params?.emotion) query.append('emotion', params.emotion);
    if (params?.topic) query.append('topic', params.topic);
    if (params?.gender) query.append('gender', params.gender);
    if (params?.age_group) query.append('age_group', params.age_group);
    if (params?.region) query.append('region', params.region);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.page_size) query.append('page_size', params.page_size.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<PostSearchResponse>(`${API_BASE}/x/posts${qs}`);
  },

  getPipelineStatus: async (): Promise<PipelineStatus> => {
    return fetchJson<PipelineStatus>(`${API_BASE}/pipeline/status`);
  },

  ackRefresh: async () => {
    return fetchJson(`${API_BASE}/pipeline/ack-refresh`, { method: 'POST' });
  },

  triggerIngestion: async () => {
    return fetchJson(`${API_BASE}/pipeline/trigger`, { method: 'POST' });
  },
};
