export const ACTIVE_WELL = {
  id: "W-051",
  name: "W-051",
  currentDepth: 2380,
  formation: "X Formation",
  status: "Drilling",
  type: "active",
  latitude: 11.0168,
  longitude: 76.9558,
};

export const NEARBY_WELLS = [
  { id: "W-042", name: "W-042", type: "Historical", latitude: 11.0250, longitude: 76.9650, distance: 1.2, totalDepth: 3240, formation: "X Formation", events: "Mud Loss, Stuck Pipe, Kick", primaryRisk: "Mud Loss", severity: "Critical", similarity: 92, npt: 31, status: "Available", surfaceLocation: "Demo Location - Block A", drillingDuration: 28 },
  { id: "W-038", name: "W-038", type: "Historical", latitude: 11.0080, longitude: 76.9420, distance: 3.4, totalDepth: 3100, formation: "Y Formation", events: "Normal", primaryRisk: "None", severity: "Low", similarity: 78, npt: 24, status: "Available" },
  { id: "W-031", name: "W-031", type: "Historical", latitude: 11.0300, longitude: 76.9400, distance: 5.1, totalDepth: 2950, formation: "X Formation", events: "Gas Kick", primaryRisk: "Gas Kick", severity: "High", similarity: 85, npt: 19, status: "Available" },
  { id: "W-025", name: "W-025", type: "Historical", latitude: 11.0000, longitude: 76.9720, distance: 4.2, totalDepth: 3400, formation: "Z Formation", events: "Loss of Circulation", primaryRisk: "Loss of Circulation", severity: "Medium", similarity: 88, npt: 27, status: "Available" },
  { id: "W-019", name: "W-019", type: "Historical", latitude: 11.0400, longitude: 76.9750, distance: 4.5, totalDepth: 3050, formation: "X Formation", events: "Normal", primaryRisk: "None", severity: "Low", similarity: 80, npt: 12, status: "Available" },
  { id: "W-013", name: "W-013", type: "Historical", latitude: 11.0500, longitude: 76.9200, distance: 6.2, totalDepth: 3150, formation: "Y Formation", events: "Torque Increase", primaryRisk: "Torque Increase", severity: "Medium", similarity: 75, npt: 15, status: "Available" },
  { id: "W-009", name: "W-009", type: "Historical", latitude: 10.9900, longitude: 76.9100, distance: 7.1, totalDepth: 3300, formation: "X Formation", events: "Cementing", primaryRisk: "Cementing", severity: "Low", similarity: 82, npt: 10, status: "Available" }
];

export const HISTORICAL_EVENTS = [
  { id: "evt-w042-sp-2620", wellId: "W-042", eventType: "Stuck Pipe", depth: 2620, formation: "X Formation", severity: "Critical", description: "Differential sticking observed during connection", mitigation: "Wiper trip + circulation", documentId: "DDR-042-025" },
  { id: "evt-w042-ml-2410", wellId: "W-042", eventType: "Mud Loss", depth: 2410, formation: "X Formation", severity: "High", description: "Partial circulation losses were observed while drilling through the formation interval.", mitigation: "Loss circulation material applied and circulation restored.", documentId: "DDR-042-021" },
  { id: "evt-w042-kick-2850", wellId: "W-042", eventType: "Kick", depth: 2850, formation: "X Formation", severity: "Critical", description: "Increase in formation pressure observed at surface", mitigation: "Well control procedure initiated", documentId: "DDR-042-031" },
  { id: "evt-w042-torq-2250", wellId: "W-042", eventType: "Torque Increase", depth: 2250, formation: "X Formation", severity: "Medium", description: "Torque increased significantly during drilling operations", mitigation: "Adjusted drilling parameters", documentId: "DDR-042-018" },
  
  { id: "evt-w038-sp-2580", wellId: "W-038", eventType: "Stuck Pipe", depth: 2580, formation: "X Formation", severity: "High", description: "Pipe sticking observed during drilling operations at the X Formation boundary.", mitigation: "Circulation and operational adjustment. Freed after jarring operations.", documentId: "DDR-038-019" },
  { id: "evt-w038-ml-2395", wellId: "W-038", eventType: "Mud Loss", depth: 2395, formation: "Y Formation", severity: "Medium", description: "Minor circulation losses observed while transitioning through the formation boundary.", mitigation: "Swept with high-viscosity pill. Losses resolved.", documentId: "DDR-038-016" },
  
  { id: "evt-w031-kick-2850", wellId: "W-031", eventType: "Kick", depth: 2850, formation: "X Formation", severity: "High", description: "Gas kick observed during drilling of the high-pressure formation interval.", mitigation: "Shut-in well, increased mud weight, circulated kick out.", documentId: "DDR-031-024" },
  { id: "evt-w031-torq-2300", wellId: "W-031", eventType: "Torque Increase", depth: 2300, formation: "X Formation", severity: "Medium", description: "Elevated torque and drag observed while drilling through tight formation sections.", mitigation: "Reduced WOB and RPM. Reamed to clean hole.", documentId: "DDR-031-017" },
  
  { id: "evt-w025-ml-2425", wellId: "W-025", eventType: "Mud Loss", depth: 2425, formation: "Z Formation", severity: "High", description: "Severe circulation losses occurred while drilling through a fractured zone.", mitigation: "LCM squeeze applied. Partial circulation restored.", documentId: "DDR-025-020" },
  { id: "evt-w025-sp-2640", wellId: "W-025", eventType: "Stuck Pipe", depth: 2640, formation: "Z Formation", severity: "High", description: "Pipe became stuck while pulling out of hole through the loss zone.", mitigation: "Historical mitigation recorded: circulation and rotation restored movement.", documentId: "DDR-025-022" },
  
  { id: "evt-w019-torq-2150", wellId: "W-019", eventType: "Torque Increase", depth: 2150, formation: "X Formation", severity: "Low", description: "Slight torque increase noted, within operational limits.", mitigation: "Parameters monitored. Drilling continued normally.", documentId: "DDR-019-012" },
  { id: "evt-w042-cem-3020", wellId: "W-042", eventType: "Cementing", depth: 3020, formation: "X Formation", severity: "Low", description: "Cementing operations recorded.", mitigation: "Pre-job planning review", documentId: "WCR-042-001" },
];

