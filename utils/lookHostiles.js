const { manualHostiles } = require('./combatUtils');

function lookAtNearestLivingEntity(bot) {
  const entity = bot.nearestEntity(e =>
    e.position && e.isValid &&
    (
      (e.type === 'hostile' ||
        ['zombie', 'skeleton', 'spider', 'creeper', 'pillager'].includes(e.name.toLowerCase())) ||
      (e.type === 'player' && manualHostiles.has(e.username))
    )
  );
  if (entity) {
    bot.lookAt(entity.position.offset(0, entity.height, 0));
  }
}

module.exports = { lookAtNearestLivingEntity };

