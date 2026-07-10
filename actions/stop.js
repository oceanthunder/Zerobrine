const { manualHostiles } = require('../utils/combatUtils');

function stopCombat(bot, playerName) {
  if (playerName && manualHostiles.has(playerName)) {
    manualHostiles.delete(playerName);
    bot.chat(`${playerName}... spared.`);
  } else {
    bot.chat("I stand down... for now.");
    bot.pvp.stop();
    bot.pathfinder.setGoal(null);
  }
}

module.exports = { stopCombat };

