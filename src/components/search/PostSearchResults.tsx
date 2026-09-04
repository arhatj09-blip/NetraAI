import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, MessageSquare, Heart, Repeat } from 'lucide-react';
import { apiService, PostSearchResponse } from '../../services/apiService';

interface PostSearchResultsProps {
  initialKeyword?: string;
}

export const PostSearchResults: React.FC<PostSearchResultsProps> = ({ initialKeyword = '' }) => {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [sentiment, setSentiment] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PostSearchResponse | null>(null);

  const fetchPosts = () => {
    setLoading(true);
    setError(null);
    apiService.getPosts({
      keyword: keyword.trim() || undefined,
      sentiment: sentiment || undefined,
      topic: topic || undefined,
      page,
      page_size: pageSize,
    })
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch posts');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, [page, sentiment, topic]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const getSentimentBadge = (sent?: string) => {
    switch (sent?.toLowerCase()) {
      case 'positive':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'negative':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div id="posts-search-results" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mt-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Indexed X Post Search &amp; Explorer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fast MySQL search over 15,000 processed X posts with NLP sentiment &amp; emotion annotations
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sentiment}
            onChange={(e) => { setSentiment(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 outline-none"
          >
            <option value="">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
          </select>

          <select
            value={topic}
            onChange={(e) => { setTopic(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 outline-none"
          >
            <option value="">All Topics</option>
            <option value="Technology">Technology</option>
            <option value="Politics">Politics</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Crypto">Crypto</option>
            <option value="Sports">Sports</option>
          </select>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 flex items-center bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search post text, hashtags or usernames..."
            className="w-full bg-transparent outline-none text-xs sm:text-sm text-slate-900 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
        >
          Search
        </button>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
          Searching X database...
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="py-6 text-center text-red-500 dark:text-red-400 text-xs font-semibold bg-red-50 dark:bg-red-900/20 rounded-xl">
          {error}
        </div>
      )}

      {/* Results list */}
      {!loading && !error && data && (
        <>
          <div className="space-y-3 mb-6">
            {data.items.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No matching posts found in MySQL database.
              </div>
            ) : (
              data.items.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        {post.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        @{post.username}
                      </span>
                      {post.verified && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-blue-500 text-white font-bold rounded-full">✓</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mb-3 leading-relaxed">
                    {post.text}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${getSentimentBadge(post.sentiment)}`}>
                        {post.sentiment}
                      </span>
                      {post.emotion && (
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          {post.emotion}
                        </span>
                      )}
                      {post.topic && (
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {post.topic}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        {post.like_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat className="w-3.5 h-3.5 text-blue-500" />
                        {post.retweet_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                        {post.reply_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing page <strong className="text-slate-900 dark:text-white">{data.page}</strong> of <strong className="text-slate-900 dark:text-white">{data.total_pages}</strong> ({data.total.toLocaleString()} total posts)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page >= data.total_pages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
