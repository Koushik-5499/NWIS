import React from 'react';
import { useNwis } from '../../context/NwisContext';
import { getWellById } from '../../services/nwisDataService';

export const EvidenceModal = ({ document, event, onClose }) => {
  const { navigateToWell } = useNwis();

  if (!document) return null;

  const handleOpenWell = () => {
    const well = getWellById(document.wellId);
    if (well) {
      navigateToWell(well, 'well-explorer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Document Evidence · {document.sourceStatus || 'DEMO SOURCE DATA'}
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white">{document.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto grow">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Well</div>
              <div className="font-bold text-black dark:text-white text-sm">{document.wellId}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Depth</div>
              <div className="font-bold text-black dark:text-white text-sm">{document.depth.toLocaleString()} m</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Event</div>
              <div className="font-bold text-black dark:text-white text-sm">{document.eventType}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Formation</div>
              <div className="font-bold text-black dark:text-white text-sm">{document.formation}</div>
            </div>
            {event && event.severity && (
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Severity</div>
                <div className="font-bold text-black dark:text-white text-sm">{event.severity}</div>
              </div>
            )}
            {document.date && (
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Date</div>
                <div className="font-bold text-black dark:text-white text-sm">{document.date}</div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 p-4 rounded">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Excerpt</h3>
              <p className="text-sm text-black dark:text-gray-300 italic">"{document.excerpt}"</p>
            </div>

            {event && event.mitigation && (
              <div className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 p-4 rounded">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mitigation Action</h3>
                <p className="text-sm text-black dark:text-gray-300">{event.mitigation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-black dark:text-white text-xs font-bold rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Close
          </button>
          <button onClick={handleOpenWell} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors">
            Open Well
          </button>
        </div>

      </div>
    </div>
  );
};
