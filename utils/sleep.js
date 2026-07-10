const { GoalNear } = require('mineflayer-pathfinder').goals;
const Vec3 = require('vec3').Vec3 || require('vec3');

let placedBedPosition = null;

function canSleepNow(bot) {
  const t = bot.time;
  return (t.timeOfDay >= 13000 && t.timeOfDay <= 23999) || t.isRaining;
}

async function findBestBed(bot) {
  const bedBlocks = bot.findBlocks({
    matching: block => block.name.endsWith('bed'),
    maxDistance: 64,
    count: 50
  });

  const sorted = bedBlocks
    .map(pos => ({ block: bot.blockAt(pos), dist: bot.entity.position.distanceTo(pos) }))
    .filter(b => b.block && b.block.name.endsWith('bed'))
    .sort((a, b) => a.dist - b.dist);

  for (const { block } of sorted) {
    const bedPos = block.position;
    const nearbyEntities = Object.values(bot.entities).filter(e =>
      e.position && e.position.distanceTo(bedPos.offset(0.5, 0, 0.5)) < 1.3
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
  if (!base || base.name === 'air') return null;

  try {
    await bot.equip(bedItem, 'hand');
    await bot.placeBlock(base, new Vec3(0, 1, 0));
    await bot.waitForTicks(5);

    return bot.findBlock({
      matching: block => block.name.endsWith('bed'),
      maxDistance: 3
    });
  } catch (err) {
    console.error(`[Bed] ${err.message}`);
    return null;
  }
}

async function goToBedAndSleep(bot, bed) {
  const pos = bed.position;
  await bot.pathfinder.goto(new GoalNear(pos.x, pos.y, pos.z, 1));
  await bot.lookAt(pos.offset(0.5, 0.5, 0.5));

  if (canSleepNow(bot)) {
    try {
      await bot.sleep(bed);
      bot.chat("The darkness calls... I rest.");

      bot.once('wake', async () => {
        bot.chat("Dawn breaks. I rise.");
        if (placedBedPosition && placedBedPosition.equals(bed.position)) {
          try {
            await bot.dig(bed);
          } catch (err) {
          }
        }
      });
    } catch (err) {
      if (err.message.includes('occupied')) {
        bot.chat("A soul resides here... seeking another.");
        await bot.waitForTicks(10);
        const nextBed = await findBestBed(bot);
        if (nextBed) await goToBedAndSleep(bot, nextBed);
      }
    }
  } else {
    bot.chat("The sun still lingers. I mark this place as my spawn.");
    try {
      await bot.activateBlock(bed);
    } catch (err) {
    }
  }
}

async function handleSleepCommand(bot) {
  const bed = await findBestBed(bot);

  if (bed) {
    placedBedPosition = null;
    await goToBedAndSleep(bot, bed);
  } else {
    const bedItem = bot.inventory.items().find(item => item.name.endsWith('bed'));
    if (!bedItem) {
      bot.chat("No resting place nearby...");
      return;
    }

    const placedBed = await placeBed(bot);
    if (!placedBed) {
      bot.chat("The ground rejects my bed.");
      return;
    }

    placedBedPosition = placedBed.position.clone();
    await goToBedAndSleep(bot, placedBed);
  }
}

module.exports = {
  handleSleepCommand
};
