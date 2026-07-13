const CultivationData = {
  realms: [
    { id: 'qi', name: '炼气', stages: 10, baseExp: 100, color: '#8b4513', nextCost: { spiritStone: 100, pill: 'foundation_pill' } },
    { id: 'foundation', name: '筑基', stages: 10, baseExp: 500, color: '#4a90d9', nextCost: { spiritStone: 500, pill: 'golden_core_pill' } },
    { id: 'golden_core', name: '金丹', stages: 10, baseExp: 2000, color: '#ffd700', nextCost: { spiritStone: 2000, pill: 'yuan_ying_pill' } },
    { id: 'yuan_ying', name: '元婴', stages: 10, baseExp: 8000, color: '#9400d3', nextCost: { spiritStone: 8000, pill: 'hua_shen_pill' } },
    { id: 'hua_shen', name: '化神', stages: 10, baseExp: 30000, color: '#00ced1', nextCost: { spiritStone: 30000, pill: 'du_jie_pill' } },
    { id: 'du_jie', name: '渡劫', stages: 10, baseExp: 100000, color: '#ff4500', nextCost: null }
  ],

  getRealmIndex(id) {
    return CultivationData.realms.findIndex(r => r.id === id);
  },

  getRealm(id) {
    return CultivationData.realms.find(r => r.id === id);
  },

  getRealmByIndex(index) {
    return CultivationData.realms[index];
  },

  calculateExpRequired(realmId, stage) {
    const realm = CultivationData.getRealm(realmId);
    if (!realm) return 0;
    return Math.floor(realm.baseExp * Math.pow(1.5, stage));
  },

  calculateTotalExp(realmId, stage) {
    const realmIndex = CultivationData.getRealmIndex(realmId);
    let total = 0;
    for (let i = 0; i < realmIndex; i++) {
      const r = CultivationData.realms[i];
      for (let s = 0; s < r.stages; s++) {
        total += CultivationData.calculateExpRequired(r.id, s);
      }
    }
    const currentRealm = CultivationData.getRealm(realmId);
    for (let s = 0; s < stage; s++) {
      total += CultivationData.calculateExpRequired(realmId, s);
    }
    return total;
  },

  elements: [
    { id: 'gold', name: '金', color: '#c0c0c0', icon: '⚔️', bonus: { atk: 1.2 } },
    { id: 'wood', name: '木', color: '#228b22', icon: '🌿', bonus: { hp: 1.3, regen: 0.5 } },
    { id: 'water', name: '水', color: '#4169e1', icon: '💧', bonus: { defense: 1.2, speed: 1.1 } },
    { id: 'fire', name: '火', color: '#ff4500', icon: '🔥', bonus: { skillDamage: 1.5 } },
    { id: 'earth', name: '土', color: '#8b4513', icon: '🪨', bonus: { hp: 1.2, defense: 1.3 } },
    { id: 'thunder', name: '雷', color: '#ffd700', icon: '⚡', bonus: { skillDamage: 1.3, critRate: 0.2 } },
    { id: 'ice', name: '冰', color: '#00ced1', icon: '❄️', bonus: { slowEffect: 0.3, defense: 1.1 } },
    { id: 'chaos', name: '混沌', color: '#9400d3', icon: '🌀', bonus: { atk: 1.1, hp: 1.1, skillDamage: 1.1, speed: 1.1 } }
  ],

  getElement(id) {
    return CultivationData.elements.find(e => e.id === id);
  },

  rarityColors: {
    common: '#c0c0c0',
    magic: '#4fc3f7',
    treasure: '#ba68c8',
    immortal: '#ffd700',
    divine: '#ff6b6b'
  },

  skillQualities: {
    yellow: { name: '黄阶', color: '#daa520', multiplier: 1.0 },
    mysterious: { name: '玄阶', color: '#9370db', multiplier: 1.3 },
    earth: { name: '地阶', color: '#20b2aa', multiplier: 1.6 },
    heaven: { name: '天阶', color: '#ffd700', multiplier: 2.0 },
    immortal: { name: '仙阶', color: '#ff6b6b', multiplier: 2.5 }
  },

  skills: [
    { id: 'flying_sword', name: '飞剑术', quality: 'yellow', element: 'gold', damage: 15, range: 200, cooldown: 800 },
    { id: 'fireball', name: '火球术', quality: 'yellow', element: 'fire', damage: 25, range: 150, cooldown: 1200 },
    { id: 'thunder_bolt', name: '雷击术', quality: 'yellow', element: 'thunder', damage: 30, range: 250, cooldown: 1500 },
    { id: 'ice_shard', name: '冰锥术', quality: 'yellow', element: 'ice', damage: 20, range: 180, cooldown: 1000 },
    { id: 'healing', name: '治愈术', quality: 'yellow', element: 'wood', heal: 30, cooldown: 3000 },
    { id: 'earth_shield', name: '土盾术', quality: 'yellow', element: 'earth', defense: 20, duration: 3000, cooldown: 5000 },
    { id: 'water_wave', name: '水波纹', quality: 'yellow', element: 'water', damage: 15, aoeRange: 100, cooldown: 1500 },
    { id: 'sword_intent', name: '剑意', quality: 'mysterious', element: 'gold', effect: 'sword_intent', bonus: 0.3, cooldown: 0 },
    { id: 'nine_suns_sword', name: '九阳剑诀', quality: 'earth', element: 'fire', damage: 50, range: 250, cooldown: 1000 },
    { id: 'ten_thousand_swords', name: '万剑归宗', quality: 'heaven', element: 'gold', damage: 100, range: 300, cooldown: 3000, projectileCount: 10 }
  ],

  getSkill(id) {
    return CultivationData.skills.find(s => s.id === id);
  },

  skillEvolutions: [
    { id: 'ten_thousand_swords', name: '万剑归宗', requires: ['flying_sword', 'sword_intent'], result: 'ten_thousand_swords', bonus: { damage: 2.0, projectileCount: 5 } },
    { id: 'nine_heaven_thunder_fire', name: '九天雷火', requires: ['fireball', 'thunder_bolt'], result: null, effect: 'thunder_fire', bonus: { damage: 1.8, stun: true } },
    { id: 'ice_thunder', name: '冰雷术', requires: ['ice_shard', 'thunder_bolt'], result: null, effect: 'ice_thunder', bonus: { damage: 1.5, slow: 0.5 } },
    { id: 'heaven_earth_sword', name: '天地一剑', requires: ['ten_thousand_swords', 'nine_suns_sword'], result: null, effect: 'heaven_earth', bonus: { damage: 3.0, aoe: true } }
  ],

  equipmentTypes: ['weapon', 'armor', 'accessory'],

  equipment: [
    { id: 'iron_sword', name: '铁剑', type: 'weapon', rarity: 'common', stats: { atk: 5 } },
    { id: 'spirit_sword', name: '灵剑', type: 'weapon', rarity: 'magic', stats: { atk: 15, skillDamage: 0.1 } },
    { id: 'flying_sword', name: '飞剑', type: 'weapon', rarity: 'treasure', stats: { atk: 30, skillDamage: 0.2 } },
    { id: 'immortal_sword', name: '仙剑', type: 'weapon', rarity: 'immortal', stats: { atk: 60, skillDamage: 0.4 } },
    { id: 'divine_sword', name: '神剑', type: 'weapon', rarity: 'divine', stats: { atk: 120, skillDamage: 0.6, critRate: 0.2 } },
    { id: 'leather_armor', name: '皮甲', type: 'armor', rarity: 'common', stats: { defense: 3, hp: 20 } },
    { id: 'spirit_armor', name: '灵甲', type: 'armor', rarity: 'magic', stats: { defense: 10, hp: 50 } },
    { id: 'treasure_armor', name: '宝甲', type: 'armor', rarity: 'treasure', stats: { defense: 25, hp: 100 } },
    { id: 'immortal_armor', name: '仙甲', type: 'armor', rarity: 'immortal', stats: { defense: 50, hp: 200 } },
    { id: 'divine_armor', name: '神甲', type: 'armor', rarity: 'divine', stats: { defense: 100, hp: 400 } },
    { id: 'iron_ring', name: '铁环', type: 'accessory', rarity: 'common', stats: { atk: 2 } },
    { id: 'spirit_ring', name: '灵戒', type: 'accessory', rarity: 'magic', stats: { atk: 8, critRate: 0.05 } },
    { id: 'treasure_ring', name: '宝戒', type: 'accessory', rarity: 'treasure', stats: { atk: 20, critRate: 0.1, skillDamage: 0.1 } },
    { id: 'immortal_ring', name: '仙戒', type: 'accessory', rarity: 'immortal', stats: { atk: 40, critRate: 0.15, skillDamage: 0.2 } },
    { id: 'divine_ring', name: '神戒', type: 'accessory', rarity: 'divine', stats: { atk: 80, critRate: 0.25, skillDamage: 0.3 } }
  ],

  getEquipment(id) {
    return CultivationData.equipment.find(e => e.id === id);
  },

  treasures: [
    { id: 'zhu_xian_sword', name: '诛仙剑', skill: 'zhu_xian', effect: '召唤诛仙剑阵，对范围内所有敌人造成大量伤害', cooldown: 30000 },
    { id: 'qian_kun_ding', name: '乾坤鼎', skill: 'qian_kun', effect: '使用乾坤鼎，恢复大量生命并获得护盾', cooldown: 25000 },
    { id: 'zhen_yao_tower', name: '镇妖塔', skill: 'zhen_yao', effect: '召唤镇妖塔，将范围内敌人定身3秒', cooldown: 40000 },
    { id: 'heavenly_mirror', name: '天镜', skill: 'heavenly_mirror', effect: '激活天镜，反弹下一次受到的攻击', cooldown: 35000 },
    { id: 'nine_turn_pellet', name: '九转丹', skill: 'nine_turn', effect: '服用九转丹，全属性提升50%持续10秒', cooldown: 60000 }
  ],

  getTreasure(id) {
    return CultivationData.treasures.find(t => t.id === id);
  },

  resources: [
    { id: 'spirit_stone', name: '灵石', icon: '💎', color: '#4fc3f7' },
    { id: 'demon_core', name: '妖丹', icon: '🫀', color: '#ff6b6b' },
    { id: 'spirit_herb', name: '灵草', icon: '🌿', color: '#228b22' },
    { id: 'foundation_pill', name: '筑基丹', icon: '💊', color: '#4a90d9' },
    { id: 'golden_core_pill', name: '金丹丹', icon: '💊', color: '#ffd700' },
    { id: 'yuan_ying_pill', name: '元婴丹', icon: '💊', color: '#9400d3' },
    { id: 'hua_shen_pill', name: '化神丹', icon: '💊', color: '#00ced1' },
    { id: 'du_jie_pill', name: '渡劫丹', icon: '💊', color: '#ff4500' },
    { id: 'rare_herb', name: '仙草', icon: '🌸', color: '#ff69b4' },
    { id: 'ancient_essence', name: '上古精华', icon: '✨', color: '#da70d6' }
  ],

  getResource(id) {
    return CultivationData.resources.find(r => r.id === id);
  },

  recipes: {
    foundation_pill: { ingredients: { spirit_herb: 5, demon_core: 2 }, result: 'foundation_pill' },
    golden_core_pill: { ingredients: { spirit_herb: 15, demon_core: 5, rare_herb: 3 }, result: 'golden_core_pill' },
    yuan_ying_pill: { ingredients: { spirit_herb: 30, demon_core: 10, rare_herb: 5, ancient_essence: 2 }, result: 'yuan_ying_pill' },
    hua_shen_pill: { ingredients: { spirit_herb: 50, demon_core: 20, rare_herb: 10, ancient_essence: 5 }, result: 'hua_shen_pill' },
    du_jie_pill: { ingredients: { spirit_herb: 100, demon_core: 50, rare_herb: 20, ancient_essence: 10 }, result: 'du_jie_pill' }
  },

  canCraft(player, recipeId) {
    const recipe = CultivationData.recipes[recipeId];
    if (!recipe) return false;
    for (const [ingredientId, amount] of Object.entries(recipe.ingredients)) {
      if ((player.resources[ingredientId] || 0) < amount) {
        return false;
      }
    }
    return true;
  },

  craft(player, recipeId) {
    const recipe = CultivationData.recipes[recipeId];
    if (!CultivationData.canCraft(player, recipeId)) return false;
    for (const [ingredientId, amount] of Object.entries(recipe.ingredients)) {
      player.resources[ingredientId] -= amount;
    }
    player.resources[recipe.result] = (player.resources[recipe.result] || 0) + 1;
    return true;
  },

  generateRandomElement() {
    const rand = Math.random();
    if (rand < 0.5) {
      return Utils.pickRandom(['gold', 'wood', 'water', 'fire', 'earth']);
    } else if (rand < 0.85) {
      return Utils.pickRandom(['thunder', 'ice']);
    } else {
      return 'chaos';
    }
  },

  generateRandomEquipment(player) {
    const realmIndex = CultivationData.getRealmIndex(player.realm);
    const maxRarity = Math.min(4, realmIndex);
    const rarityRoll = Math.random();
    let rarityIndex = 0;
    const rarityThresholds = [0.5, 0.8, 0.95, 0.99, 1.0];
    for (let i = 0; i < rarityThresholds.length; i++) {
      if (rarityRoll < rarityThresholds[i]) {
        rarityIndex = Math.min(i, maxRarity);
        break;
      }
    }
    const rarities = ['common', 'magic', 'treasure', 'immortal', 'divine'];
    const rarity = rarities[rarityIndex];
    const type = Utils.pickRandom(CultivationData.equipmentTypes);
    const filtered = CultivationData.equipment.filter(e => e.type === type && e.rarity === rarity);
    if (filtered.length === 0) {
      return null;
    }
    return Utils.pickRandom(filtered);
  },

  getRealmDisplayName(realmId, stage) {
    const realm = CultivationData.getRealm(realmId);
    if (!realm) return '未知境界';
    const stageNames = ['初期', '中期', '后期', '巅峰', '大圆满'];
    const stageName = stage < 5 ? stageNames[stage] : stageNames[stage - 5] + '·' + (stage - 4) + '转';
    return realm.name + stageName;
  },

  sects: [
    { id: 'qingyun', name: '青云宗', icon: '☁️', color: '#4fc3f7', description: '正道之首，以青云剑法闻名天下', skills: ['flying_sword', 'sword_intent'], bonus: { atk: 1.1 }, tasks: ['kill_10_enemies', 'reach_foundation'] },
    { id: 'wanjian', name: '万剑门', icon: '⚔️', color: '#9370db', description: '剑道圣地，门下弟子皆精通剑法', skills: ['nine_suns_sword', 'ten_thousand_swords'], bonus: { skillDamage: 1.2 }, tasks: ['kill_30_enemies', 'reach_golden_core'] },
    { id: 'yaowang', name: '药王谷', icon: '🌿', color: '#228b22', description: '炼丹圣地，精通药理与医术', skills: ['healing', 'earth_shield'], bonus: { hp: 1.1, regen: 1 }, tasks: ['collect_10_herbs', 'craft_pill'] },
    { id: 'tianmo', name: '天魔宗', icon: '😈', color: '#ff6b6b', description: '魔道宗门，以力量与杀戮为道', skills: ['fireball', 'thunder_bolt'], bonus: { atk: 1.15, critRate: 0.1 }, tasks: ['kill_50_enemies', 'reach_yuan_ying'] }
  ],

  getSect(id) {
    return CultivationData.sects.find(s => s.id === id);
  },

  sectShop: {
    qingyun: [
      { id: 'qingyun_pill', name: '筑基丹', cost: 50, type: 'resource', resource: 'foundation_pill', amount: 1 },
      { id: 'qingyun_sword', name: '灵剑', cost: 200, type: 'equipment', equipmentId: 'spirit_sword' },
      { id: 'qingyun_skill', name: '剑意', cost: 500, type: 'skill', skillId: 'sword_intent' }
    ],
    wanjian: [
      { id: 'wanjian_pill', name: '金丹丹', cost: 200, type: 'resource', resource: 'golden_core_pill', amount: 1 },
      { id: 'wanjian_sword', name: '飞剑', cost: 500, type: 'equipment', equipmentId: 'flying_sword' },
      { id: 'wanjian_skill', name: '九阳剑诀', cost: 1000, type: 'skill', skillId: 'nine_suns_sword' }
    ],
    yaowang: [
      { id: 'yaowang_herb', name: '灵草', cost: 10, type: 'resource', resource: 'spirit_herb', amount: 5 },
      { id: 'yaowang_rare', name: '仙草', cost: 50, type: 'resource', resource: 'rare_herb', amount: 2 },
      { id: 'yaowang_skill', name: '治愈术', cost: 300, type: 'skill', skillId: 'healing' }
    ],
    tianmo: [
      { id: 'tianmo_core', name: '妖丹', cost: 20, type: 'resource', resource: 'demon_core', amount: 3 },
      { id: 'tianmo_ring', name: '宝戒', cost: 800, type: 'equipment', equipmentId: 'treasure_ring' },
      { id: 'tianmo_skill', name: '火球术', cost: 400, type: 'skill', skillId: 'fireball' }
    ]
  },

  getShopItem(id) {
    for (const sectId of Object.keys(CultivationData.sectShop)) {
      const item = CultivationData.sectShop[sectId].find(i => i.id === id);
      if (item) return item;
    }
    return null;
  },

  plotLines: [
    { id: 'intro', title: '初入仙途', dialogs: [
      { speaker: '旁白', text: '洪荒年间，天地灵气充沛，修仙之风盛行...' },
      { speaker: '旁白', text: '你出生于一个小村庄，自小体弱多病。' },
      { speaker: '神秘老人', text: '老夫观你骨骼惊奇，竟天生拥有混沌灵根！' },
      { speaker: '神秘老人', text: '此乃万中无一的修仙奇才，随我来吧！' },
      { speaker: '旁白', text: '你踏上了修仙之路，从此命运改写...' }
    ]},
    { id: 'foundation', title: '筑基成功', dialogs: [
      { speaker: '宗门长老', text: '恭喜你成功筑基！' },
      { speaker: '宗门长老', text: '从此你已是真正的修仙者，可独当一面了。' },
      { speaker: '旁白', text: '筑基成功，你感受到体内灵力澎湃...' }
    ]},
    { id: 'golden_core', title: '金丹大道', dialogs: [
      { speaker: '宗主', text: '好！好！好！你竟然凝聚出了金丹！' },
      { speaker: '宗主', text: '金丹期，已是一方强者，前途不可限量！' },
      { speaker: '旁白', text: '你的修为再上一层楼...' }
    ]},
    { id: 'yuan_ying', title: '元婴出世', dialogs: [
      { speaker: '太上长老', text: '元婴出世，化神可期！' },
      { speaker: '太上长老', text: '你已超越了宗门内绝大多数弟子。' },
      { speaker: '旁白', text: '你感受到灵魂升华，元婴在体内孕育...' }
    ]},
    { id: 'nascent', title: '化神之境', dialogs: [
      { speaker: '神秘声音', text: '化神境，已是修仙界的顶尖存在...' },
      { speaker: '神秘声音', text: '但这条路，还很长...' },
      { speaker: '旁白', text: '你感受到了更高层次的力量...' }
    ]},
    { id: 'soul', title: '炼虚合道', dialogs: [
      { speaker: '天道', text: '你的灵魂已与天地共鸣...' },
      { speaker: '天道', text: '渡劫之路，即将开启...' },
      { speaker: '旁白', text: '你感受到了天劫的召唤...' }
    ]},
    { id: 'fusion', title: '合体大成', dialogs: [
      { speaker: '仙尊投影', text: '合体境，已是半步仙人...' },
      { speaker: '仙尊投影', text: '准备好迎接九重天雷了吗？' },
      { speaker: '旁白', text: '你的修为已达到渡劫前的巅峰...' }
    ]},
    { id: 'mahayana', title: '大乘圆满', dialogs: [
      { speaker: '天道意志', text: '大乘圆满，渡劫在即...' },
      { speaker: '天道意志', text: '九重天雷即将降临！' },
      { speaker: '旁白', text: '你感受到了天劫的威压...' }
    ]},
    { id: 'sanxian', title: '散仙之劫', dialogs: [
      { speaker: '仙门使者', text: '散仙之身，亦可飞升...' },
      { speaker: '仙门使者', text: '但天劫将更加猛烈！' },
      { speaker: '旁白', text: '你已超越凡人，步入仙途...' }
    ]},
    { id: 'du_jie', title: '渡劫飞升', dialogs: [
      { speaker: '天地', text: '九重天雷，即将降临！' },
      { speaker: '天地', text: '是生是死，在此一举！' },
      { speaker: '旁白', text: '你深吸一口气，准备迎接最后的挑战...' }
    ]}
  ],

  getPlot(id) {
    return CultivationData.plotLines.find(p => p.id === id);
  },

  tasks: [
    { id: 'kill_10_enemies', name: '除妖初体验', description: '击杀10只妖兽', target: 10, trigger: 'kill', reward: { spirit_stone: 100, contribution: 50 } },
    { id: 'kill_30_enemies', name: '斩妖除魔', description: '击杀30只妖兽', target: 30, trigger: 'kill', reward: { spirit_stone: 300, contribution: 100 } },
    { id: 'kill_50_enemies', name: '魔道试炼', description: '击杀50只妖兽', target: 50, trigger: 'kill', reward: { spirit_stone: 500, contribution: 200 } },
    { id: 'reach_foundation', name: '筑基之愿', description: '突破至筑基期', target: 1, trigger: 'realm', reward: { spirit_stone: 500, contribution: 300 } },
    { id: 'reach_golden_core', name: '金丹大道', description: '突破至金丹期', target: 1, trigger: 'realm', reward: { spirit_stone: 2000, contribution: 500 } },
    { id: 'reach_yuan_ying', name: '元婴出世', description: '突破至元婴期', target: 1, trigger: 'realm', reward: { spirit_stone: 5000, contribution: 1000 } },
    { id: 'collect_10_herbs', name: '采药任务', description: '收集灵草', target: 10, trigger: 'collect', reward: { spirit_stone: 200, contribution: 50 } },
    { id: 'craft_pill', name: '炼丹入门', description: '炼制丹药', target: 1, trigger: 'craft', reward: { spirit_stone: 300, contribution: 100 } }
  ],

  getTask(id) {
    return CultivationData.tasks.find(t => t.id === id);
  },

  encounters: [
    {
      id: 'mysterious_old_man',
      title: '神秘老人',
      icon: '👴',
      description: '一位白发苍苍的老人坐在路边，似乎在等待有缘人...',
      choices: [
        { id: 'talk', text: '上前搭话', message: '老人微微一笑，传授你一门神秘功法！', successRate: 1, reward: { skill: 'sword_intent', spirit_stone: 100 } },
        { id: 'ignore', text: '视而不见', message: '你错过了一段机缘...', successRate: 1, reward: {} }
      ]
    },
    {
      id: 'hidden_cave',
      title: '隐藏洞府',
      icon: '🕳️',
      description: '你发现了一处隐蔽的山洞，里面似乎有宝物...',
      choices: [
        { id: 'enter', text: '进入探索', message: '你发现了大量灵石和丹药！', successRate: 0.8, reward: { spirit_stone: 500, demon_core: 10, cultivationExp: 500 }, failMessage: '山洞崩塌，你侥幸逃脱...', failReward: {} },
        { id: 'leave', text: '离开', message: '你选择了安全第一', successRate: 1, reward: {} }
      ]
    },
    {
      id: 'ancient_ruins',
      title: '上古遗迹',
      icon: '🏛️',
      description: '一座古老的遗迹出现在你面前，散发着神秘的气息...',
      choices: [
        { id: 'explore', text: '深入探索', message: '你获得了上古传承！', successRate: 0.6, reward: { skill: 'nine_suns_sword', cultivationExp: 2000, elementExp: 500 }, failMessage: '机关启动，你身受重伤！', failReward: { hp: -100 } },
        { id: 'retreat', text: '退避', message: '你不敢冒险，离开了遗迹', successRate: 1, reward: {} }
      ]
    },
    {
      id: 'beast_nest',
      title: '妖兽巢穴',
      icon: '🐉',
      description: '你发现了一个妖兽巢穴，里面传来阵阵低吼...',
      choices: [
        { id: 'attack', text: '闯入击杀', message: '你成功击杀了妖兽，获得了丰厚的战利品！', successRate: 0.7, reward: { demon_core: 20, spirit_stone: 300, exp: 1000 }, failMessage: '妖兽太强，你被击退了！', failReward: { hp: -150 } },
        { id: 'sneak', text: '悄悄溜走', message: '你小心翼翼地离开了', successRate: 0.9, reward: { spirit_stone: 50 }, failMessage: '妖兽发现了你，你狼狈逃跑！', failReward: { hp: -50 } }
      ]
    },
    {
      id: 'treasure_chest',
      title: '神秘宝箱',
      icon: '📦',
      description: '一个散发着灵光的宝箱出现在你面前...',
      choices: [
        { id: 'open', text: '打开宝箱', message: '恭喜！你获得了一件珍贵法宝！', successRate: 0.75, reward: { treasure: 'zhu_xian_sword', spirit_stone: 200 }, failMessage: '宝箱是陷阱！', failReward: { hp: -80 } },
        { id: 'leave', text: '不碰为妙', message: '你没有冒险', successRate: 1, reward: {} }
      ]
    },
    {
      id: 'immortal_fountain',
      title: '仙泉',
      icon: '⛲',
      description: '一处散发着仙气的泉水，据说能洗髓伐毛...',
      choices: [
        { id: 'drink', text: '饮用泉水', message: '你的体质得到了提升！', successRate: 0.9, reward: { hp: 200, cultivationExp: 1000 }, failMessage: '泉水过于精纯，你承受不住！', failReward: { hp: -50 } },
        { id: 'collect', text: '收集泉水', message: '你收集了一些仙泉之水', successRate: 1, reward: { spirit_stone: 100 } }
      ]
    }
  ],

  getEncounters() {
    return CultivationData.encounters;
  },

  getEncounter(id) {
    return CultivationData.encounters.find(e => e.id === id);
  },

  bossTypes: [
    {
      id: 'fox_spirit',
      name: '千年妖狐',
      icon: '🦊',
      radius: 35,
      speed: 1.5,
      maxHp: 2000,
      damage: 40,
      exp: 500,
      color: '#da70d6',
      accentColor: '#ff69b4',
      phases: [
        { hpThreshold: 1, abilities: ['dash', 'fireball'] },
        { hpThreshold: 0.5, abilities: ['dash', 'fireball', 'tail_swipe'] },
        { hpThreshold: 0.2, abilities: ['dash', 'fireball', 'tail_swipe', 'illusion'] }
      ]
    },
    {
      id: 'demon_ape',
      name: '上古魔猿',
      icon: '🦍',
      radius: 45,
      speed: 0.9,
      maxHp: 3500,
      damage: 60,
      exp: 800,
      color: '#8b0000',
      accentColor: '#ff4500',
      phases: [
        { hpThreshold: 1, abilities: ['ground_slam'] },
        { hpThreshold: 0.6, abilities: ['ground_slam', 'rock_throw'] },
        { hpThreshold: 0.3, abilities: ['ground_slam', 'rock_throw', 'rage'] }
      ]
    },
    {
      id: 'demon_avatar',
      name: '天魔化身',
      icon: '😈',
      radius: 40,
      speed: 1.2,
      maxHp: 5000,
      damage: 80,
      exp: 1500,
      color: '#4b0082',
      accentColor: '#9400d3',
      phases: [
        { hpThreshold: 1, abilities: ['dark_bolt', 'teleport'] },
        { hpThreshold: 0.7, abilities: ['dark_bolt', 'teleport', 'black_hole'] },
        { hpThreshold: 0.4, abilities: ['dark_bolt', 'teleport', 'black_hole', 'meteor'] },
        { hpThreshold: 0.1, abilities: ['dark_bolt', 'teleport', 'black_hole', 'meteor', 'insanity'] }
      ]
    }
  ],

  getBossType(id) {
    return CultivationData.bossTypes.find(b => b.id === id);
  },

  tribulation: {
    lightningCount: 9,
    damagePerLightning: 100,
    speedPerLightning: 1.5,
    warningTime: 1000,
    safeZoneSize: 80
  }
};
