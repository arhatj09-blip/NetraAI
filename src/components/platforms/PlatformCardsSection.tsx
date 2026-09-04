import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Send } from 'lucide-react';
import { PlatformCard } from './PlatformCard';
import { apiService } from '../../services/apiService';

export const PlatformCardsSection: React.FC = () => {
  const navigate = useNavigate();
  const [xStats, setXStats] = useState({
    totalPosts: '15.0K',
    positivePct: '60.8%',
  });

  useEffect(() => {
    let isMounted = true;
    apiService.getAnalytics()
      .then((data) => {
        if (isMounted && data) {
          const totalStr = data.total_posts >= 1000 ? `${(data.total_posts / 1000).toFixed(1)}K` : `${data.total_posts}`;
          const posPctStr = `${data.sentiment_distribution.positive_pct.toFixed(1)}%`;
          setXStats({
            totalPosts: totalStr,
            positivePct: posPctStr,
          });
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handlePlatformClick = (platform: string) => {
    navigate(`/dashboard/analysis/${platform.toLowerCase()}`);
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
          Deep dive into platform-specific insights and sentiment analysis across X (Twitter) and social media platforms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* X (Twitter) Card */}
        <PlatformCard
          platform="X"
          icon={<MessageCircle className="w-7 h-7 text-white" />}
          title="X (Twitter)"
          description="Near-real-time simulated sentiment tracking and trending topic analysis from X platform"
          stats={[
            { label: 'Active Signals', value: xStats.totalPosts },
            { label: 'Positive Ratio', value: xStats.positivePct },
            { label: 'Trend Engine', value: 'Simulated 15m' },
          ]}
          accentColor="bg-gradient-to-br from-blue-500 to-blue-600"
          onClick={() => handlePlatformClick('X')}
        />

        {/* Social Media Feeds Card */}
        <PlatformCard
          platform="Social"
          icon={<Users className="w-7 h-7 text-white" />}
          title="Social Media Feeds"
          description="Prototype Preview — Discussion vector analysis and community sentiment monitoring"
          stats={[
            { label: 'Platform Status', value: 'Preview' },
            { label: 'Avg Sentiment', value: '+58.0%' },
            { label: 'Sample Nodes', value: '112 Channels' },
          ]}
          accentColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
          onClick={() => handlePlatformClick('Social')}
        />

        {/* Telegram Card */}
        <PlatformCard
          platform="Telegram"
          icon={<Send className="w-7 h-7 text-white" />}
          title="Telegram"
          description="Future Platform Integration — Channel analysis and alpha signal detection preview"
          stats={[
            { label: 'Platform Status', value: 'Preview' },
            { label: 'Avg Sentiment', value: '+81.4%' },
            { label: 'Sample Channels', value: '50 Groups' },
          ]}
          accentColor="bg-gradient-to-br from-cyan-500 to-cyan-600"
          onClick={() => handlePlatformClick('Telegram')}
        />

      </div>
    </section>
  );
};
