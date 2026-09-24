/**
 * Event Timeline Service
 * Provides filtering, sorting, and summary functions for the timeline view.
 * Uses canonical data from eventTimeline.js (which re-exports historicalKnowledge.js).
 */

import { HISTORICAL_EVENTS, RISK_ZONES, ACTIVE_WELL, SOURCE_SUMMARY } from '../data/nwisData';

export function getTimelineEvents() {
  return [...HISTORICAL_EVENTS].sort((a, b) => a.depth - b.depth);
}

export function filterTimelineEvents(events, filters) {
  let result = [...events];

  if (filters.wellId && filters.wellId !== 'All') {
    result = result.filter(e => e.wellId === filters.wellId);
  }
  if (filters.eventType && filters.eventType !== 'All') {
    result = result.filter(e => e.eventType === filters.eventType);
  }
  if (filters.severity && filters.severity !== 'All') {
    result = result.filter(e => e.severity === filters.severity);
  }
  if (filters.formation && filters.formation !== 'All') {
    result = result.filter(e => e.formation === filters.formation);
  }
  if (filters.depthMin != null && filters.depthMin !== '') {
    const min = parseFloat(filters.depthMin);
    if (!isNaN(min)) result = result.filter(e => e.depth >= min);
  }
  if (filters.depthMax != null && filters.depthMax !== '') {
    const max = parseFloat(filters.depthMax);
    if (!isNaN(max)) result = result.filter(e => e.depth <= max);
  }

  return result.sort((a, b) => a.depth - b.depth);
}

export function getRiskZones() {
  return RISK_ZONES;
}

export function getEventsByWell(wellId) {
  return getTimelineEvents().filter(e => e.wellId === wellId);
}

export function getEventsByType(eventType) {
  return getTimelineEvents().filter(e => e.eventType === eventType);
}

export function getEventsByDepth(minDepth, maxDepth) {
  return getTimelineEvents().filter(e => e.depth >= minDepth && e.depth <= maxDepth);
}

export function getTimelineSummary() {
  const events = getTimelineEvents();
  const wells = [...new Set(events.map(e => e.wellId))];
  const zones = RISK_ZONES;
  const active = ACTIVE_WELL;

  // Find nearest approaching zone
  const approaching = zones.filter(z => z.depthStart > active.currentDepth).sort((a, b) => a.depthStart - b.depthStart)[0];
  const distanceToZone = approaching ? approaching.depthStart - active.currentDepth : null;

  return {
    totalEvents: events.length,
    totalWells: wells.length,
    riskZones: zones.length,
    currentDepth: active.currentDepth,
    nextZone: approaching,
    distanceToZone,
  };
}

export function getActiveWell() {
  return ACTIVE_WELL;
}

export function getSourceSummary() {
  return SOURCE_SUMMARY;
}
