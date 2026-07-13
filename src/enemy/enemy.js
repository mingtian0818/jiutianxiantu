const EnemyTypes = {
  normal: {
    name: '野狼妖',
    radius: 14,
    speed: 1.2,
    maxHp: 30,
    damage: 8,
    exp: 2,
    color: '#8b4513',
    accentColor: '#d2691e'
  },
  fast: {
    name: '青蛇妖',
    radius: 11,
    speed: 2.2,
    maxHp: 18,
    damage: 5,
    exp: 3,
    color: '#228b22',
    accentColor: '#32cd32'
  },
  tank: {
    name: '黑熊妖',
    radius: 20,
    speed: 0.8,
    maxHp: 80,
    damage: 15,
    exp: 5,
    color: '#2f2f2f',
    accentColor: '#696969'
  },
  boss: {
    name: '百年妖兽',
    radius: 45,
    speed: 1.0,
    maxHp: 1500,
    damage: 30,
    exp: 200,
    color: '#8b0000',
    accentColor: '#ff4500'
  }
};

const Enemy = {
  create(type, x, y, difficulty) {
    const base = EnemyTypes[type];
    difficulty = difficulty || 1;
    return {
      type: type,
      x: x,
      y: y,
      radius: base.radius,
      speed: base.speed * (0.9 + difficulty * 0.1),
      maxHp: Math.floor(base.maxHp * (1 + difficulty * 0.3)),
      hp: Math.floor(base.maxHp * (1 + difficulty * 0.3)),
      damage: Math.floor(base.damage * (1 + difficulty * 0.2)),
      expValue: Math.floor(base.exp * (1 + difficulty * 0.15)),
      color: base.color,
      accentColor: base.accentColor,
      name: base.name,
      hitFlash: 0,
      attackCooldown: 0,
      wobble: Math.random() * Math.PI * 2
    };
  },

  update(e, dt, player, mapWidth, mapHeight) {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;

    e.wobble += dt * 0.005;
    const wobbleOffset = Math.sin(e.wobble) * 0.3;

    const moveX = (dx / dist) * e.speed + Math.cos(e.wobble) * wobbleOffset * e.speed * 0.3;
    const moveY = (dy / dist) * e.speed + Math.sin(e.wobble) * wobbleOffset * e.speed * 0.3;

    e.x += moveX;
    e.y += moveY;

    e.x = Utils.clamp(e.x, e.radius, mapWidth - e.radius);
    e.y = Utils.clamp(e.y, e.radius, mapHeight - e.radius);

    if (e.hitFlash > 0) {
      e.hitFlash -= dt;
    }

    if (e.attackCooldown > 0) {
      e.attackCooldown -= dt;
    }
  },

  tryAttack(e, player, damageNumbers) {
    if (e.attackCooldown > 0) return false;
    if (Utils.circleCircleCollide(e, player)) {
      const hit = Player.takeDamage(player, e.damage);
      if (hit) {
        e.attackCooldown = 600;
        damageNumbers.push({
          x: player.x,
          y: player.y - 25,
          value: Math.floor(e.damage),
          color: '#ff6347',
          life: 700,
          maxLife: 700
        });
        return true;
      }
    }
    return false;
  },

  draw(e, ctx) {
    ctx.save();

    if (e.hitFlash > 0) {
      ctx.globalAlpha = 0.7;
    }

    const gradient = ctx.createRadialGradient(
      e.x, e.y, 0,
      e.x, e.y, e.radius + 8
    );
    gradient.addColorStop(0, e.accentColor + '40');
    gradient.addColorStop(1, e.accentColor + '00');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius + 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : e.color;
    ctx.strokeStyle = e.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (e.type === 'normal') {
      ctx.fillStyle = e.accentColor;
      ctx.beginPath();
      ctx.moveTo(e.x - 8, e.y - e.radius + 2);
      ctx.lineTo(e.x - 5, e.y - e.radius - 6);
      ctx.lineTo(e.x - 2, e.y - e.radius + 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(e.x + 8, e.y - e.radius + 2);
      ctx.lineTo(e.x + 5, e.y - e.radius - 6);
      ctx.lineTo(e.x + 2, e.y - e.radius + 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(e.x - 4, e.y - 2, 3, 0, Math.PI * 2);
      ctx.arc(e.x + 4, e.y - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(e.x - 4, e.y - 2, 1.5, 0, Math.PI * 2);
      ctx.arc(e.x + 4, e.y - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === 'fast') {
      ctx.strokeStyle = e.accentColor;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(e.x, e.y + i * 4 - 4, e.radius - i * 3, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
      }
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(e.x - 3, e.y - 3, 2, 0, Math.PI * 2);
      ctx.arc(e.x + 3, e.y - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === 'tank') {
      ctx.fillStyle = e.accentColor;
      ctx.beginPath();
      ctx.ellipse(e.x - e.radius * 0.6, e.y - 2, 5, 8, -0.3, 0, Math.PI * 2);
      ctx.ellipse(e.x + e.radius * 0.6, e.y - 2, 5, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff4500';
      ctx.beginPath();
      ctx.arc(e.x - 6, e.y - 4, 3.5, 0, Math.PI * 2);
      ctx.arc(e.x + 6, e.y - 4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = e.accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y + 4, 6, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    } else if (e.type === 'boss') {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(e.x - 25, e.y - e.radius + 5);
      ctx.lineTo(e.x - 20, e.y - e.radius - 18);
      ctx.lineTo(e.x - 10, e.y - e.radius - 5);
      ctx.lineTo(e.x, e.y - e.radius - 22);
      ctx.lineTo(e.x + 10, e.y - e.radius - 5);
      ctx.lineTo(e.x + 20, e.y - e.radius - 18);
      ctx.lineTo(e.x + 25, e.y - e.radius + 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ff8c00';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ff0';
      ctx.shadowColor = '#ff0';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(e.x - 12, e.y - 5, 6, 0, Math.PI * 2);
      ctx.arc(e.x + 12, e.y - 5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(e.x - 12, e.y - 5, 3, 0, Math.PI * 2);
      ctx.arc(e.x + 12, e.y - 5, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ff0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(e.x, e.y + 10, 18, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) {
        const tx = e.x - 14 + i * 7;
        ctx.beginPath();
        ctx.moveTo(tx, e.y + 8);
        ctx.lineTo(tx + 3, e.y + 14);
        ctx.lineTo(tx + 6, e.y + 8);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (e.hp < e.maxHp) {
      const barW = e.radius * 2;
      const barH = 4;
      const barY = e.y - e.radius - 10;
      ctx.fillStyle = '#333';
      ctx.fillRect(e.x - barW / 2, barY, barW, barH);
      ctx.fillStyle = e.type === 'boss' ? '#ff4500' : '#32cd32';
      ctx.fillRect(e.x - barW / 2, barY, barW * (e.hp / e.maxHp), barH);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(e.x - barW / 2, barY, barW, barH);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  },

  spawnEnemy(type, player, mapWidth, mapHeight, difficulty) {
    let x, y;
    let tries = 0;
    do {
      const side = Math.floor(Math.random() * 4);
      const margin = 50;
      switch (side) {
        case 0:
          x = Math.random() * mapWidth;
          y = margin;
          break;
        case 1:
          x = mapWidth - margin;
          y = Math.random() * mapHeight;
          break;
        case 2:
          x = Math.random() * mapWidth;
          y = mapHeight - margin;
          break;
        case 3:
          x = margin;
          y = Math.random() * mapHeight;
          break;
      }
      tries++;
    } while (player && Utils.distance({ x, y }, player) < 200 && tries < 20);

    return Enemy.create(type, x, y, difficulty);
  }
};

const ExpOrb = {
  create(x, y, value) {
    return {
      x: x,
      y: y,
      value: value,
      size: 5 + Math.min(value, 10),
      pulse: Math.random() * Math.PI * 2
    };
  },

  draw(orb, ctx) {
    orb.pulse += 0.05;
    const scale = 1 + Math.sin(orb.pulse) * 0.2;
    const size = orb.size * scale;

    const gradient = ctx.createRadialGradient(
      orb.x, orb.y, 0,
      orb.x, orb.y, size * 2
    );
    gradient.addColorStop(0, 'rgba(124, 252, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(124, 252, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(124, 252, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, size * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7cfc00';
    ctx.shadowColor = '#7cfc00';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
};
