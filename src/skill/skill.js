const FlyingSword = {
  pool: [],
  activeSwords: [],

  acquire() {
    const s = FlyingSword.pool.pop() || {
      active: false,
      x: 0, y: 0,
      vx: 0, vy: 0,
      damage: 0,
      radius: 6,
      life: 0,
      maxLife: 0,
      angle: 0,
      pierced: 0,
      maxPierce: 0,
      trail: []
    };
    return s;
  },

  release(s) {
    s.active = false;
    s.trail.length = 0;
    FlyingSword.pool.push(s);
  },

  fire(player, enemies) {
    if (player.swordTimer > 0) return;

    const targets = [];
    for (const e of enemies) {
      const dist = Utils.distance(player, e);
      if (dist < player.swordRange) {
        targets.push({ enemy: e, dist: dist });
      }
    }

    if (targets.length === 0) return;

    targets.sort((a, b) => a.dist - b.dist);

    const count = player.swordCount;
    for (let i = 0; i < count; i++) {
      const target = targets[i % targets.length].enemy;
      const angle = Utils.angle(player, target);

      const sword = FlyingSword.acquire();
      sword.active = true;
      sword.x = player.x;
      sword.y = player.y;
      sword.angle = angle;
      sword.vx = Math.cos(angle) * player.swordSpeed;
      sword.vy = Math.sin(angle) * player.swordSpeed;
      sword.damage = player.swordDamage;
      sword.radius = 6;
      sword.life = 1500;
      sword.maxLife = 1500;
      sword.maxPierce = Math.floor(player.skillLevels.flyingSword / 3);
      sword.pierced = 0;
      sword.trail = [];
      sword.hitEnemies = new Set();

      FlyingSword.activeSwords.push(sword);
    }

    player.swordTimer = player.swordCooldown;
  },

  update(s, dt, player, enemies, damageNumbers) {
    s.trail.push({ x: s.x, y: s.y });
    if (s.trail.length > 8) s.trail.shift();

    s.x += s.vx;
    s.y += s.vy;
    s.life -= dt;

    if (s.life <= 0) {
      FlyingSword.release(s);
      return false;
    }

    for (const e of enemies) {
      if (s.hitEnemies.has(e)) continue;
      if (Utils.circleCircleCollide(s, e)) {
        e.hp -= s.damage;
        e.hitFlash = 150;
        s.hitEnemies.add(e);

        damageNumbers.push({
          x: e.x,
          y: e.y - 20,
          value: Math.floor(s.damage),
          color: '#ffd700',
          life: 700,
          maxLife: 700
        });

        s.pierced++;
        if (s.pierced > s.maxPierce) {
          Particle.spawnExplosion(s.x, s.y, '#ffd700', 5);
          FlyingSword.release(s);
          return false;
        }
      }
    }

    return true;
  },

  draw(s, ctx) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);

    for (let i = 0; i < s.trail.length; i++) {
      const t = s.trail[i];
      const alpha = (i / s.trail.length) * 0.5;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#87ceeb';
      ctx.beginPath();
      ctx.ellipse(t.x - s.x, t.y - s.y, 8 - i * 0.5, 2 - i * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const gradient = ctx.createLinearGradient(-15, 0, 15, 0);
    gradient.addColorStop(0, '#4a90d9');
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, '#4a90d9');

    ctx.fillStyle = gradient;
    ctx.shadowColor = '#87ceeb';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(5, -4);
    ctx.lineTo(-10, -3);
    ctx.lineTo(-15, 0);
    ctx.lineTo(-10, 3);
    ctx.lineTo(5, 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(-12, -1.5, 6, 3);

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  drawRange(player, ctx) {
    ctx.strokeStyle = 'rgba(135, 206, 235, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.swordRange, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
};

const UpgradeOptions = [
  {
    id: 'sword_count',
    name: '飞剑数量+1',
    icon: '⚔️',
    desc: '同时发射的飞剑数量增加一把',
    rarity: 'common',
    apply(player) {
      player.swordCount++;
      player.skillLevels.flyingSword++;
    }
  },
  {
    id: 'sword_damage',
    name: '飞剑伤害+25%',
    icon: '💥',
    desc: '飞剑造成的伤害提升25%',
    rarity: 'common',
    apply(player) {
      player.swordDamage = Math.floor(player.swordDamage * 1.25);
      player.skillLevels.flyingSword++;
    }
  },
  {
    id: 'sword_speed',
    name: '飞剑攻速+20%',
    icon: '⚡',
    desc: '飞剑发射间隔缩短20%',
    rarity: 'common',
    apply(player) {
      player.swordCooldown = Math.floor(player.swordCooldown * 0.8);
      player.skillLevels.flyingSword++;
    }
  },
  {
    id: 'sword_range',
    name: '飞剑范围+30%',
    icon: '🎯',
    desc: '飞剑的攻击范围扩大30%',
    rarity: 'common',
    apply(player) {
      player.swordRange = Math.floor(player.swordRange * 1.3);
      player.skillLevels.flyingSword++;
    }
  },
  {
    id: 'sword_pierce',
    name: '飞剑穿透+1',
    icon: '🏹',
    desc: '飞剑可多穿透一个敌人',
    rarity: 'rare',
    apply(player) {
      player.skillLevels.flyingSword += 3;
    }
  },
  {
    id: 'atk_up',
    name: '攻击+20%',
    icon: '🗡️',
    desc: '所有攻击伤害提升20%',
    rarity: 'common',
    apply(player) {
      player.atk = Math.floor(player.atk * 1.2);
      player.swordDamage = Math.floor(player.swordDamage * 1.2);
    }
  },
  {
    id: 'speed_up',
    name: '移速+15%',
    icon: '👟',
    desc: '移动速度提升15%',
    rarity: 'common',
    apply(player) {
      player.speed = player.baseSpeed * 1.15 + (player.speed - player.baseSpeed);
      player.baseSpeed = player.baseSpeed * 1.15;
    }
  },
  {
    id: 'hp_up',
    name: '生命+30',
    icon: '❤️',
    desc: '最大生命值增加30并恢复满血',
    rarity: 'common',
    apply(player) {
      player.maxHp += 30;
      player.hp = player.maxHp;
    }
  },
  {
    id: 'hp_regen',
    name: '生命恢复',
    icon: '💚',
    desc: '恢复50%最大生命值',
    rarity: 'rare',
    apply(player) {
      player.hp = Math.min(player.maxHp, player.hp + Math.floor(player.maxHp * 0.5));
    }
  },
  {
    id: 'pickup_range',
    name: '拾取范围+50%',
    icon: '✨',
    desc: '经验球拾取范围扩大50%',
    rarity: 'common',
    apply(player) {
      player.pickupRange = Math.floor(player.pickupRange * 1.5);
    }
  },
  {
    id: 'sword_projectile_speed',
    name: '飞剑飞行速度+25%',
    icon: '🚀',
    desc: '飞剑飞得更快更远',
    rarity: 'rare',
    apply(player) {
      player.swordSpeed = player.swordSpeed * 1.25;
    }
  }
];

function getRandomUpgrades(count) {
  const shuffled = Utils.shuffle(UpgradeOptions);
  return shuffled.slice(0, count);
}
