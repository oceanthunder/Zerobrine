const { manualHostiles } = require('../utils/combatUtils');

function stopCombat(bot, playerName) {
  if (playerName && manualHostiles.has(playerName)) {
    manualHostiles.delete(playerName);
    bot.chat(`${playerName} removed from hostile list.`);
  } else {
    bot.chat("Standing down.");
    bot.pvp.stop();
    bot.pathfinder.setGoal(null);
  }
}

module.exports = { stopCombat };

