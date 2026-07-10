const { GoalBlock } = require('mineflayer-pathfinder').goals;

function registerComeCommand(bot) {
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    const regex = /come at (-?\d+)\s+(-?\d+)\s+(-?\d+)/i;
    const match = message.match(regex);
    if (match) {
      const [x, y, z] = match.slice(1).map(Number);
      bot.chat(`Coming to ${x} ${y} ${z}`);
      bot.pathfinder.setGoal(new GoalBlock(x, y, z));
    }
  });
}

module.exports = { registerComeCommand };
