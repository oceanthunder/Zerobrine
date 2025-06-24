const { GoalNear } = require('mineflayer-pathfinder').goals;
const Vec3 = require('vec3').Vec3;

let placedBedPosition = null;

function canSleepNow(bot) {
  const t = bot.time;
  return t.timeOfDay >= 13000 && t.timeOfDay <= 23999 || t.isRaining;
}

async function findBestBed(bot) {
  const bedBlocks = bot.findBlocks({
    matching: block => block.name.endsWith('bed'),
    maxDistance: 64,
    count: 50
  });

  const sorted = bedBlocks
    .map(pos => ({ block: bot.blockAt(pos), dist: bot.entity.position.distanceTo(pos) }))
    .sort((a, b) => a.dist - b.dist);

  for (const { block } of sorted) {
    const bedPos = block.position;
    const nearbyEntities = Object.values(bot.entities).filter(e =>
      e.position.distanceTo(bedPos.offset(0.5, 0, 0.5)) < 1.3
    );

    const hasPlayer = nearbyEntities.some(e => e.type === 'player');
    const villager = nearbyEntities.find(e => e.name === 'villager');

    if (hasPlayer) continue;

    if (villager) {
      try {
        bot.attack(villager);
        await bot.waitForTicks(10);
        return block;
      } catch (err) {
        continue;
      }
    }

    return block;
  }

  return null;
}

async function placeBed(bot) {
  const bedItem = bot.inventory.items().find(i => i.name.endsWith('bed'));
  if (!bedItem) return null;

  const base = bot.blockAt(bot.entity.position.offset(0, -1, 1).floored());
  try {
    await bot.equip(bedItem, 'hand');
    await bot.placeBlock(base, new Vec3(0, 1, 0));
    await bot.waitForTicks(5);

    return bot.findBlock({
      matching: block => block.name.endsWith('bed'),
      maxDistance: 3
    });
  } catch (err) {
    console.log("Error placing bed:", err.message);
    return null;
  }
}

async function goToBedAndSleep(bot, bed) {
  const pos = bed.position;
  await bot.pathfinder.goto(new GoalNear(pos.x, pos.y, pos.z, 1));
  bot.lookAt(pos.offset(0.5, 0.5, 0.5));

  if (canSleepNow(bot)) {
    try {
      await bot.sleep(bed);
      bot.chat("Sleeping... zzz");

      bot.once('wake', async () => {
        bot.chat("Woke up.");
        if (placedBedPosition && placedBedPosition.equals(bed.position)) {
          try {
            await bot.dig(bed);
            bot.chat("Picked up placed bed.");
          } catch (err) {
            bot.chat("Couldn't pick up bed: " + err.message);
          }
        } else {
          bot.chat("Left bed untouched.");
        }
      });
    } catch (err) {
      if (err.message.includes('bed is occupied')) {
        bot.chat("Bed still occupied. Retrying...");
        await bot.waitForTicks(10);
        bot.emit('chat', 'player', `sleep ${bot.username.toLowerCase()}`);
        return;
      } else {
        bot.chat("Couldn't sleep: " + err.message);
      }
    }
  } else {
    bot.chat("It's not night or thunderstorm. Setting spawn point.");
    try {
      await bot.activateBlock(bed);
      bot.chat("Spawn point set.");
    } catch (err) {
      bot.chat("Failed to set spawn: " + err.message);
    }
  }
}

async function sleepIfRequested(bot, message) {
  const expected = `sleep ${bot.username.toLowerCase()}`;
  if (message.toLowerCase() !== expected) return;

  const bed = await findBestBed(bot);

  if (bed) {
    placedBedPosition = null;
    bot.chat(`Using bed at ${bed.position}`);
    await goToBedAndSleep(bot, bed);
  } else {
    const bedItem = bot.inventory.items().find(item => item.name.endsWith('bed'));
    if (!bedItem) {
      bot.chat("No valid beds and I don't have one in inventory.");
      return;
    }

    bot.chat("Placing a bed from inventory...");
    const placedBed = await placeBed(bot);
    if (!placedBed) {
      bot.chat("Couldn't place a bed.");
      return;
    }

    placedBedPosition = placedBed.position.clone();
    await goToBedAndSleep(bot, placedBed);
  }
}

module.exports = {
  sleepIfRequested,
  canSleepNow,
  placeBed,
  findBestBed,
  goToBedAndSleep
};

