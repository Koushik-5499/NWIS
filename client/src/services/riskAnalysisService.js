/**
 * NWIS Risk Analysis Service — DEMONSTRATION MODEL
 *
 * This service computes historical-pattern risk indicators from mock data.
 * This is NOT a validated probabilistic model.
 * Replace this module with a real risk engine/API as needed.
 */

import { RISK_FACTORS, OVERALL_RISK, ACTIVE_WELL, DEPTH_TIMELINE, NEARBY_WELLS, HISTORICAL_EVENTS, RISK_ZONES } from '../data/nwisData';

export function getRiskSummary() {
  const activeWellContext = {
    id: ACTIVE_WELL.id,
    currentDepth: ACTIVE_WELL.currentDepth,
    formation: ACTIVE_WELL.formation,
    status: ACTIVE_WELL.status,
    nearbyHistoricalWells: NEARBY_WELLS.length,
    relevantHistoricalEvents: HISTORICAL_EVENTS.length,
    riskZonesIdentified: RISK_ZONES.length,
  };

  return {
    overall: OVERALL_RISK,
    context: activeWellContext,
    categories: RISK_FACTORS,
  };
}

export function calculateHistoricalRisk() {
  return OVERALL_RISK;
}

export function findRiskZones(currentDepth = 2380, windowAhead = 500) {
  return RISK_FACTORS.filter(cat => {
    const [start] = cat.depthRange;
    return start >= currentDepth && start <= currentDepth + windowAhead;
  }).sort((a, b) => a.nearestDepth - b.nearestDepth);
}

export function findApproachingZone(currentDepth = 2380) {
  const zones = findRiskZones(currentDepth, 300);
  if (zones.length === 0) return null;
  const zone = zones[0];
  return {
    ...zone,
    distanceTo: zone.nearestDepth - currentDepth,
  };
}

export function findSupportingEvents(categoryId) {
  const cat = RISK_FACTORS.find(c => c.id === categoryId);
  if (!cat) return [];
  return HISTORICAL_EVENTS.filter(e => {
    // Map categoryId to eventType
    const typeMap = {
      'mud-loss': 'Mud Loss',
      'stuck-pipe': 'Stuck Pipe',
      'kick': 'Kick',
      'torque': 'Torque Increase',
      'cementing': 'Cementing'
    };
    return e.eventType === typeMap[categoryId];
  });
}

export function findHistoricalMitigation(categoryId) {
  const cat = RISK_FACTORS.find(c => c.id === categoryId);
  return cat ? cat.mitigation : [];
}

export function getDepthTimeline() {
  return DEPTH_TIMELINE;
}

export function getRiskIndicatorMeta(indicator) {
  if (indicator >= 81) return { level: 'Critical', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-900/50' };
  if (indicator >= 61) return { level: 'High', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-900/50' };
  if (indicator >= 31) return { level: 'Moderate', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-900/50' };
  return { level: 'Low', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-900/50' };
}
