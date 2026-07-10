const { manualHostiles, HOSTILE_MOBS } = require('./combatUtils');

function lookAtNearestLivingEntity(bot) {
  const entity = bot.nearestEntity(e =>
    e && e.position && e.isValid && e.name &&
    (
      (e.type === 'hostile' || HOSTILE_MOBS.includes(e.name.toLowerCase())) ||
      (e.type === 'player' && manualHostiles.has(e.username))
    )
  );
  if (entity) {
    bot.lookAt(entity.position.offset(0, entity.height, 0));
  }
}

module.exports = { lookAtNearestLivingEntity };
