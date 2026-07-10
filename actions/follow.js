const { GoalFollow } = require('mineflayer-pathfinder').goals;

let followTarget = null;

function getFollowTarget() {
  return followTarget;
}

function handleFollowCommand(bot, botName, playerName) {
  if (botName.toLowerCase() !== bot.username.toLowerCase()) return;

  const targetPlayer = bot.players[playerName]?.entity;
  if (!targetPlayer) {
    bot.chat("I see none by that name...");
    return;
  }

  followTarget = playerName;
  bot.chat(`I shall shadow ${playerName}.`);
  bot.pathfinder.setGoal(new GoalFollow(targetPlayer, 2), true);
}

function continueFollowing(bot) {
  const target = bot.players[followTarget]?.entity;
  if (target) {
    bot.pathfinder.setGoal(new GoalFollow(target, 2), true);
  }
}

module.exports = {
  handleFollowCommand,
  getFollowTarget,
  continueFollowing
};
