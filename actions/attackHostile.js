const { findNearestHostile } = require('../utils/combatUtils');
const { equipBestArmor, equipGear } = require('../utils/equip');

let isChargingBow = false;

async function attackNearestHostile(bot) {
  if (bot.autoEat?.isEating) return;

  equipBestArmor(bot);

  const hostile = findNearestHostile(bot);
  if (hostile) {
    const dist = bot.entity.position.distanceTo(hostile.position);
    const bow = bot.inventory.items().find(i => i.name === 'bow');
    const arrows = bot.inventory.items().find(i => i.name.includes('arrow'));

    if (dist > 4 && bow && arrows) {
      if (!bot.heldItem || bot.heldItem.name !== 'bow') {
        await bot.equip(bow, 'hand').catch(() => {});
      }
      if (!isChargingBow) {
        isChargingBow = true;
        try {
          await bot.lookAt(hostile.position.offset(0, hostile.height, 0));
          bot.activateItem();
          setTimeout(() => {
            bot.deactivateItem();
            isChargingBow = false;
          }, 700);
        } catch (err) {
          console.error("Bow error:", err);
          isChargingBow = false;
        }
      }
    } else {
      equipGear(bot);
      bot.pvp.attack(hostile);
    }
  }
}

module.exports = { attackNearestHostile };

