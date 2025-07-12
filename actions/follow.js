const { GoalFollow, GoalBlock } = require('mineflayer-pathfinder').goals;

let followTarget = null;
let followPos = null;

function getFollowTarget() {
  return followTarget;
}

function getFollowPos() {
  return followPos;
}

function setFollowPos(pos) {
  followPos = pos;
}

function handleFollowCommand(bot, botName, playerName) {
  if (botName.toLowerCase() !== bot.username.toLowerCase()) return;

  const targetPlayer = bot.players[playerName]?.entity;
  if (!targetPlayer) {
    bot.chat(`I can't see player "${playerName}" to follow! Gimme Coords.`);
    return;
  }

  followTarget = playerName;
  bot.chat(`Now following ${playerName}`);
  bot.pathfinder.setGoal(new GoalFollow(targetPlayer, 2), true);
}

function continueFollowing(bot) {
  const target = bot.players[followTarget]?.entity;
  if (target) {
    bot.pathfinder.setGoal(new GoalFollow(target, 2), true);
  }
}

function returnToFollowPos(bot) {
  if (!bot.pathfinder.isMoving() && followPos) {
    const dist = bot.entity.position.distanceTo(followPos);
    if (dist > 2) {
      bot.pathfinder.setGoal(new GoalBlock(followPos.x, followPos.y, followPos.z), true);
    }
  }
}

module.exports = {
  handleFollowCommand,
  getFollowTarget,
  continueFollowing,
  returnToFollowPos,
  setFollowPos
};

