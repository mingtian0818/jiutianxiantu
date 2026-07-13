const SkillSystem = {
  learnSkill(player, skillId) {
    if (player.skills.includes(skillId)) return false;
    const skill = CultivationData.getSkill(skillId);
    if (!skill) return false;

    const elementData = CultivationData.getElement(player.element);
    if (skill.element && skill.element !== player.element) {
      return false;
    }

    player.skills.push(skillId);
    player.skillLevels[skillId] = 1;
    SkillSystem.applySkillEffects(player);
    return true;
  },

  levelUpSkill(player, skillId) {
    if (!player.skills.includes(skillId)) return false;
    const skill = CultivationData.getSkill(skillId);
    if (!skill) return false;

    const currentLevel = player.skillLevels[skillId] || 1;
    if (currentLevel >= 10) return false;

    const cost = currentLevel * 100;
    if ((player.resources.spiritStone || 0) < cost) return false;

    player.resources.spiritStone -= cost;
    player.skillLevels[skillId] = currentLevel + 1;
    SkillSystem.applySkillEffects(player);
    return true;
  },

  applySkillEffects(player) {
    let totalDamageBonus = 1;
    let totalRangeBonus = 1;
    let totalCooldownBonus = 1;
    let totalProjectileBonus = 1;

    for (const skillId of player.skills) {
      const skill = CultivationData.getSkill(skillId);
      if (!skill) continue;

      const level = player.skillLevels[skillId] || 1;
      const qualityMultiplier = CultivationData.skillQualities[skill.quality]?.multiplier || 1;

      if (skill.id === 'sword_intent') {
        totalDamageBonus += skill.bonus * level * qualityMultiplier;
      }
      if (skill.id === 'nine_suns_sword') {
        totalDamageBonus += 0.2 * level * qualityMultiplier;
      }
    }

    player.swordDamage = Math.floor(player.baseSwordDamage * totalDamageBonus);
    player.swordRange = Math.floor(player.baseSwordRange * totalRangeBonus);
    player.swordCooldown = Math.floor(player.baseSwordCooldown / totalCooldownBonus);
    player.swordProjectileCount = Math.floor(player.baseSwordProjectileCount * totalProjectileBonus);
  },

  checkEvolution(player) {
    for (const evolution of CultivationData.skillEvolutions) {
      const hasAllSkills = evolution.requires.every(sid => player.skills.includes(sid));
      if (hasAllSkills && !player.skills.includes(evolution.id)) {
        return evolution;
      }
    }
    return null;
  },

  evolveSkill(player, evolutionId) {
    const evolution = CultivationData.skillEvolutions.find(e => e.id === evolutionId);
    if (!evolution) return false;

    const hasAllSkills = evolution.requires.every(sid => player.skills.includes(sid));
    if (!hasAllSkills) return false;

    const cost = 500 + player.level * 100;
    if ((player.resources.spiritStone || 0) < cost) return false;

    player.resources.spiritStone -= cost;

    if (evolution.result) {
      for (const sid of evolution.requires) {
        const idx = player.skills.indexOf(sid);
        if (idx > -1) player.skills.splice(idx, 1);
      }
      player.skills.push(evolution.result);
      player.skillLevels[evolution.result] = 1;
    }

    if (evolution.effect) {
      player.specialEffects.push(evolution.effect);
    }

    if (evolution.bonus) {
      for (const [key, value] of Object.entries(evolution.bonus)) {
        if (player.skillBonus[key]) {
          player.skillBonus[key] *= value;
        } else {
          player.skillBonus[key] = value;
        }
      }
    }

    SkillSystem.applySkillEffects(player);
    return true;
  },

  getActiveSkills(player) {
    return player.skills.map(id => {
      const skill = CultivationData.getSkill(id);
      return {
        ...skill,
        level: player.skillLevels[id] || 1
      };
    });
  }
};
