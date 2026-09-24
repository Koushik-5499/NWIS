/**
 * NWIS Historical Search Service
 * Local mock retrieval engine simulating a RAG (Retrieval-Augmented Generation) workflow.
 * 
 * ARCHITECTURE NOTE:
 * Replace `searchHistoricalKnowledge()` with a real API call to connect a live LLM/vector-search backend.
 * All other UI state/flow remains the same.
 */

import { getHistoricalEvents, getNearbyWells, getDocumentById } from './nwisDataService';

// ─── Query Classification ──────────────────────────────────────────────────────

const EVENT_KEYWORDS = {
  'Stuck Pipe': ['stuck', 'sticking', 'pipe stuck', 'differential sticking', 'jar'],
  'Mud Loss': ['mud loss', 'circulation loss', 'losses', 'lost circulation', 'lcm', 'loss zone'],
  'Kick': ['kick', 'influx', 'overpressure', 'well control', 'shut-in', 'gas kick'],
  'Torque Increase': ['torque', 'drag', 'friction', 'tight hole'],
  'Cementing': ['cement', 'cementing', 'casing cement'],
};

const DEPTH_PATTERN = /(\d{1,4})\s*m/gi;
const RADIUS_PATTERN = /(\d+)\s*km/i;
const FORMATION_PATTERN = /(x|y|z)\s*formation/i;

export function classifyQuery(query) {
  const q = query.toLowerCase();

  const detectedEvents = [];
  for (const [eventType, keywords] of Object.entries(EVENT_KEYWORDS)) {
    if (keywords.some(kw => q.includes(kw))) {
      detectedEvents.push(eventType);
    }
  }

  // Depth extraction
  const depthMatches = [...query.matchAll(DEPTH_PATTERN)];
  const depths = depthMatches.map(m => parseInt(m[1])).filter(d => d > 100 && d < 6000);

  // Radius extraction
  const radiusMatch = query.match(RADIUS_PATTERN);
  const radius = radiusMatch ? parseInt(radiusMatch[1]) : 10;

  // Formation
  const formationMatch = query.match(FORMATION_PATTERN);
  const formation = formationMatch ? `${formationMatch[1].toUpperCase()} Formation` : null;

  // Query intent
  let intent = 'general';
  if (q.includes('similar') || q.includes('like w-051')) intent = 'similarity';
  else if (q.includes('mitigation') || q.includes('measure') || q.includes('prevent')) intent = 'mitigation';
  else if (depths.length > 0 && detectedEvents.length === 0) intent = 'depth';
  else if (detectedEvents.length > 0) intent = 'event';
  else if (formation) intent = 'formation';

  return { detectedEvents, depths, radius, formation, intent };
}

// ─── Retrieval Functions ───────────────────────────────────────────────────────

export function findRelevantEvents(query, filters = {}) {
  const { detectedEvents, depths, radius, formation } = classifyQuery(query);
  const q = query.toLowerCase();

  let results = getHistoricalEvents().map(e => {
    const doc = getDocumentById(e.documentId);
    const well = getNearbyWells().find(w => w.id === e.wellId);
    return {
      ...e,
      documentType: doc?.type,
      excerpt: doc?.excerpt,
      distance: well ? well.distance : 10
    };
  });

  // Filter by event type
  if (detectedEvents.length > 0) {
    results = results.filter(r => detectedEvents.includes(r.eventType));
  }

  // Filter by radius
  const maxRadius = filters.radius ? parseFloat(filters.radius) : radius;
  if (maxRadius < 10) {
    results = results.filter(r => r.distance <= maxRadius);
  }

  // Filter by formation
  const formationFilter = filters.formation && filters.formation !== 'All' ? filters.formation : formation;
  if (formationFilter) {
    results = results.filter(r => r.formation === formationFilter);
  }

  // Filter by depth range
  if (depths.length > 0) {
    const depthCenter = depths[0];
    const depthWindow = filters.depthMin && filters.depthMax
      ? { min: parseFloat(filters.depthMin), max: parseFloat(filters.depthMax) }
      : { min: depthCenter - 200, max: depthCenter + 200 };
    results = results.filter(r => r.depth >= depthWindow.min && r.depth <= depthWindow.max);
  }

  // Filter by event type from filters panel
  if (filters.eventType && filters.eventType !== 'All') {
    results = results.filter(r => r.eventType === filters.eventType);
  }

  // Filter by severity
  if (filters.severity && filters.severity !== 'All') {
    results = results.filter(r => r.severity === filters.severity);
  }

  // Similarity query
  if (q.includes('similar') && results.length === 0) {
    const allEvents = getHistoricalEvents().map(e => {
      const well = getNearbyWells().find(w => w.id === e.wellId);
      return { ...e, distance: well ? well.distance : 10 };
    });
    results = allEvents.filter(r => r.distance <= 5);
  }

  if (q.includes('mitigation') || q.includes('measure')) {
    const allEvents = getHistoricalEvents();
    results = allEvents.filter(r => 
      detectedEvents.length === 0 || detectedEvents.includes(r.eventType)
    );
  }

  return results;
}

