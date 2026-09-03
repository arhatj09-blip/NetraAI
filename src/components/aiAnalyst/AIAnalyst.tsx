import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AIAnalystTrigger } from './AIAnalystTrigger';
import { AIAnalystDrawer } from './AIAnalystDrawer';
import { AIAnalystHeader } from './AIAnalystHeader';
import { AIAnalystContextChips } from './AIAnalystContextChips';
import { AIAnalystSuggestions } from './AIAnalystSuggestions';
import { AIAnalystMessage } from './AIAnalystMessage';
import { AIAnalystInput } from './AIAnalystInput';
import { AIAnalystContext, AIAnalystChatMessage, AIActionChip } from '../../types/aiAnalyst';
import { generateContextualAIResponse } from '../../services/aiAnalystService';

interface AIAnalystProps {
  platform: string;
  context?: AIAnalystContext;
  onActionClick?: (action: AIActionChip) => void;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({
  platform = 'x',
  context,
  onActionClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [messages, setMessages] = useState<AIAnalystChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Smooth open transition
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    // Double rAF: ensures DOM is mounted before CSS transition kicks in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    });
  }, []);

  // Smooth close: reverse animation, then unmount after 220ms
  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 220);
  }, []);

  // Toggle: clicking trigger while popup is open should close it
  const handleToggle = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [isOpen, handleOpen, handleClose]);

  // Auto-scroll chat to latest message
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  // Send message
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    setError(null);
    setLastQuery(query);

    const userMsg: AIAnalystChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Simulate AI Analyst response with brief delay (800ms)
    setIsLoading(true);
    setTimeout(() => {
      try {
        const aiResponse = generateContextualAIResponse(query, context);
        setMessages((prev) => [...prev, aiResponse]);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setError('AI Analyst is temporarily unavailable.');
      }
    }, 850);
  };

  // Reset conversation
  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  // Default action click handler: if scroll_section, smooth scroll to element
  const handleInternalActionClick = (action: AIActionChip) => {
    if (action.actionType === 'scroll_section' && action.target) {
      const targetElement = document.getElementById(action.target);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Optional subtle highlight
        targetElement.classList.add('ring-2', 'ring-blue-500/50');
        setTimeout(() => {
          targetElement.classList.remove('ring-2', 'ring-blue-500/50');
        }, 2000);
      }
    }
    onActionClick?.(action);
  };

  return (
    <>
      {/* 1. Floating Trigger Button — toggle open/close */}
      <AIAnalystTrigger
        isOpen={isOpen}
        onClick={handleToggle}
        platform={platform}
        hasActiveContext={!!context?.hashtag}
      />

      {/* 2. Slide-in Contextual Assistant Drawer */}
      <AIAnalystDrawer
        isOpen={isOpen}
        isAnimating={isAnimating}
        onClose={handleClose}
      >
        {/* Header */}
        <AIAnalystHeader
          onClose={handleClose}
          onClear={handleClear}
          hasMessages={messages.length > 0}
        />

        {/* Dynamic Context Chips */}
        <AIAnalystContextChips context={context} />

        {/* Scrollable Conversation / Empty Suggestions Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar bg-slate-50/40 dark:bg-transparent">
          {messages.length === 0 ? (
            <AIAnalystSuggestions
              onSelectSuggestion={handleSendMessage}
              platform={platform}
              hashtag={context?.hashtag}
            />
          ) : (
            <>
              {messages.map((msg) => (
                <AIAnalystMessage
                  key={msg.id}
                  message={msg}
                  onActionClick={handleInternalActionClick}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Fixed Bottom Input */}
        <AIAnalystInput
          inputValue={inputValue}
          onChange={setInputValue}
          onSubmit={handleSendMessage}
          isLoading={isLoading}
          error={error}
          onRetry={() => handleSendMessage(lastQuery)}
          platform={platform}
        />
      </AIAnalystDrawer>
    </>
  );
};