export const RISK_ZONES = [
  { id: "zone-mud-loss", type: "Mud Loss", startDepth: 2395, endDepth: 2425, severity: "High", supportingWells: ["W-042", "W-038", "W-025"] },
  { id: "zone-stuck-pipe", type: "Stuck Pipe", startDepth: 2580, endDepth: 2640, severity: "High", supportingWells: ["W-042", "W-038", "W-025"] },
  { id: "zone-kick", type: "Kick / Overpressure", startDepth: 2850, endDepth: 2850, severity: "Medium", supportingWells: ["W-042", "W-031"] },
  { id: "zone-torque", type: "Torque Anomaly", startDepth: 2150, endDepth: 2300, severity: "Medium", supportingWells: ["W-042", "W-031", "W-019"] },
  { id: "zone-cementing", type: "Cementing", startDepth: 3020, endDepth: 3200, severity: "Low", supportingWells: ["W-042", "W-019"] },
];

export const RISK_FACTORS = [
  {
    id: 'mud-loss',
    name: 'Mud Loss',
    indicator: 82,
    status: 'High',
    historicalEvents: 3,
    nearestDepth: 2395,
    depthRange: [2395, 2425],
    formation: 'X Formation',
    supportingWells: ['W-042', 'W-038', 'W-025'],
    eventDepths: [2410, 2395, 2425],
    mitigation: [
      'Loss circulation material (LCM) applied',
      'Controlled circulation rate reduction',
      'Mud property adjustment',
    ],
    description: '3 nearby demonstration wells recorded mud-loss events in the 2,395–2,425 m interval. Current well is 15 m from the start of this historical pattern zone.',
    pattern: '3 nearby wells recorded mud-loss events between 2,395 m and 2,425 m in similar formation intervals.',
    severity: 'High'
  },
  {
    id: 'stuck-pipe',
    name: 'Stuck Pipe',
    indicator: 74,
    status: 'High',
    historicalEvents: 3,
    nearestDepth: 2580,
    depthRange: [2580, 2640],
    formation: 'X Formation',
    supportingWells: ['W-042', 'W-038', 'W-025'],
    eventDepths: [2620, 2580, 2640],
    mitigation: [
      'Wiper trip to clean wellbore',
      'Circulation to restore mud flow',
      'Operational parameter adjustment (WOB, RPM)',
    ],
    description: '3 nearby demonstration wells recorded stuck-pipe events in the 2,580–2,640 m range. This zone is 200 m ahead of the current well depth.',
    pattern: '3 nearby wells recorded stuck-pipe events at depths between 2,580 m and 2,640 m.',
    severity: 'High'
  },
  {
    id: 'kick',
    name: 'Kick / Overpressure',
    indicator: 61,
    status: 'Medium',
    historicalEvents: 2,
    nearestDepth: 2850,
    depthRange: [2850, 2850],
    formation: 'X Formation',
    supportingWells: ['W-042', 'W-031'],
    eventDepths: [2850, 2850],
    mitigation: [
      'Well control procedure initiated',
      'Pressure monitoring increased',
      'Mud-weight adjustment',
    ],
    description: '2 nearby demonstration wells recorded kick-related events around 2,850 m.',
    pattern: '2 nearby wells recorded kick events at depths around 2,850 m.',
    severity: 'Medium'
  },
  {
    id: 'torque',
    name: 'Torque Anomaly',
    indicator: 58,
    status: 'Medium',
    historicalEvents: 2,
    nearestDepth: 2150,
    depthRange: [2150, 2300],
    formation: 'X Formation',
    supportingWells: ['W-042', 'W-031', 'W-019'],
    eventDepths: [2250, 2300, 2150],
    mitigation: [
      'Reduced WOB and RPM',
      'Reaming operations to clean hole',
      'Drilling parameter monitoring',
    ],
    description: 'Torque anomaly events recorded in nearby wells. Current well has already passed the 2,150–2,300 m range.',
    pattern: '2 nearby wells recorded elevated torque and drag in the 2,150–2,300 m interval.',
    severity: 'Medium'
  },
  {
    id: 'cementing',
    name: 'Cementing',
    indicator: 42,
    status: 'Low',
    historicalEvents: 2,
    nearestDepth: 3020,
    depthRange: [3020, 3200],
    formation: 'X Formation',
    supportingWells: ['W-042', 'W-019'],
    eventDepths: [3020, 3200],
    mitigation: [
      'Pre-job planning review',
      'Centralizer placement verification',
      'Slurry design review',
    ],
    description: 'Historical cementing records are available from nearby wells at depths 3,020–3,200 m.',
    pattern: 'Cementing operations recorded in nearby wells at depths beyond 3,020 m.',
    severity: 'Low'
  },
];

