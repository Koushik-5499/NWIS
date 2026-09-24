import React, { useState } from 'react';
import GoogleWellMap from '../components/wells/GoogleWellMap';
import { useNwis } from '../context/NwisContext';
import { getNearbyWells, getWellById, getRiskFactors, getEvidenceForEvent } from '../services/nwisDataService';
import { EvidenceModal } from '../components/common/EvidenceModal';

const CommandCenter = ({ setActiveTab }) => {
  const { activeWell, navigateToTab, navigateToWell, setSelectedRisk } = useNwis();
  const historicalWells = getNearbyWells();
  const riskFactors = getRiskFactors();
  
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const handleOpenEvidence = (eventId) => {
    const evidence = getEvidenceForEvent(eventId);
    if (evidence) {
      // Create a mock event object for the modal
      setSelectedEvidence({ document: evidence, event: { id: eventId, wellId: evidence.wellId, depth: evidence.depth, formation: evidence.formation, eventType: evidence.eventType } });
      setEvidenceModalOpen(true);
    }
  };

  const handleRiskClick = (riskId, riskName, score) => {
    setSelectedRisk({ id: `risk-${riskId.replace('-', '')}`, name: riskName, score });
    navigateToTab('risk-monitor');
  };

  // Canonical approaching risk info
  const approachingRisk = riskFactors.find(r => r.id === 'mud-loss');

  return (
    <div className="space-y-6 h-full flex flex-col overflow-y-auto hide-scrollbar pb-10">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-black dark:text-white">Engineering Intelligence Summary</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Historical drilling records from nearby wells indicate elevated historical-pattern risk around the current drilling interval.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          
          {/* Current Drilling Context */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-4 flex flex-wrap gap-6 items-center">
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Active Well</div>
              <div className="text-lg font-bold text-black dark:text-white">{activeWell.id}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Depth</div>
              <div className="text-lg font-bold text-black dark:text-white">{activeWell.currentDepth.toLocaleString()} m</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Formation</div>
              <div className="text-lg font-bold text-black dark:text-white">{activeWell.formation}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Status</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-500">{activeWell.status}</div>
            </div>
            <div className="border-l border-gray-200 dark:border-gray-700 pl-6">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Nearest Historical Risk</div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{approachingRisk?.name}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Risk Zone</div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{approachingRisk?.depthRange[0]}–{approachingRisk?.depthRange[1]} m</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Distance</div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{approachingRisk ? approachingRisk.nearestDepth - activeWell.currentDepth : 0} m ahead</div>
            </div>
          </div>

          {/* Approaching Historical Risk Alert */}
          {approachingRisk && (
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-orange-900 dark:text-orange-400 mb-1">Approaching Historical {approachingRisk.name} Zone</h3>
                  <p className="text-sm text-orange-800 dark:text-orange-300 mb-3">Current depth: {activeWell.currentDepth} m • Zone: {approachingRisk.depthRange[0]}–{approachingRisk.depthRange[1]} m • Distance: {approachingRisk.nearestDepth - activeWell.currentDepth} m</p>
                  <div className="text-xs font-bold text-orange-700 dark:text-orange-500 uppercase tracking-wider mb-2">Supporting Historical Wells</div>
                  <div className="flex gap-2">
                    {approachingRisk.supportingWells.map(w => (
                      <span key={w} className="px-2 py-1 bg-white dark:bg-[#1A1A1A] border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-400 text-xs font-bold rounded">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleRiskClick(approachingRisk.id, approachingRisk.name, approachingRisk.indicator)} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded transition-colors whitespace-nowrap text-center">
                    View Risk Analysis
                  </button>
                  <button onClick={() => handleOpenEvidence('evt-w042-ml-2410')} className="px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-orange-300 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-800 dark:text-orange-400 text-sm font-bold rounded transition-colors whitespace-nowrap text-center">
                    View Historical Evidence
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Historical Pattern Summary */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Historical Patterns</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {riskFactors.map(p => {
                const color = p.indicator >= 81 ? 'text-red-600 dark:text-red-400' : p.indicator >= 61 ? 'text-orange-600 dark:text-orange-400' : p.indicator >= 31 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400';
                const bg = p.indicator >= 81 ? 'bg-red-50 dark:bg-red-900/10' : p.indicator >= 61 ? 'bg-orange-50 dark:bg-orange-900/10' : p.indicator >= 31 ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-green-50 dark:bg-green-900/10';
                const border = p.indicator >= 81 ? 'border-red-200 dark:border-red-900/30' : p.indicator >= 61 ? 'border-orange-200 dark:border-orange-900/30' : p.indicator >= 31 ? 'border-amber-200 dark:border-amber-900/30' : 'border-green-200 dark:border-green-900/30';
                return (
                  <div key={p.id} onClick={() => handleRiskClick(p.id, p.name, p.indicator)} className={`p-3 rounded border cursor-pointer hover:shadow-md transition-all ${bg} ${border}`}>
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 truncate">{p.name}</div>
                    <div className={`text-2xl font-bold ${color}`}>{p.indicator}</div>
                    <div className="text-[10px] text-gray-500 uppercase mt-1">Indicator</div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2 italic">Historical-pattern-based risk indicators for engineering decision support.</p>
          </div>

          {/* Map (Keep existing) */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm flex flex-col h-[350px]">
             <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
               <h2 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Spatial Context Map</h2>
             </div>
             <div className="flex-1 relative">
               <GoogleWellMap 
                 activeWell={activeWell}
                 historicalWells={historicalWells}
                 onSelectWell={(wId) => {
                   const well = getWellById(wId);
                   if (well) navigateToWell(well, 'well-explorer');
                 }} 
               />
             </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="w-full lg:w-80 space-y-6 flex-shrink-0">
          
          {/* Nearby Well Intelligence */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-blue-200 dark:border-blue-900/50 rounded shadow-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-400 uppercase tracking-wider mb-4">Nearby Well Evidence</h3>
            
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-bold text-black dark:text-white">W-042</div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Similarity</div>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{historicalWells.find(w => w.id === 'W-042')?.similarity}%</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Major Historical Events</div>
              
              <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="font-bold text-red-600 dark:text-red-400">Mud Loss</span>
                <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">2,410 m</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="font-bold text-red-600 dark:text-red-400">Stuck Pipe</span>
                <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">2,620 m</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="font-bold text-amber-600 dark:text-amber-400">Kick</span>
                <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">2,850 m</span>
              </div>
            </div>

            <button 
              onClick={() => {
                const well = getWellById('W-042');
                if (well) navigateToWell(well, 'well-explorer');
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded transition-colors"
            >
              Open Well
            </button>
          </div>

          {/* Ask NWIS Quick Action */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5">
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              Ask NWIS
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Query historical records using natural language.</p>
            
            <div className="space-y-2 mb-4">
              <button onClick={() => navigateToTab('ai-search')} className="w-full text-left text-xs p-2 bg-gray-50 dark:bg-[#0A0A0A] hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300">
                "What happened around 2400 m in nearby wells?"
              </button>
              <button onClick={() => navigateToTab('ai-search')} className="w-full text-left text-xs p-2 bg-gray-50 dark:bg-[#0A0A0A] hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300">
                "Show me stuck pipe incidents near W-051."
              </button>
            </div>
            
            <button onClick={() => navigateToTab('ai-search')} className="w-full py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-sm font-bold rounded transition-colors">
              Open AI Search
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5">
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => navigateToTab('nearby-wells')} className="text-left py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 rounded transition-colors">
                View Nearby Wells
              </button>
              <button onClick={() => navigateToTab('risk-monitor')} className="text-left py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 rounded transition-colors">
                Open Risk Monitor
              </button>
              <button onClick={() => navigateToTab('event-timeline')} className="text-left py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 rounded transition-colors">
                Historical Timeline
              </button>
            </div>
          </div>

        </div>
      </div>

      {evidenceModalOpen && selectedEvidence && (
        <EvidenceModal 
          document={selectedEvidence.document} 
          event={selectedEvidence.event} 
          onClose={() => setEvidenceModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default CommandCenter;
