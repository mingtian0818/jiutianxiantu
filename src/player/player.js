const Player = {
  create(x, y, name = '修仙者') {
    const player = {
      x: x,
      y: y,
      name: name,
      radius: 18,
      baseSpeed: 3,
      speed: 3,
      baseMaxHp: 150,
      maxHp: 150,
      hp: 150,
      baseAtk: 15,
      atk: 15,
      baseDefense: 0,
      defense: 0,
      level: 1,
      exp: 0,
      expToNext: 10,
      invincible: 0,
      facingAngle: 0,
      shield: 0,
      reflectNextAttack: false,
      critRate: 0,

      swordCount: 1,
      baseSwordDamage: 15,
      swordDamage: 15,
      baseSwordRange: 220,
      swordRange: 220,
      swordSpeed: 7,
      baseSwordCooldown: 800,
      swordCooldown: 800,
      swordTimer: 0,
      baseSwordProjectileCount: 1,
      swordProjectileCount: 1,
      skillDamageMultiplier: 1,

      pickupRange: 50,

      realm: 'qi',
      realmStage: 0,
      cultivation: {
        exp: 0,
        breakthroughProgress: 0
      },

      element: null,
      elementLevel: 1,
      elementExp: 0,
      elementBonus: {},

      skills: ['flying_sword'],
      skillLevels: { flying_sword: 1 },
      specialEffects: [],
      skillBonus: {},

      equipment: {
        weapon: null,
        armor: null,
        accessory: null
      },
      equipmentBonus: {
        atk: 0,
        defense: 0,
        hp: 0,
        skillDamage: 0,
        critRate: 0
      },

      treasures: [],
      treasureCooldowns: {},
      nineTurnBuff: null,

      sect: null,
      sectContribution: 0,
      sectQuests: [],
      sectBonus: {},

      quests: [],

      plotCompleted: {},

      resources: {
        spirit_stone: 0,
        demon_core: 0,
        spirit_herb: 0,
        foundation_pill: 0,
        golden_core_pill: 0,
        yuan_ying_pill: 0,
        hua_shen_pill: 0,
        du_jie_pill: 0,
        rare_herb: 0,
        ancient_essence: 0
      }
    };

    ElementSystem.generateElements(player);
    ElementSystem.applyElementBonus(player);

    return player;
  },

  update(p, dt, input, enemies, expOrbs, mapWidth, mapHeight) {
    let dx = 0, dy = 0;
    if (input.keys.w) dy -= 1;
    if (input.keys.s) dy += 1;
    if (input.keys.a) dx -= 1;
    if (input.keys.d) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len; dy /= len;
    }

    if (dx !== 0 || dy !== 0) {
      p.facingAngle = Math.atan2(dy, dx);
    }

    p.x += dx * p.speed;
    p.y += dy * p.speed;

    p.x = Utils.clamp(p.x, p.radius, mapWidth - p.radius);
    p.y = Utils.clamp(p.y, p.radius, mapHeight - p.radius);

    if (p.invincible > 0) {
      p.invincible -= dt;
    }

    if (p.swordTimer > 0) {
      p.swordTimer -= dt;
    }

    if (p.nineTurnBuff) {
      const elapsed = performance.now() - p.nineTurnBuff.startTime;
      if (elapsed >= p.nineTurnBuff.duration) {
        p.nineTurnBuff = null;
      }
    }

    for (let i = expOrbs.length - 1; i >= 0; i--) {
      const orb = expOrbs[i];
      const dist = Utils.distance(p, orb);
      if (dist < p.pickupRange + orb.size) {
        p.exp += orb.value;
        RealmSystem.addCultivation(p, orb.value);
        ElementSystem.addElementExp(p, Math.floor(orb.value / 2));
        expOrbs.splice(i, 1);
      } else if (dist < p.pickupRange * 3) {
        const angle = Utils.angle(orb, p);
        const pullSpeed = 2 + (p.pickupRange * 3 - dist) * 0.03;
        orb.x += Math.cos(angle) * pullSpeed;
        orb.y += Math.sin(angle) * pullSpeed;
      }
    }
  },

  tryLevelUp(p) {
    let leveledUp = false;
    while (p.exp >= p.expToNext) {
      p.exp -= p.expToNext;
      p.level++;
      p.expToNext = Math.floor(p.expToNext * 1.4 + 5);
      p.baseMaxHp += 10;
      p.baseAtk += 2;
      leveledUp = true;
    }
    return leveledUp;
  },

  takeDamage(p, amount) {
    if (p.invincible > 0) return false;

    if (p.reflectNextAttack) {
      p.reflectNextAttack = false;
      return { reflected: true };
    }

    if (p.shield > 0) {
      const damageToShield = Math.min(p.shield, amount);
      p.shield -= damageToShield;
      amount -= damageToShield;
    }

    const actualDamage = Math.max(1, amount - p.defense);
    p.hp -= actualDamage;
    p.invincible = 500;
    return { reflected: false, damage: actualDamage };
  },

  getDamage(p) {
    let damage = p.swordDamage;
    if (p.nineTurnBuff) {
      damage *= p.nineTurnBuff.multiplier;
    }
    if (Math.random() < p.critRate) {
      damage *= 2;
    }
    return Math.floor(damage);
  },

  draw(p, ctx) {
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.invincible > 0 && Math.floor(p.invincible / 80) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    if (p.shield > 0) {
      ctx.strokeStyle = 'rgba(79, 195, 247, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (p.nineTurnBuff) {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.radius + 15);
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 15, 0, Math.PI * 2);
      ctx.fill();
    }

    const element = CultivationData.getElement(p.element);
    const elementColor = element ? element.color : '#ffd700';

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.radius + 10);
    gradient.addColorStop(0, elementColor + '40');
    gradient.addColorStop(1, elementColor + '00');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff8dc';
    ctx.strokeStyle = elementColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4a3c20';
    ctx.beginPath();
    ctx.arc(0, -p.radius * 0.2, p.radius * 0.55, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-5, 2, 2.5, 0, Math.PI * 2);
    ctx.arc(5, 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 8, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = elementColor;
    ctx.textAlign = 'center';
    ctx.fillText(element ? element.name : '?', 0, p.radius + 18);

    ctx.restore();
  }
};
