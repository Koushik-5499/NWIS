import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'command-center', label: 'Command Center', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'nearby-wells', label: 'Nearby Wells Intelligence', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { id: 'well-explorer', label: 'Well Explorer', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: 'ai-search', label: 'AI Historical Search', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'risk-monitor', label: 'Risk Monitor', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'event-timeline', label: 'Event Timeline', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 7 0 0118 0z' },
  ];

  return (
    <div className="w-64 bg-black dark:bg-[#0A0A0A] border-r border-transparent dark:border-gray-800 text-white h-screen flex flex-col flex-shrink-0 transition-colors duration-200">
      {/* Sidebar Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold rounded-sm">
            N
          </div>
          <div>
            <div className="font-bold text-lg leading-tight tracking-wide">NWIS</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest leading-tight">Nearby Wells<br/>Intelligence System</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors text-left ${
              activeTab === item.id 
                ? 'bg-white text-black dark:bg-[#1A1A1A] dark:text-white rounded-sm' 
                : 'text-gray-300 hover:text-white hover:bg-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 rounded-sm'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">System Status</div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Operational
        </div>
        <div className="text-[10px] text-gray-500 mt-1">Data: Historical Well Intelligence</div>
      </div>
    </div>
  );
};

export default Sidebar;
