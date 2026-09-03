import { ChatMessage } from '../types/intelligence';
import { AIAnalystContext, AIAnalystChatMessage, AnalyticalMetric, AIActionChip } from '../types/aiAnalyst';

// =========================================================================
// FUTURE BACKEND INTEGRATION HOOK:
// When the backend LLM endpoint is ready, connect here:
//
// export const fetchBackendAIResponse = async (
//   query: string,
//   context?: AIAnalystContext
// ): Promise<AIAnalystChatMessage> => {
//   const response = await fetch('/api/ai/chat', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       message: query,
//       platform: context?.platform || 'x',
//       hashtag: context?.hashtag,
//       start_date: context?.startDate,
//       end_date: context?.endDate,
//       section: context?.section,
//     }),
//   });
//   if (!response.ok) throw new Error('AI Analyst temporarily unavailable');
//   return response.json();
// };
// =========================================================================

/**
 * Generates an analytical response for the contextual AI Analyst drawer.
 * Simulates intelligent synthesis grounded in the user's active dashboard context.
 */
export const generateContextualAIResponse = (
  userQuery: string,
  context?: AIAnalystContext
): AIAnalystChatMessage => {
  const q = userQuery.toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const platformName = (context?.platform || 'x').toUpperCase();
  const targetTag = context?.hashtag || '#AI';
  const dateSpan = context?.startDate && context?.endDate
    ? `${context.startDate} to ${context.endDate}`
    : 'selected observation period';

  // 1. WHY IS TREND RISING / VELOCITY
  if (q.includes('rising') || q.includes('trend') || q.includes('growth') || q.includes('velocity')) {
    const metrics: AnalyticalMetric[] = [
      { label: 'Growth Velocity', value: '+340%', subtext: 'vs last 24h', trend: 'up', color: 'emerald' },
      { label: 'Signal Volume', value: '18.4K', subtext: 'mentions', trend: 'up', color: 'blue' },
      { label: 'Engagement Rate', value: '6.4%', subtext: 'organic peak', trend: 'up', color: 'purple' },
    ];
    const bulletPoints = [
      `Viral repost cascade anchored by 4 high-authority engineering opinion leader nodes on ${platformName}.`,
      `Sudden influx of synthetic benchmark comparisons and repository releases across the developer community.`,
      `Zero coordinated bot anomalies detected; volume is authentic community engagement.`,
    ];
    const actionChips: AIActionChip[] = [
      { id: 'view-trends', label: 'View Hashtag Trends', actionType: 'scroll_section', target: 'rising-hashtags' },
      { id: 'view-network', label: 'Explore Interaction Network', actionType: 'scroll_section', target: 'network-canvas' },
    ];

    return {
      id: `ai-ctx-${Date.now()}`,
      sender: 'ai',
      timestamp,
      text: `${targetTag} is experiencing exponential velocity on ${platformName} across ${dateSpan}. Post density spiked following open-source deployment announcements and cross-platform referencing.`,
      metrics,
      bulletPoints,
      actionChips,
      summaryQuote: `Signal propagation model confirms authentic virality with high repost-to-reply ratio (4.2:1).`,
      contextSnapshot: context,
    };
  }

  // 2. SENTIMENT DRIVERS
  if (q.includes('sentiment') || q.includes('positive') || q.includes('negative') || q.includes('driving')) {
    const metrics: AnalyticalMetric[] = [
      { label: 'Positive', value: '58%', subtext: 'High enthusiasm', trend: 'up', color: 'emerald' },
      { label: 'Neutral', value: '27%', subtext: 'Technical inquiries', trend: 'neutral', color: 'blue' },
      { label: 'Negative', value: '15%', subtext: 'Latency/Cost concerns', trend: 'down', color: 'amber' },
    ];
    const bulletPoints = [
      `Developer excitement around autonomous pipeline workflows drives the 58% positive baseline.`,
      `Technical debate accounts for 27% neutral inquiries regarding context window limits and infrastructure pricing.`,
      `Low polarization index (0.18), indicating cohesive community reception without regulatory friction.`,
    ];
    const actionChips: AIActionChip[] = [
      { id: 'view-sentiment', label: 'View Sentiment Spectrum', actionType: 'scroll_section', target: 'sentiment-analytics' },
      { id: 'view-demographics', label: 'Inspect Demographics', actionType: 'scroll_section', target: 'demographics-panel' },
    ];

    return {
      id: `ai-ctx-${Date.now()}`,
      sender: 'ai',
      timestamp,
      text: `Sentiment is predominantly positive across ${targetTag} on ${platformName}. The sentiment trajectory reflects strong organic developer confidence over the ${dateSpan} window.`,
      metrics,
      bulletPoints,
      actionChips,
      summaryQuote: `Net Sentiment Index is +43 points above the 30-day cross-platform baseline.`,
      contextSnapshot: context,
    };
  }

  // 3. EMOTION PULSE
  if (q.includes('emotion') || q.includes('feeling') || q.includes('pulse')) {
    const metrics: AnalyticalMetric[] = [
      { label: 'Excitement', value: '62%', subtext: 'Primary impulse', trend: 'up', color: 'emerald' },
      { label: 'Curiosity', value: '24%', subtext: 'Architecture questions', trend: 'neutral', color: 'blue' },
      { label: 'Concern', value: '14%', subtext: 'Safety/Reliability', trend: 'down', color: 'amber' },
    ];
    const bulletPoints = [
      `Excitement dominates discussions concerning agentic autonomous reasoning and multimodal workflows.`,
      `Curiosity manifests in code snippets, benchmarks, and community tutorials.`,
      `Negative emotions (Fear, Anger, Sadness) remain subdued below 10% combined threshold.`,
    ];
    const actionChips: AIActionChip[] = [
      { id: 'view-emotion', label: 'View Emotional Pulse', actionType: 'scroll_section', target: 'emotion-analytics' },
    ];

    return {
      id: `ai-ctx-${Date.now()}`,
      sender: 'ai',
      timestamp,
      text: `Emotional pulse analysis on ${platformName} reveals high optimism and curiosity for ${targetTag}. Emotional vectors indicate healthy technical adoption rather than speculative hype.`,
      metrics,
      bulletPoints,
      actionChips,
      summaryQuote: `Emotional cohesion score is 87/100, showing sustained creative enthusiasm.`,
      contextSnapshot: context,
    };
  }

  // 4. AUDIENCE / DEMOGRAPHICS / REGION
  if (q.includes('audience') || q.includes('segment') || q.includes('region') || q.includes('who')) {
    const metrics: AnalyticalMetric[] = [
      { label: 'Primary Cohort', value: '64%', subtext: 'Software / IT / AI Dev', trend: 'up', color: 'blue' },
      { label: 'Top Age Group', value: '52%', subtext: '25–34 Professionals', trend: 'neutral', color: 'purple' },
      { label: 'Top Region', value: '41%', subtext: 'North America / EU', trend: 'neutral', color: 'emerald' },
    ];
    const bulletPoints = [
      `Tech practitioners and enterprise engineers represent the majority of active commentators.`,
      `Academic researchers and students comprise a secondary 22% demographic bracket.`,
      `Dominant opinion leader nodes: @TechGuruX (98.4 Influence) and @DataVoyager (92.1 Influence).`,
    ];
    const actionChips: AIActionChip[] = [
      { id: 'view-demographics', label: 'View Demographic Breakdown', actionType: 'scroll_section', target: 'demographics-panel' },
      { id: 'view-network', label: 'View Influencer Nodes', actionType: 'scroll_section', target: 'network-canvas' },
    ];

    return {
      id: `ai-ctx-${Date.now()}`,
      sender: 'ai',
      timestamp,
      text: `The active audience for ${targetTag} on ${platformName} is heavily weighted toward senior engineers, AI builders, and data practitioners active between ${dateSpan}.`,
      metrics,
      bulletPoints,
      actionChips,
      summaryQuote: `Demographic clustering reveals an authoritative, high-expertise conversational core.`,
      contextSnapshot: context,
    };
  }

  // 5. SUMMARY / KEY INSIGHTS
  if (q.includes('summarize') || q.includes('summary') || q.includes('key insights') || q.includes('overview')) {
    const metrics: AnalyticalMetric[] = [
      { label: 'Overall Health', value: '94/100', subtext: 'High vitality', trend: 'up', color: 'emerald' },
      { label: 'Posts Sampled', value: '124.4K', subtext: 'Verified records', trend: 'up', color: 'blue' },
      { label: 'Influence Index', value: '92.4', subtext: 'High reach', trend: 'up', color: 'purple' },
    ];
    const bulletPoints = [
      `Consistent upward volume trend with +242 new posts/hour during peak UTC hours.`,
      `Strong developer satisfaction with 58% positive sentiment and low controversy markers.`,
      `Core network centralization around verified nodes with wide re-propagation rings.`,
    ];
    const actionChips: AIActionChip[] = [
      { id: 'view-metrics', label: 'Review Key Metrics', actionType: 'scroll_section', target: 'key-platform-metrics' },
      { id: 'view-trends', label: 'Inspect Rising Trends', actionType: 'scroll_section', target: 'rising-hashtags' },
    ];

    return {
      id: `ai-ctx-${Date.now()}`,
      sender: 'ai',
      timestamp,
      text: `Executive summary for ${platformName} (${targetTag}, ${dateSpan}): Signals show exceptional engagement momentum, constructive technical discourse, and minimal narrative fragmentation.`,
      metrics,
      bulletPoints,
      actionChips,
      summaryQuote: `Key Takeaway: ${targetTag} has evolved from an emerging topic into an anchor conversation vector for ${platformName}.`,
      contextSnapshot: context,
    };
  }

  // DEFAULT CONTEXTUAL FALLBACK
  const defaultMetrics: AnalyticalMetric[] = [
    { label: 'Signal Confidence', value: '89%', subtext: 'Telemetric certainty', trend: 'up', color: 'emerald' },
    { label: 'Active Signals', value: '274.3K', subtext: 'Cross-indexed', trend: 'neutral', color: 'blue' },
  ];
  return {
    id: `ai-ctx-${Date.now()}`,
    sender: 'ai',
    timestamp,
    text: `Based on current telemetry for ${targetTag} on ${platformName} during ${dateSpan}, conversation density is high with stable engagement velocity across all tracked nodes.`,
    metrics: defaultMetrics,
    bulletPoints: [
      `Context aligned to ${platformName} platform filters and ${dateSpan} window.`,
      `Continuous pipeline synchronization active with zero detected data anomalies.`,
    ],
    actionChips: [
      { id: 'view-trends', label: 'View Hashtags', actionType: 'scroll_section', target: 'rising-hashtags' },
      { id: 'view-network', label: 'View Network', actionType: 'scroll_section', target: 'network-canvas' },
    ],
    summaryQuote: `Multi-layer vector embeddings confirm sustained signal propagation without anomalous dissonance.`,
    contextSnapshot: context,
  };
};

