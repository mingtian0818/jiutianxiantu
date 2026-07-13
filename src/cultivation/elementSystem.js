const ElementSystem = {
  generateElements(player) {
    const primary = CultivationData.generateRandomElement();
    const primaryData = CultivationData.getElement(primary);
    player.element = primary;
    player.elementLevel = 1;
    player.elementExp = 0;
    player.elementBonus = { ...primaryData.bonus };
  },

  addElementExp(player, amount) {
    player.elementExp += amount;
    const levelExp = player.elementLevel * 100;
    if (player.elementExp >= levelExp) {
      player.elementExp -= levelExp;
      player.elementLevel++;
      ElementSystem.updateBonus(player);
      return true;
    }
    return false;
  },

  updateBonus(player) {
    const elementData = CultivationData.getElement(player.element);
    const levelMultiplier = 1 + (player.elementLevel - 1) * 0.1;
    player.elementBonus = {};
    for (const [key, value] of Object.entries(elementData.bonus)) {
      player.elementBonus[key] = value * levelMultiplier;
    }
  },

  applyElementBonus(player) {
    const bonus = player.elementBonus;
    if (bonus.atk) {
      player.atk = Math.floor(player.baseAtk * bonus.atk);
    }
    if (bonus.hp) {
      player.maxHp = Math.floor(player.baseMaxHp * bonus.hp);
    }
    if (bonus.skillDamage) {
      player.skillDamageMultiplier = bonus.skillDamage;
    }
    if (bonus.defense) {
      player.defense = Math.floor(player.baseDefense * bonus.defense);
    }
    if (bonus.speed) {
      player.speed = player.baseSpeed * bonus.speed;
    }
    if (bonus.critRate) {
      player.critRate = bonus.critRate;
    }
  },

  getElementExpProgress(player) {
    const levelExp = player.elementLevel * 100;
    return player.elementExp / levelExp;
  },

  getElementDisplayName(player) {
    const element = CultivationData.getElement(player.element);
    if (!element) return '未知';
    const levelNames = ['初醒', '小成', '大成', '圆满', '化境'];
    const levelIndex = Math.min(player.elementLevel - 1, levelNames.length - 1);
    return element.name + '灵根·' + levelNames[levelIndex];
  }
};
