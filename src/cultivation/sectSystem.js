const SectSystem = {
  joinSect(player, sectId) {
    const sect = CultivationData.getSect(sectId);
    if (!sect) return { success: false, message: '宗门不存在' };
    
    if (player.sect) {
      return { success: false, message: '你已经加入了其他宗门' };
    }
    
    player.sect = sectId;
    player.sectContribution = 0;
    player.sectQuests = [];
    player.sectBonus = { ...sect.bonus };
    
    sect.skills.forEach(skillId => {
      if (!player.skills.includes(skillId)) {
        player.skills.push(skillId);
        player.skillLevels[skillId] = 1;
      }
    });
    
    SectSystem.initQuests(player);
    
    return { success: true, message: `恭喜加入${sect.name}！` };
  },

  leaveSect(player) {
    if (!player.sect) return { success: false, message: '你还没有加入任何宗门' };
    
    const sect = CultivationData.getSect(player.sect);
    player.sect = null;
    player.sectContribution = 0;
    player.sectQuests = [];
    player.sectBonus = {};
    
    return { success: true, message: `已离开${sect.name}` };
  },

  initQuests(player) {
    const sect = CultivationData.getSect(player.sect);
    if (!sect) return;
    
    player.sectQuests = sect.tasks.map(taskId => {
      const task = CultivationData.getTask(taskId);
      return {
        id: taskId,
        name: task.name,
        description: task.description,
        target: task.target,
        current: 0,
        reward: task.reward
      };
    });
  },

  updateQuestProgress(player, actionType, data) {
    if (!player.sect || !player.sectQuests.length) return;
    
    player.sectQuests.forEach(quest => {
      const task = CultivationData.getTask(quest.id);
      if (!task) return;
      
      if (task.trigger === actionType) {
        quest.current++;
        if (quest.current >= quest.target) {
          SectSystem.completeQuest(player, quest);
        }
      }
    });
  },

  completeQuest(player, quest) {
    const index = player.sectQuests.findIndex(q => q.id === quest.id);
    if (index === -1) return;
    
    if (quest.reward.spirit_stone) {
      player.resources.spirit_stone += quest.reward.spirit_stone;
    }
    if (quest.reward.contribution) {
      player.sectContribution += quest.reward.contribution;
    }
    
    AudioSystem.playQuestCompleteSound();
    GameUI.showBreakNotice(`完成宗门任务：${quest.name}！`);
    
    player.sectQuests.splice(index, 1);
    
    const sect = CultivationData.getSect(player.sect);
    if (sect) {
      const newTaskId = sect.tasks[Math.floor(Math.random() * sect.tasks.length)];
      const newTask = CultivationData.getTask(newTaskId);
      player.sectQuests.push({
        id: newTaskId,
        name: newTask.name,
        description: newTask.description,
        target: newTask.target,
        current: 0,
        reward: newTask.reward
      });
    }
  },

  buyItem(player, itemId) {
    const sect = CultivationData.getSect(player.sect);
    if (!sect) return { success: false, message: '你还没有加入宗门' };
    
    const item = CultivationData.getShopItem(itemId);
    if (!item) return { success: false, message: '物品不存在' };
    
    if (player.sectContribution < item.cost) {
      return { success: false, message: '贡献度不足' };
    }
    
    player.sectContribution -= item.cost;
    
    if (item.type === 'resource') {
      player.resources[item.resource] = (player.resources[item.resource] || 0) + item.amount;
    } else if (item.type === 'equipment') {
      const equipment = CultivationData.getEquipment(item.equipmentId);
      if (equipment) {
        EquipmentSystem.equip(player, equipment);
      }
    } else if (item.type === 'treasure') {
      const treasure = CultivationData.getTreasure(item.treasureId);
      if (treasure) {
        player.treasures.push(treasure);
      }
    } else if (item.type === 'skill') {
      if (!player.skills.includes(item.skillId)) {
        player.skills.push(item.skillId);
        player.skillLevels[item.skillId] = 1;
      }
    }
    
    return { success: true, message: `兑换成功：${item.name}` };
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const sectJoinBtn = document.getElementById('sectJoinBtn');
  if (sectJoinBtn) {
    sectJoinBtn.addEventListener('click', () => {
      const selectedCard = document.querySelector('.sect-card.selected');
      if (selectedCard && selectedCard.dataset.sectId) {
        const result = SectSystem.joinSect(Game.player, selectedCard.dataset.sectId);
        GameUI.showBreakNotice(result.message);
        if (result.success) {
          GameUI.hideSectScreen();
        }
      }
    });
  }
});