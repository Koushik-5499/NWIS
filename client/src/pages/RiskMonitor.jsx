import React, { useState } from 'react';
import {
  getRiskSummary,
  findApproachingZone,
  getDepthTimeline,
  getRiskIndicatorMeta,
} from '../services/riskAnalysisService';
import { useNwis } from '../context/NwisContext';
import { EvidenceModal as CommonEvidenceModal } from '../components/common/EvidenceModal';
import { WellContextComparison } from '../components/common/WellContextComparison';
import { getWellById, getEvidenceForEvent } from '../services/nwisDataService';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const SEVERITY_BADGE = {
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  High:     'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  Medium:   'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Low:      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function RiskGauge({ indicator, level }) {
  const gaugePercent = Math.min(indicator, 100);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (gaugePercent / 100) * circumference;
  const color = indicator >= 81 ? '#dc2626' : indicator >= 61 ? '#ea580c' : indicator >= 31 ? '#d97706' : '#16a34a';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeWidth="10" />
          <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-black dark:text-white leading-none">{indicator}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
        </div>
      </div>
      <div className="mt-2 text-sm font-bold" style={{ color }}>{level}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Historical Pattern Indicator</div>
    </div>
  );
}

function RiskFactorCard({ category, isSelected, onClick, onViewEvidence, onOpenWell }) {
  const meta = getRiskIndicatorMeta(category.indicator);
  const indicatorColor = category.indicator >= 81 ? '#dc2626' : category.indicator >= 61 ? '#ea580c' : category.indicator >= 31 ? '#d97706' : '#16a34a';

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#1A1A1A] border rounded shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-blue-400 dark:border-blue-600 ring-1 ring-blue-300 dark:ring-blue-700' : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{category.name}</div>
          <div className="text-2xl font-bold" style={{ color: indicatorColor }}>{category.indicator}</div>
          <div className="text-xs text-gray-400">/ 100</div>
        </div>
        <span className={`px-2 py-1 text-xs font-bold rounded ${meta.bg} ${meta.color}`}>{category.status}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${category.indicator}%`, backgroundColor: indicatorColor }} />
      </div>
      <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex justify-between"><span>Historical Events</span><span className="font-bold text-black dark:text-white">{category.historicalEvents}</span></div>
        <div className="flex justify-between"><span>Nearest Depth</span><span className="font-bold text-black dark:text-white">{category.nearestDepth.toLocaleString()} m</span></div>
        <div className="flex justify-between"><span>Formation</span><span className="font-bold text-black dark:text-white">{category.formation}</span></div>
      </div>
      {isSelected && (
        <div className="mt-3 flex gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
          <button
            onClick={e => { e.stopPropagation(); onViewEvidence(category.evidence[0]); }}
            className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors"
          >
            View Evidence
          </button>
          <button
            onClick={e => { e.stopPropagation(); onOpenWell(category.supportingWells[0]); }}
            className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-xs font-bold rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            View Well
          </button>
        </div>
      )}
    </div>
  );
}

function ApproachingZone({ zone, currentDepth }) {
  if (!zone) return null;
  const [zoneStart, zoneEnd] = zone.depthRange;
  const distance = zoneStart - currentDepth;

  const depths = [
    { d: currentDepth - 30, label: `${(currentDepth - 30).toLocaleString()} m`, type: 'normal' },
    { d: currentDepth, label: `${currentDepth.toLocaleString()} m`, type: 'current' },
    { d: zoneStart, label: `${zoneStart.toLocaleString()} m`, type: 'zone-start' },
    { d: zone.nearestDepth, label: `${zone.nearestDepth.toLocaleString()} m`, type: 'event' },
    { d: zoneEnd, label: `${zoneEnd.toLocaleString()} m`, type: 'zone-end' },
    { d: zoneEnd + 25, label: `${(zoneEnd + 25).toLocaleString()} m`, type: 'normal' },
  ];

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-orange-200 dark:border-orange-900/50 rounded shadow-sm p-5 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Approaching Historical Risk Zone</span>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-5 text-xs">
        <div><div className="text-gray-500 uppercase font-bold tracking-wider mb-1">Current Depth</div><div className="text-xl font-bold text-black dark:text-white">{currentDepth.toLocaleString()} m</div></div>
        <div><div className="text-gray-500 uppercase font-bold tracking-wider mb-1">Historical Zone</div><div className="text-xl font-bold text-orange-600 dark:text-orange-400">{zoneStart.toLocaleString()}–{zoneEnd.toLocaleString()} m</div></div>
        <div><div className="text-gray-500 uppercase font-bold tracking-wider mb-1">Distance to Zone</div><div className="text-xl font-bold text-orange-600 dark:text-orange-400">{distance} m</div></div>
      </div>

      {/* Depth Visualization */}
      <div className="flex justify-center mb-4">
        <div className="relative flex flex-col items-center" style={{ minWidth: 320 }}>
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2" />
          {depths.map((item, i) => {
            const isCurrent = item.type === 'current';
            const isZone = item.type === 'zone-start' || item.type === 'zone-end' || item.type === 'event';
            return (
              <div key={i} className="flex items-center w-full py-2 relative z-10">
                <div className={`w-1/2 pr-6 text-right text-xs font-${isCurrent || isZone ? 'bold' : 'normal'} ${isCurrent ? 'text-black dark:text-white' : isZone ? 'text-orange-700 dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'}`}>
                  {item.label}
                </div>
                <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-[#1A1A1A] shadow flex-shrink-0 ${
                  isCurrent ? 'bg-black dark:bg-white' :
                  item.type === 'event' ? 'bg-orange-500' :
                  isZone ? 'bg-orange-300' :
                  'bg-gray-300 dark:bg-gray-600'
                }`} />
                <div className={`w-1/2 pl-4 text-xs font-medium ${isCurrent ? 'text-black dark:text-white' : isZone ? 'text-orange-700 dark:text-orange-400' : 'text-gray-400'}`}>
                  {isCurrent ? '← CURRENT WELL' :
                   item.type === 'zone-start' ? 'HISTORICAL ZONE START' :
                   item.type === 'event' ? `Historical ${zone.name}` :
                   item.type === 'zone-end' ? 'HISTORICAL ZONE END' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center border-t border-gray-100 dark:border-gray-800 pt-3">
        Supporting wells: {zone.supportingWells.join(', ')} · Formation: {zone.formation}
      </div>
    </div>
  );
}

