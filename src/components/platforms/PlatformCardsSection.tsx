import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Send } from 'lucide-react';
import { PlatformCard } from './PlatformCard';

export const PlatformCardsSection: React.FC = () => {
  const navigate = useNavigate();

  const handlePlatformClick = (platform: string) => {
    navigate(`/analysis/${platform.toLowerCase()}`);
  };

  return (
    <section className="w-full">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Platform Intelligence
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
          Social Media Analytics
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Deep dive into platform-specific insights and sentiment analysis across X, Reddit, and Telegram
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* X (Twitter) Card */}
        <PlatformCard
          platform="X"
          icon={<MessageCircle className="w-7 h-7 text-white" />}
          title="X (Twitter)"
          description="Real-time sentiment tracking and trending topic analysis from X platform"
          stats={[
            { label: 'Active Signals', value: '124.4K' },
            { label: 'Avg Sentiment', value: '+68.2%' },
            { label: 'Trend Velocity', value: '↑ 12.4%' },
          ]}
          accentColor="bg-gradient-to-br from-blue-500 to-blue-600"
          onClick={() => handlePlatformClick('X')}
        />

        {/* Reddit Card */}
        <PlatformCard
          platform="Reddit"
          icon={<Users className="w-7 h-7 text-white" />}
          title="Reddit"
          description="Discussion vector analysis and subreddit sentiment monitoring"
          stats={[
            { label: 'Active Signals', value: '87.2K' },
            { label: 'Avg Sentiment', value: '+72.8%' },
            { label: 'Trend Velocity', value: '↑ 8.6%' },
          ]}
          accentColor="bg-gradient-to-br from-orange-500 to-orange-600"
          onClick={() => handlePlatformClick('Reddit')}
        />

        {/* Telegram Card */}
        <PlatformCard
          platform="Telegram"
          icon={<Send className="w-7 h-7 text-white" />}
          title="Telegram"
          description="Encrypted channel analysis and alpha signal detection"
          stats={[
            { label: 'Active Signals', value: '62.8K' },
            { label: 'Avg Sentiment', value: '+81.4%' },
            { label: 'Trend Velocity', value: '↑ 15.2%' },
          ]}
          accentColor="bg-gradient-to-br from-cyan-500 to-cyan-600"
          onClick={() => handlePlatformClick('Telegram')}
        />
      </div>
    </section>
  );
};
