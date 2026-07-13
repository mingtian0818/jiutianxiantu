const Utils = {
  circleCircleCollide(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    const rr = a.radius + b.radius;
    return (dx * dx + dy * dy) < rr * rr;
  },

  distance(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  angle(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  },

  randomRange(min, max) {
    return min + Math.random() * (max - min);
  },

  randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  },

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  shuffle(arr) {
    const result = arr.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  }
};

const Particle = {
  pool: [],
  _active: [],

  acquire(x, y, vx, vy, color, life, size) {
    const p = Particle.pool.pop() || {
      active: false, x: 0, y: 0, vx: 0, vy: 0,
      color: '', life: 0, maxLife: 0, size: 0
    };
    p.x = x; p.y = y; p.vx = vx; p.vy = vy;
    p.color = color; p.life = life; p.maxLife = life;
    p.size = size || 4;
    p.active = true;
    return p;
  },

  release(p) {
    p.active = false;
    Particle.pool.push(p);
  },

  spawnExplosion(x, y, color, count) {
    count = count || 10;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 / count) * i + Math.random() * 0.4;
      const v = 2 + Math.random() * 3;
      Particle._active.push(
        Particle.acquire(x, y, Math.cos(a) * v, Math.sin(a) * v, color, 600, 4 + Math.random() * 3)
      );
    }
  },

  spawnExpOrb(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 15;
    Particle._active.push(
      Particle.acquire(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 0, 0, '#7cfc00', 999999, 6)
    );
  },

  update(p, dt) {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.92;
    p.vy *= 0.92;
    p.life -= dt;
    if (p.life <= 0) Particle.release(p);
  },

  draw(p, ctx) {
    const a = Math.min(1, p.life / p.maxLife);
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
};
