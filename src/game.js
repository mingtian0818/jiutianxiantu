const Game = {
  canvas: null,
  ctx: null,
  width: 1000,
  height: 650,

  state: 'menu',
  player: null,
  enemies: [],
  expOrbs: [],
  damageNumbers: [],
  particles: Particle._active,

  kills: 0,
  startTime: 0,
  elapsed: 0,

  spawnTimer: 0,
  spawnInterval: 2500,
  difficulty: 1,

  bossSpawned: false,
  bossDefeated: false,
  bossTime: 600000,

  tribulationStarted: false,
  ascensionStartTime: 0,
  ascensionShown: false,

  input: {
    keys: { w: false, a: false, s: false, d: false }
  },

  pendingUpgrades: null,
  heavenlyVision: null,

  bestKillCount: 0,
  bestTime: 0,
  bestLevel: 0,
  
  maxParticles: 200,
  maxDamageNumbers: 50,
  maxExpOrbs: 100,
  
  frameCount: 0,
  fps: 0,
  lastFpsUpdate: 0,

  init() {
    Game.canvas = document.getElementById('gameCanvas');
    Game.ctx = Game.canvas.getContext('2d');
    Game.width = Game.canvas.width;
    Game.height = Game.canvas.height;

    GameUI.init();
    GameMap.generate(Game.width, Game.height);

    window.addEventListener('keydown', Game.onKeyDown);
    window.addEventListener('keyup', Game.onKeyUp);
    
    Game.setupTouchControls();

    GameUI.elements.startBtn.addEventListener('click', Game.start);
    GameUI.elements.restartBtn.addEventListener('click', Game.start);
    GameUI.elements.victoryRestartBtn.addEventListener('click', Game.start);
    GameUI.elements.saveBtn.addEventListener('click', Game.saveGame);
    GameUI.elements.loadBtn.addEventListener('click', Game.loadGame);
    GameUI.elements.craftBtn.addEventListener('click', () => GameUI.showCraftPanel(Game.player));

    document.getElementById('craftPanel').addEventListener('click', (e) => {
      const btn = e.target.closest('.craft-btn');
      if (btn && btn.dataset.recipe) {
        CultivationData.craft(Game.player, btn.dataset.recipe);
        GameUI.showCraftPanel(Game.player);
      }
      if (e.target.id === 'craftPanel') {
        GameUI.hideCraftPanel();
      }
    });

    document.getElementById('sectScreen').addEventListener('click', (e) => {
      const sectCard = e.target.closest('.sect-card');
      if (sectCard) {
        document.querySelectorAll('.sect-card').forEach(c => c.classList.remove('selected'));
        sectCard.classList.add('selected');
      }
      const shopBtn = e.target.closest('.shop-btn');
      if (shopBtn && shopBtn.dataset.item) {
        const result = SectSystem.buyItem(Game.player, shopBtn.dataset.item);
        GameUI.showBreakNotice(result.message);
        GameUI.showSectScreen(Game.player);
      }
      if (e.target.id === 'sectScreen') {
        GameUI.hideSectScreen();
      }
    });

    SaveSystem.loadGameStats(SaveSystem.load());

    requestAnimationFrame(Game.loop);
  },

  setupTouchControls() {
    const canvas = Game.canvas;
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        Game.input.keys.a = deltaX < -20;
        Game.input.keys.d = deltaX > 20;
      } else {
        Game.input.keys.w = deltaY < -20;
        Game.input.keys.s = deltaY > 20;
      }
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      Game.input.keys.w = false;
      Game.input.keys.a = false;
      Game.input.keys.s = false;
      Game.input.keys.d = false;
    });
  },

  onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (k in Game.input.keys) {
      Game.input.keys[k] = true;
      e.preventDefault();
    }
    if (k === 'escape') {
      GameUI.hideCraftPanel();
    }
  },

  onKeyUp(e) {
    const k = e.key.toLowerCase();
    if (k in Game.input.keys) {
      Game.input.keys[k] = false;
    }
  },

  start() {
    Game.state = 'playing';
    Game.player = Player.create(Game.width / 2, Game.height / 2);
    Game.enemies = [];
    Game.expOrbs = [];
    Game.damageNumbers = [];
    Game.particles.length = 0;
    FlyingSword.activeSwords.length = 0;
    Game.kills = 0;
    Game.startTime = performance.now();
    Game.elapsed = 0;
    Game.spawnTimer = 0;
    Game.spawnInterval = 1500;
    Game.difficulty = 1;
    Game.bossSpawned = false;
    Game.bossDefeated = false;
    Game.pendingUpgrades = null;
    Game.heavenlyVision = null;
    Game.tribulationStarted = false;
    Game.ascensionStartTime = 0;
    Game.ascensionShown = false;

    GameMap.generate(Game.width, Game.height);

    GameUI.hideStartScreen();
    GameUI.hideGameOverScreen();
    GameUI.hideVictoryScreen();
    GameUI.hideUpgradeScreen();
    GameUI.hideCraftPanel();

    AudioSystem.playBGM();
  },

  spawnEnemies() {
    const timeRatio = Game.elapsed / 600000;
    const currentDifficulty = 1 + timeRatio * 4;
    Game.difficulty = currentDifficulty;

    Game.spawnInterval = Math.max(400, 1500 - timeRatio * 900);

    const maxEnemies = Math.floor(15 + timeRatio * 35);
    if (Game.enemies.length >= maxEnemies) return;

    let spawnCount = 1 + Math.floor(timeRatio * 3);
    for (let i = 0; i < spawnCount; i++) {
      const roll = Math.random();
      let type = 'normal';
      if (timeRatio > 0.2 && roll > 0.7) {
        type = 'fast';
      }
      if (timeRatio > 0.4 && roll > 0.88) {
        type = 'tank';
      }
      Game.enemies.push(
        Enemy.spawnEnemy(type, Game.player, Game.width, Game.height, currentDifficulty)
      );
    }
  },

  spawnBoss() {
    if (Game.bossSpawned) return;
    Game.bossSpawned = true;

    const boss = Enemy.create('boss', Game.width / 2, 80, Game.difficulty);
    Game.enemies.push(boss);

    AudioSystem.playBossBGM();
    GameUI.showBossNotice();
  },

  handleUpgradeSelect(index) {
    if (!Game.pendingUpgrades) return;
    const upgrade = Game.pendingUpgrades[index];
    if (upgrade && upgrade.apply) {
      upgrade.apply(Game.player);
    }
    Game.pendingUpgrades = null;
    GameUI.hideUpgradeScreen();
    Game.state = 'playing';
  },

  checkLevelUp() {
    if (Player.tryLevelUp(Game.player)) {
      AudioSystem.playLevelUpSound();
      Game.state = 'upgrading';
      Game.pendingUpgrades = getRandomUpgrades(3);
      GameUI.showUpgradeScreen(Game.pendingUpgrades, Game.handleUpgradeSelect);
    }
  },

  checkBreakthrough() {
    const result = RealmSystem.checkBreakthrough(Game.player);
    if (result) {
      AudioSystem.playBreakthroughSound();
      if (result.type === 'realm') {
        const oldRealm = CultivationData.getRealm(result.oldRealm);
        const newRealm = CultivationData.getRealm(result.newRealm);
        GameUI.showBreakNotice(`${oldRealm.name}突破${newRealm.name}`);
        RealmSystem.startHeavenlyVision(Game.player);
      } else if (result.type === 'stage') {
        const realm = CultivationData.getRealm(result.realm);
        GameUI.showBreakNotice(`${realm.name}${['初期','中期','后期','巅峰','大圆满'][result.stage]}`);
      }
    }
  },

  checkElementLevelUp() {
    if (ElementSystem.addElementExp(Game.player, 0)) {
      GameUI.showBreakNotice(`${ElementSystem.getElementDisplayName(Game.player)}`);
    }
  },

  spawnEquipmentDrop() {
    const dropChance = 0.05 + Game.difficulty * 0.02;
    if (Math.random() < dropChance) {
      const equipment = CultivationData.generateRandomEquipment(Game.player);
      if (equipment) {
        EquipmentSystem.equip(Game.player, equipment);
      }
    }
  },

  gameOver() {
    SaveSystem.updateBestStats();
    SaveSystem.save(Game.player);
    AudioSystem.playDeathSound();
    Game.state = 'gameover';
    GameUI.showGameOverScreen(Game.elapsed, Game.kills, Game.player.level);
  },

  victory() {
    SaveSystem.updateBestStats();
    SaveSystem.save(Game.player);
    AudioSystem.playVictorySound();
    Game.state = 'victory';
    GameUI.showVictoryScreen(Game.kills, Game.player.level);
  },

  saveGame() {
    if (SaveSystem.save(Game.player)) {
      GameUI.showBreakNotice('存档成功！');
    }
  },

  loadGame() {
    const saveData = SaveSystem.load();
    if (!saveData) {
      GameUI.showBreakNotice('暂无存档');
      return;
    }

    const loadedPlayer = SaveSystem.loadPlayer(saveData);
    if (!loadedPlayer) {
      GameUI.showBreakNotice('读档失败');
      return;
    }

    Game.player = loadedPlayer;
    Game.player.x = Game.width / 2;
    Game.player.y = Game.height / 2;

    SaveSystem.loadGameStats(saveData);
    Game.state = 'playing';
    Game.enemies = [];
    Game.expOrbs = [];
    Game.kills = saveData.gameStats.kills || 0;
    Game.elapsed = saveData.gameStats.totalTime || 0;
    Game.startTime = performance.now() - Game.elapsed;

    GameUI.hideStartScreen();
    GameUI.hideGameOverScreen();
    GameUI.hideVictoryScreen();
    GameUI.hideUpgradeScreen();
    GameUI.hideCraftPanel();

    GameUI.showBreakNotice('读档成功！');
  },

  update(dt) {
    Game.frameCount++;
    const now = performance.now();
    if (now - Game.lastFpsUpdate >= 1000) {
      Game.fps = Game.frameCount;
      Game.frameCount = 0;
      Game.lastFpsUpdate = now;
    }

    if (Game.state === 'breakthrough') {
      RealmSystem.updateHeavenlyVision(dt);
      return;
    }

    if (Game.state === 'tribulation') {
      TribulationSystem.update(dt);
      Player.update(Game.player, dt, Game.input, [], [], Game.width, Game.height);
      if (Game.player.hp <= 0) {
        Game.gameOver();
      }
      return;
    }

    if (Game.state === 'ascension') {
      return;
    }

    if (Game.state !== 'playing' && Game.state !== 'plot' && Game.state !== 'encounter') return;

    if (Game.state === 'playing') {
      Game.elapsed = performance.now() - Game.startTime;

      if (!Game.bossSpawned && Game.elapsed >= Game.bossTime) {
        Game.spawnBoss();
      }

      Player.update(
        Game.player, dt, Game.input,
        Game.enemies, Game.expOrbs,
        Game.width, Game.height
      );

      Game.checkLevelUp();
      if (Game.state !== 'playing') return;

      Game.checkBreakthrough();

      PlotSystem.checkPlotTriggers(Game.player);
      if (Game.state !== 'playing') return;

      EncounterSystem.checkEncounter(Game.player);
      if (Game.state !== 'playing') return;

      if (Game.player.realm === 'du_jie' && Game.player.realmStage >= 9 && !Game.tribulationStarted) {
        Game.tribulationStarted = true;
        TribulationSystem.startTribulation(Game.player);
        return;
      }

      FlyingSword.fire(Game.player, Game.enemies);

      for (let i = FlyingSword.activeSwords.length - 1; i >= 0; i--) {
        const s = FlyingSword.activeSwords[i];
        if (!s.active) {
          FlyingSword.activeSwords.splice(i, 1);
          continue;
        }
        const damage = Player.getDamage(Game.player);
        s.damage = damage;
        const alive = FlyingSword.update(s, dt, Game.player, Game.enemies, Game.damageNumbers);
        if (!alive) {
          FlyingSword.activeSwords.splice(i, 1);
        }
      }

      for (const e of Game.enemies) {
        Enemy.update(e, dt, Game.player, Game.width, Game.height);
        const attackResult = Enemy.tryAttack(e, Game.player, Game.damageNumbers);
        if (attackResult && attackResult.reflected) {
          e.hp -= e.damage * 2;
          Particle.spawnExplosion(e.x, e.y, '#00ced1', 10);
        }
      }

      for (let i = Game.enemies.length - 1; i >= 0; i--) {
        const e = Game.enemies[i];
        if (e.hp <= 0) {
          Particle.spawnExplosion(e.x, e.y, e.accentColor, 12);
          ResourceSystem.dropResources(e, Game.player);

          const orbCount = Math.max(1, Math.floor(e.expValue / 2));
          for (let j = 0; j < orbCount && Game.expOrbs.length < Game.maxExpOrbs; j++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 10 + Math.random() * 20;
            Game.expOrbs.push(ExpOrb.create(
              e.x + Math.cos(angle) * dist,
              e.y + Math.sin(angle) * dist,
              Math.ceil(e.expValue / orbCount)
            ));
          }
          Game.kills++;

          SectSystem.updateQuestProgress(Game.player, 'kill', null);

          Game.spawnEquipmentDrop();

          if (e.type === 'boss') {
            Game.bossDefeated = true;
            setTimeout(() => Game.victory(), 1000);
          }

          Game.enemies.splice(i, 1);
        }
      }

      if (Game.player.hp <= 0) {
        Particle.spawnExplosion(Game.player.x, Game.player.y, '#ffd700', 20);
        Game.gameOver();
        return;
      }

      TreasureSystem.updateTreasures(Game.player);

      Game.spawnTimer += dt;
      if (Game.spawnTimer >= Game.spawnInterval) {
        Game.spawnTimer = 0;
        Game.spawnEnemies();
      }

      while (Game.particles.length > Game.maxParticles) {
        Game.particles.shift();
      }
      for (let i = Game.particles.length - 1; i >= 0; i--) {
        const p = Game.particles[i];
        if (!p.active) {
          Game.particles.splice(i, 1);
          continue;
        }
        Particle.update(p, dt);
      }

      while (Game.damageNumbers.length > Game.maxDamageNumbers) {
        Game.damageNumbers.shift();
      }
      for (let i = Game.damageNumbers.length - 1; i >= 0; i--) {
        const d = Game.damageNumbers[i];
        d.life -= dt;
        if (d.life <= 0) {
          Game.damageNumbers.splice(i, 1);
        }
      }

      while (Game.expOrbs.length > Game.maxExpOrbs) {
        Game.expOrbs.shift();
      }

      GameUI.updateHUD(Game.player, Game.elapsed, Game.kills);
      GameUI.updateQuests(Game.player);
    }
  },

  draw() {
    const ctx = Game.ctx;

    ctx.clearRect(0, 0, Game.width, Game.height);

    Game.drawInkBackground(ctx);

    GameMap.drawBackground(ctx);

    for (const orb of Game.expOrbs) {
      ExpOrb.draw(orb, ctx);
    }

    for (const p of Game.particles) {
      if (p.active) Particle.draw(p, ctx);
    }

    const allEntities = [];
    for (const e of Game.enemies) {
      allEntities.push({ obj: e, y: e.y, type: 'enemy' });
    }
    if (Game.player) {
      allEntities.push({ obj: Game.player, y: Game.player.y, type: 'player' });
    }
    allEntities.sort((a, b) => a.y - b.y);

    for (const ent of allEntities) {
      if (ent.type === 'enemy') {
        Enemy.draw(ent.obj, ctx);
      } else {
        Player.draw(ent.obj, ctx);
      }
    }

    for (const s of FlyingSword.activeSwords) {
      if (s.active) FlyingSword.draw(s, ctx);
    }

    GameMap.drawForeground(ctx);

    GameUI.drawDamageNumbers(ctx, Game.damageNumbers);

    GameMap.drawBorder(ctx);

    RealmSystem.drawHeavenlyVision(ctx);

    if (Game.state === 'tribulation') {
      TribulationSystem.draw(ctx);
    }

    if (Game.state === 'ascension') {
      Game.drawAscensionAnimation(ctx);
    }
  },

  drawInkBackground(ctx) {
    const time = performance.now() * 0.0002;

    const gradient = ctx.createLinearGradient(0, 0, 0, Game.height);
    gradient.addColorStop(0, '#0a0a15');
    gradient.addColorStop(0.5, '#0d1120');
    gradient.addColorStop(1, '#080812');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, Game.width, Game.height);

    ctx.strokeStyle = 'rgba(40, 60, 80, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const y = (Game.height / 5) * i + Math.sin(time + i) * 20;
      ctx.moveTo(0, y);
      for (let x = 0; x < Game.width; x += 50) {
        ctx.lineTo(x, y + Math.sin(x * 0.01 + time * 2 + i) * 15);
      }
      ctx.stroke();
    }

    const mountains = [
      { x: 0, y: Game.height * 0.7, scale: 0.6, color: 'rgba(30, 40, 50, 0.4)' },
      { x: Game.width * 0.3, y: Game.height * 0.65, scale: 0.8, color: 'rgba(35, 45, 55, 0.5)' },
      { x: Game.width * 0.6, y: Game.height * 0.72, scale: 0.7, color: 'rgba(25, 35, 45, 0.45)' },
      { x: Game.width * 0.9, y: Game.height * 0.68, scale: 0.75, color: 'rgba(30, 40, 50, 0.48)' }
    ];

    mountains.forEach((m, i) => {
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.moveTo(m.x, Game.height);
      
      const peaks = 5 + i;
      for (let j = 0; j <= peaks; j++) {
        const px = m.x + (Game.width * m.scale / peaks) * j;
        const py = m.y + Math.sin(j * 1.5 + time + i) * 30 + Math.sin(j * 2.3) * 20;
        ctx.lineTo(px, py);
      }
      
      ctx.lineTo(m.x + Game.width * m.scale, Game.height);
      ctx.closePath();
      ctx.fill();
    });

    const clouds = [
      { x: time * 100 % (Game.width + 200) - 100, y: 50, size: 80 },
      { x: time * 70 % (Game.width + 200) - 100, y: 120, size: 60 },
      { x: time * 50 % (Game.width + 200) - 100, y: 80, size: 100 },
      { x: time * 80 % (Game.width + 200) - 100, y: 180, size: 70 }
    ];

    clouds.forEach(c => {
      ctx.fillStyle = 'rgba(100, 120, 140, 0.15)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      ctx.arc(c.x + c.size * 0.6, c.y - c.size * 0.2, c.size * 0.7, 0, Math.PI * 2);
      ctx.arc(c.x - c.size * 0.5, c.y + c.size * 0.1, c.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  drawAscensionAnimation(ctx) {
    const time = performance.now() - Game.ascensionStartTime;
    const progress = Math.min(time / 5000, 1);

    ctx.fillStyle = `rgba(255, 215, 0, ${progress * 0.3})`;
    ctx.fillRect(0, 0, Game.width, Game.height);

    const centerX = Game.width / 2;
    const centerY = Game.height / 2;

    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2 + time * 0.002;
      const radius = 50 + (time * 0.05) % 200;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.fillStyle = `rgba(255, 255, 200, ${0.5 - progress * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = `bold ${40 + progress * 20}px serif`;
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText('飞升成功！', centerX, centerY);
    ctx.font = '20px serif';
    ctx.fillStyle = '#ffec8b';
    ctx.fillText('恭喜你成为仙尊！', centerX, centerY + 40);

    if (progress >= 1 && !Game.ascensionShown) {
      Game.ascensionShown = true;
      setTimeout(() => {
        Game.start();
      }, 2000);
    }
  },

  loop(now) {
    const dt = Math.min(50, now - (Game.lastTime || now));
    Game.lastTime = now;

    Game.update(dt);
    Game.draw();

    requestAnimationFrame(Game.loop);
  },

  lastTime: 0
};

window.addEventListener('load', Game.init);
