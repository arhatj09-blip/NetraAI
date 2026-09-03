import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

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

  // Set focus when opened
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  // Keep mounted during close animation; unmount only after it finishes
  if (!isOpen && !isAnimating) return null;

  const content = (
    /**
     * COMPACT FLOATING CHAT POPUP — NOT a full-height drawer.
     *
     * Portaled to document.body / modal-root to guarantee true viewport coordinates
     * unaffected by any parent transform/will-change wrappers on route pages.
     *
     * Positioning:
     *   fixed bottom-right, 80px from bottom (clears the trigger pill),
     *   24px from right edge.
     *
     * Dimensions:
     *   width:      420px on desktop, min(420px, calc(100vw - 32px)) on mobile
     *   height:     min(560px, calc(100vh - 110px))  ← guarantees full in-viewport visibility
     *   max-height: calc(100vh - 110px)
     *   min-height: 360px
     *
     * NO backdrop. NO inset-0. NO full-viewport overlay.
     * Dashboard remains fully visible and interactive behind the popup.
     */
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label="AI Analyst"
      tabIndex={-1}
      onClick={(e) => e.stopPropagation()}
      className={`
        fixed z-50 flex flex-col
        bg-white/98 dark:bg-[#0c0e14]/97
        border border-slate-200/90 dark:border-slate-700/60
        rounded-2xl
        backdrop-blur-2xl
        overflow-hidden
        focus:outline-none
        will-change-transform
        ${isAnimating ? 'pointer-events-auto' : 'pointer-events-none'}
      `}
      style={{
        /* Position — floats above the trigger button at bottom-right of viewport */
        bottom: '80px',
        right: '24px',
        /* Width — responsive */
        width: 'min(420px, calc(100vw - 32px))',
        /* Height — constrained to comfortably fit viewport at all desktop & laptop sizes (1366x768, etc.) */
        height: 'min(560px, calc(100vh - 110px))',
        maxHeight: 'calc(100vh - 110px)',
        minHeight: '360px',
        /* GPU-composited animation: scale + fade */
        transform: isAnimating ? 'translateY(0px) scale(1)' : 'translateY(16px) scale(0.96)',
        opacity: isAnimating ? 1 : 0,
        transition: 'transform 215ms cubic-bezier(0.16, 1, 0.3, 1), opacity 215ms ease-out',
        /* Adaptive theme shadow */
        boxShadow: 'var(--ai-popup-shadow)',
      }}
    >
      {children}
    </div>
  );

  const mountTarget = document.getElementById('modal-root') ?? document.body;
  return createPortal(content, mountTarget);
};
