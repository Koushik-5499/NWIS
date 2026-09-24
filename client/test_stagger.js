const minSpacing = 40;

const eventStagger = {};
let activeWellStagger = 0;

const activeWellDepth = 2380;
const filteredEvents = [
  { id: '2395', depth: 2395, isEvent: true },
  { id: '2410', depth: 2410, isEvent: true },
  { id: '2425', depth: 2425, isEvent: true },
  { id: '2580', depth: 2580, isEvent: true },
  { id: '2620', depth: 2620, isEvent: true },
  { id: '2640', depth: 2640, isEvent: true },
];

const items = filteredEvents.map(e => ({ id: e.id, depth: e.depth, isEvent: true }));
items.push({ id: 'active_well', depth: activeWellDepth, isEvent: false });

items.sort((a, b) => a.depth - b.depth);

const lastDepthAtLevel = [-9999, -9999, -9999, -9999];

items.forEach(item => {
  let level = 0;
  while (level < 3 && item.depth - lastDepthAtLevel[level] < minSpacing) {
    level++;
  }
  lastDepthAtLevel[level] = item.depth;
  
  if (item.isEvent) {
    eventStagger[item.id] = level;
  } else {
    activeWellStagger = level;
  }
  console.log(`Depth ${item.depth} -> Level ${level}`);
});
