import React, { useState, useEffect, useRef } from 'react';

const GoogleWellMap = ({ activeWell, historicalWells, selectedWellId, onSelectWell }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    // Check if google maps API is available
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
      } else {
        const timer = setTimeout(checkGoogleMaps, 500);
        return () => clearTimeout(timer);
      }
    };
    
    const errorTimer = setTimeout(() => {
      if (!window.google || !window.google.maps) {
        setMapError(true);
      }
    }, 5000);

    checkGoogleMaps();

    return () => clearTimeout(errorTimer);
  }, []);

  useEffect(() => {
    // Attach click listeners manually to custom elements if needed
    const handleMarkerClick = (e, wellId) => {
      e.preventDefault();
      e.stopPropagation();
      if (onSelectWell) onSelectWell(wellId);
    };

    if (mapLoaded) {
      // In a real app we might use react refs for each marker, but querying works for simple DOM
      const markers = document.querySelectorAll('gmp-advanced-marker');
      markers.forEach(marker => {
        const wellId = marker.getAttribute('title');
        if (wellId) {
          // avoid duplicate listeners
          marker.onclick = (e) => handleMarkerClick(e, wellId);
        }
      });
    }
  }, [mapLoaded, historicalWells, activeWell, onSelectWell]);

  if (mapError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 border border-red-200 dark:border-red-900/50 rounded p-6">
        <div className="text-red-500 font-bold mb-2">Unable to load Google Maps.</div>
        <div className="text-gray-500 dark:text-gray-400 text-sm text-center">Check your Google Maps API key and enabled APIs.</div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-[#0A0A0A] rounded">
        <div className="text-gray-500 dark:text-gray-400 font-medium flex flex-col items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full"></div>
          Loading nearby well intelligence...
        </div>
      </div>
    );
  }

  const getMarkerBgClass = (well) => {
    if (well.id === selectedWellId) return 'bg-blue-500 z-10 scale-125';
    if (well.severity === 'Critical' || well.severity === 'High') return 'bg-red-500';
    if (well.severity === 'Medium') return 'bg-amber-500';
    return 'bg-gray-500 dark:bg-gray-400';
  };

  return (
    <div className="relative h-full w-full rounded overflow-hidden shadow-inner bg-gray-100 dark:bg-gray-900">
      <gmp-map
        ref={(node) => {
          if (node && activeWell) {
            node.setAttribute('center', `${activeWell.latitude},${activeWell.longitude}`);
            node.setAttribute('zoom', '12');
            node.setAttribute('map-id', 'DEMO_MAP_ID');
          }
        }}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Active Well Marker */}
        {activeWell && (
          <gmp-advanced-marker 
            ref={(node) => {
              if (node) node.setAttribute('position', `${activeWell.latitude},${activeWell.longitude}`);
            }}
            title={activeWell.id}
          >
            <div className={`w-4 h-4 rounded-full border-2 border-black shadow hover:scale-125 transition-transform cursor-pointer ${selectedWellId === activeWell.id ? 'bg-blue-500 z-10 scale-125' : 'bg-green-500'}`}></div>
          </gmp-advanced-marker>
        )}

        {/* Historical Well Markers */}
        {historicalWells && historicalWells.map((well) => (
          <gmp-advanced-marker 
            key={well.id}
            ref={(node) => {
              if (node) node.setAttribute('position', `${well.latitude},${well.longitude}`);
            }}
            title={well.id}
          >
            <div className={`w-4 h-4 rounded-full border-2 border-black shadow hover:scale-125 transition-transform cursor-pointer ${getMarkerBgClass(well)}`}></div>
          </gmp-advanced-marker>
        ))}
      </gmp-map>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur shadow border border-gray-200 dark:border-gray-800 rounded p-3 text-xs transition-colors duration-200">
        <div className="font-bold text-black dark:text-white mb-2 uppercase tracking-wider">Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Active Well</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-800 dark:bg-gray-400"></div>
            <span className="text-gray-700 dark:text-gray-300">Historical Well</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Historical Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Critical Event</span>
          </div>
        </div>
      </div>
      
      {/* Map Toolbar (Demo) */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-black dark:text-white px-3 py-1.5 text-xs font-bold uppercase rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Fit All Wells
        </button>
        <button className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-black dark:text-white px-3 py-1.5 text-xs font-bold uppercase rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Reset View
        </button>
      </div>
    </div>
  );
};

export default GoogleWellMap;
