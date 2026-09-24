import React, { useState, useRef } from 'react';
import { searchHistoricalKnowledge } from '../services/historicalSearchService';
import { useNwis } from '../context/NwisContext';
import { EvidenceModal as CommonEvidenceModal } from '../components/common/EvidenceModal';
import { WellContextComparison } from '../components/common/WellContextComparison';
import { getWellById, getEvidenceForEvent } from '../services/nwisDataService';

// ─── Sub-components ────────────────────────────────────────────────────────────

const SEVERITY_COLORS = {
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const SUGGESTED_QUESTIONS = [
  'Show me stuck pipe incidents within 5 km of Well W-051.',
  'What happened around 2400 m in nearby wells?',
  'Which nearby wells experienced mud losses?',
  'Show historical kick events in X Formation.',
  'What mitigation measures were used for stuck pipe?',
  'Which historical wells are most similar to W-051?',
];



function EvidenceCard({ evidence, onViewEvidence, onOpenWell }) {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-4 flex flex-col gap-3 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Source Document</div>
          <div className="font-mono font-bold text-blue-700 dark:text-blue-400 text-sm">{evidence.documentId}</div>
        </div>
        <span className={`px-2 py-1 text-xs font-bold rounded ${SEVERITY_COLORS[evidence.severity] || SEVERITY_COLORS.Low}`}>
          {evidence.severity}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div><span className="text-gray-500 uppercase font-bold">Well</span><div className="font-bold text-black dark:text-white mt-0.5">{evidence.wellId}</div></div>
        <div><span className="text-gray-500 uppercase font-bold">Depth</span><div className="font-bold text-black dark:text-white mt-0.5">{evidence.depth.toLocaleString()} m</div></div>
        <div><span className="text-gray-500 uppercase font-bold">Formation</span><div className="font-bold text-black dark:text-white mt-0.5">{evidence.formation}</div></div>
        <div><span className="text-gray-500 uppercase font-bold">Event</span><div className="font-bold text-black dark:text-white mt-0.5">{evidence.eventType}</div></div>
      </div>
      <div className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-100 dark:border-gray-800 rounded p-3 text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">
        "{evidence.excerpt.slice(0, 100)}..."
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onViewEvidence(evidence)}
          className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors"
        >
          View Evidence
        </button>
        <button
          onClick={() => onOpenWell(evidence.wellId)}
          className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-xs font-bold rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Open Well
        </button>
      </div>
    </div>
  );
}

function ResultSummary({ result }) {
  const uniqueWells = [...new Set(result.matchedEvents.map(e => e.wellId))];
  const uniqueFormations = [...new Set(result.matchedEvents.map(e => e.formation))];
  const depths = result.matchedEvents.map(e => e.depth).sort((a, b) => a - b);
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-black dark:text-white font-medium">
        <span className="font-bold text-blue-700 dark:text-blue-400">{result.matchedEvents.length}</span> Events
      </div>
      <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-black dark:text-white font-medium">
        <span className="font-bold text-blue-700 dark:text-blue-400">{uniqueWells.length}</span> Wells
      </div>
      <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-black dark:text-white font-medium">
        <span className="font-bold text-blue-700 dark:text-blue-400">{result.sources.length}</span> Sources
      </div>
      {uniqueFormations[0] && (
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-black dark:text-white font-medium">
          Formation: <span className="font-bold ml-1">{uniqueFormations.join(', ')}</span>
        </div>
      )}
      {depths.length > 1 && (
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-black dark:text-white font-medium">
          Depth: <span className="font-bold ml-1">{depths[0].toLocaleString()}–{depths[depths.length - 1].toLocaleString()} m</span>
        </div>
      )}
      <div className="ml-auto flex items-center text-gray-400 gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        DEMONSTRATION DATA
      </div>
    </div>
  );
}

function HistoricalEventCard({ event, onViewEvidence, onOpenWell }) {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-default">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold text-black dark:text-white text-sm">{event.eventType}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{event.wellId}</div>
        </div>
        <span className={`px-2 py-0.5 text-xs font-bold rounded ${SEVERITY_COLORS[event.severity] || SEVERITY_COLORS.Low}`}>{event.severity}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div><span className="text-gray-500">Depth</span><div className="font-bold text-black dark:text-white">{event.depth.toLocaleString()} m</div></div>
        <div><span className="text-gray-500">Formation</span><div className="font-bold text-black dark:text-white">{event.formation}</div></div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{event.mitigation}</div>
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{event.documentId}</span>
        <div className="flex gap-2">
          <button onClick={() => onViewEvidence(event)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Evidence</button>
          <button onClick={() => onOpenWell(event.wellId)} className="text-xs text-gray-600 dark:text-gray-400 hover:underline font-medium">Well</button>
        </div>
      </div>
    </div>
  );
}

