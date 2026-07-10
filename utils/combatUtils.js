const manualHostiles = new Set();

const HOSTILE_MOBS = [
  'zombie', 'skeleton', 'spider', 'creeper', 'pillager',
  'breeze', 'bogged', 'zombie_nautilus', 'camel_husk', 'parched', 'zombie_horse'
];

function findNearestHostile(bot) {
  const isHostile = e =>
    e && e.name && e.position &&
    ((e.type === 'hostile' || HOSTILE_MOBS.includes(e.name.toLowerCase())) ||
     (e.type === 'player' && manualHostiles.has(e.username)));

  return Object.values(bot.entities)
    .filter(e => isHostile(e) && bot.entity.position.distanceTo(e.position) < 16 && e.isValid !== false)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position))[0];
}

module.exports = {
  findNearestHostile,
  manualHostiles,
  HOSTILE_MOBS
};
