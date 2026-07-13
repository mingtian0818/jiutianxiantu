const EquipmentSystem = {
  equip(player, equipment) {
    if (!equipment) return false;

    const currentEquipment = player.equipment[equipment.type];
    if (currentEquipment) {
      EquipmentSystem.unequip(player, equipment.type);
    }

    player.equipment[equipment.type] = { ...equipment };
    EquipmentSystem.applyEquipmentBonus(player);
    return true;
  },

  unequip(player, type) {
    if (!player.equipment[type]) return false;
    player.equipment[type] = null;
    EquipmentSystem.applyEquipmentBonus(player);
    return true;
  },

  applyEquipmentBonus(player) {
    let totalAtk = 0;
    let totalDefense = 0;
    let totalHp = 0;
    let totalSkillDamage = 0;
    let totalCritRate = 0;

    for (const type of ['weapon', 'armor', 'accessory']) {
      const eq = player.equipment[type];
      if (!eq) continue;

      if (eq.stats.atk) totalAtk += eq.stats.atk;
      if (eq.stats.defense) totalDefense += eq.stats.defense;
      if (eq.stats.hp) totalHp += eq.stats.hp;
      if (eq.stats.skillDamage) totalSkillDamage += eq.stats.skillDamage;
      if (eq.stats.critRate) totalCritRate += eq.stats.critRate;
    }

    player.equipmentBonus = {
      atk: totalAtk,
      defense: totalDefense,
      hp: totalHp,
      skillDamage: totalSkillDamage,
      critRate: totalCritRate
    };

    player.atk = player.baseAtk + totalAtk;
    player.defense = player.baseDefense + totalDefense;
    player.maxHp = player.baseMaxHp + totalHp;
    player.skillDamageMultiplier *= (1 + totalSkillDamage);
    player.critRate += totalCritRate;
  },

  getEquipmentRarityColor(rarity) {
    return CultivationData.rarityColors[rarity] || '#c0c0c0';
  },

  getEquipmentTypeName(type) {
    const names = { weapon: '武器', armor: '防具', accessory: '饰品' };
    return names[type] || type;
  }
};

const TreasureSystem = {
  activate(player, treasureId) {
    const treasure = CultivationData.getTreasure(treasureId);
    if (!treasure) return false;

    const now = performance.now();
    if (player.treasureCooldowns[treasureId] && now < player.treasureCooldowns[treasureId]) {
      return false;
    }

    player.treasureCooldowns[treasureId] = now + treasure.cooldown;

    switch (treasure.id) {
      case 'zhu_xian_sword':
        TreasureSystem.activateZhuXian(player);
        break;
      case 'qian_kun_ding':
        TreasureSystem.activateQianKun(player);
        break;
      case 'zhen_yao_tower':
        TreasureSystem.activateZhenYao(player);
        break;
      case 'heavenly_mirror':
        TreasureSystem.activateHeavenlyMirror(player);
        break;
      case 'nine_turn_pellet':
        TreasureSystem.activateNineTurn(player);
        break;
    }

    return true;
  },

  activateZhuXian(player) {
    for (const enemy of Game.enemies) {
      const dist = Utils.distance(player, enemy);
      if (dist < 400) {
        enemy.hp -= 200 + player.atk;
        Particle.spawnExplosion(enemy.x, enemy.y, '#ff6b6b', 15);
      }
    }
  },

  activateQianKun(player) {
    const healAmount = Math.floor(player.maxHp * 0.5);
    player.hp = Math.min(player.maxHp, player.hp + healAmount);
    player.shield = 100 + player.defense;
    Particle.spawnExplosion(player.x, player.y, '#4fc3f7', 20);
  },

  activateZhenYao(player) {
    for (const enemy of Game.enemies) {
      const dist = Utils.distance(player, enemy);
      if (dist < 300) {
        enemy.stunned = 3000;
      }
    }
  },

  activateHeavenlyMirror(player) {
    player.reflectNextAttack = true;
  },

  activateNineTurn(player) {
    player.nineTurnBuff = {
      startTime: performance.now(),
      duration: 10000,
      multiplier: 1.5
    };
  },

  updateTreasures(player, dt) {
    if (player.nineTurnBuff) {
      const elapsed = performance.now() - player.nineTurnBuff.startTime;
      if (elapsed >= player.nineTurnBuff.duration) {
        player.nineTurnBuff = null;
      }
    }

    for (const enemy of Game.enemies) {
      if (enemy.stunned > 0) {
        enemy.stunned -= dt;
      }
    }
  },

  getTreasureCooldown(player, treasureId) {
    const treasure = CultivationData.getTreasure(treasureId);
    if (!treasure) return 0;

    const cooldownEnd = player.treasureCooldowns[treasureId];
    if (!cooldownEnd) return 0;

    const remaining = cooldownEnd - performance.now();
    return Math.max(0, remaining);
  },

  getTreasureCooldownPercent(player, treasureId) {
    const treasure = CultivationData.getTreasure(treasureId);
    if (!treasure) return 1;

    const remaining = TreasureSystem.getTreasureCooldown(player, treasureId);
    return 1 - (remaining / treasure.cooldown);
  }
};
