const _internalArmorValues = {
  leather: 1, golden: 2, chainmail: 3, iron: 4, diamond: 5, netherite: 6
};

function getInternalArmorValue(itemName) {
  if (!itemName) return 0;
  const material = Object.keys(_internalArmorValues).find(mat => itemName.startsWith(mat + '_'));
  return _internalArmorValues[material] || 0;
}

function equipBestArmor(bot) {
  const slotsDefinition = {
    head: 'helmet', torso: 'chestplate', legs: 'leggings', feet: 'boots'
  };

  for (const [slotName, armorPieceType] of Object.entries(slotsDefinition)) {
    const equipmentSlotIndex = bot.getEquipmentDestSlot(slotName);
    const currentItem = bot.inventory.slots[equipmentSlotIndex];

    const bestArmor = bot.inventory.items()
      .filter(item => item.name.includes(`_${armorPieceType}`))
      .sort((a, b) => getInternalArmorValue(b.name) - getInternalArmorValue(a.name))[0];

    const currentValue = currentItem ? getInternalArmorValue(currentItem.name) : 0;
    const bestValue = bestArmor ? getInternalArmorValue(bestArmor.name) : 0;

    if (bestArmor && bestValue > currentValue) {
      bot.equip(bestArmor, slotName).catch(() => {});
    }
  }
}

function equipGear(bot) {
  const sword = bot.inventory.items().find(item => item.name.includes('sword'));
  const shield = bot.inventory.items().find(item => item.name === 'shield');

  if (sword && (!bot.heldItem || !bot.heldItem.name.includes('sword'))) {
    bot.equip(sword, 'hand').catch(() => {});
  }

  const offHand = bot.inventory.slots[bot.getEquipmentDestSlot('off-hand')];
  if (shield && (!offHand || offHand.name !== shield.name)) {
    bot.equip(shield, 'off-hand').catch(() => {});
  }
}

module.exports = { equipBestArmor, equipGear };

