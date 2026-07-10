const { manualHostiles } = require('../utils/combatUtils');

function markPlayerHostile(bot, playerName) {
  const target = bot.players[playerName]?.entity;
  if (!target) {
    bot.chat("I sense not this soul...");
    return;
  }

  manualHostiles.add(playerName);
  bot.chat(`${playerName}... marked for judgment.`);
}

module.exports = { markPlayerHostile };

