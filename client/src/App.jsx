import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import PageContainer from './components/layout/PageContainer';

import CommandCenter from './pages/CommandCenter';
import NearbyWells from './pages/NearbyWells';
import WellExplorer from './pages/WellExplorer';
import AiSearch from './pages/AiSearch';
import RiskMonitor from './pages/RiskMonitor';
import EventTimeline from './pages/EventTimeline';
import { NwisProvider } from './context/NwisContext';
import { validateNwisData } from './services/dataValidationService';

function AppContent() {
  const [activeTab, setActiveTab] = useState('command-center');
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Validate NWIS Data once on mount
    validateNwisData();
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const navigateToTab = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'command-center':
        return <CommandCenter setActiveTab={navigateToTab} />;
      case 'nearby-wells':
        return <NearbyWells setActiveTab={navigateToTab} />;
      case 'well-explorer':
        return <WellExplorer setActiveTab={navigateToTab} />;
      case 'ai-search':
        return <AiSearch setActiveTab={navigateToTab} />;
      case 'risk-monitor':
        return <RiskMonitor setActiveTab={navigateToTab} />;
      case 'event-timeline':
        return <EventTimeline setActiveTab={navigateToTab} />;
      default:
        return <CommandCenter setActiveTab={navigateToTab} />;
    }
  };

  return (
    <NwisProvider navigateToTab={navigateToTab} initialTheme={isDarkMode ? 'dark' : 'light'}>
      <div className="flex h-screen w-screen overflow-hidden font-sans text-gray-900 dark:text-gray-100 bg-white dark:bg-[#121212] transition-colors duration-200">
        <Sidebar activeTab={activeTab} setActiveTab={navigateToTab} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          <PageContainer>
            {renderContent()}
          </PageContainer>
        </div>
      </div>
    </NwisProvider>
  );
}

export default AppContent;