export const HISTORICAL_DOCUMENTS = [
  { id: "DDR-042-025", type: "Daily Drilling Report", wellId: "W-042", title: "Daily Drilling Report - Day 25", eventType: "Stuck Pipe", depth: 2620, formation: "X Formation", excerpt: "Demonstration record: Differential sticking observed while drilling through the formation interval at 2,620 m. Wiper trip initiated and circulation restored after 12 hours NPT.", sourceStatus: "Demonstration Data", date: "2021-04-25" },
  { id: "DDR-042-021", type: "Daily Drilling Report", wellId: "W-042", title: "Daily Drilling Report - Day 21", eventType: "Mud Loss", depth: 2410, formation: "X Formation", excerpt: "Demonstration record: Partial losses were observed while drilling through the X Formation interval at 2,410 m. LCM applied, losses controlled after 8 hours.", sourceStatus: "Demonstration Data", date: "2021-04-21" },
  { id: "DDR-042-031", type: "Daily Drilling Report", wellId: "W-042", title: "Daily Drilling Report - Day 31", eventType: "Kick", depth: 2850, formation: "X Formation", excerpt: "Demonstration record: Formation pressure influx observed at 2,850 m. Well control procedure initiated, well secured after 4 hours.", sourceStatus: "Demonstration Data", date: "2021-05-01" },
  { id: "DDR-042-018", type: "Daily Drilling Report", wellId: "W-042", title: "Daily Drilling Report - Day 18", eventType: "Torque Increase", depth: 2250, formation: "X Formation", excerpt: "Demonstration record: Torque increase observed at 2,250 m. Parameters adjusted and drilling continued.", sourceStatus: "Demonstration Data", date: "2021-04-18" },
  { id: "DDR-038-019", type: "Daily Drilling Report", wellId: "W-038", title: "Daily Drilling Report", eventType: "Stuck Pipe", depth: 2580, formation: "X Formation", excerpt: "Demonstration record: Pipe sticking observed at 2,580 m during X Formation drilling. Freed after jarring operations and mud-weight adjustment.", sourceStatus: "Demonstration Data", date: "2020-08-19" },
  { id: "DDR-038-016", type: "Daily Drilling Report", wellId: "W-038", title: "Daily Drilling Report", eventType: "Mud Loss", depth: 2395, formation: "Y Formation", excerpt: "Demonstration record: Minor losses at 2,395 m during formation transition. Resolved with high-viscosity pill.", sourceStatus: "Demonstration Data", date: "2020-08-16" },
  { id: "DDR-031-024", type: "Daily Drilling Report", wellId: "W-031", title: "Daily Drilling Report", eventType: "Kick", depth: 2850, formation: "X Formation", excerpt: "Demonstration record: Gas kick observed at 2,850 m. Shut-in procedure initiated, kick circulated out safely.", sourceStatus: "Demonstration Data", date: "2019-11-24" },
  { id: "DDR-031-017", type: "Daily Drilling Report", wellId: "W-031", title: "Daily Drilling Report", eventType: "Torque Increase", depth: 2300, formation: "X Formation", excerpt: "Demonstration record: High torque and drag at 2,300 m. Reaming operations performed to clean the hole.", sourceStatus: "Demonstration Data", date: "2019-11-17" },
  { id: "DDR-025-020", type: "Daily Drilling Report", wellId: "W-025", title: "Daily Drilling Report", eventType: "Mud Loss", depth: 2425, formation: "Z Formation", excerpt: "Demonstration record: Severe losses at 2,425 m in fractured zone. LCM squeeze applied, partial restoration achieved.", sourceStatus: "Demonstration Data", date: "2018-05-20" },
  { id: "DDR-025-022", type: "Daily Drilling Report", wellId: "W-025", title: "Daily Drilling Report", eventType: "Stuck Pipe", depth: 2640, formation: "Z Formation", excerpt: "Demonstration record: Pipe stuck at 2,640 m while POOH through loss zone. Circulation and rotation applied.", sourceStatus: "Demonstration Data", date: "2018-05-22" },
  { id: "DDR-019-012", type: "Daily Drilling Report", wellId: "W-019", title: "Daily Drilling Report", eventType: "Torque Increase", depth: 2150, formation: "X Formation", excerpt: "Demonstration record: Minor torque increase at 2,150 m. Operations continued normally with monitoring.", sourceStatus: "Demonstration Data", date: "2017-02-12" },
  { id: "WCR-042-001", type: "Well Completion Report", wellId: "W-042", title: "Well Completion Report", eventType: "Cementing", depth: 3020, formation: "X Formation", excerpt: "Demonstration record: Cementing operations at 3,020 m.", sourceStatus: "Demonstration Data", date: "2021-05-15" }
];

