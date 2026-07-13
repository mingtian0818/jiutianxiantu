const PlotSystem = {
  currentPlot: null,
  currentDialogIndex: 0,

  startPlot(plotId) {
    const plot = CultivationData.getPlot(plotId);
    if (!plot) return false;
    
    PlotSystem.currentPlot = plot;
    PlotSystem.currentDialogIndex = 0;
    Game.state = 'plot';
    GameUI.showPlotScreen(plot.title, plot.dialogs[0]);
    return true;
  },

  nextDialog() {
    if (!PlotSystem.currentPlot) return false;
    
    PlotSystem.currentDialogIndex++;
    if (PlotSystem.currentDialogIndex >= PlotSystem.currentPlot.dialogs.length) {
      PlotSystem.endPlot();
      return false;
    }
    
    const dialog = PlotSystem.currentPlot.dialogs[PlotSystem.currentDialogIndex];
    GameUI.updatePlotDialog(dialog);
    return true;
  },

  endPlot() {
    PlotSystem.currentPlot = null;
    PlotSystem.currentDialogIndex = 0;
    Game.state = 'playing';
    GameUI.hidePlotScreen();
  },

  checkPlotTriggers(player) {
    if (player.realm === 'qi' && player.realmStage === 0 && !player.plotCompleted.intro) {
      PlotSystem.startPlot('intro');
      player.plotCompleted.intro = true;
    }
    if (player.realm === 'foundation' && player.realmStage === 0 && !player.plotCompleted.foundation) {
      PlotSystem.startPlot('foundation');
      player.plotCompleted.foundation = true;
    }
    if (player.realm === 'golden_core' && player.realmStage === 0 && !player.plotCompleted.golden_core) {
      PlotSystem.startPlot('golden_core');
      player.plotCompleted.golden_core = true;
    }
    if (player.realm === 'yuan_ying' && player.realmStage === 0 && !player.plotCompleted.yuan_ying) {
      PlotSystem.startPlot('yuan_ying');
      player.plotCompleted.yuan_ying = true;
    }
    if (player.realm === 'nascent' && player.realmStage === 0 && !player.plotCompleted.nascent) {
      PlotSystem.startPlot('nascent');
      player.plotCompleted.nascent = true;
    }
    if (player.realm === 'soul' && player.realmStage === 0 && !player.plotCompleted.soul) {
      PlotSystem.startPlot('soul');
      player.plotCompleted.soul = true;
    }
    if (player.realm === 'fusion' && player.realmStage === 0 && !player.plotCompleted.fusion) {
      PlotSystem.startPlot('fusion');
      player.plotCompleted.fusion = true;
    }
    if (player.realm === 'mahayana' && player.realmStage === 0 && !player.plotCompleted.mahayana) {
      PlotSystem.startPlot('mahayana');
      player.plotCompleted.mahayana = true;
    }
    if (player.realm === 'sanxian' && player.realmStage === 0 && !player.plotCompleted.sanxian) {
      PlotSystem.startPlot('sanxian');
      player.plotCompleted.sanxian = true;
    }
    if (player.realm === 'du_jie' && player.realmStage === 0 && !player.plotCompleted.du_jie) {
      PlotSystem.startPlot('du_jie');
      player.plotCompleted.du_jie = true;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const plotNextBtn = document.getElementById('plotNextBtn');
  if (plotNextBtn) {
    plotNextBtn.addEventListener('click', () => {
      PlotSystem.nextDialog();
    });
  }
});