const mineflayer = require('mineflayer');
const { plugin: pvp } = require('mineflayer-pvp');
const pathfinderPkg = require('mineflayer-pathfinder');
const { Movements } = pathfinderPkg;
const { GoalFollow } = pathfinderPkg.goals;
const Vec3 = require('vec3');

const { setupAutoEat } = require('./utils/autoEat');
const { lookAtNearestLivingEntity } = require('./utils/lookHostiles');
const { attackNearestHostile } = require('./actions/attackHostile');
const { markPlayerHostile } = require('./actions/attackPlayer');
const { stopCombat } = require('./actions/stop');
const { registerComeCommand } = require('./actions/comeCommand');
const { sleepIfRequested } = require('./utils/sleep');
const {
  handleFollowCommand,
  getFollowTarget,
  continueFollowing,
  returnToFollowPos
} = require('./actions/follow');

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 42069,
  username: 'Zerobrine',
});

bot.loadPlugin(pvp);
bot.loadPlugin(pathfinderPkg.pathfinder);

bot.once('spawn', async () => {
  setupAutoEat(bot);
  const mcData = (await import('minecraft-data')).default(bot.version);
  bot.pathfinder.setMovements(new Movements(bot, mcData));
  bot.chat("Hello World! Now, gimme some bread.");
  registerComeCommand(bot);

  bot.on('chat', async (username, message) => {
    if (username === bot.username) return;
    await sleepIfRequested(bot, message);
    const parts = message.trim().split(/\s+/);
    const cmd = parts[0]?.toLowerCase();

    if (cmd === 'follow' && parts.length === 3) {
      handleFollowCommand(bot, parts[1], parts[2]);
    }

    if (cmd === 'attack' && parts.length === 2) {
      markPlayerHostile(bot, parts[1]);
    }

    if (cmd === 'stop') {
      stopCombat(bot, parts[1]);
    }
  });

  setInterval(async () => {
    await attackNearestHostile(bot);

    const target = getFollowTarget();
    if (target) {
      continueFollowing(bot);
    } else {
      returnToFollowPos(bot);
    }
  }, 500);
});

bot.on('physicsTick', () => lookAtNearestLivingEntity(bot));
bot.on('death', () => bot.chat("I'm dead"));
bot.on('kicked', reason => console.log(`Kicked: ${reason}`));
bot.on('error', err => console.error('Bot error:', err));
bot.on('end', reason => console.log(`Disconnected: ${reason}`));

