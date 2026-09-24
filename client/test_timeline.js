function resolveOverlapsWithPushback(items, minSpacing) {
  let resolved = [...items].map(item => ({...item, renderDepth: item.depth}));
  resolved.sort((a, b) => a.depth - b.depth);

  for (let i = 0; i < resolved.length; i++) {
    for (let j = 1; j < resolved.length; j++) {
      const prev = resolved[j - 1];
      const curr = resolved[j];
      if (curr.renderDepth - prev.renderDepth < minSpacing) {
        // distribute the difference
        const diff = minSpacing - (curr.renderDepth - prev.renderDepth);
        curr.renderDepth += diff / 2;
        prev.renderDepth -= diff / 2;
      }
    }
  }
  
  // ensure we don't push the first item before 2000
  const offset = Math.max(0, 2000 - Math.min(...resolved.map(i => i.renderDepth)));
  if (offset > 0) {
    resolved.forEach(r => r.renderDepth += offset);
  }

  return resolved;
}

const events = [
  { id: 'curr', depth: 2380, label: 'W-051 CURRENT' },
  { id: 2, depth: 2395, label: 'Mud Loss' },
  { id: 3, depth: 2410, label: 'Mud Loss' },
  { id: 4, depth: 2425, label: 'Mud Loss' },
  { id: 5, depth: 2580, label: 'Stuck Pipe' },
  { id: 6, depth: 2620, label: 'Stuck Pipe' },
  { id: 7, depth: 2640, label: 'Stuck Pipe' },
  { id: 8, depth: 2850, label: 'Kick' }
];

console.log(resolveOverlapsWithPushback(events, 60));
