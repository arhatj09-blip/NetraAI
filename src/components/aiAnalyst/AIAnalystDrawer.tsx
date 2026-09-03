import React, { useEffect, useRef } from 'react';

interface AIAnalystDrawerProps {
  isOpen: boolean;
  isAnimating: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const AIAnalystDrawer: React.FC<AIAnalystDrawerProps> = ({
  isOpen,
  isAnimating,
  onClose,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus or manage initial focus
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Analyst Drawer"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Subtle Backdrop - allows dashboard behind to remain visible */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-250 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Right-Side Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pointer-events-none">
        <div
          ref={panelRef}
          tabIndex={-1}
          className={`pointer-events-auto w-screen max-w-full sm:w-[420px] md:w-[440px] h-full
                     bg-slate-900/95 dark:bg-slate-950/95 border-l border-slate-700/60 shadow-2xl
                     backdrop-blur-xl flex flex-col focus:outline-none
                     transition-all duration-250 ease-out will-change-transform ${
                       isAnimating
                         ? 'translate-x-0 opacity-100'
                         : 'translate-x-full opacity-0'
                     }`}
          style={{
            transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
