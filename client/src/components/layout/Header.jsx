import React from 'react';
import { useNwis } from '../../context/NwisContext';

const Header = ({ isDarkMode, toggleTheme }) => {
  const { activeWell, navigateToTab } = useNwis();
  return (
    <header className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-6 flex-shrink-0 transition-colors duration-200">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <div className="font-bold text-black dark:text-white text-lg">NWIS</div>
        <div className="text-gray-400 dark:text-gray-600 text-sm hidden md:block">|</div>
        <div className="text-gray-500 dark:text-gray-400 text-sm hidden md:block">Nearby Wells Intelligence System</div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        
        {/* Quick Actions */}
        <div className="hidden xl:flex items-center gap-2 mr-2">
          <button onClick={() => navigateToTab('ai-search')} className="text-xs font-bold text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">Search Historical Data</button>
          <button onClick={() => navigateToTab('nearby-wells')} className="text-xs font-bold text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">View Nearby Wells</button>
          <button onClick={() => navigateToTab('risk-monitor')} className="text-xs font-bold text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">Risk Monitor</button>
          <button onClick={() => navigateToTab('event-timeline')} className="text-xs font-bold text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">Event Timeline</button>
        </div>

        {/* Active Well Chips */}
        <div className="hidden lg:flex items-center gap-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-sm px-3 py-1.5 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Active Well</span>
            <span className="text-sm font-bold text-black dark:text-white">{activeWell?.id || 'W-051'}</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Depth</span>
            <span className="text-sm font-bold text-black dark:text-white">{(activeWell?.currentDepth || 2380).toLocaleString()} m</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 hidden xl:block"></div>
          <div className="items-center gap-2 hidden xl:flex">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Formation</span>
            <span className="text-sm font-bold text-black dark:text-white">{activeWell?.formation || 'X Formation'}</span>
          </div>
        </div>

        {/* Status */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{activeWell?.status || 'Drilling'}</span>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            title="Switch theme"
            className="text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center justify-center p-1"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
            USR
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
