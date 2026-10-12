/**
 * UIManager: Manages all Turkish HTML/CSS Menus, Character Selection,
 * World & Custom 2-10 Selection, Student Progress Dashboard,
 * In-Game HUD, and Interactive Whiteboard (Etkileşimli Tahta) Touch Controls.
 */

import { CHARACTERS, getCharacterById, drawCharacterFrame } from '../data/characters.js';
import { WORLDS, getAllLevels, getLevelById } from '../data/levels.js';
import { ALL_COUNTING_STEPS, COUNTING_DIRECTIONS, getStepLabel } from '../math/MathGenerator.js';
import { virtualInput } from '../entities/Player.js';
import { progressManager } from '../storage/ProgressManager.js';
import { audioManager } from '../audio/AudioManager.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.uiLayer = document.getElementById('ui-layer');
    this.hasInitializedMenu = false;
    this.previewRafId = null;
    this.selectedPreviewPose = 'idle';
    this.toastTimer = null;
    this.currentActiveChallenge = null;

    // State for Custom 2-10 Skip-Counting Picker
    this.customStep = 2;
    this.customDirection = COUNTING_DIRECTIONS.MIXED;

    this.initTopUtilityBar();
    this.applyReducedMotionClass();
  }

  initTopUtilityBar() {
    const btnSound = document.getElementById('btn-toggle-sound');
    const btnMusic = document.getElementById('btn-toggle-music');
    const btnMotion = document.getElementById('btn-toggle-motion');
    const btnFullscreen = document.getElementById('btn-toggle-fullscreen');

    this.refreshUtilityBarLabels();

    btnSound?.addEventListener('click', () => {
      btnSound.blur();
      audioManager.toggleSound();
      this.refreshUtilityBarLabels();
    });

    btnMusic?.addEventListener('click', () => {
      btnMusic.blur();
      audioManager.playClick();
      audioManager.toggleMusic();
      this.refreshUtilityBarLabels();
    });

    btnMotion?.addEventListener('click', () => {
      btnMotion.blur();
      audioManager.playClick();
      const s = progressManager.getSettings();
      progressManager.updateSettings({ reducedMotion: !s.reducedMotion });
      this.applyReducedMotionClass();
      this.refreshUtilityBarLabels();
    });

    btnFullscreen?.addEventListener('click', () => {
      btnFullscreen.blur();
      audioManager.playClick();
      this.toggleFullscreen();
    });

    document.addEventListener('fullscreenchange', () => {
      this.refreshUtilityBarLabels();
    });
  }

  toggleFullscreen() {
    const docEl = document.documentElement;
    const isFull = Boolean(
      document.fullscreenElement || document.webkitFullscreenElement
    );
    if (!isFull) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  applyReducedMotionClass() {
    const reduced = progressManager.getSettings().reducedMotion;
    document.body.classList.toggle('reduced-motion', Boolean(reduced));
  }

  refreshUtilityBarLabels() {
    const s = progressManager.getSettings();
    const btnSound = document.getElementById('btn-toggle-sound');
    const btnMusic = document.getElementById('btn-toggle-music');
    const btnMotion = document.getElementById('btn-toggle-motion');

    const soundLabel = document.getElementById('sound-label');
    const musicLabel = document.getElementById('music-label');
    const motionLabel = document.getElementById('motion-label');

    if (soundLabel && btnSound) {
      soundLabel.textContent = s.soundEnabled ? 'Ses: Açık' : 'Ses: Kapalı';
      btnSound.className = `pill-btn utility-btn ${
        s.soundEnabled ? 'active-toggle' : 'muted-toggle'
      }`;
    }
    if (musicLabel && btnMusic) {
      musicLabel.textContent =
        s.musicEnabled && s.soundEnabled ? 'Müzik: Açık' : 'Müzik: Kapalı';
      btnMusic.className = `pill-btn utility-btn ${
        s.musicEnabled && s.soundEnabled ? 'active-toggle' : 'muted-toggle'
      }`;
    }
    if (motionLabel && btnMotion) {
      motionLabel.textContent = s.reducedMotion
        ? 'Efektler: Azaltılmış'
        : 'Efektler: Normal';
    }
    const fsLabel = document.getElementById('fullscreen-label');
    if (fsLabel) {
      const isFull = Boolean(
        document.fullscreenElement || document.webkitFullscreenElement
      );
      fsLabel.textContent = isFull ? '✕ Küçült' : '⛶ Tam Ekran';
    }
  }

  clearPreviewLoop() {
    if (this.previewRafId) {
      cancelAnimationFrame(this.previewRafId);
      this.previewRafId = null;
    }
  }

  attachButtonSounds(container = this.uiLayer) {
    const buttons = container.querySelectorAll('button');
    buttons.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        if (!btn.disabled) audioManager.playHover();
      });
      btn.addEventListener('click', () => {
        btn.blur(); // Ensure DOM button never steals keyboard Arrow key focus
        if (!btn.disabled) {
          audioManager.ensureContext();
          audioManager.playClick();
          audioManager.startBackgroundMusic();
        }
      });
    });
  }

  /* =========================================================================
   * 1. MAIN MENU
   * ========================================================================= */
  showMainMenu() {
    this.clearPreviewLoop();
    virtualInput.reset();
    this.ensureMenuSceneRunning();

    const selectedChar = getCharacterById(progressManager.getSelectedCharacter());
    const completedCount = Object.keys(progressManager.data.completedLevels).length;
    const totalLevels = getAllLevels().length;

    this.uiLayer.innerHTML = `
      <div class="screen-overlay">
        <div class="main-menu-layout">
          <div class="menu-left-column">
            <div class="title-badge-pill">
              <span>Sayıları öğren, yıldızları topla, bayrağa ulaş!</span>
            </div>
            <h1 class="game-main-title">
              Ritmik Sayma<br/>
              <span class="highlight-gold">Macerası</span>
            </h1>
            <p class="game-subtitle">
              Her adımda bir sayı, her bölümde yeni bir macera!
            </p>
            <div class="menu-buttons-grid">
              <button id="btn-start-game" class="btn-3d btn-green btn-large menu-btn-primary">
                <span>▶ Oyuna Başla</span>
              </button>
              <button id="btn-select-char" class="btn-3d btn-gold">
                <span>Karakterimi Seç</span>
              </button>
              <button id="btn-worlds" class="btn-3d btn-blue">
                <span>Dünyalar (2-10 Seç)</span>
              </button>
              <button id="btn-progress" class="btn-3d btn-purple">
                <span>İlerlemem</span>
              </button>
              <button id="btn-how-to-play" class="btn-3d btn-coral">
                <span>Nasıl Oynanır?</span>
              </button>
            </div>
          </div>

          <div class="menu-hero-card">
            <canvas id="menu-hero-canvas" class="hero-stage-canvas" width="180" height="180"></canvas>
            <div class="hero-card-name">${selectedChar.name}</div>
            <div class="hero-card-role">${selectedChar.title}</div>
            <div class="hero-stats-strip">
              <span class="stat-chip">⭐ ${progressManager.data.totalStars} Yıldız</span>
              <span class="stat-chip">🪙 ${progressManager.data.totalCoins} Altın</span>
              <span class="stat-chip">🏁 ${completedCount}/${totalLevels} Bölüm</span>
            </div>
            <button id="btn-quick-change-char" class="btn-3d btn-slate btn-sm" style="margin-top:6px;">
              Karakteri Değiştir
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachButtonSounds();

    const heroCanvas = document.getElementById('menu-hero-canvas');
    if (heroCanvas) {
      const ctx = heroCanvas.getContext('2d');
      const startT = performance.now();
      const renderLoop = (now) => {
        if (!document.getElementById('menu-hero-canvas')) return;
        const elapsed = progressManager.getSettings().reducedMotion
          ? 0
          : (now - startT) / 1000;
        drawCharacterFrame(ctx, selectedChar, 'idle', elapsed, 180, 180);
        this.previewRafId = requestAnimationFrame(renderLoop);
      };
      this.previewRafId = requestAnimationFrame(renderLoop);
    }

    document.getElementById('btn-start-game')?.addEventListener('click', () => {
      const targetLevel = progressManager.data.lastPlayedLevel || '1-1';
      this.startLevel(targetLevel);
    });
    document.getElementById('btn-select-char')?.addEventListener('click', () => {
      this.showCharacterSelection();
    });
    document.getElementById('btn-quick-change-char')?.addEventListener('click', () => {
      this.showCharacterSelection();
    });
    document.getElementById('btn-worlds')?.addEventListener('click', () => {
      this.showWorldSelection();
    });
    document.getElementById('btn-progress')?.addEventListener('click', () => {
      this.showProgressDashboard();
    });
    document.getElementById('btn-how-to-play')?.addEventListener('click', () => {
      this.showHowToPlay();
    });
  }

  /* =========================================================================
   * 2. CHARACTER SELECTION SCREEN
   * ========================================================================= */
  showCharacterSelection() {
    this.clearPreviewLoop();
    let currentSelectedId = progressManager.getSelectedCharacter();
    this.selectedPreviewPose = 'idle';

    const renderScreen = () => {
      this.clearPreviewLoop();
      const activeChar = getCharacterById(currentSelectedId);

      const cardsHtml = CHARACTERS.map((char) => {
        const isSel = char.id === currentSelectedId;
        return `
          <div class="char-card ${isSel ? 'selected' : ''}" data-char-id="${char.id}" role="button" tabindex="0">
            <canvas id="portrait-${char.id}" class="char-portrait-canvas" width="110" height="110"></canvas>
            <div class="char-name">${char.name}</div>
            <span class="char-badge" style="background:${char.badgeColor}">${char.badgeText}</span>
            <p class="char-desc">${char.description}</p>
          </div>
        `;
      }).join('');

      this.uiLayer.innerHTML = `
        <div class="screen-overlay">
          <div class="glass-panel">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">Karakterimi Seç</h2>
                <p class="panel-subtitle">Macerada sana eşlik edecek özgün kahramanını seç! Tüm karakterler aynı hız ve zıplama gücüne sahiptir.</p>
              </div>
              <button id="btn-char-back" class="btn-3d btn-slate btn-sm">⬅ Ana Menü</button>
            </div>

            <div class="char-selection-grid">
              ${cardsHtml}
            </div>

            <div class="char-preview-showcase">
              <div style="display:flex; align-items:center; gap:16px;">
                <canvas id="active-pose-canvas" class="char-portrait-canvas" width="110" height="110"></canvas>
                <div>
                  <div class="hero-card-name" style="font-size:1.3rem;">Seçili Kahraman: ${activeChar.name}</div>
                  <div class="panel-subtitle">${activeChar.title}</div>
                  <div class="anim-test-buttons" style="margin-top:8px;">
                    <button class="pill-btn pose-btn ${this.selectedPreviewPose === 'idle' ? 'active-toggle' : ''}" data-pose="idle">Durma</button>
                    <button class="pill-btn pose-btn ${this.selectedPreviewPose === 'run1' ? 'active-toggle' : ''}" data-pose="run1">Koşma</button>
                    <button class="pill-btn pose-btn ${this.selectedPreviewPose === 'jump' ? 'active-toggle' : ''}" data-pose="jump">Zıplama</button>
                    <button class="pill-btn pose-btn ${this.selectedPreviewPose === 'land' ? 'active-toggle' : ''}" data-pose="land">İniş</button>
                    <button class="pill-btn pose-btn ${this.selectedPreviewPose === 'victory' ? 'active-toggle' : ''}" data-pose="victory">Zafer</button>
                  </div>
                </div>
              </div>

              <div style="display:flex; gap:12px; flex-wrap:wrap;">
                <button id="btn-confirm-char-play" class="btn-3d btn-green">
                  ✔ Bu Karakterle Başla
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      this.attachButtonSounds();

      const startT = performance.now();
      const animatePortraits = (now) => {
        if (!document.getElementById('active-pose-canvas')) return;
        const elapsed = progressManager.getSettings().reducedMotion
          ? 0
          : (now - startT) / 1000;

        for (const c of CHARACTERS) {
          const canvas = document.getElementById(`portrait-${c.id}`);
          if (canvas) {
            const ctx = canvas.getContext('2d');
            const pose = c.id === currentSelectedId ? 'victory' : 'idle';
            drawCharacterFrame(ctx, c, pose, elapsed, 110, 110);
          }
        }

        const activeCanvas = document.getElementById('active-pose-canvas');
        if (activeCanvas) {
          const ctx = activeCanvas.getContext('2d');
          drawCharacterFrame(
            ctx,
            activeChar,
            this.selectedPreviewPose,
            elapsed,
            110,
            110
          );
        }

        this.previewRafId = requestAnimationFrame(animatePortraits);
      };
      this.previewRafId = requestAnimationFrame(animatePortraits);

      this.uiLayer.querySelectorAll('.char-card').forEach((card) => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-char-id');
          if (id) {
            currentSelectedId = id;
            progressManager.setSelectedCharacter(id);
            const menuScene = this.game.scene.getScene('MenuScene');
            if (menuScene) {
              menuScene.events.emit('update-hero', id);
            }
            audioManager.playClick();
            renderScreen();
          }
        });
      });

      this.uiLayer.querySelectorAll('.pose-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.selectedPreviewPose = btn.getAttribute('data-pose') || 'idle';
          renderScreen();
        });
      });

      document.getElementById('btn-char-back')?.addEventListener('click', () => {
        progressManager.setSelectedCharacter(currentSelectedId);
        this.showMainMenu();
      });

      document.getElementById('btn-confirm-char-play')?.addEventListener('click', () => {
        progressManager.setSelectedCharacter(currentSelectedId);
        const targetLevel = progressManager.data.lastPlayedLevel || '1-1';
        this.startLevel(targetLevel);
      });
    };

    renderScreen();
  }

  /* =========================================================================
   * 3. WORLD & LEVEL SELECTION + 2-10 CUSTOM PRACTICE PICKER
   * ========================================================================= */
  showWorldSelection() {
    this.clearPreviewLoop();
    this.ensureMenuSceneRunning();

    const stepButtonsHtml = ALL_COUNTING_STEPS.map((st) => {
      const active = this.customStep === st ? 'selected' : '';
      return `<button class="step-choice-btn ${active}" data-custom-step="${st}">${getStepLabel(st)} Sayma</button>`;
    }).join('');

    const dirOptions = [
      { id: COUNTING_DIRECTIONS.FORWARD, label: '➡ İleriye Sayma' },
      { id: COUNTING_DIRECTIONS.BACKWARD, label: '⬅ Geriye Sayma' },
      { id: COUNTING_DIRECTIONS.MIXED, label: '🔄 İleri & Geri Karışık' }
    ];
    const dirButtonsHtml = dirOptions
      .map((d) => {
        const active = this.customDirection === d.id ? 'selected' : '';
        return `<button class="step-choice-btn ${active}" data-custom-dir="${d.id}">${d.label}</button>`;
      })
      .join('');

    const worldsHtml = WORLDS.map((world) => {
      const levelsHtml = world.levels
        .map((lvl) => {
          const unlocked = progressManager.isLevelUnlocked(lvl.id);
          const completed = progressManager.isLevelCompleted(lvl.id);
          const stats = progressManager.getLevelStats(lvl.id);

          let statusClass = 'locked';
          let statusIcon = '🔒 Kilitli';
          if (completed) {
            statusClass = 'unlocked completed';
            statusIcon = '✔ Tamamlandı';
          } else if (unlocked) {
            statusClass = 'unlocked';
            statusIcon = '▶ Oyna';
          }

          const starsSvg = [1, 2, 3]
            .map((sNum) => this.renderStarSvg(sNum <= (stats.stars || 0)))
            .join('');

          return `
            <button
              class="level-node-btn ${statusClass}"
              data-level-id="${lvl.id}"
              ${!unlocked ? 'disabled' : ''}
            >
              <div class="level-status-icon">${statusIcon}</div>
              <div class="level-node-title">Bölüm ${lvl.id}: ${lvl.name}</div>
              <div class="stars-row">${starsSvg}</div>
              <div class="level-node-sub">
                ${
                  completed
                    ? `En İyi Doğruluk: %${stats.bestAccuracy}`
                    : unlocked
                    ? 'Maceraya Hazır!'
                    : 'Önceki bölümü bitir'
                }
              </div>
            </button>
          `;
        })
        .join('');

      return `
        <div class="world-card">
          <div class="world-info-box" style="background: ${world.theme.cardGradient}">
            <span class="world-number-tag">DÜNYA ${world.id} • ${world.difficultyLabel}</span>
            <div class="world-title">${world.name}</div>
            <span class="world-goal-badge">🎯 ${world.subtitle}</span>
            <p style="font-size:0.84rem; opacity:0.95; margin-top:4px;">${world.description}</p>
          </div>
          <div class="levels-row">
            ${levelsHtml}
          </div>
        </div>
      `;
    }).join('');

    this.uiLayer.innerHTML = `
      <div class="screen-overlay">
        <div class="glass-panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Dünyalar ve 2'den 10'a Ritmik Sayma Seçimi</h2>
              <p class="panel-subtitle">İster 2'den 10'a istediğin sayıyı ve yönü (İleri / Geri) hemen seçip oyna, ister 5 dünyadaki macera bölümlerini tamamla!</p>
            </div>
            <button id="btn-worlds-back" class="btn-3d btn-slate btn-sm">⬅ Ana Menü</button>
          </div>

          <!-- Custom 2-10 Forward/Backward Practice Selector -->
          <div class="custom-practice-card">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <div>
                <h3 style="font-family:var(--font-display); font-size:1.25rem; color:#fde047;">
                  🎯 Hızlı Ritmik Sayma Parkuru (2'den 10'a Kadar — İleriye veya Geriye)
                </h3>
                <p style="font-size:0.88rem; color:#e2e8f0; font-weight:700;">
                  Çalışmak istediğin ritmik sayma adımını ve sayma yönünü seç:
                </p>
              </div>
              <button id="btn-start-custom-level" class="btn-3d btn-green btn-sm">
                ▶ Seçili Saymayla Hemen Oyna (${getStepLabel(this.customStep)})
              </button>
            </div>

            <div class="step-pills-row">
              ${stepButtonsHtml}
            </div>

            <div class="step-pills-row">
              ${dirButtonsHtml}
            </div>
          </div>

          <div class="worlds-container">
            ${worldsHtml}
          </div>
        </div>
      </div>
    `;

    this.attachButtonSounds();

    document.getElementById('btn-worlds-back')?.addEventListener('click', () => {
      this.showMainMenu();
    });

    this.uiLayer.querySelectorAll('[data-custom-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.customStep = Number(btn.getAttribute('data-custom-step')) || 2;
        this.showWorldSelection();
      });
    });

    this.uiLayer.querySelectorAll('[data-custom-dir]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.customDirection =
          btn.getAttribute('data-custom-dir') || COUNTING_DIRECTIONS.MIXED;
        this.showWorldSelection();
      });
    });

    document
      .getElementById('btn-start-custom-level')
      ?.addEventListener('click', () => {
        this.startLevel(`custom_${this.customStep}_${this.customDirection}`);
      });

    this.uiLayer.querySelectorAll('.level-node-btn.unlocked').forEach((btn) => {
      btn.addEventListener('click', () => {
        const levelId = btn.getAttribute('data-level-id');
        if (levelId && progressManager.isLevelUnlocked(levelId)) {
          this.startLevel(levelId);
        }
      });
    });
  }

  /* =========================================================================
   * 4. STUDENT PROGRESS DASHBOARD ("İLERLEMEM")
   * ========================================================================= */
  showProgressDashboard() {
    this.clearPreviewLoop();
    this.ensureMenuSceneRunning();

    const d = progressManager.data;
    const selectedChar = getCharacterById(d.selectedCharacter);
    const allLevels = getAllLevels();
    const completedCount = Object.keys(d.completedLevels).length;
    const unlockedCount = d.unlockedLevels.length;
    const lastLevelObj = getLevelById(d.lastPlayedLevel);

    const firstAttemptAccuracy =
      d.questionsAnswered > 0
        ? Math.round((d.firstAttemptCorrect / d.questionsAnswered) * 100)
        : 0;

    const mins = Math.floor(d.playTimeSeconds / 60);
    const secs = d.playTimeSeconds % 60;
    const timeFormatted = mins > 0 ? `${mins} dk ${secs} sn` : `${secs} sn`;

    const skillDefs = ALL_COUNTING_STEPS.map((st) => ({
      step: String(st),
      title: `${getStepLabel(st)} Ritmik Sayma`
    }));

    const skillsHtml = skillDefs
      .map((sk) => {
        const m = progressManager.getSkillMastery(sk.step);
        return `
          <div class="skill-row">
            <div>
              <div class="skill-name">${sk.title}</div>
              <div style="font-size:0.8rem; color:#cbd5e1;">
                Çözülen: ${m.correct} soru • İlk Deneme Başarısı: %${m.firstAttemptAccuracy}
              </div>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill" style="width: ${m.progressPercent}%"></div>
            </div>
            <span class="mastery-badge ${m.badgeClass}">${m.label}</span>
          </div>
        `;
      })
      .join('');

    this.uiLayer.innerHTML = `
      <div class="screen-overlay">
        <div class="glass-panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Öğrenci İlerleme Paneli</h2>
              <p class="panel-subtitle">2'den 10'a kadar tüm ritmik sayma kazanımları ve ustalık tablosu</p>
            </div>
            <button id="btn-prog-back" class="btn-3d btn-slate btn-sm">⬅ Ana Menü</button>
          </div>

          <div class="local-notice-banner">
            <span>📍 <strong>Yerel Cihaz Kaydı:</strong> Bu ilerleme verileri yalnızca bu cihazdaki tarayıcı belleğinde (LocalStorage) saklanır.</span>
            <button id="btn-reset-progress" class="btn-3d btn-coral btn-sm">İlerlemeyi Sıfırla</button>
          </div>

          <div class="dashboard-stats-grid">
            <div class="stat-card">
              <span class="stat-card-label">Seçili Kahraman</span>
              <span class="stat-card-value">${selectedChar.name}</span>
              <span class="stat-card-sub">Son Bölüm: ${lastLevelObj.id} (${lastLevelObj.name})</span>
            </div>
            <div class="stat-card">
              <span class="stat-card-label">Bölüm İlerlemesi</span>
              <span class="stat-card-value">${completedCount} / ${allLevels.length}</span>
              <span class="stat-card-sub">Açık Bölüm: ${unlockedCount}</span>
            </div>
            <div class="stat-card">
              <span class="stat-card-label">Yıldız & Altın</span>
              <span class="stat-card-value">⭐ ${d.totalStars} • 🪙 ${d.totalCoins}</span>
              <span class="stat-card-sub">Toplam Oyun Süresi: ${timeFormatted}</span>
            </div>
            <div class="stat-card">
              <span class="stat-card-label">İlk Deneme Doğruluğu</span>
              <span class="stat-card-value">%${firstAttemptAccuracy}</span>
              <span class="stat-card-sub">Doğru: ${d.correctAnswers} • Hatalı Deneme: ${d.incorrectAttempts} • Tekrar: ${d.retries}</span>
            </div>
          </div>

          <div>
            <h3 style="font-family:var(--font-display); font-size:1.3rem; color:#fde047; margin-bottom:8px;">
              2'den 10'a Ritmik Sayma Becerileri Ustalık Durumu
            </h3>
            <div class="skills-mastery-list">
              ${skillsHtml}
            </div>
          </div>

          <div id="reset-confirm-box" style="display:none; background:rgba(127, 29, 29, 0.92); border:2px solid #fca5a5; border-radius:16px; padding:14px 20px; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
            <span style="font-weight:800;">⚠️ Tüm yıldızların, açılan bölümlerin ve istatistiklerin sıfırlanacak. Emin misin?</span>
            <div style="display:flex; gap:10px;">
              <button id="btn-confirm-reset-yes" class="btn-3d btn-coral btn-sm">Evet, Sıfırla</button>
              <button id="btn-confirm-reset-no" class="btn-3d btn-slate btn-sm">Vazgeç</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachButtonSounds();

    document.getElementById('btn-prog-back')?.addEventListener('click', () => {
      this.showMainMenu();
    });

    const confirmBox = document.getElementById('reset-confirm-box');
    document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
      if (confirmBox) confirmBox.style.display = 'flex';
    });

    document.getElementById('btn-confirm-reset-no')?.addEventListener('click', () => {
      if (confirmBox) confirmBox.style.display = 'none';
    });

    document.getElementById('btn-confirm-reset-yes')?.addEventListener('click', () => {
      progressManager.resetProgress();
      this.showProgressDashboard();
    });
  }

  /* =========================================================================
   * 5. HOW TO PLAY ("NASIL OYNANIR?")
   * ========================================================================= */
  showHowToPlay() {
    this.clearPreviewLoop();
    this.ensureMenuSceneRunning();

    this.uiLayer.innerHTML = `
      <div class="screen-overlay">
        <div class="glass-panel" style="max-width:860px;">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Nasıl Oynanır?</h2>
              <p class="panel-subtitle">Klavye yön tuşları, havada kalma özelliği ve Etkileşimli Tahta dokunmatik kontrolleri</p>
            </div>
            <button id="btn-howto-back" class="btn-3d btn-slate btn-sm">⬅ Ana Menü</button>
          </div>

          <div class="dashboard-stats-grid" style="grid-template-columns: repeat(2, 1fr);">
            <div class="stat-card">
              <span class="stat-card-label">1. Klavye Yön Tuşları & Havada Kalma</span>
              <div style="margin-top:6px; line-height:1.7; font-weight:700;">
                <div><span class="key-cap">⬅ Sol Yön Tuşu</span> : Sola Koş</div>
                <div><span class="key-cap">➡ Sağ Yön Tuşu</span> : Sağa Koş</div>
                <div><span class="key-cap">⬆ Yukarı Yön Tuşu</span> / <span class="key-cap">Boşluk</span> : Zıpla</div>
                <div style="color:#fde047;">✨ <strong>İpucu:</strong> Zıplama tuşuna <strong>basılı tuttuğun sürece</strong> karakter havada süzülür! İstediğin kutunun üzerine gelince tuşu bırakarak kutuya inebilirsin.</div>
              </div>
            </div>

            <div class="stat-card">
              <span class="stat-card-label">2. Etkileşimli Tahta (Dokunmatik)</span>
              <p style="margin-top:6px; line-height:1.5; color:#e2e8f0; font-weight:700;">
                Sınıftaki <strong>Etkileşimli Tahtada</strong> ekranın altındaki dokunmatik kontrol panelini kullanabilirsin!
                <strong>"↖ Sola Zıpla"</strong>, <strong>"⬆ Zıpla / Havada Kal"</strong> ve <strong>"↗ Sağa Zıpla"</strong> düğmelerine basılı tutarak en arkadaki cevap kutusuna bile kolayca ulaşabilirsin.
              </p>
            </div>

            <div class="stat-card">
              <span class="stat-card-label">3. 2'den 10'a İleri ve Geri Sayma</span>
              <p style="margin-top:6px; line-height:1.5; color:#e2e8f0; font-weight:700;">
                Oyunda <strong>2'şer, 3'er, 4'er, 5'er, 6'şar, 7'şer, 8'er, 9'ar ve 10'ar</strong> hem <strong>İLERİYE</strong> hem de <strong>GERİYE</strong> ritmik sayma soruları yer alır. Üstteki yönergeye dikkat et!
              </p>
            </div>

            <div class="stat-card">
              <span class="stat-card-label">4. Bitiş Bayrağını Açma</span>
              <p style="margin-top:6px; line-height:1.5; color:#e2e8f0; font-weight:700;">
                Bölümdeki tüm ritmik sayma hedeflerini tamamladığında bölüm sonundaki <strong>Bitiş Bayrağı</strong> açılır. Bayrağa ulaşarak yıldızları kazan!
              </p>
            </div>
          </div>

          <div style="display:flex; justify-content:center; margin-top:6px;">
            <button id="btn-howto-play-now" class="btn-3d btn-green">▶ Hemen Maceraya Başla</button>
          </div>
        </div>
      </div>
    `;

    this.attachButtonSounds();

    document.getElementById('btn-howto-back')?.addEventListener('click', () => {
      this.showMainMenu();
    });
    document.getElementById('btn-howto-play-now')?.addEventListener('click', () => {
      const targetLevel = progressManager.data.lastPlayedLevel || '1-1';
      this.startLevel(targetLevel);
    });
  }

  /* =========================================================================
   * 6. IN-GAME HUD & INTERACTIVE WHITEBOARD TOUCH CONTROL BAR
   * ========================================================================= */
  showGameHUD({
    levelConfig,
    worldConfig,
    solvedCount,
    totalChallenges,
    coins,
    stars,
    activeChallenge
  }) {
    this.clearPreviewLoop();
    virtualInput.reset();
    this.currentActiveChallenge = activeChallenge;

    this.uiLayer.innerHTML = `
      <div class="hud-wrapper">
        <div>
          <div class="hud-top-row">
            <div class="hud-left-cluster">
              <button id="btn-hud-pause" class="btn-3d btn-slate btn-sm" title="Duraklat (Esc)">
                ⏸ Duraklat
              </button>
              <div class="hud-pill">
                <span>🌍 ${worldConfig.name} • ${levelConfig.name}</span>
              </div>
            </div>

            <div class="hud-right-cluster">
              <div class="hud-pill">
                <span>🎯 Hedef: <strong id="hud-solved-count">${solvedCount}/${totalChallenges}</strong></span>
              </div>
              <div class="hud-pill">
                <span>⭐ <strong id="hud-stars-count">${stars}</strong></span>
              </div>
              <div class="hud-pill">
                <span>🪙 <strong id="hud-coins-count">${coins}</strong></span>
              </div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; align-items:center; margin-top:8px; gap:6px;">
            <div id="hud-math-banner" class="hud-math-banner"></div>
            <div id="hud-feedback-toast" class="hud-feedback-toast" style="display:none;"></div>
          </div>
        </div>

        <!-- Bottom Interactive Whiteboard (Etkileşimli Tahta) Touch Control Section -->
        <div class="hud-bottom-bar">
          <div id="smartboard-controls" class="smartboard-dock" role="region" aria-label="Etkileşimli Tahta Dokunmatik Kontrolleri">
            <div class="smartboard-group">
              <button id="btn-touch-left" class="touch-ctrl-btn touch-move" type="button">
                ⬅ SOLA GİT
              </button>
              <button id="btn-touch-right" class="touch-ctrl-btn touch-move" type="button">
                SAĞA GİT ➡
              </button>
            </div>

            <div class="smartboard-center-hint">
              <span>⌨️ Klavye Yön Tuşları: <span class="key-cap">⬅</span> <span class="key-cap">➡</span> <span class="key-cap">⬆</span> • 🖐️ Etkileşimli Tahta Dokunmatik</span>
              <span style="color:#fde047;">✨ Zıpla tuşuna basılı tutarak havada kalabilir ve arkadaki kutulara ulaşabilirsin!</span>
            </div>

            <div class="smartboard-group">
              <button id="btn-touch-jump-left" class="touch-ctrl-btn touch-combo" type="button">
                ↖ SOLA ZIPLA
              </button>
              <button id="btn-touch-jump" class="touch-ctrl-btn touch-jump" type="button">
                ⬆ ZIPLA / HAVADA KAL
              </button>
              <button id="btn-touch-jump-right" class="touch-ctrl-btn touch-combo" type="button">
                ↗ SAĞA ZIPLA
              </button>
            </div>
          </div>
        </div>

        <div id="hud-modal-slot" style="position:absolute; inset:0; display:none; align-items:center; justify-content:center; background:rgba(10, 18, 36, 0.72); backdrop-filter:blur(6px); pointer-events:auto; z-index:40;"></div>
      </div>
    `;

    this.attachButtonSounds();
    this.bindSmartboardTouchControls();

    if (activeChallenge) {
      this.updateHUDMathBanner(activeChallenge);
    }

    document.getElementById('btn-hud-pause')?.addEventListener('click', () => {
      const gameScene = this.game.scene.getScene('GameScene');
      if (gameScene && gameScene.scene.isActive()) {
        gameScene.togglePause();
      }
    });
  }

  /**
   * Binds multi-touch (for mobile phones & tablets) and pointer events (for Interactive Whiteboards & mouse)
   * on the bottom control buttons so players can hold, slide between buttons, or use two thumbs simultaneously.
   */
  bindSmartboardTouchControls() {
    const dock = document.getElementById('smartboard-controls');
    if (!dock) return;

    const btnMap = {
      'btn-touch-left': { left: true },
      'btn-touch-right': { right: true },
      'btn-touch-jump': { up: true },
      'btn-touch-jump-left': { left: true, up: true },
      'btn-touch-jump-right': { right: true, up: true }
    };

    const pointerPressedIds = new Set();

    const syncVirtualInputFromActiveButtons = (activeBtnIds) => {
      let nextLeft = false;
      let nextRight = false;
      let nextUp = false;

      Object.keys(btnMap).forEach((id) => {
        const el = document.getElementById(id);
        const isActive = activeBtnIds.has(id);
        if (el) {
          el.classList.toggle('pressed', isActive);
        }
        if (isActive) {
          if (btnMap[id].left) nextLeft = true;
          if (btnMap[id].right) nextRight = true;
          if (btnMap[id].up) nextUp = true;
        }
      });

      virtualInput.left = nextLeft;
      virtualInput.right = nextRight;
      virtualInput.up = nextUp;
    };

    // 1. Multi-touch handler (iOS / Android phones & tablets: supports two thumbs + sliding thumb across buttons)
    const handleTouchEvent = (e) => {
      if (e.cancelable) e.preventDefault();
      audioManager.ensureContext();

      const touchedIds = new Set(pointerPressedIds);
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        const target = document
          .elementFromPoint(t.clientX, t.clientY)
          ?.closest('.touch-ctrl-btn');
        if (target && target.id && btnMap[target.id]) {
          touchedIds.add(target.id);
        }
      }
      syncVirtualInputFromActiveButtons(touchedIds);
    };

    dock.addEventListener('touchstart', handleTouchEvent, { passive: false });
    dock.addEventListener('touchmove', handleTouchEvent, { passive: false });
    dock.addEventListener('touchend', handleTouchEvent, { passive: false });
    dock.addEventListener('touchcancel', handleTouchEvent, { passive: false });
    dock.addEventListener('contextmenu', (e) => e.preventDefault());

    // 2. Pointer Events handler (Interactive Whiteboards, Stylus, Desktop Mouse, and Automated Tests)
    Object.keys(btnMap).forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;

      const startHold = (e) => {
        if (e.pointerType === 'touch') return; // Handled by multi-touch listener above
        e.preventDefault();
        btn.blur();
        audioManager.ensureContext();
        pointerPressedIds.add(btnId);
        syncVirtualInputFromActiveButtons(pointerPressedIds);
      };

      const endHold = (e) => {
        if (e.pointerType === 'touch') return;
        e.preventDefault();
        pointerPressedIds.delete(btnId);
        syncVirtualInputFromActiveButtons(pointerPressedIds);
      };

      btn.addEventListener('pointerdown', startHold);
      btn.addEventListener('pointerup', endHold);
      btn.addEventListener('pointerleave', endHold);
      btn.addEventListener('pointercancel', endHold);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }

  updateHUDMathBanner(challenge, isSolved = false) {
    if (!challenge) return;
    this.currentActiveChallenge = challenge;
    const banner = document.getElementById('hud-math-banner');
    if (!banner) return;

    const isBack = challenge.direction === COUNTING_DIRECTIONS.BACKWARD;
    const dirClass = isBack ? 'dir-backward' : 'dir-forward';

    const seqBoxes = challenge.displaySequence
      .map((val) => {
        if (val === null) {
          if (isSolved) {
            return `<span class="seq-num-box solved-slot">${challenge.correctAnswer}</span>`;
          }
          return `<span class="seq-num-box missing-slot">?</span>`;
        }
        return `<span class="seq-num-box">${val}</span>`;
      })
      .join('<span class="seq-arrow">➔</span>');

    banner.innerHTML = `
      <div class="math-banner-header">
        <span class="dir-badge-pill ${dirClass}">${challenge.dirBadge || ''}</span>
        <span class="math-prompt-text">${challenge.promptText}</span>
        <button id="btn-repeat-instruction" class="btn-repeat-prompt">🔊 Yönergeyi Tekrarla</button>
      </div>
      <div class="sequence-boxes-row">
        ${seqBoxes}
      </div>
    `;

    document
      .getElementById('btn-repeat-instruction')
      ?.addEventListener('click', (e) => {
        e.currentTarget.blur();
        audioManager.playClick();
        const opWord = isBack ? 'çıkarılır' : 'eklenir';
        this.showFeedbackToast(
          `${challenge.promptText} (${challenge.stepLabel} ${
            isBack ? 'geriye' : 'ileriye'
          } sayarken her adımda ${challenge.step} ${opWord}.)`,
          'info',
          4200
        );
      });
  }

  markHUDChallengeSolved(challenge) {
    this.updateHUDMathBanner(challenge, true);
  }

  updateHUDCounters({ coins, stars, solvedCount, totalChallenges }) {
    const elCoins = document.getElementById('hud-coins-count');
    const elStars = document.getElementById('hud-stars-count');
    const elSolved = document.getElementById('hud-solved-count');
    if (elCoins) elCoins.textContent = String(coins);
    if (elStars) elStars.textContent = String(stars);
    if (elSolved) elSolved.textContent = `${solvedCount}/${totalChallenges}`;
  }

  showFeedbackToast(message, type = 'info', durationMs = 3400) {
    const toast = document.getElementById('hud-feedback-toast');
    if (!toast) return;

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    toast.className = `hud-feedback-toast feedback-${type}`;
    toast.textContent = message;
    toast.style.display = 'block';

    this.toastTimer = setTimeout(() => {
      if (toast) toast.style.display = 'none';
    }, durationMs);
  }

  /* =========================================================================
   * 7. PAUSE MENU & VICTORY COMPLETION SCREEN
   * ========================================================================= */
  showPauseModal(levelConfig) {
    const slot = document.getElementById('hud-modal-slot');
    if (!slot) return;

    const s = progressManager.getSettings();
    const volPercent = Math.round((s.volume ?? 0.8) * 100);

    slot.style.display = 'flex';
    slot.innerHTML = `
      <div class="victory-modal-card">
        <h2 class="panel-title">Oyun Duraklatıldı</h2>
        <p class="panel-subtitle">${levelConfig.name}</p>

        <div style="width:100%; background:rgba(255,255,255,0.08); padding:14px 18px; border-radius:16px; display:flex; flex-direction:column; gap:10px; text-align:left;">
          <label style="font-weight:800; display:flex; justify-content:space-between;">
            <span>Ses Seviyesi:</span>
            <span id="vol-label-val">%${volPercent}</span>
          </label>
          <input id="pause-vol-slider" type="range" min="0" max="100" value="${volPercent}" style="width:100%; cursor:pointer;" />
        </div>

        <div class="modal-actions-row">
          <button id="btn-pause-resume" class="btn-3d btn-green">▶ Devam Et</button>
          <button id="btn-pause-restart" class="btn-3d btn-gold">↻ Yeniden Başlat</button>
          <button id="btn-pause-worlds" class="btn-3d btn-blue">🌍 Dünyalar</button>
          <button id="btn-pause-menu" class="btn-3d btn-slate">🏠 Ana Menü</button>
        </div>
      </div>
    `;

    this.attachButtonSounds(slot);

    const slider = document.getElementById('pause-vol-slider');
    const volLabel = document.getElementById('vol-label-val');
    slider?.addEventListener('input', (e) => {
      const v = Number(e.target.value);
      if (volLabel) volLabel.textContent = `%${v}`;
      audioManager.setVolume(v / 100);
    });

    document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
      const gameScene = this.game.scene.getScene('GameScene');
      if (gameScene) gameScene.togglePause(false);
    });

    document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
      this.startLevel(levelConfig.id);
    });

    document.getElementById('btn-pause-worlds')?.addEventListener('click', () => {
      this.stopGameScene();
      this.showWorldSelection();
    });

    document.getElementById('btn-pause-menu')?.addEventListener('click', () => {
      this.stopGameScene();
      this.showMainMenu();
    });
  }

  hideModal() {
    const slot = document.getElementById('hud-modal-slot');
    if (slot) {
      slot.style.display = 'none';
      slot.innerHTML = '';
    }
  }

  showVictoryModal({
    levelConfig,
    stars,
    correctAnswers,
    incorrectAttempts,
    accuracy,
    nextLevelId
  }) {
    const slot = document.getElementById('hud-modal-slot');
    if (!slot) return;

    const starsHtml = [1, 2, 3]
      .map((idx) => this.renderStarSvg(idx <= stars, 'victory-star-lg'))
      .join('');

    slot.style.display = 'flex';
    slot.innerHTML = `
      <div class="victory-modal-card">
        <div class="title-badge-pill">🌟 BÖLÜM TAMAMLANDI! 🌟</div>
        <h2 class="panel-title">Tebrikler! Bölümü tamamladın!</h2>
        <p class="panel-subtitle" style="font-size:1.15rem; color:#fef08a;">
          ${levelConfig.name}
        </p>

        <div class="victory-stars-showcase">
          ${starsHtml}
        </div>

        <div class="victory-metrics-grid">
          <div class="victory-metric-box">
            <div class="victory-metric-val">${correctAnswers}</div>
            <div class="victory-metric-lbl">Doğru Cevap</div>
          </div>
          <div class="victory-metric-box">
            <div class="victory-metric-val">${incorrectAttempts}</div>
            <div class="victory-metric-lbl">Hatalı Deneme</div>
          </div>
          <div class="victory-metric-box">
            <div class="victory-metric-val">%${accuracy}</div>
            <div class="victory-metric-lbl">Doğruluk Oranı</div>
          </div>
        </div>

        <div class="modal-actions-row">
          <button id="btn-vic-replay" class="btn-3d btn-gold">↻ Tekrar Oyna</button>
          ${
            nextLevelId
              ? `<button id="btn-vic-next" class="btn-3d btn-green">Sonraki Seviye ➡</button>`
              : `<button id="btn-vic-worlds" class="btn-3d btn-blue">🌍 Tüm Dünyalar</button>`
          }
          <button id="btn-vic-menu" class="btn-3d btn-slate">🏠 Ana Menü</button>
        </div>
      </div>
    `;

    this.attachButtonSounds(slot);

    document.getElementById('btn-vic-replay')?.addEventListener('click', () => {
      this.startLevel(levelConfig.id);
    });

    document.getElementById('btn-vic-next')?.addEventListener('click', () => {
      if (nextLevelId) {
        this.startLevel(nextLevelId);
      }
    });

    document.getElementById('btn-vic-worlds')?.addEventListener('click', () => {
      this.stopGameScene();
      this.showWorldSelection();
    });

    document.getElementById('btn-vic-menu')?.addEventListener('click', () => {
      this.stopGameScene();
      this.showMainMenu();
    });
  }

  /* =========================================================================
   * SCENE NAVIGATION HELPERS
   * ========================================================================= */
  startLevel(levelId) {
    this.clearPreviewLoop();
    virtualInput.reset();
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur?.();
    }
    if (this.game.scene.isActive('MenuScene')) {
      this.game.scene.stop('MenuScene');
    }
    if (this.game.scene.isActive('GameScene')) {
      this.game.scene.stop('GameScene');
    }
    this.game.scene.start('GameScene', { levelId });
  }

  stopGameScene() {
    virtualInput.reset();
    if (this.game.scene.isActive('GameScene')) {
      this.game.scene.stop('GameScene');
    }
    this.ensureMenuSceneRunning();
  }

  ensureMenuSceneRunning() {
    if (!this.game || !this.game.isBooted) return;
    if (this.game.scene.isActive('BootScene')) return;
    if (!this.game.scene.isActive('MenuScene')) {
      this.game.scene.start('MenuScene');
    }
  }

  renderStarSvg(filled = true, extraClass = 'star-icon') {
    const fill = filled ? '#fde047' : 'rgba(255,255,255,0.18)';
    const stroke = filled ? '#ca8a04' : 'rgba(255,255,255,0.35)';
    return `
      <svg class="${extraClass}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    `;
  }
}
