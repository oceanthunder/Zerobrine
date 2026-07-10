const mineflayer = require('mineflayer');
const { plugin: pvp } = require('mineflayer-pvp');
const pathfinderPkg = require('mineflayer-pathfinder');
const { Movements } = pathfinderPkg;
const { GoalFollow } = pathfinderPkg.goals;

const { setupAutoEat } = require('./utils/autoEat');
const { lookAtNearestLivingEntity } = require('./utils/lookHostiles');
const { equipBestArmor } = require('./utils/equip');
const { attackNearestHostile } = require('./actions/attackHostile');
const { markPlayerHostile } = require('./actions/attackPlayer');
const { stopCombat } = require('./actions/stop');
const { registerComeCommand } = require('./actions/comeCommand');
const { handleSleepCommand } = require('./utils/sleep');
const {
  handleFollowCommand,
  getFollowTarget,
  continueFollowing
} = require('./actions/follow');
const { queryLLM, parseAction } = require('./utils/llm');
const { GoalBlock } = require('mineflayer-pathfinder').goals;

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 42069,
  username: 'Zerobrine',
});

bot.loadPlugin(pvp);
bot.loadPlugin(pathfinderPkg.pathfinder);

let currentAction = 'idle';

bot.once('spawn', async () => {
  setupAutoEat(bot);
  const mcData = (await import('minecraft-data')).default(bot.version);
  const movements = new Movements(bot, mcData);
  movements.allowFreeMotion = true;
  movements.allow1by1towers = true;
  bot.pathfinder.setMovements(movements);
  bot.chat("The shadows stir... I have returned.");
  registerComeCommand(bot);

  bot.on('goal_reached', () => {
    if (currentAction.startsWith('going to')) {
      currentAction = 'idle';
    }
  });

  bot.on('path_update', (result) => {
    if (result.status === 'noPath') {
      if (currentAction !== 'idle') {
        currentAction = 'idle';
        bot.chat("The path is blocked...");
      }
    }
  });

  bot.on('chat', async (username, message) => {
    if (username === bot.username) return;
    const parts = message.trim().split(/\s+/);
    const cmd = parts[0]?.toLowerCase();

    if (cmd === 'follow' && parts.length === 3) {
      handleFollowCommand(bot, parts[1], parts[2]);
      return;
    }

    if (cmd === 'attack' && parts.length === 2) {
      markPlayerHostile(bot, parts[1]);
      return;
    }

    if (cmd === 'stop') {
      stopCombat(bot, parts[1]);
      return;
    }

    try {
      const nearbyPlayers = Object.keys(bot.players).filter(p => p !== bot.username).join(', ');
      const context = {
        position: bot.entity.position,
        currentAction,
        nearbyPlayers: nearbyPlayers || 'none',
        gameMode: bot.game?.gameMode || 'unknown'
      };
      const response = await queryLLM(message, context);
      const { text, action, args } = parseAction(response);

      if (text) {
        bot.chat(text);
      }

      if (action) {
        switch (action) {
          case 'goto':
            if (args.length >= 3) {
              const x = parseInt(args[0]);
              const y = parseInt(args[1]);
              const z = parseInt(args[2]);
              if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                currentAction = `going to ${x} ${y} ${z}`;
                bot.pathfinder.setGoal(new GoalBlock(x, y, z));
              }
            }
            break;
          case 'come': {
            const player = bot.players[username];
            if (player && player.entity) {
              const pos = player.entity.position;
              currentAction = `going to ${username}`;
              bot.pathfinder.setGoal(new GoalBlock(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z)));
            } else {
              bot.chat("I sense not thy presence...");
            }
            break;
          }
          case 'attack':
            if (args[0]) {
              currentAction = `attacking ${args[0]}`;
              markPlayerHostile(bot, args[0]);
            }
            break;
          case 'stop':
            currentAction = 'idle';
            stopCombat(bot);
            bot.pathfinder.setGoal(null);
            break;
          case 'follow': {
            const targetName = args[0] || username;
            const targetPlayer = bot.players[targetName]?.entity;
            if (targetPlayer) {
              currentAction = `following ${targetName}`;
              bot.pathfinder.setGoal(new GoalFollow(targetPlayer, 2), true);
            } else {
              bot.chat("I see none by that name...");
            }
            break;
          }
          case 'findbed':
          case 'placebed':
          case 'sleep': {
            currentAction = 'sleeping';
            handleSleepCommand(bot).then(() => {
              if (currentAction === 'sleeping') currentAction = 'idle';
            }).catch(err => {
              currentAction = 'idle';
              console.error(`[Sleep] ${err.message}`);
            });
            break;
          }
          case 'drop': {
            const itemName = args[0];
            if (!itemName) break;
            const item = bot.inventory.items().find(i => i.name.includes(itemName));
            if (item) {
              bot.tossStack(item).then(() => {
                bot.chat(`Farewell, ${item.name}.`);
              });
            } else {
              bot.chat("I possess it not.");
            }
            break;
          }
        }
      }
    } catch (err) {
      console.error(`[LLM] Error: ${err.message}`);
    }
  });

  setInterval(async () => {
    equipBestArmor(bot);

    if (currentAction === 'idle') {
      await attackNearestHostile(bot);
    }

    const target = getFollowTarget();
    if (target) {
      continueFollowing(bot);
    }
  }, 500);
});

bot.on('physicsTick', () => lookAtNearestLivingEntity(bot));
bot.on('death', () => bot.chat("The void... claims me..."));
bot.on('kicked', reason => console.warn(`Kicked: ${reason}`));
bot.on('error', err => console.error('Error:', err));
bot.on('end', reason => console.warn(`Disconnected: ${reason}`));
