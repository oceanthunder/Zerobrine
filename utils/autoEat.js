const { plugin: autoEat } = require('mineflayer-auto-eat');

function setupAutoEat(bot) {
  let lastEatTime = 0;
  const cooldownMs = 2000;

  bot.loadPlugin(autoEat);

  bot.on('autoeat_started', () => {
    const now = Date.now();
    if (now - lastEatTime < cooldownMs) {
      bot.autoEat.disable();
      setTimeout(() => bot.autoEat.enable(), cooldownMs - (now - lastEatTime));
      return;
    }
  });

  bot.on('autoeat_finished', () => {
    lastEatTime = Date.now();
  });

  bot.on('autoeat_error', (error) => {
    console.error(`Eating failed: ${error.message || error}`);
  });
}

module.exports = { setupAutoEat };
