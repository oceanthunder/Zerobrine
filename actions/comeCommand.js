// utils/comeCommand.js
const { Movements, goals } = require('mineflayer-pathfinder');
const mcDataLoader = require('minecraft-data');
const { GoalBlock } = goals;

function registerComeCommand(bot) {
  const mcData = mcDataLoader(bot.version);
  const movements = new Movements(bot, mcData);
  movements.allowFreeMotion = true;
  movements.allow1by1towers = true;
  bot.pathfinder.setMovements(movements);

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    const regex = /come at (-?\d+)\s+(-?\d+)\s+(-?\d+)/i;
    const match = message.match(regex);
    if (match) {
      const [x, y, z] = match.slice(1).map(Number);
      bot.chat(`Coming to ${x} ${y} ${z}`);
      const goal = new GoalBlock(x, y, z);
      bot.pathfinder.setGoal(goal);
    }
  });

  bot.on('goal_reached', () => {
    bot.chat("Arrived at the destination.");
  });
}

module.exports = { registerComeCommand };

