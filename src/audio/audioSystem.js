const AudioSystem = {
  ctx: null,
  bgmOscillators: [],
  enabled: true,
  volume: 0.3,

  init() {
    try {
      AudioSystem.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      AudioSystem.enabled = false;
    }
  },

  playBGM() {
    if (!AudioSystem.enabled) return;
    
    AudioSystem.stopBGM();
    
    const ctx = AudioSystem.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const playNote = (freq, startTime, duration, type = 'sine', vol = 0.1) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol * AudioSystem.volume, startTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
      
      AudioSystem.bgmOscillators.push(osc);
    };

    const notes = [
      { freq: 261.63, duration: 2, delay: 0 },
      { freq: 293.66, duration: 2, delay: 2 },
      { freq: 329.63, duration: 2, delay: 4 },
      { freq: 349.23, duration: 2, delay: 6 },
      { freq: 392.00, duration: 2, delay: 8 },
      { freq: 349.23, duration: 2, delay: 10 },
      { freq: 329.63, duration: 2, delay: 12 },
      { freq: 293.66, duration: 3, delay: 14 }
    ];

    const startTime = ctx.currentTime;
    notes.forEach(note => {
      playNote(note.freq, startTime + note.delay, note.duration, 'sine', 0.08);
    });

    setTimeout(() => {
      if (AudioSystem.enabled) {
        AudioSystem.playBGM();
      }
    }, 17000);
  },

  stopBGM() {
    AudioSystem.bgmOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    AudioSystem.bgmOscillators = [];
  },

  playBossBGM() {
    if (!AudioSystem.enabled) return;
    
    AudioSystem.stopBGM();
    
    const ctx = AudioSystem.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const playNote = (freq, startTime, duration, type = 'sawtooth', vol = 0.1) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol * AudioSystem.volume, startTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
      
      AudioSystem.bgmOscillators.push(osc);
    };

    const notes = [
      { freq: 146.83, duration: 1, delay: 0 },
      { freq: 164.81, duration: 1, delay: 1 },
      { freq: 196.00, duration: 1, delay: 2 },
      { freq: 146.83, duration: 2, delay: 3 },
      { freq: 196.00, duration: 1, delay: 5 },
      { freq: 220.00, duration: 1, delay: 6 },
      { freq: 246.94, duration: 2, delay: 7 },
      { freq: 220.00, duration: 1, delay: 9 },
      { freq: 196.00, duration: 2, delay: 10 }
    ];

    const startTime = ctx.currentTime;
    notes.forEach(note => {
      playNote(note.freq, startTime + note.delay, note.duration, 'sawtooth', 0.06);
    });

    setTimeout(() => {
      if (AudioSystem.enabled) {
        AudioSystem.playBossBGM();
      }
    }, 12000);
  },

  playSkillSound() {
    if (!AudioSystem.enabled) return;
    
    const ctx = AudioSystem.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2 * AudioSystem.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  },

  playLevelUpSound() {
    if (!AudioSystem.enabled) return;
    
    const ctx = AudioSystem.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      
      gain.gain.setValueAtTime(0.15 * AudioSystem.volume, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  },

  playBreakthroughSound() {
    if (!AudioSystem.enabled) return;
    
    const ctx = AudioSystem.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      
      gain.gain.setValueAtTime(0.1 * AudioSystem.volume, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.4);
    });
  },

  playDamageSound() {
    if (!AudioSystem.enabled) return;
    
    const ctx = AudioSystem.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1 * AudioSystem.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  },

  playDeathSound() {
    if (!AudioSystem.enabled) return;
    
    const ctx = AudioSystem.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [392.00, 329.63, 293.66, 261.63, 220.00];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
      
      gain.gain.setValueAtTime(0.1 * AudioSystem.volume, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.5);
    });
  },

  playVictorySound() {
    if (!AudioSystem.enabled) return;
    
    const ctx = AudioSystem.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      
      gain.gain.setValueAtTime(0.15 * AudioSystem.volume, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.4);
    });
  },

  playTribulationSound() {
    if (!AudioSystem.enabled) return;
    
    const ctx = AudioSystem.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.3 * AudioSystem.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  },

  playAscensionSound() {
    if (!AudioSystem.enabled) return;
    
    const ctx = AudioSystem.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      
      gain.gain.setValueAtTime(0.08 * AudioSystem.volume, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.5);
    });
  },

  playEncounterSound() {
    if (!AudioSystem.enabled) return;
    
    const ctx = AudioSystem.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      
      gain.gain.setValueAtTime(0.1 * AudioSystem.volume, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  },

  playQuestCompleteSound() {
    if (!AudioSystem.enabled) return;
    
    const ctx = AudioSystem.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      
      gain.gain.setValueAtTime(0.12 * AudioSystem.volume, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.25);
    });
  },

  toggle() {
    AudioSystem.enabled = !AudioSystem.enabled;
    if (!AudioSystem.enabled) {
      AudioSystem.stopBGM();
    } else {
      AudioSystem.playBGM();
    }
    return AudioSystem.enabled;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AudioSystem.init();
});