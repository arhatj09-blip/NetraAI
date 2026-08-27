import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, Paperclip } from 'lucide-react';
import { ChatMessage } from '../../types/intelligence';
import { initialChatMessages } from '../../services/mockData';
import { generateAIResponse } from '../../services/aiAnalystService';
import { MiniChatChart } from './MiniChatChart';

interface AIAnalystChatProps {
  isDark: boolean;
}

export const AIAnalystChat: React.FC<AIAnalystChatProps> = ({ isDark }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Simulate AI Analyst response with brief delay
    setIsTyping(true);
    setTimeout(() => {
      const aiReply = generateAIResponse(text);
      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 800);
  };

  const suggestedQueries = [
    'Why did sentiment increase?',
    'What is trending right now?',
    'Which platform has strongest sentiment?',
    'Who are top influencers?',
    'How did conversation change?',
  ];

  return (
    <section id="ai-chat" className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            NetraAI Analyst
          </h2>
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
            Conversational Social Signal Processing &amp; Insight Synthesis
          </p>
        </div>
      </div>

      <div className="card-base rounded-[2.5rem] h-[750px] flex flex-col relative overflow-hidden transition-colors">
        {/* Suggested Queries Pill Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 shrink-0">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {suggestedQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(query)}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
              >
                {query}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} msg-in`}
            >
              {msg.sender === 'user' ? (
                <div className="max-w-[85%] sm:max-w-[70%] bg-blue-600 text-white p-4 sm:p-5 rounded-3xl rounded-tr-none shadow-md space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-blue-100 mb-1">
                    <User className="w-3 h-3" /> You • {msg.timestamp}
                  </div>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              ) : (
                <div className="max-w-[90%] sm:max-w-[80%] bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl rounded-tl-none border border-slate-200 dark:border-slate-700/80 border-l-4 border-l-blue-500 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        NETRAAI ANALYST
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mono">{msg.timestamp}</span>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {msg.text}
                  </p>

                  {/* Embedded Chart Attachment */}
                  {msg.chartType && (
                    <MiniChatChart chartType={msg.chartType} isDark={isDark} />
                  )}

                  {/* Analyst Summary Callout */}
                  {msg.analystSummary && (
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Analyst Summary
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        "{msg.analystSummary}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start msg-in">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-xs text-slate-400 ml-2 font-medium">Analyst Synthesizing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-6 bg-slate-50/90 dark:bg-slate-900/70 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 pl-4 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about trends, sentiment shifts, or network dynamics..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 py-2"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Attach context document"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSendMessage()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-center text-[9px] text-slate-400 mt-2 uppercase tracking-[0.2em] font-bold">
            Agent Node NetraAI-4 • Multi-Model Social Signal NLP
          </p>
        </div>
      </div>
    </section>
  );
};
