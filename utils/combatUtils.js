const manualHostiles = new Set();

function findNearestHostile(bot) {
  const isHostile = e =>
    ((e.type === 'hostile' ||
      ['zombie', 'skeleton', 'spider', 'creeper', 'pillager'].includes(e.name.toLowerCase())) ||
     (e.type === 'player' && manualHostiles.has(e.username)));

  return Object.values(bot.entities)
    .filter(e => isHostile(e) && bot.entity.position.distanceTo(e.position) < 16 && e.isValid !== false)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position))[0];
}

module.exports = {
  findNearestHostile,
  manualHostiles
};