function PatternCard({ pattern }) {
  if (!pattern) return null;
  return (
    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded p-5">
      <div className="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Historical Pattern Detected</span>
      </div>
      <p className="text-sm text-amber-900 dark:text-amber-200 mb-2">{pattern.summary}</p>
      <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">{pattern.formations}</p>
      {pattern.mitigations.length > 0 && (
        <div>
          <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Historical Mitigation Measures</div>
          <ul className="space-y-1">
            {pattern.mitigations.map((m, i) => (
              <li key={i} className="text-xs text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                <span className="mt-0.5 text-amber-600">•</span> {m}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-3 text-[10px] text-amber-600 dark:text-amber-500 italic">
        Historical pattern — not a prediction. Review with current well parameters.
      </div>
      <div className="mt-4 flex gap-3">
        <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded transition-colors shadow-sm" onClick={() => pattern.onViewRisk && pattern.onViewRisk()}>
          View Historical Risk
        </button>
      </div>
    </div>
  );
}

function RetrievalExplanation({ criteria }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Why this result?</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 py-4 bg-white dark:bg-[#1A1A1A] grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div><div className="text-gray-500 uppercase font-bold tracking-wider mb-1">Event Types</div><div className="text-black dark:text-white">{criteria.eventTypes?.join(', ') || 'All'}</div></div>
          <div><div className="text-gray-500 uppercase font-bold tracking-wider mb-1">Radius</div><div className="text-black dark:text-white">{criteria.radius} km</div></div>
          <div><div className="text-gray-500 uppercase font-bold tracking-wider mb-1">Formation</div><div className="text-black dark:text-white">{criteria.formation || 'All'}</div></div>
          <div><div className="text-gray-500 uppercase font-bold tracking-wider mb-1">Depth Match</div><div className="text-black dark:text-white">{criteria.depths?.length > 0 ? `±200 m of ${criteria.depths[0].toLocaleString()} m` : 'All depths'}</div></div>
          <div><div className="text-gray-500 uppercase font-bold tracking-wider mb-1">Retrieved Sources</div><div className="text-black dark:text-white">{criteria.retrievedSources}</div></div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const AiSearch = ({ setActiveTab }) => {
  const { activeWell, navigateToWell, navigateToTab, setSelectedRisk } = useNwis();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | results | no-results | error
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeEvidence, setActiveEvidence] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    radius: '10', formation: 'All', eventType: 'All', severity: 'All'
  });
  const inputRef = useRef(null);

  const handleSearch = async (q) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setStatus('loading');
    setResult(null);
    try {
      const res = await searchHistoricalKnowledge(searchQuery, filters);
      if (res.matchedEvents.length === 0) {
        setStatus('no-results');
      } else {
        setResult(res);
        setStatus('results');
        setHistory(prev => {
          const shortQ = searchQuery.length > 40 ? searchQuery.slice(0, 38) + '…' : searchQuery;
          const newHistory = [{ query: searchQuery, short: shortQ, result: res }, ...prev.filter(h => h.query !== searchQuery)];
          return newHistory.slice(0, 8);
        });
      }
    } catch {
      setStatus('error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const restoreHistory = (item) => {
    setQuery(item.query);
    setResult(item.result);
    setStatus('results');
  };

  const openWell = (wellId) => {
    const well = getWellById(wellId);
    if (well) navigateToWell(well, 'well-explorer');
  };

  const handleViewRisk = (pattern) => {
    // Basic logic to determine risk type based on pattern summary
    if (pattern.summary.toLowerCase().includes('mud loss')) {
      setSelectedRisk({ id: 'risk-mudloss', name: 'Mud Loss', score: 82 });
    } else if (pattern.summary.toLowerCase().includes('stuck pipe')) {
      setSelectedRisk({ id: 'risk-stuckpipe', name: 'Stuck Pipe', score: 89 });
    }
    navigateToTab('risk-monitor');
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 flex-shrink-0">
        <div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-2">
            <button onClick={() => navigateToTab('command-center')} className="hover:text-black dark:hover:text-white">NWIS</button>
            <span>/</span>
            <span className="font-bold text-gray-600 dark:text-gray-300">AI Search</span>
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white">AI Historical Search</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ask natural-language questions across historical drilling knowledge.</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 italic mt-1">Search decades of drilling knowledge in seconds.</p>
        </div>
      </div>
      
      <WellContextComparison />

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left: History */}
        {history.length > 0 && (
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Questions</div>
              <div className="space-y-1">
                {history.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => restoreHistory(item)}
                    className="w-full text-left text-xs px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors truncate"
                  >
                    {item.short}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right: Main content */}
        <div className="flex-1 min-w-0 overflow-y-auto space-y-6 pb-6">
          {/* Search Card */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NWIS Intelligence Assistant</span>
              <span className="ml-auto text-xs text-gray-400">Historical knowledge available</span>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask NWIS about historical drilling events, nearby wells, formations or mitigation..."
                className="flex-1 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-700 rounded px-4 py-2.5 text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={() => handleSearch()}
                disabled={status === 'loading'}
                className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {status === 'loading' ? '...' : 'Search'}
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {showFilters ? '▲ Hide Filters' : '▼ Advanced Filters'}
            </button>

            {/* Filters panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Radius', key: 'radius', options: [['1','1 km'],['2','2 km'],['5','5 km'],['10','10 km']] },
                  { label: 'Formation', key: 'formation', options: [['All','All'],['X Formation','X Formation'],['Y Formation','Y Formation'],['Z Formation','Z Formation']] },
                  { label: 'Event Type', key: 'eventType', options: [['All','All'],['Stuck Pipe','Stuck Pipe'],['Mud Loss','Mud Loss'],['Kick','Kick'],['Torque Increase','Torque Increase']] },
                  { label: 'Severity', key: 'severity', options: [['All','All'],['Low','Low'],['Medium','Medium'],['High','High'],['Critical','Critical']] },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{f.label}</label>
                    <select
                      value={filters[f.key]}
                      onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm text-black dark:text-white focus:outline-none"
                    >
                      {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                  </div>
                ))}
                <div className="col-span-2 md:col-span-4 flex gap-2 mt-1">
                  <button onClick={() => handleSearch()} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors">Apply Filters</button>
                  <button onClick={() => setFilters({ radius: '10', formation: 'All', eventType: 'All', severity: 'All' })} className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-xs font-bold rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Reset</button>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Questions — idle only */}
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Suggested Questions</div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {SUGGESTED_QUESTIONS.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(sq)}
                    className="text-left text-sm bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded p-3 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-600 hover:text-black dark:hover:text-white transition-all shadow-sm"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {status === 'loading' && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-8 flex items-center gap-4">
              <div className="animate-spin w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full flex-shrink-0"></div>
              <div>
                <div className="text-sm font-bold text-black dark:text-white">Searching historical knowledge...</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Analyzing drilling records and formation data</div>
              </div>
            </div>
          )}

          {/* No Results */}
          {status === 'no-results' && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-8 text-center">
              <div className="text-black dark:text-white font-bold mb-2">No matching historical records found.</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Try changing the radius, formation, or event type.</div>
              <button onClick={() => setStatus('idle')} className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Clear</button>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-red-200 dark:border-red-900/50 rounded shadow-sm p-8 text-center">
              <div className="text-red-600 dark:text-red-400 font-bold mb-2">Unable to search the historical dataset.</div>
              <button onClick={() => handleSearch()} className="mt-4 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded">Retry</button>
            </div>
          )}

          {/* Results */}
          {status === 'results' && result && (
            <div className="space-y-6">
              {/* User message bubble */}
              <div className="flex justify-end">
                <div className="bg-gray-900 dark:bg-gray-700 text-white rounded-lg px-4 py-3 max-w-xl text-sm">
                  {result.query}
                </div>
              </div>

              {/* NWIS Response card */}
              <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-5 space-y-5 transition-colors">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">NWIS Historical Intelligence</span>
                  <span className="text-xs text-gray-400 ml-1">Source-backed demonstration response</span>
                </div>

                {/* Answer */}
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Answer</div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">{result.answer}</p>
                </div>

                {/* Summary Bar */}
                <ResultSummary result={result} />

                {/* Events */}
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Relevant Historical Events</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {result.matchedEvents.map((evt, i) => (
                      <HistoricalEventCard
                        key={i}
                        event={evt}
                        onViewEvidence={setActiveEvidence}
                        onOpenWell={openWell}
                      />
                    ))}
                  </div>
                </div>

                {/* Pattern */}
                {result.pattern && <PatternCard pattern={{...result.pattern, onViewRisk: () => handleViewRisk(result.pattern)}} />}

                {/* Retrieval explanation */}
                <RetrievalExplanation criteria={result.retrievalCriteria} />
              </div>

              {/* Evidence Cards */}
              {result.sources.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Source Evidence</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {result.sources.map((src, i) => {
                      const fullEvt = result.matchedEvents.find(e => e.documentId === src.id) || {};
                      return (
                        <EvidenceCard
                          key={i}
                          evidence={{ ...src, ...fullEvt }}
                          onViewEvidence={setActiveEvidence}
                          onOpenWell={openWell}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Related Wells */}
              {result.matchedWells.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Related Historical Wells</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {result.matchedWells.map((w, i) => (
                      <div key={i} className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-4 flex justify-between items-center gap-4">
                        <div>
                          <div className="font-bold text-black dark:text-white">{w.wellId}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{w.formation} · {w.distance} · {w.totalDepth}</div>
                          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">Similarity {w.similarity}%</div>
                        </div>
                        <button
                          onClick={() => openWell(w.wellId)}
                          className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex-shrink-0"
                        >
                          View Well
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Evidence Modal */}
      {activeEvidence && (
        <CommonEvidenceModal 
          document={getEvidenceForEvent(activeEvidence.id)} 
          event={activeEvidence} 
          onClose={() => setActiveEvidence(null)} 
        />
      )}
    </div>
  );
};

export default AiSearch;
