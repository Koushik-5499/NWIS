import React, { useState, useEffect } from 'react';
import { WELL_DETAILS } from '../data/wellDetails';
import { useNwis } from '../context/NwisContext';
import { getEventsByWell, getEvidenceForEvent } from '../services/nwisDataService';
import { EvidenceModal } from '../components/common/EvidenceModal';
import { WellContextComparison } from '../components/common/WellContextComparison';

const WellExplorer = ({ setActiveTab }) => {
  const { selectedWell, selectedEvent, setSelectedEvent, navigateToTab } = useNwis();
  const [activeTab, setActiveExplorerTab] = useState('Overview');
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  
  const well = selectedWell || { id: 'W-042', type: 'Historical', distance: '1.2', totalDepth: 3240, formation: 'X Formation', npt: 31, similarity: 92, surfaceLocation: "Demo Location - Block A", drillingDuration: 28 };
  
  // Enrich with presentation data
  const presentationData = WELL_DETAILS[well.id] || WELL_DETAILS['W-042'];
  const drillingEvents = getEventsByWell(well.id);
  
  const handleViewEvidence = () => {
    setEvidenceModalOpen(true);
  };

  const tabs = [
    'Overview', 'Drilling Events', 'Mud Program', 'Casing', 'Cementing', 'NPT', 'Documents'
  ];

  if (!selectedWell) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="text-gray-500 dark:text-gray-400">No historical well selected.</div>
        <button 
          onClick={() => navigateToTab('nearby-wells')}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Explore Nearby Wells
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-2">
            <button onClick={() => navigateToTab('command-center')} className="hover:text-black dark:hover:text-white">NWIS</button>
            <span>/</span>
            <button onClick={() => navigateToTab('nearby-wells')} className="hover:text-black dark:hover:text-white">Nearby Wells</button>
            <span>/</span>
            <span className="font-bold text-gray-600 dark:text-gray-300">{well.id}</span>
            <span>/</span>
            <span className="font-bold text-gray-600 dark:text-gray-300">Well Explorer</span>
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Well Explorer</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Detailed historical drilling record and operational intelligence</p>
        </div>
        <div className="text-right bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded p-3 flex gap-6 shadow-sm">
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Selected Well</div>
            <div className="text-sm font-bold text-black dark:text-white">{well.id}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Type</div>
            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase">{well.type}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Distance</div>
            <div className="text-sm font-bold text-black dark:text-white">{well.distance} km</div>
          </div>
        </div>
      </div>

      {/* Well Summary Header */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4 flex-shrink-0 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-xl text-gray-800 dark:text-gray-200">
            {well.id.split('-')[1]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">{well.id}</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">{well.type}</div>
          </div>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <div className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded flex flex-col items-center min-w-[100px]">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Depth</span>
            <span className="font-bold text-black dark:text-white">{well.totalDepth.toLocaleString()} m</span>
          </div>
          <div className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded flex flex-col items-center min-w-[100px]">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Formation</span>
            <span className="font-bold text-black dark:text-white">{well.formation}</span>
          </div>
          <div className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded flex flex-col items-center min-w-[100px]">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Drilling Days</span>
            <span className="font-bold text-black dark:text-white">{well.drillingDuration}</span>
          </div>
          <div className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded flex flex-col items-center min-w-[100px]">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">NPT</span>
            <span className="font-bold text-black dark:text-white">{well.npt}</span>
          </div>
          <div className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded flex flex-col items-center min-w-[100px]">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Similarity</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{well.similarity}%</span>
          </div>
        </div>

        <button 
          onClick={() => navigateToTab('nearby-wells')}
          className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors whitespace-nowrap"
        >
          Back to Nearby Wells
        </button>
      </div>

      <WellContextComparison />

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex overflow-x-auto hide-scrollbar flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveExplorerTab(tab)}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-black dark:border-white text-black dark:text-white' 
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto pb-6">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5">
                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">Well Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 uppercase">Well ID</span>
                    <span className="text-sm font-bold text-black dark:text-white">{well.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 uppercase">Surface Location</span>
                    <span className="text-sm font-bold text-black dark:text-white">{well.surfaceLocation || presentationData.surfaceLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 uppercase">Total Depth</span>
                    <span className="text-sm font-bold text-black dark:text-white">{well.totalDepth.toLocaleString()} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 uppercase">Formation</span>
                    <span className="text-sm font-bold text-black dark:text-white">{well.formation}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5">
                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">Historical Risk Indicators</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mud Loss</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold rounded">High</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stuck Pipe</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold rounded">High</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kick</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded">Medium</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cementing</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded">Low</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#1A1A1A] border border-blue-200 dark:border-blue-900/50 rounded shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex items-center gap-2 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-sm font-bold text-blue-900 dark:text-blue-400 uppercase tracking-wider">AI-Generated Summary</h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Based on historical source records. Demonstration data only.</p>
                <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-6">
                  "This historical well recorded multiple operational events during drilling. Partial mud loss was observed around 2,410 m, followed by a stuck-pipe event near 2,620 m. A kick-related event was also recorded around 2,850 m. These historical events may provide useful context when reviewing similar intervals in the active well."
                </div>
                
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Key Lessons</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>Review historical mud-loss behavior around the X Formation interval.</li>
                  <li>Compare stuck-pipe conditions with current drilling parameters.</li>
                  <li>Review previous mitigation measures before approaching similar depths.</li>
                </ul>
              </div>

              {/* Depth Visualization Demo */}
              <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5 flex flex-col">
                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">Depth Trajectory & Events</h3>
                <div className="flex-1 min-h-[200px] flex justify-center py-4">
                  <div className="relative w-full max-w-lg flex flex-col items-center">
                    <div className="absolute top-0 bottom-0 w-2 bg-gray-200 dark:bg-gray-700 rounded-full left-1/2 -translate-x-1/2"></div>
                    
                    {/* Mock events on timeline */}
                    <div className="w-full flex justify-between items-center mb-8 relative z-10">
                      <div className="w-1/2 pr-6 text-right">
                        <span className="text-xs font-bold text-black dark:text-white">2,000 m</span>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white dark:border-[#1A1A1A] shadow"></div>
                      <div className="w-1/2 pl-6">
                        <span className="text-xs text-gray-500">Normal drilling</span>
                      </div>
                    </div>

                    <div className="w-full flex justify-between items-center mb-8 relative z-10">
                      <div className="w-1/2 pr-6 text-right">
                        <span className="text-xs font-bold text-black dark:text-white">2,410 m</span>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-[#1A1A1A] shadow"></div>
                      <div className="w-1/2 pl-6">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">Mud Loss</span>
                      </div>
                    </div>
                    
                    <div className="w-full flex justify-between items-center mb-8 relative z-10">
                      <div className="w-1/2 pr-6 text-right">
                        <span className="text-xs font-bold text-black dark:text-white">2,620 m</span>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-[#1A1A1A] shadow"></div>
                      <div className="w-1/2 pl-6">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">Stuck Pipe</span>
                      </div>
                    </div>

                    <div className="w-full flex justify-between items-center mb-8 relative z-10">
                      <div className="w-1/2 pr-6 text-right">
                        <span className="text-xs font-bold text-black dark:text-white">2,850 m</span>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-[#1A1A1A] shadow"></div>
                      <div className="w-1/2 pl-6">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Kick</span>
                      </div>
                    </div>

                    <div className="w-full flex justify-between items-center relative z-10">
                      <div className="w-1/2 pr-6 text-right">
                        <span className="text-xs font-bold text-black dark:text-white">{well.totalDepth}</span>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-gray-800 dark:bg-gray-200 border-2 border-white dark:border-[#1A1A1A] shadow"></div>
                      <div className="w-1/2 pl-6">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Total Depth</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Drilling Events' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Depth</th>
                    <th className="px-6 py-3">Event</th>
                    <th className="px-6 py-3">Formation</th>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {drillingEvents.map((evt, idx) => (
                    <tr 
                      key={evt.id || idx} 
                      className="border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => setSelectedEvent(evt)}
                    >
                      <td className="px-6 py-4 font-medium text-black dark:text-white">{evt.depth.toLocaleString()} m</td>
                      <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{evt.eventType}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{evt.formation}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          evt.severity === 'Critical' || evt.severity === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          evt.severity === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {evt.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 truncate max-w-xs">{evt.description}</td>
                      <td className="px-6 py-4 text-blue-600 dark:text-blue-400 text-xs font-mono">{evt.documentId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedEvent && (
              <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-6 animate-fade-in relative">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Event Details</div>
                <h3 className="text-2xl font-bold text-black dark:text-white mb-6">{selectedEvent.eventType}</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Well</div>
                    <div className="text-sm font-bold text-black dark:text-white">{selectedEvent.wellId}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Depth</div>
                    <div className="text-sm font-bold text-black dark:text-white">{selectedEvent.depth.toLocaleString()} m</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Formation</div>
                    <div className="text-sm font-bold text-black dark:text-white">{selectedEvent.formation}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Severity</div>
                    <div className="text-sm font-bold text-black dark:text-white">{selectedEvent.severity}</div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">Description</div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{selectedEvent.description}</p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">Mitigation</div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{selectedEvent.mitigation}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Source Evidence</div>
                    <div className="text-sm font-bold text-blue-900 dark:text-blue-400 font-mono">{selectedEvent.documentId}</div>
                  </div>
                  <button onClick={handleViewEvidence} className="px-4 py-2 bg-blue-600 text-white font-medium rounded text-sm hover:bg-blue-700 transition-colors">
                    View Evidence
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Similar tabular formats for Mud, Casing, Cementing can be added here. Providing Mud as example */}
        {activeTab === 'Mud Program' && (
          <div className="space-y-6">
            <div className="flex gap-4">
               <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 p-4 rounded shadow-sm w-48">
                 <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Mud Weight Range</div>
                 <div className="text-lg font-bold text-black dark:text-white">1.08–1.20 SG</div>
               </div>
            </div>
            
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Depth</th>
                    <th className="px-6 py-3">Mud Weight</th>
                    <th className="px-6 py-3">Viscosity</th>
                    <th className="px-6 py-3">Fluid Type</th>
                    <th className="px-6 py-3">Funnel Viscosity</th>
                    <th className="px-6 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {presentationData.mudProgram.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 font-medium text-black dark:text-white">{item.depth}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-bold">{item.weight}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{item.viscosity}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{item.fluidType}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{item.funnel}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{item.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other tabs have placeholder text for brevity, but the architecture is there */}
        {['Casing', 'Cementing', 'NPT', 'Documents'].includes(activeTab) && (
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-8 text-center text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-bold text-black dark:text-white mb-2">{activeTab} Details</h3>
            <p>Data loaded for {well.id}. The tabular visualization for {activeTab} goes here, matching the aesthetic of Drilling Events and Mud Program.</p>
          </div>
        )}
      </div>

      {evidenceModalOpen && selectedEvent && (
        <EvidenceModal 
          document={getEvidenceForEvent(selectedEvent.id)} 
          event={selectedEvent} 
          onClose={() => setEvidenceModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default WellExplorer;
