import { ChatMessage } from '../types/intelligence';

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
      analystSummary: 'Breakout vector detected in enterprise autonomous agents discussions across X and Reddit.',
    };
  }

  if (queryLower.includes('platform') || queryLower.includes('strongest') || queryLower.includes('compare')) {
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: 'Telegram currently exhibits the highest net positive sentiment (88%), followed by X at 68%. Reddit maintains a more analytical and skeptical discourse at 42% positivity with 32% neutral debate.',
      timestamp,
      chartType: 'platform-variance',
      analystSummary: 'Cross-platform variance index is 46 points, showing significant divergence between retail/dev communities and formal technical forums.',
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

  // Default response
  return {
    id: `ai-${Date.now()}`,
    sender: 'ai',
    text: `I analyzed our 274,392 active records regarding "${userQuery}". The cross-platform signal indicates high engagement (5.2%) with strong positive momentum across primary nodes.`,
    timestamp,
    chartType: 'sentiment-donut',
    analystSummary: 'Real-time telemetry and multi-layer vector embeddings confirm steady signal propagation without anomalous dissonance.',
  };
};
