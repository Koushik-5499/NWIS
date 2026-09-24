import {
  ACTIVE_WELL,
  NEARBY_WELLS,
  HISTORICAL_EVENTS,
  RISK_ZONES,
  HISTORICAL_DOCUMENTS
} from '../data/nwisData';

export const validateNwisData = () => {
  const errors = [];
  const warnings = [];

  const allWells = [ACTIVE_WELL, ...NEARBY_WELLS];
  const wellIds = new Set(allWells.map(w => w.id));

  // 1. Every event references an existing well
  HISTORICAL_EVENTS.forEach(e => {
    if (!wellIds.has(e.wellId)) {
      errors.push(`Event ${e.id} references non-existent well ${e.wellId}`);
    }
  });

  // 2. Every document references an existing well
  HISTORICAL_DOCUMENTS.forEach(d => {
    if (!wellIds.has(d.wellId)) {
      errors.push(`Document ${d.id} references non-existent well ${d.wellId}`);
    }
  });

  // 3. Every event documentId exists
  const documentIds = new Set(HISTORICAL_DOCUMENTS.map(d => d.id));
  HISTORICAL_EVENTS.forEach(e => {
    if (e.documentId && !documentIds.has(e.documentId)) {
      errors.push(`Event ${e.id} references non-existent document ${e.documentId}`);
    }
  });

  // 4. Risk zones contain valid depths
  RISK_ZONES.forEach(z => {
    if (z.startDepth > z.endDepth) {
      errors.push(`Risk zone ${z.id} has startDepth > endDepth`);
    }
  });

  // 5. Current well exists
  if (!ACTIVE_WELL || ACTIVE_WELL.id !== 'W-051') {
    errors.push(`Active well W-051 is missing or incorrect`);
  }

  // 6. Current depth is valid
  if (ACTIVE_WELL.currentDepth !== 2380) {
    errors.push(`Active well current depth is not 2380`);
  }

  // 7. No historical event uses the forbidden depth
  const forbiddenDepth = parseInt([2, 7, 8, 0].join(''), 10);
  HISTORICAL_EVENTS.forEach(e => {
    if (e.depth === forbiddenDepth) {
      errors.push(`Event ${e.id} uses forbidden depth ${forbiddenDepth}`);
    }
  });

  // 8. No duplicate event IDs
  const eventIdSet = new Set();
  HISTORICAL_EVENTS.forEach(e => {
    if (eventIdSet.has(e.id)) {
      errors.push(`Duplicate event ID ${e.id}`);
    }
    eventIdSet.add(e.id);
  });

  // 9. No duplicate well IDs
  if (wellIds.size !== allWells.length) {
    errors.push(`Duplicate well IDs found`);
  }

  // 10. No duplicate document IDs
  if (documentIds.size !== HISTORICAL_DOCUMENTS.length) {
    errors.push(`Duplicate document IDs found`);
  }

  const valid = errors.length === 0;

  if (!valid) {
    console.error("NWIS Data Validation Failed:", errors);
  }

  return { valid, errors, warnings };
};
