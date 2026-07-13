const TribulationSystem = {
  lightningCount: 0,
  maxLightning: 9,
  lightningDamage: 100,
  lightningSpeed: 1.5,
  
  activeLightning: [],
  warningLightning: [],
  timeSinceLastLightning: 0,
  lightningInterval: 2000,
  
  startTribulation(player) {
    TribulationSystem.lightningCount = 0;
    TribulationSystem.activeLightning = [];
    TribulationSystem.warningLightning = [];
    TribulationSystem.timeSinceLastLightning = 0;
    TribulationSystem.lightningInterval = 2000;
    
    AudioSystem.playTribulationSound();
    Game.state = 'tribulation';
    GameUI.showTribulationScreen();
  },

  update(dt) {
    TribulationSystem.timeSinceLastLightning += dt;
    
    if (TribulationSystem.timeSinceLastLightning >= TribulationSystem.lightningInterval) {
      TribulationSystem.timeSinceLastLightning = 0;
      TribulationSystem.spawnLightning();
    }
    
    for (let i = TribulationSystem.warningLightning.length - 1; i >= 0; i--) {
      const wl = TribulationSystem.warningLightning[i];
      wl.timer -= dt;
      if (wl.timer <= 0) {
        TribulationSystem.warningLightning.splice(i, 1);
        TribulationSystem.createLightning(wl.x, wl.y);
      }
    }
    
    for (let i = TribulationSystem.activeLightning.length - 1; i >= 0; i--) {
      const l = TribulationSystem.activeLightning[i];
      l.y += l.speed * (dt / 16);
      
      if (l.y > Game.height + 50) {
        TribulationSystem.activeLightning.splice(i, 1);
        continue;
      }
      
      if (Game.player) {
        const dx = Game.player.x - l.x;
        const dy = Game.player.y - l.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < Game.player.radius + l.radius) {
          const damage = TribulationSystem.lightningDamage * (1 + TribulationSystem.lightningCount * 0.1);
          Game.player.hp -= damage;
          Game.damageNumbers.push({
            x: Game.player.x,
            y: Game.player.y,
            text: Math.floor(damage).toString(),
            color: '#ff4500',
            size: 30,
            life: 1000
          });
          TribulationSystem.activeLightning.splice(i, 1);
        }
      }
    }
    
    if (TribulationSystem.lightningCount >= TribulationSystem.maxLightning && 
        TribulationSystem.activeLightning.length === 0 && 
        TribulationSystem.warningLightning.length === 0) {
      TribulationSystem.completeTribulation();
    }
    
    TribulationSystem.lightningInterval = Math.max(1000, 2000 - TribulationSystem.lightningCount * 100);
  },

  spawnLightning() {
    if (TribulationSystem.lightningCount >= TribulationSystem.maxLightning) return;
    
    TribulationSystem.lightningCount++;
    
    const warningCount = Math.min(3, TribulationSystem.lightningCount);
    for (let i = 0; i < warningCount; i++) {
      const x = 50 + Math.random() * (Game.width - 100);
      const y = -50;
      TribulationSystem.warningLightning.push({
        x: x,
        y: y,
        timer: 800,
        id: TribulationSystem.lightningCount + i
      });
    }
  },

  createLightning(x, y) {
    const speed = TribulationSystem.lightningSpeed * (1 + TribulationSystem.lightningCount * 0.1);
    TribulationSystem.activeLightning.push({
      x: x,
      y: y,
      speed: speed,
      radius: 25,
      width: 15 + Math.random() * 10
    });
    
    for (let i = 0; i < 10; i++) {
      Game.particles.push({
        active: true,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 5,
        life: 500,
        maxLife: 500,
        color: '#ffff00',
        size: 3 + Math.random() * 5
      });
    }
  },

  completeTribulation() {
    AudioSystem.playAscensionSound();
    Game.state = 'ascension';
    Game.ascensionStartTime = performance.now();
    GameUI.hideTribulationScreen();
  },

  draw(ctx) {
    for (const wl of TribulationSystem.warningLightning) {
      ctx.fillStyle = `rgba(255, 255, 0, ${0.5 + Math.sin(performance.now() * 0.01) * 0.3})`;
      ctx.beginPath();
      ctx.arc(wl.x, 50, 40, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(wl.x, 50, 50, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    for (const l of TribulationSystem.activeLightning) {
      const gradient = ctx.createLinearGradient(l.x, l.y - 100, l.x, l.y);
      gradient.addColorStop(0, '#00ffff');
      gradient.addColorStop(0.5, '#ffff00');
      gradient.addColorStop(1, '#ff4500');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = l.width;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(l.x, l.y - 80);
      
      let prevX = l.x;
      let prevY = l.y - 80;
      
      for (let i = 0; i < 8; i++) {
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = 20;
        ctx.lineTo(prevX + offsetX, prevY + offsetY);
        prevX = prevX + offsetX;
        prevY = prevY + offsetY;
      }
      
      ctx.lineTo(l.x, l.y);
      ctx.stroke();
      
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const lightningText = `${TribulationSystem.lightningCount}/${TribulationSystem.maxLightning}`;
    ctx.font = 'bold 24px serif';
    ctx.fillStyle = '#ff4500';
    ctx.textAlign = 'center';
    ctx.fillText(`雷劫: ${lightningText}`, Game.width / 2, 40);
  }
};