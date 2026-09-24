export const WELL_DETAILS = {
  'W-042': {
    id: 'W-042',
    type: 'Historical Well',
    distance: '1.2 km',
    surfaceLocation: 'Demo Location - Block A',
    totalDepth: '3,240 m',
    formation: 'X Formation',
    drillingDuration: 28,
    npt: '31 hrs',
    similarity: '92%',
    primaryRisk: 'Mud Loss',
    events: [
      { depth: '2,250 m', type: 'Torque Increase', formation: 'X Formation', severity: 'Medium', description: 'Torque increased during drilling operations', mitigation: 'Adjusted drilling parameters', source: 'DDR-042-018' },
      { depth: '2,410 m', type: 'Mud Loss', formation: 'X Formation', severity: 'High', description: 'Partial circulation losses were observed while drilling through the formation interval.', mitigation: 'Loss circulation material applied and circulation restored.', source: 'DDR-042-021' },
      { depth: '2,620 m', type: 'Stuck Pipe', formation: 'X Formation', severity: 'Critical', description: 'Differential sticking observed during connection', mitigation: 'Wiper trip + circulation', source: 'DDR-042-025' },
      { depth: '2,850 m', type: 'Kick', formation: 'X Formation', severity: 'Critical', description: 'Increase in formation pressure observed at surface', mitigation: 'Well control procedure initiated', source: 'DDR-042-031' }
    ],
    mudProgram: [
      { depth: '1,500 m', weight: '1.08 SG', viscosity: '45 sec', fluidType: 'Water Based', funnel: '42', remarks: 'Normal' },
      { depth: '2,000 m', weight: '1.12 SG', viscosity: '48 sec', fluidType: 'Water Based', funnel: '44', remarks: 'Stable' },
      { depth: '2,400 m', weight: '1.16 SG', viscosity: '51 sec', fluidType: 'Water Based', funnel: '46', remarks: 'Losses observed' },
      { depth: '2,800 m', weight: '1.20 SG', viscosity: '54 sec', fluidType: 'Water Based', funnel: '48', remarks: 'Pressure management' }
    ],
    casing: [
      { string: 'Conductor', depth: '100 m', size: '20"', grade: 'K55', weight: '94 lb/ft', status: 'Set' },
      { string: 'Surface', depth: '800 m', size: '13 3/8"', grade: 'J55', weight: '54.5 lb/ft', status: 'Set' },
      { string: 'Intermediate', depth: '2,200 m', size: '9 5/8"', grade: 'L80', weight: '43.5 lb/ft', status: 'Set' },
      { string: 'Production', depth: '3,200 m', size: '7"', grade: 'P110', weight: '29 lb/ft', status: 'Set' }
    ],
    cementing: [
      { job: 'Surface Cement', casing: '13 3/8"', depth: '800 m', slurry: 'Class G', volume: '150 bbl', result: 'Successful', remarks: 'Good returns' },
      { job: 'Intermediate Cement', casing: '9 5/8"', depth: '2,200 m', slurry: 'Class G', volume: '220 bbl', result: 'Successful', remarks: 'No losses' }
    ],
    nptAnalysis: {
      total: 31,
      breakdown: [
        { category: 'Stuck Pipe', hours: 12 },
        { category: 'Mud Loss', hours: 8 },
        { category: 'Equipment', hours: 5 },
        { category: 'Well Control', hours: 4 },
        { category: 'Other', hours: 2 }
      ]
    },
    documents: [
      { name: 'Well Completion Report', code: 'WCR', type: 'Historical', status: 'Available' },
      { name: 'Daily Drilling Report — Day 18', code: 'DDR', type: 'Historical', status: 'Available' },
      { name: 'Daily Drilling Report — Day 21', code: 'DDR', type: 'Historical', status: 'Available' },
      { name: 'Mud Logging Report', code: 'MLR', type: 'Historical', status: 'Available' },
      { name: 'Cementing Report', code: 'CEMENT', type: 'Historical', status: 'Available' }
    ]
  }
};
