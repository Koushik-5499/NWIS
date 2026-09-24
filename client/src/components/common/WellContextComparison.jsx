import React from 'react';
import { useNwis } from '../../context/NwisContext';

export function WellContextComparison() {
  const { activeWell, selectedWell } = useNwis();

  if (!selectedWell) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-4 flex gap-4 items-center">
        <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold flex-shrink-0">W</div>
        <div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Current Well</div>
          <div className="text-sm font-bold text-black dark:text-white leading-none mb-1">{activeWell.id}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{activeWell.currentDepth.toLocaleString()} m · {activeWell.formation}</div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">VS</div>
      </div>

      <div className="flex-1 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded shadow-sm p-4 flex gap-4 items-center">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">H</div>
        <div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Historical Well</div>
          <div className="text-sm font-bold text-black dark:text-white leading-none mb-1">{selectedWell.id}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{selectedWell.totalDepth?.toLocaleString() || selectedWell.depth?.toLocaleString()} m · {selectedWell.formation || 'X Formation'} · {selectedWell.distance ? selectedWell.distance + ' km' : '1.2 km'}</div>
        </div>
      </div>
    </div>
  );
}
