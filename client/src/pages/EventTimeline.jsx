import React, { useState, useMemo } from 'react';
import {
  getTimelineEvents,
  filterTimelineEvents,
  getRiskZones,
  getTimelineSummary,
  getSourceSummary,
} from '../services/eventTimelineService';
import { EvidenceModal as CommonEvidenceModal } from '../components/common/EvidenceModal';
import { WellContextComparison } from '../components/common/WellContextComparison';
import { getWellById, getEvidenceForEvent } from '../services/nwisDataService';
import { useNwis } from '../context/NwisContext';

// ─── Constants ─────────────────────────────────────────────────────────────────

const SEVERITY_BADGE = {
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const EVENT_DOT_COLOR = {
  'Mud Loss': 'bg-orange-500',
  'Stuck Pipe': 'bg-red-500',
  'Kick': 'bg-red-700',
  'Torque Increase': 'bg-amber-500',
  'Cementing': 'bg-green-500',
};

const ZONE_COLORS = {
  'Mud Loss': { bg: 'bg-orange-100/60 dark:bg-orange-900/15', border: 'border-orange-300 dark:border-orange-800' },
  'Stuck Pipe': { bg: 'bg-red-100/60 dark:bg-red-900/15', border: 'border-red-300 dark:border-red-800' },
  'Kick': { bg: 'bg-red-100/60 dark:bg-red-900/15', border: 'border-red-300 dark:border-red-800' },
};



// ─── Main Page ─────────────────────────────────────────────────────────────────

const EventTimeline = ({ setActiveTab }) => {
  const { activeWell, navigateToWell, navigateToTab, setSelectedRisk } = useNwis();
  const allEvents = useMemo(() => getTimelineEvents(), []);
  const riskZones = useMemo(() => getRiskZones(), []);
  const summary = useMemo(() => getTimelineSummary(), []);
  const sourceSummary = useMemo(() => getSourceSummary(), []);

  const [filters, setFilters] = useState({ wellId: 'All', eventType: 'All', severity: 'All', formation: 'All', depthMin: '', depthMax: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [evidenceEvent, setEvidenceEvent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredEvents = useMemo(() => filterTimelineEvents(allEvents, filters), [allEvents, filters]);

  // Unique well ids from data
  const wellIds = useMemo(() => [...new Set(allEvents.map(e => e.wellId))].sort(), [allEvents]);

  const resetFilters = () => setFilters({ wellId: 'All', eventType: 'All', severity: 'All', formation: 'All', depthMin: '', depthMax: '' });

  const openWell = (wellId) => {
    const well = getWellById(wellId);
    if (well) navigateToWell(well, 'well-explorer');
  };

  // Compute depth bounds for timeline rendering
  const depthMin = 2000;
  const depthMax = 3400;
  const depthRange = depthMax - depthMin;
  const pct = (d) => ((d - depthMin) / depthRange) * 100;

  // --- Horizontal Staggering Logic ---
  // To avoid labels overlapping horizontally, we compute a stagger level (0, 1, 2)
  // for events that are vertically close to each other.
  const minSpacing = 40; // Depth units threshold for vertical collision

  const eventStagger = {}; // eventId -> level
  let activeWellStagger = 0;

  useMemo(() => {
    // Collect all items that need rendering spacing
    const items = filteredEvents.map(e => ({ id: e.id, depth: e.depth, isEvent: true }));
    items.push({ id: 'active_well', depth: activeWell.currentDepth, isEvent: false });

    // Sort by depth
    items.sort((a, b) => a.depth - b.depth);

    // Keep track of the last depth occupied at each stagger level
    const lastDepthAtLevel = [-9999, -9999, -9999, -9999];

    items.forEach(item => {
      let level = 0;
      // Find the first level where we have enough vertical space
      while (level < 3 && item.depth - lastDepthAtLevel[level] < minSpacing) {
        level++;
      }
      lastDepthAtLevel[level] = item.depth;

      if (item.isEvent) {
        eventStagger[item.id] = level;
      } else {
        activeWellStagger = level;
      }
    });
  }, [filteredEvents, activeWell.currentDepth]);

  return (
    <div className="flex flex-col space-y-6 pb-8">
      {/* ─── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 flex-shrink-0">
        <div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-2">
            <button onClick={() => navigateToTab('command-center')} className="hover:text-black dark:hover:text-white">NWIS</button>
            <span>/</span>
            <span className="font-bold text-gray-600 dark:text-gray-300">Timeline</span>
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Historical Event Timeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Depth-based view of historical drilling events across nearby wells.</p>
        </div>
      </div>
      
      <WellContextComparison />

      {/* ─── Summary Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Historical Events', value: summary.totalEvents },
          { label: 'Historical Wells', value: summary.totalWells },
          { label: 'Risk Zones', value: summary.riskZones },
          { label: 'Current Depth', value: `${summary.currentDepth.toLocaleString()} m` },
          { label: 'Next Historical Zone', value: summary.nextZone ? `${summary.nextZone.depthStart.toLocaleString()}–${summary.nextZone.depthEnd.toLocaleString()} m` : '—' },
          { label: 'Distance to Zone', value: summary.distanceToZone != null ? `${summary.distanceToZone} m` : '—', highlight: summary.distanceToZone != null && summary.distanceToZone <= 50 },
        ].map((s, i) => (
          <div key={i} className={`bg-white dark:bg-[#1A1A1A] border rounded shadow-sm p-3 text-center transition-colors ${s.highlight ? 'border-orange-300 dark:border-orange-800' : 'border-gray-200 dark:border-gray-800'}`}>
            <div className={`text-xl font-bold ${s.highlight ? 'text-orange-600 dark:text-orange-400' : 'text-black dark:text-white'}`}>{s.value}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Filter Bar ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-4 transition-colors">
        <div className="flex justify-between items-center">
          <button onClick={() => setShowFilters(!showFilters)} className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            {showFilters ? 'Hide Filters' : 'Timeline Filters'}
          </button>
          <div className="text-xs text-gray-400">{filteredEvents.length} of {allEvents.length} events</div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Well */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Well</label>
              <select value={filters.wellId} onChange={e => setFilters(p => ({ ...p, wellId: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm text-black dark:text-white focus:outline-none">
                <option value="All">All Nearby Wells</option>
                {wellIds.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            {/* Event Type */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Event Type</label>
              <select value={filters.eventType} onChange={e => setFilters(p => ({ ...p, eventType: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm text-black dark:text-white focus:outline-none">
                {['All', 'Mud Loss', 'Stuck Pipe', 'Kick', 'Torque Increase', 'Cementing'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* Severity */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Severity</label>
              <select value={filters.severity} onChange={e => setFilters(p => ({ ...p, severity: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm text-black dark:text-white focus:outline-none">
                {['All', 'Low', 'Medium', 'High', 'Critical'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* Formation */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Formation</label>
              <select value={filters.formation} onChange={e => setFilters(p => ({ ...p, formation: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm text-black dark:text-white focus:outline-none">
                {['All', 'X Formation', 'Y Formation', 'Z Formation'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            {/* Depth Min */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Min Depth (m)</label>
              <input type="number" value={filters.depthMin} onChange={e => setFilters(p => ({ ...p, depthMin: e.target.value }))} placeholder="2000" className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm text-black dark:text-white focus:outline-none" />
            </div>
            {/* Depth Max */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Max Depth (m)</label>
              <input type="number" value={filters.depthMax} onChange={e => setFilters(p => ({ ...p, depthMax: e.target.value }))} placeholder="3400" className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm text-black dark:text-white focus:outline-none" />
            </div>
            <div className="col-span-2 md:col-span-3 lg:col-span-6 flex gap-2 mt-1">
              <button onClick={resetFilters} className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-xs font-bold rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Reset Filters</button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Approaching Zone Alert ───────────────────────────────────────── */}
      {summary.nextZone && summary.distanceToZone <= 50 && (
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-300 dark:border-orange-900/50 rounded shadow-sm p-5 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Approaching Historical Zone</span>
            <span className="ml-auto text-xs font-bold text-orange-600 dark:text-orange-400">{summary.distanceToZone} m ahead</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="font-bold text-orange-900 dark:text-orange-200 text-sm">{summary.nextZone.name}</div>
              <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">{summary.nextZone.depthStart.toLocaleString()}–{summary.nextZone.depthEnd.toLocaleString()} m · {summary.nextZone.formation}</div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 italic">Historical {summary.nextZone.eventType.toLowerCase()} events were recorded in nearby wells within this depth interval.</p>
            </div>
            <div className="flex items-end gap-2 flex-shrink-0">
              <button onClick={() => {
                // Determine risk from zone name/type
                const t = summary.nextZone.eventType.toLowerCase();
                if (t.includes('mud loss')) {
                  setSelectedRisk({ id: 'risk-mudloss', name: 'Mud Loss', score: 82 });
                } else if (t.includes('stuck pipe')) {
                  setSelectedRisk({ id: 'risk-stuckpipe', name: 'Stuck Pipe', score: 89 });
                }
                navigateToTab('risk-monitor');
              }} className="px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded hover:bg-orange-700 transition-colors">View Risk</button>
              <button onClick={() => navigateToTab('ai-search')} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-xs font-bold rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Search Evidence</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Content: Timeline + Details ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Visual Depth Timeline (2 cols) ─────────────────────────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5 transition-colors">
          <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3 mb-5">Depth Timeline</h3>

          <div className="relative" style={{ minHeight: 500 }}>
            {/* Vertical track */}
            <div className="absolute left-[140px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            {/* Risk zone bands */}
            {riskZones.map(zone => {
              const top = pct(zone.depthStart);
              const height = Math.max(pct(zone.depthEnd) - pct(zone.depthStart), 1.5);
              const zc = ZONE_COLORS[zone.eventType] || ZONE_COLORS['Mud Loss'];
              return (
                <div
                  key={zone.id}
                  className={`absolute left-[120px] w-[calc(100%-140px)] ${zc.bg} border-l-2 ${zc.border} rounded-r transition-all`}
                  style={{ top: `${top}%`, height: `${height}%`, minHeight: 14 }}
                >
                  <div className="absolute -left-[108px] top-0 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap text-right w-[100px]">
                    {zone.depthStart.toLocaleString()}–{zone.depthEnd.toLocaleString()} m
                  </div>
                  <div className="pl-8 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-[14px]">{zone.name}</div>
                </div>
              );
            })}

            {/* Current depth marker */}
            {(() => {
              const top = pct(activeWell.currentDepth);
              const stagger = activeWellStagger;
              return (
                <div className="absolute left-0 right-0 z-20" style={{ top: `${top}%` }}>
                  <div className="flex items-center">
                    <div className="w-[100px] text-right pr-3 flex-shrink-0">
                      <span className="text-xs font-bold text-black dark:text-white">{activeWell.currentDepth.toLocaleString()} m</span>
                    </div>
                    <div className="relative flex items-center">
                      <div className="w-5 h-5 rounded-full bg-black dark:bg-white border-[3px] border-white dark:border-[#1A1A1A] shadow-lg z-10" />
                      
                      {stagger > 0 ? (
                        <>
                          <div className="h-px bg-gray-400 dark:bg-gray-500" style={{ width: stagger * 40 }} />
                          <div className="ml-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-sm">
                            ← {activeWell.id} CURRENT
                          </div>
                        </>
                      ) : (
                        <div className="ml-3 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-sm">
                          ← {activeWell.id} CURRENT
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Event dots */}
            {filteredEvents.map((evt) => {
              const top = pct(evt.depth);
              const isSelected = selectedEvent && selectedEvent.id === evt.id;
              const dotColor = EVENT_DOT_COLOR[evt.eventType] || 'bg-gray-500';
              const stagger = eventStagger[evt.id] || 0;
              
              return (
                <div
                  key={evt.id}
                  className="absolute flex items-center group z-10 w-full"
                  style={{ top: `${top}%`, left: 0 }}
                >
                  <div className="w-[100px] text-right pr-3 flex-shrink-0 pt-[2px]">
                    <span className={`text-xs ${isSelected ? 'font-bold text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{evt.depth.toLocaleString()} m</span>
                  </div>
                  <button 
                    className="relative flex items-center text-left" 
                    onClick={() => setSelectedEvent(isSelected ? null : evt)}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${dotColor} border-2 ${isSelected ? 'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700 scale-125' : 'border-white dark:border-[#1A1A1A]'} shadow transition-all z-10`} />
                    
                    {stagger > 0 && (
                      <div className="h-px bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 transition-colors" style={{ width: stagger * 32 }} />
                    )}

                    <div className={`ml-2 text-xs font-medium transition-colors whitespace-nowrap bg-white/90 dark:bg-[#1A1A1A]/90 px-1.5 py-0.5 rounded border ${isSelected ? 'text-black dark:text-white font-bold border-gray-300 dark:border-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-400 border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700 group-hover:text-black dark:group-hover:text-white'}`}>
                      {evt.eventType} <span className="text-gray-400 dark:text-gray-500 font-normal">· {evt.wellId}</span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Right Panel ────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Selected Event Details */}
          {selectedEvent ? (
            <div className="bg-white dark:bg-[#1A1A1A] border border-blue-200 dark:border-blue-900/50 rounded shadow-sm p-5 transition-colors">
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3">Selected Event</div>
              <div className="text-lg font-bold text-black dark:text-white mb-1">{selectedEvent.eventType}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">{selectedEvent.wellId} · {selectedEvent.depth.toLocaleString()} m · {selectedEvent.formation}</div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-xs"><span className="text-gray-500 uppercase font-bold">Severity</span><span className={`px-2 py-0.5 font-bold rounded ${SEVERITY_BADGE[selectedEvent.severity] || ''}`}>{selectedEvent.severity}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500 uppercase font-bold">Distance</span><span className="font-bold text-black dark:text-white">{selectedEvent.distance} km</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500 uppercase font-bold">Source</span><span className="font-mono text-blue-600 dark:text-blue-400">{selectedEvent.documentId}</span></div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mb-3">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{selectedEvent.description}</p>
              </div>
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mitigation</div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{selectedEvent.mitigation}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setEvidenceEvent(selectedEvent)} className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors">View Evidence</button>
                <button onClick={() => openWell(selectedEvent.wellId)} className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-xs font-bold rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Open Well</button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-6 text-center transition-colors">
              <div className="text-sm text-gray-400 dark:text-gray-500">Click an event on the timeline or table to inspect its details.</div>
            </div>
          )}

          {/* Current Depth Comparison */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5 transition-colors">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Current Well Position</h4>
            <div className="text-lg font-bold text-black dark:text-white">{activeWell.id}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">{activeWell.currentDepth.toLocaleString()} m · {activeWell.formation}</div>
            {summary.nextZone && (
              <div className="space-y-2 text-xs border-t border-gray-100 dark:border-gray-800 pt-3">
                <div className="flex justify-between"><span className="text-gray-500">Nearest Historical Zone</span><span className="font-bold text-orange-600 dark:text-orange-400">{summary.nextZone.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Zone Depth</span><span className="font-bold text-black dark:text-white">{summary.nextZone.depthStart.toLocaleString()}–{summary.nextZone.depthEnd.toLocaleString()} m</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Distance</span><span className="font-bold text-orange-600 dark:text-orange-400">{summary.distanceToZone} m</span></div>
              </div>
            )}
          </div>

          {/* Historical Pattern Summary */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5 transition-colors">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Historical Pattern Summary</h4>
            <div className="space-y-3">
              {riskZones.map(zone => (
                <div key={zone.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-100 dark:border-gray-800 rounded">
                  <div>
                    <div className="text-xs font-bold text-black dark:text-white">{zone.eventType}</div>
                    <div className="text-[10px] text-gray-500">{zone.supportingWells.length} nearby wells · {zone.depthStart.toLocaleString()}{zone.depthEnd !== zone.depthStart ? `–${zone.depthEnd.toLocaleString()}` : ''} m</div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${zone.status === 'Approaching' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>{zone.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Records */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5 transition-colors">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Source Records</h4>
            <div className="space-y-2">
              {sourceSummary.map((s, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{s.type}</span>
                  <span className="font-bold text-black dark:text-white">{s.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[10px] text-gray-400 italic">Demonstration data</div>
          </div>

          {/* Navigation Actions */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-4 transition-colors">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Related Modules</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Nearby Wells', tab: 'nearby-wells' },
                { label: 'Well Explorer', tab: 'well-explorer' },
                { label: 'AI Search', tab: 'ai-search' },
                { label: 'Risk Monitor', tab: 'risk-monitor' },
              ].map(nav => (
                <button key={nav.tab} onClick={() => navigateToTab(nav.tab)} className="py-1.5 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 text-black dark:text-white text-xs font-bold rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {nav.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Event Table ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm overflow-hidden transition-colors">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Historical Event Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3">Depth</th>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Well</th>
                <th className="px-5 py-3">Formation</th>
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3">Mitigation</th>
                <th className="px-5 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt) => {
                const isSelected = selectedEvent && selectedEvent.id === evt.id;
                return (
                  <tr
                    key={evt.id}
                    onClick={() => setSelectedEvent(isSelected ? null : evt)}
                    className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                  >
                    <td className="px-5 py-3 font-bold text-black dark:text-white whitespace-nowrap">{evt.depth.toLocaleString()} m</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${EVENT_DOT_COLOR[evt.eventType] || 'bg-gray-500'}`} />
                        <span className="font-bold text-gray-800 dark:text-gray-200">{evt.eventType}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{evt.wellId}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{evt.formation}</td>
                    <td className="px-5 py-3"><span className={`px-2 py-0.5 text-xs font-bold rounded ${SEVERITY_BADGE[evt.severity] || ''}`}>{evt.severity}</span></td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{evt.mitigation}</td>
                    <td className="px-5 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">{evt.documentId}</td>
                  </tr>
                );
              })}
              {filteredEvents.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No events match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Evidence Modal ───────────────────────────────────────────────── */}
      {evidenceEvent && (
        <CommonEvidenceModal 
          document={getEvidenceForEvent(evidenceEvent.id) || {
            id: evidenceEvent.documentId,
            title: "Historical Demo Document",
            type: evidenceEvent.documentType || "Demo Record",
            date: "2018-05-12",
            wellId: evidenceEvent.wellId,
            excerpt: evidenceEvent.excerpt || `Historical demonstration record for ${evidenceEvent.eventType} at ${evidenceEvent.depth.toLocaleString()} m.`,
            mitigation: evidenceEvent.mitigation || "Review historical drilling reports."
          }} 
          event={evidenceEvent} 
          onClose={() => setEvidenceEvent(null)} 
        />
      )}
    </div>
  );
};

export default EventTimeline;
