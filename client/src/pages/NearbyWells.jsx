import React, { useState, useMemo } from 'react';
import GoogleWellMap from '../components/wells/GoogleWellMap';
import { useNwis } from '../context/NwisContext';
import { getNearbyWells, getWellById } from '../services/nwisDataService';

const NearbyWells = ({ setActiveTab }) => {
  const { activeWell, selectedWell, setSelectedWell, navigateToWell } = useNwis();
  const historicalWells = getNearbyWells();
  
  // Filters state
  const [radiusFilter, setRadiusFilter] = useState('5');
  const [formationFilter, setFormationFilter] = useState('All');
  const [eventFilter, setEventFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Apply filters
  const filteredWells = useMemo(() => {
    return historicalWells.filter(well => {
      // Very basic mock filtering for demonstration
      if (searchQuery && !well.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (formationFilter !== 'All' && well.formation !== formationFilter) return false;
      
      const distanceVal = parseFloat(well.distance);
      if (radiusFilter !== 'All' && distanceVal > parseFloat(radiusFilter)) return false;

      if (eventFilter !== 'All' && well.primaryRisk !== eventFilter) return false;
      if (severityFilter !== 'All' && well.severity !== severityFilter) return false;

      return true;
    });
  }, [historicalWells, radiusFilter, formationFilter, eventFilter, severityFilter, searchQuery]);

  const resetFilters = () => {
    setRadiusFilter('10');
    setFormationFilter('All');
    setEventFilter('All');
    setSeverityFilter('All');
    setSearchQuery('');
    setSelectedWell(null);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Nearby Wells Intelligence</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Explore historical drilling experience around the active well.</p>
        </div>
        <div className="text-right bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded p-3 flex gap-6 shadow-sm">
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Active Well</div>
            <div className="text-sm font-bold text-black dark:text-white">{activeWell.id}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Status</div>
            <div className="text-sm font-bold text-green-600">{activeWell.status}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Current Depth</div>
            <div className="text-sm font-bold text-black dark:text-white">{activeWell.currentDepth.toLocaleString()} m</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-4 flex flex-wrap gap-4 items-end flex-shrink-0">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Search Well</label>
          <input 
            type="text" 
            placeholder="Search by well name" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Radius</label>
          <select value={radiusFilter} onChange={(e) => setRadiusFilter(e.target.value)} className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:border-blue-500 transition-colors">
            <option value="1">1 km</option>
            <option value="2">2 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="All">All</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Formation</label>
          <select value={formationFilter} onChange={(e) => setFormationFilter(e.target.value)} className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:border-blue-500 transition-colors">
            <option value="All">All</option>
            <option value="X Formation">X Formation</option>
            <option value="Y Formation">Y Formation</option>
            <option value="Z Formation">Z Formation</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Event Type</label>
          <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:border-blue-500 transition-colors">
            <option value="All">All</option>
            <option value="Mud Loss">Mud Loss</option>
            <option value="Stuck Pipe">Stuck Pipe</option>
            <option value="Gas Kick">Gas Kick</option>
            <option value="Torque Increase">Torque Increase</option>
            <option value="Cementing">Cementing</option>
          </select>
        </div>
        <button onClick={resetFilters} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded transition-colors">
          Reset Filters
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Left / Large Area: Interactive Map */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm flex flex-col transition-colors duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center flex-shrink-0">
            <div>
              <h2 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Nearby Wells Map</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Historical wells within selected radius</p>
            </div>
            <div className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full font-medium">
              {filteredWells.length} wells found
            </div>
          </div>
          <div className="flex-1 p-2 bg-gray-50 dark:bg-[#0A0A0A] relative">
            <GoogleWellMap 
              activeWell={activeWell}
              historicalWells={filteredWells}
              selectedWellId={selectedWell?.id}
              onSelectWell={(id) => setSelectedWell(getWellById(id))}
            />
          </div>
        </div>

        {/* Right Area: Selected Well Intelligence */}
        <div className="lg:col-span-1 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm flex flex-col transition-colors duration-200">
          <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 p-4 m-0 flex-shrink-0">
            Selected Well Intelligence
          </h3>
          
          <div className="flex-1 p-6 overflow-y-auto">
            {!selectedWell ? (
              <div className="h-full flex items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
                Select a historical well on the map or table to inspect its drilling history.
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <div className="text-2xl font-bold text-black dark:text-white">{selectedWell.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mt-1">
                    {selectedWell.type === 'active' ? 'Active Well' : 'Historical Well'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-[#0A0A0A] p-3 rounded border border-gray-100 dark:border-gray-800">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Distance</div>
                    <div className="text-sm font-bold text-black dark:text-white">{selectedWell.distance} km</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#0A0A0A] p-3 rounded border border-gray-100 dark:border-gray-800">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Depth</div>
                    <div className="text-sm font-bold text-black dark:text-white">{selectedWell.totalDepth.toLocaleString()} m</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#0A0A0A] p-3 rounded border border-gray-100 dark:border-gray-800">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Formation</div>
                    <div className="text-sm font-bold text-black dark:text-white">{selectedWell.formation}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#0A0A0A] p-3 rounded border border-gray-100 dark:border-gray-800">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">NPT</div>
                    <div className="text-sm font-bold text-black dark:text-white">{selectedWell.npt} hrs</div>
                  </div>
                </div>

                {selectedWell.type !== 'active' && (
                  <>
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Major Historical Events</div>
                      <div className={`p-3 rounded border ${selectedWell.events !== 'Normal' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'}`}>
                        <div className={`font-bold ${selectedWell.events !== 'Normal' ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {selectedWell.events}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                      <div className="flex justify-between items-end mb-2">
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Historical Similarity</div>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{selectedWell.similarity}%</div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${selectedWell.similarity}%` }}></div>
                      </div>
                      <div className="text-[10px] text-gray-400 mb-4">Based on spatial proximity, formation, depth, and events.</div>
                      
                      <button 
                        onClick={() => navigateToWell(selectedWell, 'well-explorer')}
                        className="w-full py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                      >
                        View Well Details
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm overflow-hidden flex-shrink-0 transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">Well</th>
                <th className="px-6 py-3">Distance</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Formation</th>
                <th className="px-6 py-3">TD</th>
                <th className="px-6 py-3">Major Event</th>
                <th className="px-6 py-3">Similarity</th>
                <th className="px-6 py-3">NPT</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredWells.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No nearby wells found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredWells.map((well) => (
                  <tr 
                    key={well.id} 
                    onClick={() => setSelectedWell(well)}
                    className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${
                      selectedWell?.id === well.id 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 bg-white dark:bg-[#1A1A1A]'
                    }`}
                  >
                    <td className="px-6 py-3 font-bold text-black dark:text-white">{well.id}</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{well.distance} km</td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400 capitalize">{well.type}</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{well.formation}</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{well.totalDepth.toLocaleString()} m</td>
                    <td className="px-6 py-3">
                      <span className={`${well.events !== 'Normal' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                        {well.primaryRisk}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-blue-600 dark:text-blue-400 font-medium">{well.similarity}%</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{well.npt} hrs</td>
                    <td className="px-6 py-3 text-green-600 dark:text-green-500 font-medium">{well.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NearbyWells;
