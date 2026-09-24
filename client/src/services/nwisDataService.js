import {
  ACTIVE_WELL,
  NEARBY_WELLS,
  HISTORICAL_EVENTS,
  RISK_ZONES,
  RISK_FACTORS,
  HISTORICAL_DOCUMENTS,
  FORMATION_DATA
} from '../data/nwisData';

export const getActiveWell = () => ACTIVE_WELL;

export const getNearbyWells = () => NEARBY_WELLS;

export const getWellById = (id) => {
  if (id === ACTIVE_WELL.id) return ACTIVE_WELL;
  return NEARBY_WELLS.find(w => w.id === id) || null;
};

export const getHistoricalEvents = () => HISTORICAL_EVENTS;

export const getEventsByWell = (wellId) => {
  return HISTORICAL_EVENTS.filter(e => e.wellId === wellId);
};

export const getEventsByType = (type) => {
  if (!type || type === 'All') return HISTORICAL_EVENTS;
  return HISTORICAL_EVENTS.filter(e => e.eventType === type);
};

export const getEventsByDepth = (minDepth, maxDepth) => {
  return HISTORICAL_EVENTS.filter(e => e.depth >= minDepth && e.depth <= maxDepth);
};

export const getRiskZones = () => RISK_ZONES;

export const getRiskFactors = () => RISK_FACTORS;

export const getDocuments = () => HISTORICAL_DOCUMENTS;

export const getDocumentById = (documentId) => {
  return HISTORICAL_DOCUMENTS.find(d => d.id === documentId) || null;
};

export const getEvidenceForEvent = (eventId) => {
  const event = HISTORICAL_EVENTS.find(e => e.id === eventId);
  if (!event || !event.documentId) return null;
  return getDocumentById(event.documentId);
};

export const getFormationData = () => FORMATION_DATA;
