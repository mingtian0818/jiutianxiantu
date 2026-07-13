const RealmSystem = {
  addCultivation(player, amount) {
    player.cultivation.exp += amount;
    return RealmSystem.checkBreakthrough(player);
  },

  checkBreakthrough(player) {
    const requiredExp = CultivationData.calculateExpRequired(player.realm, player.realmStage);
    if (player.cultivation.exp >= requiredExp) {
      return RealmSystem.tryBreakthrough(player);
    }
    return false;
  },

  tryBreakthrough(player) {
    const realm = CultivationData.getRealm(player.realm);
    const nextRealmIndex = CultivationData.getRealmIndex(player.realm) + 1;

    if (player.realmStage < realm.stages - 1) {
      player.cultivation.exp -= CultivationData.calculateExpRequired(player.realm, player.realmStage);
      player.realmStage++;
      return { type: 'stage', realm: player.realm, stage: player.realmStage };
    } else if (nextRealmIndex < CultivationData.realms.length) {
      const nextRealm = CultivationData.realms[nextRealmIndex];
      if (nextRealm.nextCost) {
        const cost = nextRealm.nextCost;
        if ((player.resources[cost.spiritStone] || 0) >= cost.spiritStone) {
          if (cost.pill && (player.resources[cost.pill] || 0) >= 1) {
            player.resources[cost.spiritStone] -= cost.spiritStone;
            player.resources[cost.pill] -= 1;
            player.realm = nextRealm.id;
            player.realmStage = 0;
            player.cultivation.exp = 0;
            RealmSystem.applyRealmBonus(player);
            return { type: 'realm', oldRealm: realm.id, newRealm: nextRealm.id };
          }
        }
        return { type: 'need_materials', cost: cost };
      } else {
        player.realm = nextRealm.id;
        player.realmStage = 0;
        player.cultivation.exp = 0;
        RealmSystem.applyRealmBonus(player);
        return { type: 'realm', oldRealm: realm.id, newRealm: nextRealm.id };
      }
    }
    return false;
  },

  applyRealmBonus(player) {
    const realmIndex = CultivationData.getRealmIndex(player.realm);
    const bonusMultiplier = 1 + realmIndex * 0.2;
    player.maxHp = Math.floor(player.baseMaxHp * bonusMultiplier);
    player.hp = player.maxHp;
    player.atk = Math.floor(player.baseAtk * bonusMultiplier);
    player.swordDamage = Math.floor(player.baseSwordDamage * bonusMultiplier);
  },

  getExpProgress(player) {
    const required = CultivationData.calculateExpRequired(player.realm, player.realmStage);
    return player.cultivation.exp / required;
  },

  startHeavenlyVision(player) {
    Game.state = 'breakthrough';
    const vision = {
      startTime: performance.now(),
      duration: 3000,
      particles: [],
      realm: player.realm,
      stage: player.realmStage
    };

    const colors = ['#ffd700', '#00ced1', '#9400d3', '#ff4500', '#4fc3f7'];
    for (let i = 0; i < 50; i++) {
      vision.particles.push({
        x: Math.random() * Game.width,
        y: Math.random() * Game.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: Utils.pickRandom(colors),
        size: 2 + Math.random() * 6,
        life: 3000 + Math.random() * 2000
      });
    }

    Game.heavenlyVision = vision;
  },

  updateHeavenlyVision(dt) {
    if (!Game.heavenlyVision) return;
    const vision = Game.heavenlyVision;

    for (const p of vision.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= dt;
    }
    vision.particles = vision.particles.filter(p => p.life > 0);

    const elapsed = performance.now() - vision.startTime;
    if (elapsed >= vision.duration) {
      Game.heavenlyVision = null;
      Game.state = 'playing';
    }
  },

  drawHeavenlyVision(ctx) {
    if (!Game.heavenlyVision) return;
    const vision = Game.heavenlyVision;
    const elapsed = performance.now() - vision.startTime;
    const progress = elapsed / vision.duration;

    ctx.save();

    const gradient = ctx.createRadialGradient(
      Game.width / 2, Game.height / 2, 0,
      Game.width / 2, Game.height / 2, Math.max(Game.width, Game.height)
    );
    gradient.addColorStop(0, `rgba(255, 215, 0, ${0.3 * (1 - progress)})`);
    gradient.addColorStop(0.5, `rgba(0, 206, 209, ${0.2 * (1 - progress)})`);
    gradient.addColorStop(1, `rgba(148, 0, 211, ${0.1 * (1 - progress)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, Game.width, Game.height);

    for (const p of vision.particles) {
      ctx.globalAlpha = Math.min(1, p.life / 2000);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + Math.sin(elapsed * 0.005 + p.x * 0.01)), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    ctx.font = 'bold 48px "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 30;

    const realmName = CultivationData.getRealmDisplayName(vision.realm, vision.stage);
    ctx.fillText(`${realmName}`, Game.width / 2, Game.height / 2 - 30);

    ctx.font = '24px "KaiTi", serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('天地异象！', Game.width / 2, Game.height / 2 + 30);

    ctx.restore();
  },

  getRealmBonus(player) {
    const realmIndex = CultivationData.getRealmIndex(player.realm);
    return {
      hpMultiplier: 1 + realmIndex * 0.2,
      atkMultiplier: 1 + realmIndex * 0.2,
      skillMultiplier: 1 + realmIndex * 0.15
    };
  }
};
