const { manualHostiles } = require('../utils/combatUtils');

function markPlayerHostile(bot, playerName) {
  const target = bot.players[playerName]?.entity;
  if (!target) {
    bot.chat(`I can't see ${playerName}.`);
    return;
  }

  manualHostiles.add(playerName);
  bot.chat(`${playerName} marked as hostile!`);
}

module.exports = { markPlayerHostile };

