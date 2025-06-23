const { GoalFollow, GoalBlock } = require('mineflayer-pathfinder').goals;

let guardTarget = null;
let guardPos = null;

function getGuardTarget() {
  return guardTarget;
}

function getGuardPos() {
  return guardPos;
}

function setGuardPos(pos) {
  guardPos = pos;
}

function handleGuardCommand(bot, botName, playerName) {
  if (botName.toLowerCase() !== bot.username.toLowerCase()) return;

  const targetPlayer = bot.players[playerName]?.entity;
  if (!targetPlayer) {
    bot.chat(`I can't see player "${playerName}" to guard!`);
    return;
  }

  guardTarget = playerName;
  bot.chat(`Now guarding ${playerName}`);
  bot.pathfinder.setGoal(new GoalFollow(targetPlayer, 2), true);
}

function continueGuarding(bot) {
  const target = bot.players[guardTarget]?.entity;
  if (target) {
    bot.pathfinder.setGoal(new GoalFollow(target, 2), true);
  }
}

function returnToGuardPos(bot) {
  if (!bot.pathfinder.isMoving() && guardPos) {
    const dist = bot.entity.position.distanceTo(guardPos);
    if (dist > 2) {
      bot.pathfinder.setGoal(new GoalBlock(guardPos.x, guardPos.y, guardPos.z), true);
    }
  }
}

module.exports = {
  handleGuardCommand,
  getGuardTarget,
  continueGuarding,
  returnToGuardPos,
  setGuardPos
};

