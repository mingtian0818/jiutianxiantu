const EncounterSystem = {
  lastEncounterTime: 0,
  encounterCooldown: 30000,

  checkEncounter(player) {
    const now = performance.now();
    if (now - EncounterSystem.lastEncounterTime < EncounterSystem.encounterCooldown) return;
    
    const encounterChance = 0.005;
    if (Math.random() < encounterChance) {
      EncounterSystem.triggerEncounter(player);
    }
  },

  triggerEncounter(player) {
    const encounters = CultivationData.getEncounters();
    const encounter = encounters[Math.floor(Math.random() * encounters.length)];
    
    if (!encounter) return;
    
    AudioSystem.playEncounterSound();
    EncounterSystem.lastEncounterTime = performance.now();
    Game.state = 'encounter';
    GameUI.showEncounterScreen(encounter);
  },

  handleChoice(player, encounterId, choiceId) {
    const encounter = CultivationData.getEncounter(encounterId);
    if (!encounter) return;
    
    const choice = encounter.choices.find(c => c.id === choiceId);
    if (!choice) return;
    
    if (choice.successRate && Math.random() > choice.successRate) {
      if (choice.failReward) {
        EncounterSystem.applyReward(player, choice.failReward);
        GameUI.showBreakNotice(choice.failMessage);
      }
    } else {
      if (choice.reward) {
        EncounterSystem.applyReward(player, choice.reward);
        GameUI.showBreakNotice(choice.message);
      }
    }
    
    EncounterSystem.endEncounter();
  },

  applyReward(player, reward) {
    if (reward.spirit_stone) {
      player.resources.spirit_stone = (player.resources.spirit_stone || 0) + reward.spirit_stone;
    }
    if (reward.demon_core) {
      player.resources.demon_core = (player.resources.demon_core || 0) + reward.demon_core;
    }
    if (reward.herb) {
      player.resources.herb = (player.resources.herb || 0) + reward.herb;
    }
    if (reward.crystal) {
      player.resources.crystal = (player.resources.crystal || 0) + reward.crystal;
    }
    if (reward.exp) {
      Player.addExp(player, reward.exp);
    }
    if (reward.hp) {
      player.hp = Math.min(player.maxHp, player.hp + reward.hp);
    }
    if (reward.skill) {
      if (!player.skills.includes(reward.skill)) {
        player.skills.push(reward.skill);
        player.skillLevels[reward.skill] = 1;
      }
    }
    if (reward.cultivationExp) {
      player.cultivation.exp += reward.cultivationExp;
    }
    if (reward.elementExp) {
      ElementSystem.addElementExp(player, reward.elementExp);
    }
  },

  endEncounter() {
    Game.state = 'playing';
    GameUI.hideEncounterScreen();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const encounterOptions = document.getElementById('encounterOptions');
  if (encounterOptions) {
    encounterOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('.encounter-btn');
      if (btn && btn.dataset.choiceId && btn.dataset.encounterId) {
        EncounterSystem.handleChoice(Game.player, btn.dataset.encounterId, btn.dataset.choiceId);
      }
    });
  }
});