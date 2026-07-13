const ResourceSystem = {
  addResource(player, resourceId, amount) {
    if (!player.resources[resourceId]) {
      player.resources[resourceId] = 0;
    }
    player.resources[resourceId] += amount;
  },

  removeResource(player, resourceId, amount) {
    if (!player.resources[resourceId] || player.resources[resourceId] < amount) {
      return false;
    }
    player.resources[resourceId] -= amount;
    return true;
  },

  getResource(player, resourceId) {
    return player.resources[resourceId] || 0;
  },

  dropResources(enemy, player) {
    const baseDrop = {
      spirit_stone: enemy.expValue * 2,
      demon_core: Math.random() < 0.3 ? 1 : 0,
      spirit_herb: Math.random() < 0.2 ? 1 : 0
    };

    if (enemy.type === 'boss') {
      baseDrop.spirit_stone *= 50;
      baseDrop.demon_core = 10;
      baseDrop.spirit_herb = 20;
      baseDrop.rare_herb = 5;
      baseDrop.ancient_essence = 2;
    }

    for (const [resourceId, amount] of Object.entries(baseDrop)) {
      if (amount > 0) {
        ResourceSystem.addResource(player, resourceId, amount);
      }
    }
  },

  craft(player, recipeId) {
    return CultivationData.craft(player, recipeId);
  },

  canCraft(player, recipeId) {
    return CultivationData.canCraft(player, recipeId);
  },

  getResourceDisplayName(resourceId) {
    const resource = CultivationData.getResource(resourceId);
    return resource ? resource.name : resourceId;
  },

  getResourceIcon(resourceId) {
    const resource = CultivationData.getResource(resourceId);
    return resource ? resource.icon : '📦';
  },

  getResourceColor(resourceId) {
    const resource = CultivationData.getResource(resourceId);
    return resource ? resource.color : '#888';
  },

  collectOrb(player, orb) {
    ResourceSystem.addResource(player, orb.type, orb.value);
  }
};

const SaveSystem = {
  save(player) {
    const saveData = {
      version: '1.0',
      timestamp: Date.now(),
      player: {
        name: player.name,
        level: player.level,
        exp: player.exp,
        expToNext: player.expToNext,
        hp: player.hp,
        maxHp: player.maxHp,
        atk: player.atk,
        defense: player.defense,
        speed: player.speed,
        realm: player.realm,
        realmStage: player.realmStage,
        cultivation: player.cultivation,
        element: player.element,
        elementLevel: player.elementLevel,
        elementExp: player.elementExp,
        skills: player.skills,
        skillLevels: player.skillLevels,
        equipment: player.equipment,
        treasures: player.treasures,
        resources: player.resources,
        swordDamage: player.swordDamage,
        swordRange: player.swordRange,
        swordCooldown: player.swordCooldown,
        swordProjectileCount: player.swordProjectileCount
      },
      gameStats: {
        kills: Game.kills,
        totalTime: Game.elapsed,
        bestKillCount: Game.bestKillCount || 0,
        bestTime: Game.bestTime || 0,
        bestLevel: Game.bestLevel || 0
      }
    };

    try {
      localStorage.setItem('jiutian_xiantu_save', JSON.stringify(saveData));
      return true;
    } catch (e) {
      return false;
    }
  },

  load() {
    try {
      const saveStr = localStorage.getItem('jiutian_xiantu_save');
      if (!saveStr) return null;

      const saveData = JSON.parse(saveStr);
      if (!saveData.version || saveData.version !== '1.0') return null;

      return saveData;
    } catch (e) {
      return null;
    }
  },

  hasSave() {
    return localStorage.getItem('jiutian_xiantu_save') !== null;
  },

  deleteSave() {
    localStorage.removeItem('jiutian_xiantu_save');
  },

  loadPlayer(saveData) {
    if (!saveData || !saveData.player) return null;

    const player = Player.create(Game.width / 2, Game.height / 2);
    const pData = saveData.player;

    player.name = pData.name;
    player.level = pData.level;
    player.exp = pData.exp;
    player.expToNext = pData.expToNext;
    player.hp = pData.hp;
    player.maxHp = pData.maxHp;
    player.atk = pData.atk;
    player.defense = pData.defense;
    player.speed = pData.speed;
    player.realm = pData.realm;
    player.realmStage = pData.realmStage;
    player.cultivation = pData.cultivation;
    player.element = pData.element;
    player.elementLevel = pData.elementLevel;
    player.elementExp = pData.elementExp;
    player.skills = pData.skills || [];
    player.skillLevels = pData.skillLevels || {};
    player.equipment = pData.equipment || { weapon: null, armor: null, accessory: null };
    player.treasures = pData.treasures || [];
    player.resources = pData.resources || {};
    player.swordDamage = pData.swordDamage;
    player.swordRange = pData.swordRange;
    player.swordCooldown = pData.swordCooldown;
    player.swordProjectileCount = pData.swordProjectileCount;

    ElementSystem.updateBonus(player);
    EquipmentSystem.applyEquipmentBonus(player);
    SkillSystem.applySkillEffects(player);

    return player;
  },

  loadGameStats(saveData) {
    if (!saveData || !saveData.gameStats) return;

    Game.bestKillCount = saveData.gameStats.bestKillCount || 0;
    Game.bestTime = saveData.gameStats.bestTime || 0;
    Game.bestLevel = saveData.gameStats.bestLevel || 0;
  },

  updateBestStats() {
    if (Game.kills > Game.bestKillCount) Game.bestKillCount = Game.kills;
    if (Game.elapsed > Game.bestTime) Game.bestTime = Game.elapsed;
    if (Game.player && Game.player.level > Game.bestLevel) Game.bestLevel = Game.player.level;
  }
};