export function findRelevantWells(events) {
  const wellIds = [...new Set(events.map(e => e.wellId))];
  const wells = getNearbyWells().filter(w => wellIds.includes(w.id));
  return wells
    .map(w => ({ wellId: w.id, similarity: w.similarity, formation: w.formation, distance: `${w.distance} km`, totalDepth: `${w.totalDepth.toLocaleString()} m` }))
    .sort((a, b) => b.similarity - a.similarity);
}

export function findRelevantDocuments(events) {
  const seen = new Set();
  return events.filter(e => {
    if (seen.has(e.documentId)) return false;
    seen.add(e.documentId);
    return true;
  }).map(e => ({
    id: e.documentId,
    type: e.documentType,
    wellId: e.wellId,
    eventType: e.eventType,
    depth: e.depth,
  }));
}

// ─── Answer Generation ─────────────────────────────────────────────────────────

export function generateMockAnswer(results, query, classification) {
  const { intent, detectedEvents, depths } = classification;
  const count = results.length;
  const wells = findRelevantWells(results);

  if (count === 0) return null;

  const eventLabel = detectedEvents[0] || 'operational';
  const wellNames = wells.map(w => w.wellId).join(', ');

  if (intent === 'similarity') {
    return `Based on available demonstration data, the most similar historical wells to W-051 are: ${wellNames}. Similarity is computed from spatial proximity, formation type, and drilling depth context. This is a demonstration metric and does not constitute a validated prediction.`;
  }

  if (intent === 'mitigation') {
    const mitigations = [...new Set(results.map(r => r.mitigation))];
    return `Historical mitigation measures recorded for ${eventLabel} events in nearby wells include:\n\n${mitigations.map(m => `• ${m}`).join('\n')}\n\nThese are historical demonstration records only. Verify with current well parameters before applying.`;
  }

  if (intent === 'depth') {
    const depthStr = depths[0] ? `around ${depths[0]} m` : 'in the specified depth range';
    return `${count} historical event${count !== 1 ? 's' : ''} were identified ${depthStr} across nearby demonstration wells (${wellNames}). These records may provide relevant historical context for the current active well interval.`;
  }

  return `${count} historical ${eventLabel.toLowerCase()} record${count !== 1 ? 's' : ''} ${count !== 1 ? 'were' : 'was'} identified in ${wells.length} nearby demonstration well${wells.length !== 1 ? 's' : ''} (${wellNames}). These historical records are provided for engineering context and should be reviewed alongside current well data.`;
}

export function generatePattern(results, classification) {
  const { detectedEvents } = classification;
  const depths = results.map(r => r.depth).sort((a, b) => a - b);
  const formations = [...new Set(results.map(r => r.formation))];

  if (results.length === 0) return null;

  const eventLabel = detectedEvents[0] || 'operational events';
  const minDepth = Math.min(...depths);
  const maxDepth = Math.max(...depths);
  const mitigations = [...new Set(results.map(r => r.mitigation))].slice(0, 3);
  const wellCount = [...new Set(results.map(r => r.wellId))].length;

  return {
    summary: `${wellCount} nearby demonstration well${wellCount !== 1 ? 's' : ''} recorded ${eventLabel.toLowerCase()}-related events between approximately ${minDepth.toLocaleString()} m and ${maxDepth.toLocaleString()} m.`,
    formations: `${formations.length === 1 ? formations[0] : formations.join(', ')} formation${formations.length > 1 ? 's' : ''} represented.`,
    mitigations,
  };
}

// ─── Main Search Entry Point ───────────────────────────────────────────────────

/**
 * Main search function. Replace this function with a real API call to integrate a live backend.
 * @param {string} query - Natural language query from the user
 * @param {object} filters - Optional filter overrides
 * @returns {object} Structured search result
 */
export async function searchHistoricalKnowledge(query, filters = {}) {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 900 + Math.random() * 600));

  const classification = classifyQuery(query);
  const matchedEvents = findRelevantEvents(query, filters);
  const matchedWells = findRelevantWells(matchedEvents);
  const sources = findRelevantDocuments(matchedEvents);
  const answer = generateMockAnswer(matchedEvents, query, classification);
  const pattern = generatePattern(matchedEvents, classification);

  return {
    query,
    classification,
    answer,
    matchedEvents,
    matchedWells,
    sources,
    pattern,
    retrievalCriteria: {
      eventTypes: classification.detectedEvents,
      depths: classification.depths,
      radius: filters.radius || classification.radius,
      formation: filters.formation !== 'All' ? filters.formation : classification.formation,
      formation_filter: classification.formation,
      retrievedSources: sources.length,
    },
  };
}