export const FORMATION_DATA = [
  { name: "X Formation" },
  { name: "Y Formation" },
  { name: "Z Formation" }
];

export const SOURCE_RECORDS = {};

export const OVERALL_RISK = {
  indicator: 78,
  level: 'High',
  label: 'Historical Pattern Indicator',
  basis: 'Based on available nearby-well records, event history, formation similarity and depth similarity.',
};

export const DEPTH_TIMELINE = [
  { depth: 2000, label: '2,000 m', events: [] },
  { depth: 2150, label: '2,150 m', events: [{ type: 'Torque Anomaly', category: 'torque', status: 'Passed' }] },
  { depth: 2380, label: '2,380 m', events: [], isCurrent: true },
  { depth: 2395, label: '2,395 m', events: [{ type: 'Mud Loss Zone Start', category: 'mud-loss', status: 'Approaching' }] },
  { depth: 2410, label: '2,410 m', events: [{ type: 'Mud Loss (W-042)', category: 'mud-loss', status: 'Approaching' }] },
  { depth: 2425, label: '2,425 m', events: [{ type: 'Mud Loss Zone End', category: 'mud-loss', status: 'Approaching' }] },
  { depth: 2580, label: '2,580 m', events: [{ type: 'Stuck Pipe Zone', category: 'stuck-pipe', status: 'Future' }] },
  { depth: 2640, label: '2,640 m', events: [{ type: 'Stuck Pipe Zone End', category: 'stuck-pipe', status: 'Future' }] },
  { depth: 2850, label: '2,850 m', events: [{ type: 'Kick History', category: 'kick', status: 'Future' }] },
  { depth: 3020, label: '3,020 m', events: [{ type: 'Cementing Records', category: 'cementing', status: 'Future' }] },
  { depth: 3240, label: '3,240 m', events: [{ type: 'Total Depth (W-042)', category: 'general', status: 'Future' }] },
];

export const SOURCE_SUMMARY = [
  { type: 'Daily Drilling Reports', count: 8 },
  { type: 'Well Completion Reports', count: 1 },
  { type: 'Mud Logging Reports', count: 1 },
  { type: 'Cementing Reports', count: 1 },
];
