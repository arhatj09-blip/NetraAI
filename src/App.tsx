import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { usePipelineCountdown } from './hooks/usePipelineCountdown';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { AnalysisResults } from './pages/AnalysisResults';
import { SettingsModal } from './components/modals/SettingsModal';
import { GenerateReportModal } from './components/modals/GenerateReportModal';

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { lastSync, nextSync } = usePipelineCountdown(522);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        {/* Top Navigation Header */}
        <Header
          theme={theme}
          onThemeToggle={toggleTheme}
          lastSync={lastSync}
          nextSync={nextSync}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis/:platform" element={<AnalysisResults />} />
          <Route path="/analysis/:platform/:query" element={<AnalysisResults />} />
        </Routes>

        {/* Page Footer */}
        <Footer />

        {/* Modals */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          onThemeToggle={toggleTheme}
        />

        <GenerateReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      </div>
    </Router>
  );
};

export default App;
