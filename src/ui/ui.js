const GameUI = {
  elements: {},

  init() {
    GameUI.elements = {
      hpFill: document.getElementById('hpFill'),
      hpText: document.getElementById('hpText'),
      levelText: document.getElementById('levelText'),
      expFill: document.getElementById('expFill'),
      expText: document.getElementById('expText'),
      timeText: document.getElementById('timeText'),
      killCount: document.getElementById('killCount'),
      swordLevel: document.getElementById('swordLevel'),
      upgradeScreen: document.getElementById('upgradeScreen'),
      upgradeCards: document.getElementById('upgradeCards'),
      startScreen: document.getElementById('startScreen'),
      gameOverScreen: document.getElementById('gameOverScreen'),
      victoryScreen: document.getElementById('victoryScreen'),
      finalTime: document.getElementById('finalTime'),
      finalKills: document.getElementById('finalKills'),
      finalLevel: document.getElementById('finalLevel'),
      victoryKills: document.getElementById('victoryKills'),
      victoryLevel: document.getElementById('victoryLevel'),
      bossNotice: document.getElementById('bossNotice'),
      startBtn: document.getElementById('startBtn'),
      restartBtn: document.getElementById('restartBtn'),
      victoryRestartBtn: document.getElementById('victoryRestartBtn'),

      realmText: document.getElementById('realmText'),
      realmProgress: document.getElementById('realmProgress'),
      elementText: document.getElementById('elementText'),
      elementProgress: document.getElementById('elementProgress'),
      resourcesPanel: document.getElementById('resourcesPanel'),
      equipmentPanel: document.getElementById('equipmentPanel'),
      skillsPanel: document.getElementById('skillsPanel'),
      treasuresPanel: document.getElementById('treasuresPanel'),
      breakNotice: document.getElementById('breakNotice'),
      saveBtn: document.getElementById('saveBtn'),
      loadBtn: document.getElementById('loadBtn'),
      craftPanel: document.getElementById('craftPanel'),
      craftBtn: document.getElementById('craftBtn'),

      plotScreen: document.getElementById('plotScreen'),
      plotTitle: document.getElementById('plotTitle'),
      plotDialog: document.getElementById('plotDialog'),
      plotSpeaker: document.getElementById('plotSpeaker'),
      plotNextBtn: document.getElementById('plotNextBtn'),

      encounterScreen: document.getElementById('encounterScreen'),
      encounterTitle: document.getElementById('encounterTitle'),
      encounterIcon: document.getElementById('encounterIcon'),
      encounterDesc: document.getElementById('encounterDesc'),
      encounterOptions: document.getElementById('encounterOptions'),

      tribulationScreen: document.getElementById('tribulationScreen'),
      tribulationLightning: document.getElementById('tribulationLightning'),
      tribulationHp: document.getElementById('tribulationHp'),

      sectPanel: document.getElementById('sectPanel'),
      sectBtn: document.getElementById('sectBtn'),
      sectScreen: document.getElementById('sectScreen'),
      sectName: document.getElementById('sectName'),
      sectDesc: document.getElementById('sectDesc'),
      sectContribution: document.getElementById('sectContribution'),
      sectQuests: document.getElementById('sectQuests'),
      sectShop: document.getElementById('sectShop'),
      sectJoinBtn: document.getElementById('sectJoinBtn'),

      questsPanel: document.getElementById('questsPanel')
    };

    if (GameUI.elements.plotNextBtn) {
      GameUI.elements.plotNextBtn.addEventListener('click', PlotSystem.nextDialog);
    }
    if (GameUI.elements.sectBtn) {
      GameUI.elements.sectBtn.addEventListener('click', () => GameUI.showSectScreen(Game.player));
    }
    if (GameUI.elements.sectJoinBtn) {
      GameUI.elements.sectJoinBtn.addEventListener('click', () => GameUI.handleSectJoin());
    }
  },

  updateHUD(player, time, kills) {
    const el = GameUI.elements;
    const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
    el.hpFill.style.width = hpPercent + '%';
    el.hpText.textContent = Math.max(0, Math.floor(player.hp)) + ' / ' + player.maxHp;

    el.levelText.textContent = player.level;

    const expPercent = (player.exp / player.expToNext) * 100;
    el.expFill.style.width = expPercent + '%';
    el.expText.textContent = player.exp + ' / ' + player.expToNext;

    const mins = Math.floor(time / 60000);
    const secs = Math.floor((time % 60000) / 1000);
    el.timeText.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

    el.killCount.textContent = kills;

    if (player.skillLevels.flying_sword) {
      el.swordLevel.textContent = player.skillLevels.flying_sword;
    }

    if (el.realmText) {
      const realmName = CultivationData.getRealmDisplayName(player.realm, player.realmStage);
      el.realmText.textContent = realmName;
      const realmColor = CultivationData.getRealm(player.realm)?.color || '#ffd700';
      el.realmText.style.color = realmColor;
    }

    if (el.realmProgress) {
      const realmProgress = RealmSystem.getExpProgress(player);
      el.realmProgress.style.width = (realmProgress * 100) + '%';
    }

    if (el.elementText) {
      el.elementText.textContent = ElementSystem.getElementDisplayName(player);
      const element = CultivationData.getElement(player.element);
      if (element) {
        el.elementText.style.color = element.color;
      }
    }

    if (el.elementProgress) {
      const elementProgress = ElementSystem.getElementExpProgress(player);
      el.elementProgress.style.width = (elementProgress * 100) + '%';
    }

    GameUI.updateResources(player);
    GameUI.updateEquipment(player);
    GameUI.updateSkills(player);
    GameUI.updateTreasures(player);
  },

  updateResources(player) {
    const el = GameUI.elements.resourcesPanel;
    if (!el) return;

    const displayResources = ['spirit_stone', 'demon_core', 'spirit_herb', 'foundation_pill', 'golden_core_pill'];
    let html = '';
    for (const rid of displayResources) {
      const resource = CultivationData.getResource(rid);
      const amount = player.resources[rid] || 0;
      if (amount > 0) {
        html += `
          <div class="resource-item" style="color: ${resource.color}">
            <span>${resource.icon}</span>
            <span>${resource.name}</span>
            <span>${amount}</span>
          </div>
        `;
      }
    }
    el.innerHTML = html || '<div style="color: #666">暂无资源</div>';
  },

  updateEquipment(player) {
    const el = GameUI.elements.equipmentPanel;
    if (!el) return;

    let html = '';
    const types = ['weapon', 'armor', 'accessory'];
    for (const type of types) {
      const eq = player.equipment[type];
      const typeName = EquipmentSystem.getEquipmentTypeName(type);
      if (eq) {
        const color = EquipmentSystem.getEquipmentRarityColor(eq.rarity);
        html += `
          <div class="equipment-item">
            <span class="eq-type">${typeName}</span>
            <span class="eq-name" style="color: ${color}">${eq.name}</span>
            <span class="eq-stats">${GameUI.formatEquipmentStats(eq.stats)}</span>
          </div>
        `;
      } else {
        html += `
          <div class="equipment-item">
            <span class="eq-type">${typeName}</span>
            <span class="eq-name" style="color: #666">空</span>
          </div>
        `;
      }
    }
    el.innerHTML = html;
  },

  formatEquipmentStats(stats) {
    const parts = [];
    if (stats.atk) parts.push(`攻+${stats.atk}`);
    if (stats.defense) parts.push(`防+${stats.defense}`);
    if (stats.hp) parts.push(`血+${stats.hp}`);
    if (stats.skillDamage) parts.push(`技伤+${(stats.skillDamage * 100).toFixed(0)}%`);
    if (stats.critRate) parts.push(`暴击+${(stats.critRate * 100).toFixed(0)}%`);
    return parts.join(' ');
  },

  updateSkills(player) {
    const el = GameUI.elements.skillsPanel;
    if (!el) return;

    let html = '';
    for (const skillId of player.skills) {
      const skill = CultivationData.getSkill(skillId);
      if (!skill) continue;
      const level = player.skillLevels[skillId] || 1;
      const quality = CultivationData.skillQualities[skill.quality];
      html += `
        <div class="skill-item">
          <span>${skill.icon || '⚔️'}</span>
          <span class="skill-name" style="color: ${quality.color}">${skill.name}</span>
          <span class="skill-level">Lv.${level}</span>
        </div>
      `;
    }
    el.innerHTML = html;
  },

  updateTreasures(player) {
    const el = GameUI.elements.treasuresPanel;
    if (!el) return;

    let html = '';
    for (const treasureId of player.treasures) {
      const treasure = CultivationData.getTreasure(treasureId);
      if (!treasure) continue;
      const cooldownPercent = TreasureSystem.getTreasureCooldownPercent(player, treasureId);
      html += `
        <div class="treasure-item">
          <span>${treasure.icon || '🔮'}</span>
          <span>${treasure.name}</span>
          <div class="treasure-cd">
            <div class="treasure-cd-fill" style="width: ${cooldownPercent * 100}%"></div>
          </div>
        </div>
      `;
    }
    el.innerHTML = html || '<div style="color: #666">暂无法宝</div>';
  },

  showUpgradeScreen(upgrades, onSelect) {
    const el = GameUI.elements;
    el.upgradeCards.innerHTML = '';

    upgrades.forEach((upgrade, index) => {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `
        <div class="card-icon">${upgrade.icon}</div>
        <div class="card-name">${upgrade.name}</div>
        <div class="card-desc">${upgrade.desc}</div>
      `;
      card.addEventListener('click', () => {
        onSelect(index);
      });
      el.upgradeCards.appendChild(card);
    });

    el.upgradeScreen.classList.remove('hidden');
  },

  hideUpgradeScreen() {
    GameUI.elements.upgradeScreen.classList.add('hidden');
  },

  showStartScreen() {
    GameUI.elements.startScreen.classList.remove('hidden');
  },

  hideStartScreen() {
    GameUI.elements.startScreen.classList.add('hidden');
  },

  showGameOverScreen(time, kills, level) {
    const el = GameUI.elements;
    el.finalTime.textContent = Math.floor(time / 1000);
    el.finalKills.textContent = kills;
    el.finalLevel.textContent = level;
    el.gameOverScreen.classList.remove('hidden');
  },

  hideGameOverScreen() {
    GameUI.elements.gameOverScreen.classList.add('hidden');
  },

  showVictoryScreen(kills, level) {
    const el = GameUI.elements;
    el.victoryKills.textContent = kills;
    el.victoryLevel.textContent = level;
    el.victoryScreen.classList.remove('hidden');
  },

  hideVictoryScreen() {
    GameUI.elements.victoryScreen.classList.add('hidden');
  },

  showBossNotice() {
    const el = GameUI.elements.bossNotice;
    el.style.opacity = '1';
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count >= 6) {
        el.style.opacity = '0';
        clearInterval(interval);
      } else {
        el.style.opacity = el.style.opacity === '1' ? '0.3' : '1';
      }
    }, 400);
  },

  showBreakNotice(message) {
    const el = GameUI.elements.breakNotice;
    if (!el) return;
    el.textContent = message;
    el.style.opacity = '1';
    setTimeout(() => {
      el.style.opacity = '0';
    }, 2000);
  },

  showCraftPanel(player) {
    const el = GameUI.elements.craftPanel;
    if (!el) return;

    let html = '<h3>炼丹</h3>';
    const recipes = Object.keys(CultivationData.recipes);
    for (const recipeId of recipes) {
      const recipe = CultivationData.recipes[recipeId];
      const resultResource = CultivationData.getResource(recipe.result);
      const canCraft = CultivationData.canCraft(player, recipeId);

      let ingredientsHtml = '';
      for (const [ingId, amount] of Object.entries(recipe.ingredients)) {
        const ingResource = CultivationData.getResource(ingId);
        const playerAmount = player.resources[ingId] || 0;
        const color = playerAmount >= amount ? '#32cd32' : '#ff6347';
        ingredientsHtml += `<span style="color: ${color}">${ingResource.icon} ${ingResource.name} ${playerAmount}/${amount}</span> `;
      }

      html += `
        <div class="craft-item">
          <div class="craft-ingredients">${ingredientsHtml}</div>
          <div class="craft-arrow">→</div>
          <div class="craft-result">${resultResource.icon} ${resultResource.name}</div>
          <button class="craft-btn" ${canCraft ? '' : 'disabled'} data-recipe="${recipeId}">炼制</button>
        </div>
      `;
    }
    el.innerHTML = html;
    el.classList.remove('hidden');
  },

  hideCraftPanel() {
    const el = GameUI.elements.craftPanel;
    if (el) el.classList.add('hidden');
  },

  drawDamageNumbers(ctx, damageNumbers) {
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px "KaiTi", "STKaiti", serif';
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
      const d = damageNumbers[i];
      const alpha = d.life / d.maxLife;
      d.y -= 0.8;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = d.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(d.value, d.x, d.y);
      ctx.fillText(d.value, d.x, d.y);
    }
    ctx.globalAlpha = 1;
  },

  showPlotScreen(title, dialog) {
    const el = GameUI.elements;
    if (!el.plotScreen) return;
    el.plotTitle.textContent = title;
    el.plotSpeaker.textContent = dialog.speaker;
    el.plotDialog.textContent = dialog.text;
    el.plotScreen.classList.remove('hidden');
  },

  updatePlotDialog(dialog) {
    const el = GameUI.elements;
    if (!el.plotScreen) return;
    el.plotSpeaker.textContent = dialog.speaker;
    el.plotDialog.textContent = dialog.text;
  },

  hidePlotScreen() {
    const el = GameUI.elements;
    if (el.plotScreen) el.plotScreen.classList.add('hidden');
  },

  showEncounterScreen(encounter) {
    const el = GameUI.elements;
    if (!el.encounterScreen) return;
    el.encounterTitle.textContent = encounter.title;
    el.encounterIcon.textContent = encounter.icon;
    el.encounterDesc.textContent = encounter.description;
    
    el.encounterOptions.innerHTML = '';
    encounter.choices.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'encounter-btn';
      btn.textContent = opt.text;
      btn.dataset.choiceId = opt.id;
      btn.dataset.encounterId = encounter.id;
      el.encounterOptions.appendChild(btn);
    });
    
    el.encounterScreen.classList.remove('hidden');
  },

  hideEncounterScreen() {
    const el = GameUI.elements;
    if (el.encounterScreen) el.encounterScreen.classList.add('hidden');
  },

  showTribulationScreen() {
    const el = GameUI.elements;
    if (!el.tribulationScreen) return;
    el.tribulationScreen.classList.remove('hidden');
  },

  hideTribulationScreen() {
    const el = GameUI.elements;
    if (el.tribulationScreen) el.tribulationScreen.classList.add('hidden');
  },

  showLightningWarning(x, y) {
    GameUI.showBreakNotice('天雷降临！快躲避！');
  },

  showDamageNumber(x, y, value, color) {
    Game.damageNumbers.push({
      x: x, y: y, value: value, color: color,
      life: 700, maxLife: 700
    });
  },

  showAscensionAnimation() {
    const el = GameUI.elements;
    if (!el.tribulationScreen) return;
    
    el.tribulationScreen.innerHTML = `
      <div style="text-align:center; padding-top: 200px;">
        <div style="font-size: 72px; color: #ffd700; text-shadow: 0 0 30px #ff8c00; animation: float 2s ease-in-out infinite;">✦</div>
        <div style="font-size: 48px; color: #7cfc00; text-shadow: 0 0 20px #32cd32; margin-top: 20px;">渡劫成功</div>
        <div style="font-size: 24px; color: #fff; margin-top: 10px;">飞升仙界！</div>
      </div>
    `;
  },

  showSectScreen(player) {
    const el = GameUI.elements;
    if (!el.sectScreen) return;
    
    if (player.sect) {
      const sect = CultivationData.getSect(player.sect);
      el.sectName.textContent = sect.name;
      el.sectDesc.textContent = sect.description;
      el.sectContribution.textContent = `贡献值: ${player.sectContribution}`;
      
      let questsHtml = '<h4>宗门任务</h4>';
      for (const quest of player.sectQuests) {
        const status = `${quest.current}/${quest.target}`;
        questsHtml += `<div>${quest.name}: ${status}</div>`;
      }
      el.sectQuests.innerHTML = questsHtml;
      
      let shopHtml = '<h4>宗门商店</h4>';
      const shop = CultivationData.sectShop[player.sect];
      for (const item of shop) {
        const canBuy = player.sectContribution >= item.cost;
        shopHtml += `
          <div class="shop-item">
            <span>${item.name}</span>
            <span>${item.cost} 贡献</span>
            <button class="shop-btn" ${canBuy ? '' : 'disabled'} data-item="${item.id}">兑换</button>
          </div>
        `;
      }
      el.sectShop.innerHTML = shopHtml;
      el.sectJoinBtn.style.display = 'none';
    } else {
      let sectsHtml = '';
      for (const sect of CultivationData.sects) {
        sectsHtml += `
          <div class="sect-card" data-sectId="${sect.id}" style="border-color: ${sect.color}">
            <div style="font-size: 32px;">${sect.icon}</div>
            <div style="color: ${sect.color}; font-size: 18px;">${sect.name}</div>
            <div style="font-size: 12px; color: #999;">${sect.description}</div>
          </div>
        `;
      }
      el.sectScreen.innerHTML = sectsHtml;
      el.sectJoinBtn.style.display = 'block';
    }
    
    el.sectScreen.classList.remove('hidden');
  },

  hideSectScreen() {
    const el = GameUI.elements;
    if (el.sectScreen) el.sectScreen.classList.add('hidden');
  },

  handleSectJoin() {
    const el = GameUI.elements;
    const selectedSect = document.querySelector('.sect-card.selected');
    if (!selectedSect) return;
    
    const sectId = selectedSect.dataset.sectid;
    const result = SectSystem.joinSect(Game.player, sectId);
    GameUI.showBreakNotice(result.message);
    
    if (result.success) {
      GameUI.showSectScreen(Game.player);
    }
  },

  updateQuests(player) {
    const el = GameUI.elements.questsPanel;
    if (!el) return;
    
    let html = '<h4>任务</h4>';
    for (const quest of player.sectQuests || []) {
      const status = `${quest.current}/${quest.target}`;
      html += `<div>${quest.name}: ${status}</div>`;
    }
    el.innerHTML = html || '<div style="color: #666">暂无任务</div>';
  }
};