function RiskAlert({ zone, currentDepth, onViewEvidence, onOpenWell, onNavigateToTab }) {
  if (!zone) return null;
  const distance = zone.nearestDepth - currentDepth;
  return (
    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-300 dark:border-orange-900/50 rounded shadow-sm p-5">
      <div className="flex items-start gap-3 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="text-xs font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider">Historical Risk Alert</div>
      </div>
      <div className="space-y-3 text-sm text-orange-900 dark:text-orange-200">
        <p><span className="font-bold">Current depth:</span> {currentDepth.toLocaleString()} m</p>
        <p><span className="font-bold">Historical pattern:</span> {zone.supportingWells.length} nearby demonstration wells recorded {zone.name.toLowerCase()} events between {zone.depthRange[0].toLocaleString()} m and {zone.depthRange[1].toLocaleString()} m in {zone.formation}.</p>
        <p><span className="font-bold">Distance to historical zone:</span> {distance} m</p>
      </div>
      <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-900/30">
        <p className="text-xs text-orange-700 dark:text-orange-400 italic mb-4">
          ⓘ Historical pattern detected. Review historical mitigation measures and nearby-well evidence before proceeding. This is a decision-support indicator, not a prediction.
        </p>
        <div className="flex gap-2">
          <button onClick={() => onViewEvidence({ wellId: zone.supportingWells[0], documentId: `DDR-${zone.supportingWells[0].split('-')[1]}-021`, eventType: zone.name, depth: zone.nearestDepth, formation: zone.formation, severity: 'High', excerpt: 'Historical demonstration record...' })} className="flex-1 py-1.5 bg-orange-600 text-white text-xs font-bold rounded hover:bg-orange-700 transition-colors">
            View Evidence
          </button>
          <button onClick={() => onNavigateToTab('event-timeline')} className="flex-1 py-1.5 bg-orange-200 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800 text-xs font-bold rounded hover:bg-orange-300 dark:hover:bg-orange-800/60 transition-colors">
            View Timeline
          </button>
          <button onClick={() => onOpenWell(zone.supportingWells[0])} className="flex-1 py-1.5 bg-orange-200 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800 text-xs font-bold rounded hover:bg-orange-300 dark:hover:bg-orange-800/60 transition-colors">
            View Well
          </button>
        </div>
      </div>
    </div>
  );
}

