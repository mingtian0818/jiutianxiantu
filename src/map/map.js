const GameMap = {
  width: 1000,
  height: 650,

  grassPattern: [],
  trees: [],
  rocks: [],
  flowers: [],

  generate(width, height) {
    GameMap.width = width;
    GameMap.height = height;

    GameMap.grassPattern.length = 0;
    GameMap.trees.length = 0;
    GameMap.rocks.length = 0;
    GameMap.flowers.length = 0;

    for (let i = 0; i < 80; i++) {
      GameMap.grassPattern.push({
        x: Math.random() * width,
        y: Math.random() * height,
        type: Math.floor(Math.random() * 3)
      });
    }

    const treeCount = 18 + Math.floor(Math.random() * 8);
    for (let i = 0; i < treeCount; i++) {
      let x, y, valid;
      let tries = 0;
      do {
        valid = true;
        x = 50 + Math.random() * (width - 100);
        y = 50 + Math.random() * (height - 100);

        if (Math.abs(x - width / 2) < 120 && Math.abs(y - height / 2) < 120) {
          valid = false;
        }

        for (const t of GameMap.trees) {
          if (Utils.distance({ x, y }, t) < 60) {
            valid = false;
            break;
          }
        }
        tries++;
      } while (!valid && tries < 50);

      if (valid) {
        GameMap.trees.push({
          x: x,
          y: y,
          size: 18 + Math.random() * 10,
          shade: Math.random() * 0.2 - 0.1
        });
      }
    }

    const rockCount = 12 + Math.floor(Math.random() * 6);
    for (let i = 0; i < rockCount; i++) {
      let x, y, valid;
      let tries = 0;
      do {
        valid = true;
        x = 50 + Math.random() * (width - 100);
        y = 50 + Math.random() * (height - 100);

        if (Math.abs(x - width / 2) < 100 && Math.abs(y - height / 2) < 100) {
          valid = false;
        }

        for (const r of GameMap.rocks) {
          if (Utils.distance({ x, y }, r) < 50) {
            valid = false;
            break;
          }
        }
        tries++;
      } while (!valid && tries < 50);

      if (valid) {
        GameMap.rocks.push({
          x: x,
          y: y,
          size: 12 + Math.random() * 12,
          rot: Math.random() * Math.PI * 2
        });
      }
    }

    for (let i = 0; i < 30; i++) {
      GameMap.flowers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        color: Utils.pickRandom(['#ff69b4', '#ff6347', '#ffd700', '#da70d6', '#87ceeb']),
        size: 3 + Math.random() * 3
      });
    }
  },

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, GameMap.height);
    gradient.addColorStop(0, '#3d5c3d');
    gradient.addColorStop(1, '#2a4a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GameMap.width, GameMap.height);

    ctx.strokeStyle = 'rgba(0, 50, 0, 0.15)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x <= GameMap.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GameMap.height);
      ctx.stroke();
    }
    for (let y = 0; y <= GameMap.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GameMap.width, y);
      ctx.stroke();
    }

    for (const g of GameMap.grassPattern) {
      ctx.fillStyle = `rgba(60, 120, 60, ${0.3 + g.type * 0.1})`;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 3 + g.type * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const f of GameMap.flowers) {
      ctx.fillStyle = f.color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const px = f.x + Math.cos(angle) * f.size * 0.6;
        const py = f.y + Math.sin(angle) * f.size * 0.6;
        ctx.moveTo(px, py);
        ctx.arc(px, py, f.size * 0.4, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawRocks(ctx) {
    for (const r of GameMap.rocks) {
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.rot);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(3, 5, r.size, r.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      const rockGrad = ctx.createRadialGradient(-r.size * 0.3, -r.size * 0.3, 0, 0, 0, r.size);
      rockGrad.addColorStop(0, '#888');
      rockGrad.addColorStop(0.7, '#555');
      rockGrad.addColorStop(1, '#333');
      ctx.fillStyle = rockGrad;
      ctx.beginPath();
      ctx.moveTo(r.size, 0);
      ctx.lineTo(r.size * 0.6, -r.size * 0.7);
      ctx.lineTo(-r.size * 0.4, -r.size * 0.8);
      ctx.lineTo(-r.size * 0.8, -r.size * 0.2);
      ctx.lineTo(-r.size * 0.6, r.size * 0.5);
      ctx.lineTo(r.size * 0.3, r.size * 0.7);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.ellipse(-r.size * 0.2, -r.size * 0.3, r.size * 0.3, r.size * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  },

  drawTrees(ctx) {
    const sortedTrees = GameMap.trees.slice().sort((a, b) => a.y - b.y);
    for (const t of sortedTrees) {
      ctx.save();
      ctx.translate(t.x, t.y);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(5, 8, t.size * 1.2, t.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#5c3d2e';
      ctx.fillRect(-t.size * 0.15, 0, t.size * 0.3, t.size * 0.8);

      const greenDark = `rgb(${40 + t.shade * 30}, ${90 + t.shade * 40}, ${40 + t.shade * 20})`;
      const greenMid = `rgb(${60 + t.shade * 40}, ${130 + t.shade * 40}, ${60 + t.shade * 30})`;
      const greenLight = `rgb(${100 + t.shade * 50}, ${170 + t.shade * 40}, ${100 + t.shade * 30})`;

      ctx.fillStyle = greenDark;
      ctx.beginPath();
      ctx.moveTo(0, -t.size * 1.8);
      ctx.lineTo(-t.size * 1.1, t.size * 0.3);
      ctx.lineTo(t.size * 1.1, t.size * 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = greenMid;
      ctx.beginPath();
      ctx.moveTo(0, -t.size * 2.2);
      ctx.lineTo(-t.size * 0.9, -t.size * 0.4);
      ctx.lineTo(t.size * 0.9, -t.size * 0.4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = greenLight;
      ctx.beginPath();
      ctx.moveTo(0, -t.size * 2.5);
      ctx.lineTo(-t.size * 0.6, -t.size * 1.0);
      ctx.lineTo(t.size * 0.6, -t.size * 1.0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  },

  drawForeground(ctx) {
    GameMap.drawRocks(ctx);
    GameMap.drawTrees(ctx);
  },

  drawBorder(ctx) {
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, GameMap.width - 6, GameMap.height - 6);

    ctx.strokeStyle = '#5c4408';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, GameMap.width - 16, GameMap.height - 16);
  }
};
