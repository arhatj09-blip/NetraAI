import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { usePipelineCountdown } from './hooks/usePipelineCountdown';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { AnalysisResults } from './pages/AnalysisResults';
import { LandingPage } from './pages/LandingPage';
import { SettingsModal } from './components/modals/SettingsModal';
import { GenerateReportModal } from './components/modals/GenerateReportModal';

const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="page-shell">{children}</div>
);

const AnimatedPage: React.FC<{ children: React.ReactNode; direction: 'forward' | 'backward' }> = ({
  children,
  direction,
}) => (
  <div className={`route-page route-page--${direction}`}>{children}</div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Dashboard shell — Header + Footer + modals wrap the inner dashboard routes.
   Extracted into its own component so the landing page renders completely
   outside this shell without any shared layout.
───────────────────────────────────────────────────────────────────────────── */
const DashboardShell: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { lastSync: _lastSync, nextSync: _nextSync } = usePipelineCountdown(522);
  const [isSettingsOpen, setIsSettingsOpen]   = useState(false);
  const [isReportModalOpen, setIsReportModal] = useState(false);
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const currentPath = location.pathname;
    const previousDepth = previousPath.split('/').filter(Boolean).length;
    const currentDepth = currentPath.split('/').filter(Boolean).length;

    setDirection(currentDepth >= previousDepth ? 'forward' : 'backward');
    previousPathRef.current = currentPath;
  }, [location.pathname]);

  return (
    <PageShell>
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        <Header
          theme={theme}
          onThemeToggle={toggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenReportModal={() => setIsReportModal(true)}
        />

        <AnimatedPage direction={direction}>
          <Routes location={location}>
            {/* Main dashboard — /dashboard */}
            <Route path="/" element={<Home />} />

            {/* Platform analysis — /dashboard/analysis/:platform */}
            <Route path="/analysis/:platform" element={<AnalysisResults />} />

            {/* Platform analysis + search query — /dashboard/analysis/:platform/:query */}
            <Route path="/analysis/:platform/:query" element={<AnalysisResults />} />
          </Routes>
        </AnimatedPage>

        <Footer />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
        <GenerateReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModal(false)}
        />
      </div>
    </PageShell>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Root router — landing page at "/", full dashboard shell at "/dashboard/*"
───────────────────────────────────────────────────────────────────────────── */
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const currentPath = location.pathname;
    const previousDepth = previousPath.split('/').filter(Boolean).length;
    const currentDepth = currentPath.split('/').filter(Boolean).length;

    setDirection(currentDepth >= previousDepth ? 'forward' : 'backward');
    previousPathRef.current = currentPath;
  }, [location.pathname]);

  return (
    <AnimatedPage direction={direction}>
      <Routes location={location}>
        {/* Entry point — landing page, no shared shell */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard — all existing routes nested under /dashboard */}
        <Route path="/dashboard/*" element={<DashboardShell />} />
      </Routes>
    </AnimatedPage>
  );
};

export const App: React.FC = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