/**
 * Legacy generator preserved for backward compatibility
 */
export const generateAIResponse = (userQuery: string): ChatMessage => {
  const queryLower = userQuery.toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (queryLower.includes('sentiment') || queryLower.includes('increase') || queryLower.includes('why')) {
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: 'Sentiment rose by +8.4% over the last 6 hours, driven by positive developer reactions to open-source agent tooling on X and high optimism in Telegram private alpha groups.',
      timestamp,
      chartType: 'sentiment-donut',
      analystSummary: 'Dominant driver: 78% positive mentions on #AgentDev with low regulatory friction signals in current news cycles.',
    };
  }

  if (queryLower.includes('trend') || queryLower.includes('what is trending')) {
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: 'Top trending topics right now are #AgentDev (+124% velocity), #GPT5Architecture (+82%), and #LLMOps (+112%). Multi-modal agent deployments have generated over 28,000 unified impressions.',
      timestamp,
      chartType: 'topic-bars',
      analystSummary: 'Breakout vector detected in enterprise autonomous agents discussions across X (Twitter) and social media platforms.',
    };
  }

  if (queryLower.includes('platform') || queryLower.includes('strongest') || queryLower.includes('compare')) {
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: 'Telegram currently exhibits the highest net positive sentiment (88%), followed by X at 68%. Social media channels maintain an analytical discourse at 58% positivity with 23% neutral debate.',
      timestamp,
      chartType: 'platform-variance',
      analystSummary: 'Cross-platform variance index is 30 points, showing healthy sentiment distribution across developer channels and public platforms.',
    };
  }

  if (queryLower.includes('influencer') || queryLower.includes('who')) {
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: 'The top 3 key opinion leaders driving the discourse are @TechGuruX (98.4 Influence Score), @DataVoyager (92.1 Influence Score), and @AnalystPro (87.6 Influence Score). Their posts account for 41% of viral re-propagation.',
      timestamp,
      analystSummary: 'Network clustering analysis indicates strong central authority nodes with high cross-platform quotation rates.',
    };
  }

  if (queryLower.includes('emotion') || queryLower.includes('pulse') || queryLower.includes('feeling')) {
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: 'The dominant emotional signal across all platforms is Excitement (84/100) and Curiosity (72/100). Fear and Sadness indices remain below 35/100 baseline levels.',
      timestamp,
      chartType: 'sentiment-timeline',
      analystSummary: 'Market psychology is in high-adoption phase with low systemic FUD vectors.',
    };
  }

  return {
    id: `ai-${Date.now()}`,
    sender: 'ai',
    text: `I analyzed our 274,392 active records regarding "${userQuery}". The cross-platform signal indicates high engagement (5.2%) with strong positive momentum across primary nodes.`,
    timestamp,
    chartType: 'sentiment-donut',
    analystSummary: 'Real-time telemetry and multi-layer vector embeddings confirm steady signal propagation without anomalous dissonance.',
  };
};
