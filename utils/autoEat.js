const { loader: autoEat } = require('mineflayer-auto-eat');

function setupAutoEat(bot) {
  let isEating = false;
  let lastEatTime = 0;
  const cooldownMs = 2000;

  bot.loadPlugin(autoEat);
  bot.autoEat.enableAuto();

  bot.autoEat.on('eatStart', () => {
    const now = Date.now();
    if (now - lastEatTime < cooldownMs) {
      bot.autoEat.disableAuto();
      setTimeout(() => bot.autoEat.enableAuto(), cooldownMs - (now - lastEatTime));
      return;
    }
    if (isEating) return;
    isEating = true;
  });

  bot.autoEat.on('eatFinish', (opts) => {
    if (!isEating) return;
    isEating = false;
    lastEatTime = Date.now();
    bot.chat(`I ate ${opts.food.name} and my health is now ${bot.health.toFixed(1)}`);
  });

  bot.autoEat.on('eatFail', (error) => {
    if (!isEating) return;
    isEating = false;
    console.error(`Eating failed: ${error.message || error}`);
  });
}

module.exports = { setupAutoEat };