function RiskDepthTimeline({ timeline, currentDepth, onSelectCategory }) {
  const minDepth = timeline[0].depth;
  const maxDepth = timeline[timeline.length - 1].depth;
  const range = maxDepth - minDepth;

  const categoryColors = {
    'mud-loss': '#ea580c',
    'stuck-pipe': '#dc2626',
    'kick': '#b91c1c',
    'torque': '#d97706',
    'cementing': '#059669',
    'general': '#6b7280',
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5">
      <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3 mb-5">Historical Risk by Depth</h3>
      <div className="relative">
        {/* Vertical track */}
        <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        {/* Current depth highlight */}
        {(() => {
          const pct = ((currentDepth - minDepth) / range) * 100;
          return (
            <div className="absolute left-16 w-32 h-0.5 bg-black dark:bg-white z-10" style={{ top: `${pct}%` }}>
              <div className="absolute -left-2 -top-1.5 w-3 h-3 rounded-full bg-black dark:bg-white border-2 border-white dark:border-[#1A1A1A]" />
            </div>
          );
        })()}

        <div className="space-y-3">
          {timeline.map((item, i) => {
            const pct = ((item.depth - minDepth) / range) * 100;
            const isCurrent = item.isCurrent;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="w-14 text-right text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 pt-0.5">{item.label}</div>
                <div className="relative flex-shrink-0 w-5 flex justify-center pt-0.5">
                  {isCurrent ? (
                    <div className="w-3 h-3 rounded-full bg-black dark:bg-white border-2 border-white dark:border-[#1A1A1A] shadow z-10" />
                  ) : item.events.length > 0 ? (
                    <div className="w-3 h-3 rounded-full border-2 border-white dark:border-[#1A1A1A] shadow z-10"
                      style={{ backgroundColor: categoryColors[item.events[0].category] || '#6b7280' }} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 mt-0.5" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  {isCurrent && (
                    <div className="text-xs font-bold text-black dark:text-white bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 inline-block">
                      ← W-051 Current ({item.depth.toLocaleString()} m)
                    </div>
                  )}
                  {item.events.map((evt, j) => (
                    <button
                      key={j}
                      onClick={() => onSelectCategory(evt.category)}
                      className={`text-xs font-medium px-2 py-0.5 rounded mr-1 transition-colors hover:opacity-80 text-white`}
                      style={{ backgroundColor: categoryColors[evt.category] || '#6b7280' }}
                    >
                      {evt.type}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RiskCalculationExplanation() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">How is this indicator calculated?</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 py-4 bg-white dark:bg-[#1A1A1A] text-sm space-y-3">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Historical Similarity Analysis</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Spatial Proximity', desc: 'Distance from W-051 to historical wells' },
              { label: 'Formation Similarity', desc: 'Matching formation intervals (X, Y, Z)' },
              { label: 'Depth Proximity', desc: 'Similarity in event depth ranges' },
              { label: 'Event Frequency', desc: 'Number of historical events per category' },
              { label: 'Severity Weighting', desc: 'Critical/High events weighted higher' },
            ].map((f, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-black dark:text-white">{f.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-400 italic border-t border-gray-100 dark:border-gray-800 pt-3">
            This is a demonstration scoring model combining the above factors. It is not a validated operational risk model or probabilistic prediction. All outputs are for decision-support reference only.
          </div>
        </div>
      )}
    </div>
  );
}

function RiskSummaryTable({ categories, onSelect }) {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-5 py-3">Risk Category</th>
              <th className="px-5 py-3">Indicator</th>
              <th className="px-5 py-3">Events</th>
              <th className="px-5 py-3">Nearest Depth</th>
              <th className="px-5 py-3">Formation</th>
              <th className="px-5 py-3">Supporting Wells</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => {
              const meta = getRiskIndicatorMeta(cat.indicator);
              return (
                <tr
                  key={i}
                  onClick={() => onSelect(cat.id)}
                  className="border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-5 py-3 font-bold text-black dark:text-white">{cat.name}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${meta.color}`}>{cat.indicator}</span>
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <div className={`h-1.5 rounded-full ${meta.color.includes('red') ? 'bg-red-500' : meta.color.includes('orange') ? 'bg-orange-500' : meta.color.includes('amber') ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${cat.indicator}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{cat.historicalEvents}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{cat.nearestDepth.toLocaleString()} m</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{cat.formation}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{cat.supportingWells.length}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${meta.bg} ${meta.color}`}>{cat.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoricalMitigation({ category }) {
  if (!category) return null;
  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5">
      <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
        Historical Mitigation — {category.name}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">Historical mitigation measures recorded in demonstration data. Review with current well parameters before application.</p>
      <ul className="space-y-2">
        {category.mitigation.map((m, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RiskEvidencePanel({ category, onViewEvidence, onOpenWell }) {
  if (!category) return null;
  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5">
      <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
        Risk Evidence — {category.name}
      </h3>
      <div className="space-y-3">
        {category.evidence.map((ev, i) => (
          <div key={i} className="flex items-center justify-between gap-4 p-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-100 dark:border-gray-800 rounded">
            <div className="flex gap-4 text-xs">
              <div><div className="text-gray-500 uppercase font-bold">Well</div><div className="font-bold text-black dark:text-white">{ev.wellId}</div></div>
              <div><div className="text-gray-500 uppercase font-bold">Depth</div><div className="font-bold text-black dark:text-white">{ev.depth.toLocaleString()} m</div></div>
              <div><div className="text-gray-500 uppercase font-bold">Formation</div><div className="font-bold text-black dark:text-white">{ev.formation}</div></div>
              <div className="hidden md:block"><div className="text-gray-500 uppercase font-bold">Document</div><div className="font-mono text-blue-600 dark:text-blue-400">{ev.documentId}</div></div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => onViewEvidence(ev)} className="text-xs px-3 py-1.5 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors">Evidence</button>
              <button onClick={() => onOpenWell(ev.wellId)} className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-bold rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Well</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const RiskMonitor = ({ setActiveTab }) => {
  const { activeWell, navigateToWell, navigateToTab, selectedRisk, setSelectedRisk } = useNwis();
  const { overall, context: riskContext, categories } = getRiskSummary();
  const currentDepth = activeWell.currentDepth || riskContext.currentDepth;
  const approachingZone = findApproachingZone(currentDepth);
  const timeline = getDepthTimeline();
  const overallMeta = getRiskIndicatorMeta(overall.indicator);

  const [selectedCategoryId, setSelectedCategoryId] = useState(selectedRisk?.id ? selectedRisk.id.replace('risk-', '') : 'mud-loss');
  const [activeEvidence, setActiveEvidence] = useState(null);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const openWell = (wellId) => {
    const well = getWellById(wellId);
    if (well) navigateToWell(well, 'well-explorer');
  };

  return (
    <div className="flex flex-col space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 flex-shrink-0">
        <div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-2">
            <button onClick={() => navigateToTab('command-center')} className="hover:text-black dark:hover:text-white">NWIS</button>
            <span>/</span>
            <span className="font-bold text-gray-600 dark:text-gray-300">Risk Monitor</span>
            {selectedCategoryId && (
              <>
                <span>/</span>
                <span className="font-bold text-gray-600 dark:text-gray-300">{categories.find(c => c.id === selectedCategoryId)?.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Risk Monitor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Historical-pattern-based risk intelligence for the active well.</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 italic mt-1">DEMONSTRATION HISTORICAL DATA — for decision support only.</p>
        </div>
      </div>

      <WellContextComparison />

      {/* Overall Risk Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gauge card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-6 flex flex-col items-center transition-colors">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Overall Historical Risk</div>
          <RiskGauge indicator={overall.indicator} level={overall.level} />
          <div className="mt-4 flex gap-4 text-[10px] text-gray-400">
            {[['0–30','Low','#16a34a'],['31–60','Moderate','#d97706'],['61–80','High','#ea580c'],['81–100','Critical','#dc2626']].map(([range, label, color]) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span>{range} {label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 italic text-center mt-3 max-w-xs">{overall.basis}</p>
          <RiskCalculationExplanation />
        </div>

        {/* Context card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-6 transition-colors">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Current Well Context</div>
          <div className="text-2xl font-bold text-black dark:text-white mb-1">{activeWell.id}</div>
          <div className="text-base text-gray-600 dark:text-gray-400 mb-5">{currentDepth.toLocaleString()} m · {activeWell.formation}</div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Nearby Historical Wells', value: riskContext.nearbyHistoricalWells },
              { label: 'Relevant Historical Events', value: riskContext.relevantHistoricalEvents },
              { label: 'Risk Zones Identified', value: riskContext.riskZonesIdentified },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-100 dark:border-gray-800 rounded p-3 text-center">
                <div className="text-2xl font-bold text-black dark:text-white">{stat.value}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Historical Alert Summary</div>
            {[
              { label: 'Mud Loss Pattern', depth: currentDepth, status: 'Approaching', color: 'bg-orange-500' },
              { label: 'Stuck Pipe Pattern', depth: 2580, status: 'Future depth range', color: 'bg-red-500' },
              { label: 'Kick Pattern', depth: 2850, status: 'Future depth range', color: 'bg-red-400' },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-100 dark:border-gray-800 rounded">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${a.color}`} />
                  <span className="font-medium text-black dark:text-white">{a.label}</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Factor Cards */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Risk Factors — Click to expand details</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categories.map(cat => (
            <RiskFactorCard
              key={cat.id}
              category={cat}
              isSelected={selectedCategoryId === cat.id}
              onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
              onViewEvidence={setActiveEvidence}
              onOpenWell={openWell}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApproachingZone zone={approachingZone} currentDepth={currentDepth} />
        <RiskAlert zone={approachingZone} currentDepth={currentDepth} onViewEvidence={setActiveEvidence} onOpenWell={openWell} onNavigateToTab={navigateToTab} />
      </div>

      {/* Depth Timeline + selected category details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RiskDepthTimeline
            timeline={timeline}
            currentDepth={currentDepth}
            onSelectCategory={id => setSelectedCategoryId(id)}
          />
        </div>
        <div className="lg:col-span-2 space-y-6">
          {selectedCategory && (
            <>
              <RiskEvidencePanel category={selectedCategory} onViewEvidence={setActiveEvidence} onOpenWell={openWell} />
              <HistoricalMitigation category={selectedCategory} />
            </>
          )}
        </div>
      </div>

      {/* Risk Summary Table */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Risk Summary Table</div>
        <RiskSummaryTable categories={categories} onSelect={id => setSelectedCategoryId(id)} />
      </div>

      {/* Evidence modal */}
      {activeEvidence && (
        <CommonEvidenceModal 
          document={getEvidenceForEvent(activeEvidence.id) || {
            id: activeEvidence.documentId,
            title: "Historical Demo Document",
            type: "Demo Record",
            date: "2018-05-12",
            wellId: activeEvidence.wellId,
            excerpt: `Historical demonstration record: Event recorded in this formation interval at ${activeEvidence.depth.toLocaleString()} m.`,
            mitigation: "Review historical drilling reports for full operational context."
          }} 
          event={activeEvidence} 
          onClose={() => setActiveEvidence(null)} 
        />
      )}
    </div>
  );
};

export default RiskMonitor;
