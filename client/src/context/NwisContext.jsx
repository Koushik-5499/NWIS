import React, { createContext, useState, useContext } from 'react';
import { getActiveWell } from '../services/nwisDataService';

const NwisContext = createContext();

export const NwisProvider = ({ children, initialTheme = 'dark', navigateToTab }) => {
  const [activeWell] = useState(getActiveWell());
  const [selectedWell, setSelectedWell] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [theme, setTheme] = useState(initialTheme);

  const navigateToWell = (well, tab = 'well-explorer') => {
    setSelectedWell(well);
    if (navigateToTab) navigateToTab(tab);
  };

  const navigateToEvent = (event, tab = 'well-explorer') => {
    setSelectedEvent(event);
    if (navigateToTab) navigateToTab(tab);
  };

  const navigateToRisk = (risk, tab = 'risk-monitor') => {
    setSelectedRisk(risk);
    if (navigateToTab) navigateToTab(tab);
  };

  return (
    <NwisContext.Provider
      value={{
        activeWell,
        selectedWell,
        setSelectedWell,
        selectedEvent,
        setSelectedEvent,
        selectedRisk,
        setSelectedRisk,
        theme,
        setTheme,
        navigateToWell,
        navigateToEvent,
        navigateToRisk,
        navigateToTab
      }}
    >
      {children}
    </NwisContext.Provider>
  );
};

export const useNwis = () => useContext(NwisContext);
