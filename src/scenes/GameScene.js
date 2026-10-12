/**
 * GameScene: Core Side-Scrolling Educational Platformer Scene
 * Integrates 2-to-10 forward & backward skip-counting math challenges
 * with one-way pass-through platforms and smartboard-friendly layout.
 */

import Phaser from 'phaser';
import { getLevelById } from '../data/levels.js';
import { generateMathChallenge, POSITIVE_MESSAGES } from '../math/MathGenerator.js';
import { Player, virtualInput } from '../entities/Player.js';
import { progressManager } from '../storage/ProgressManager.js';
import { audioManager } from '../audio/AudioManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelId = data?.levelId || progressManager.data.lastPlayedLevel || '1-1';
    this.levelConfig = getLevelById(this.levelId);
    this.worldConfig = this.levelConfig.world;
    if (!String(this.levelId).startsWith('custom_')) {
      progressManager.setLastPlayedLevel(this.levelId);
    }

    this.stations = [];
    this.activeStationIndex = 0;
    this.solvedCount = 0;
    this.levelCorrectAnswers = 0;
    this.levelIncorrectAttempts = 0;
    this.levelFirstAttemptCorrect = 0;
    this.coinsCollected = 0;
    this.starsCollected = 0;
    this.flagUnlocked = false;
    this.levelCompleted = false;
    this.isPaused = false;
    this.levelStartTime = Date.now();
    this.lastCheckpointPos = { x: 180, y: 500 };
  }

  create() {
    const challengeCount = this.levelConfig.challengeCount || 3;
    this.worldWidth = 1150 + challengeCount * 960;
    this.worldHeight = 720;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight + 220);

    // 1. Multi-layer Parallax Background
    this.createParallaxBackground();

    // 2. Physics Groups
    this.platformsGroup = this.physics.add.staticGroup();
    this.choicePlatformsGroup = this.physics.add.staticGroup();
    this.coinsGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.starsGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.trampolinesGroup = this.physics.add.staticGroup();
    this.checkpointsGroup = this.physics.add.staticGroup();

    // 3. Build Start Area, Math Challenge Stations, Checkpoints, and Finish Zone
    this.buildLevelGeometry(challengeCount);

    // 4. Create Player
    const charId = progressManager.getSelectedCharacter();
    this.player = new Player(this, 180, 500, charId);

    // 5. Camera Follow
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    // 6. Collisions & Overlaps
    this.physics.add.collider(this.player.sprite, this.platformsGroup);
    this.physics.add.collider(
      this.player.sprite,
      this.choicePlatformsGroup,
      this.handleChoicePlatformLanding,
      null,
      this
    );
    this.physics.add.collider(
      this.player.sprite,
      this.trampolinesGroup,
      this.handleTrampolineBounce,
      null,
      this
    );
    this.physics.add.overlap(
      this.player.sprite,
      this.coinsGroup,
      this.handleCoinCollect,
      null,
      this
    );
    this.physics.add.overlap(
      this.player.sprite,
      this.starsGroup,
      this.handleStarCollect,
      null,
      this
    );
    this.physics.add.overlap(
      this.player.sprite,
      this.checkpointsGroup,
      this.handleCheckpointOverlap,
      null,
      this
    );
    this.physics.add.overlap(
      this.player.sprite,
      this.flagTriggerZone,
      this.handleFlagOverlap,
      null,
      this
    );

    // 7. Escape key for Pause Menu
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyEsc.on('down', () => {
      if (this.levelCompleted) return;
      this.togglePause();
    });

    // 8. Initialize HUD via UIManager
    if (window.uiManager) {
      window.uiManager.showGameHUD({
        levelConfig: this.levelConfig,
        worldConfig: this.worldConfig,
        solvedCount: this.solvedCount,
        totalChallenges: this.stations.length,
        coins: this.coinsCollected,
        stars: this.starsCollected,
        activeChallenge: this.stations[0]?.challenge
      });
      window.uiManager.showFeedbackToast(this.levelConfig.introText, 'info', 5200);
    }
  }

  createParallaxBackground() {
    const worldKey = this.worldConfig.key;

    // Sky fixed to camera
    this.add
      .image(640, 360, `sky_${worldKey}`)
      .setScrollFactor(0)
      .setDepth(0);

    // Clouds layer (scrollFactor 0.2)
    for (let cx = 120; cx < this.worldWidth; cx += 420) {
      this.add
        .image(cx, 90 + (cx % 65), 'deco_cloud_puff')
        .setScrollFactor(0.2)
        .setAlpha(0.85)
        .setScale(0.8 + (cx % 3) * 0.15)
        .setDepth(1);
    }

    // Far Hills layer (scrollFactor 0.25)
    for (let hx = 640; hx < this.worldWidth + 1280; hx += 1280) {
      this.add
        .image(hx, 515, `hills_far_${worldKey}`)
        .setScrollFactor(0.25)
        .setDepth(2);
    }

    // Near Hills layer (scrollFactor 0.45)
    for (let hx = 640; hx < this.worldWidth + 1280; hx += 1280) {
      this.add
        .image(hx, 560, `hills_near_${worldKey}`)
        .setScrollFactor(0.45)
        .setDepth(3);
    }
  }

  buildLevelGeometry(challengeCount) {
    const worldKey = this.worldConfig.key;
    const groundKey = `ground_${worldKey}`;
    const platKey = `platform_${worldKey}`;
    const groundY = 620;

    // Start zone ground (x = 0 to 650)
    for (let gx = 128; gx <= 640; gx += 250) {
      this.addGroundSegment(gx, groundY, groundKey);
    }

    // Scenic start props & starter coins
    this.add.image(110, groundY - 105, 'deco_tree').setDepth(5);
    this.spawnCoinArc(320, groundY - 105, 3, 55);

    // Start signpost
    this.createWorldSignpost(
      460,
      groundY - 90,
      `${this.levelConfig.name}\nHedef: ${this.worldConfig.subtitle}`
    );

    let cursorX = 720;

    // Build each Math Challenge Station along the world
    for (let i = 0; i < challengeCount; i++) {
      const challenge = generateMathChallenge({
        allowedSteps: this.levelConfig.allowedSteps,
        activityTypes: this.levelConfig.activityTypes,
        difficulty: this.levelConfig.difficulty,
        challengeIndex: i,
        directionMode: this.levelConfig.directionMode
      });

      const stationStartX = cursorX;

      // Extended ground beneath the entire station so the player can run under & behind the 3rd box
      for (let gx = stationStartX; gx <= stationStartX + 860; gx += 240) {
        this.addGroundSegment(gx, groundY, groundKey);
      }

      // 1. Stepping-Stone Platforms showing the known sequence numbers
      const knownCoords = [
        { x: stationStartX + 40, y: 515 },
        { x: stationStartX + 185, y: 480 },
        { x: stationStartX + 330, y: 450 }
      ];

      for (let sIdx = 0; sIdx < Math.min(3, challenge.displaySequence.length); sIdx++) {
        const val = challenge.displaySequence[sIdx];
        const pos = knownCoords[sIdx];
        const stepPlat = this.platformsGroup.create(pos.x, pos.y, 'math_platform_step');
        stepPlat.setDepth(8);
        stepPlat.refreshBody();
        this.makeOneWayPlatform(stepPlat);

        const labelStr = val === null ? '?' : String(val);
        this.add
          .text(pos.x, pos.y - 2, labelStr, {
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: val === null ? '#fde047' : '#ffffff'
          })
          .setOrigin(0.5)
          .setDepth(9);

        this.spawnCoin(pos.x, pos.y - 52);
      }

      // 2. Floating World Sequence Banner above the choice zone
      const boardX = stationStartX + 610;
      const boardY = 235;
      const boardContainer = this.createStationSequenceBoard(
        boardX,
        boardY,
        i + 1,
        challenge
      );

      // 3. Three Branching Numbered Choice Platforms
      // All 3 boxes are one-way platforms (pass-through from below/sides) and positioned at reachable heights
      const choicePositions = [
        { x: stationStartX + 465, y: 495 },
        { x: stationStartX + 615, y: 460 },
        { x: stationStartX + 765, y: 495 }
      ];

      // Bouncy mushroom near the choice platforms for extra fun lift
      const tramp = this.trampolinesGroup.create(
        stationStartX + 540,
        groundY - 54,
        'bouncy_mushroom'
      );
      tramp.setDepth(7);
      tramp.refreshBody();

      const stationObj = {
        index: i,
        challenge,
        solved: false,
        wrongCount: 0,
        choicePlatforms: [],
        boardContainer,
        startX: stationStartX
      };

      challenge.options.forEach((optVal, optIdx) => {
        const cPos = choicePositions[optIdx];
        const cPlat = this.choicePlatformsGroup.create(
          cPos.x,
          cPos.y,
          'math_platform_neutral'
        );
        cPlat.setDepth(10);
        cPlat.refreshBody();
        this.makeOneWayPlatform(cPlat);

        const numText = this.add
          .text(cPos.x, cPos.y - 2, String(optVal), {
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '26px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#0f172a',
            strokeThickness: 4
          })
          .setOrigin(0.5)
          .setDepth(11);

        cPlat.stationRef = stationObj;
        cPlat.optionValue = optVal;
        cPlat.numText = numText;
        cPlat.lastWrongTime = 0;

        stationObj.choicePlatforms.push(cPlat);
      });

      this.stations.push(stationObj);

      // Transition bridge & checkpoint before next station
      cursorX = stationStartX + 920;

      if (i < challengeCount - 1) {
        const bridgePlat = this.platformsGroup.create(cursorX + 40, 520, platKey);
        bridgePlat.setDepth(7);
        bridgePlat.refreshBody();
        this.makeOneWayPlatform(bridgePlat);
        this.spawnCoinArc(cursorX + 40, 460, 3, 42);

        this.addGroundSegment(cursorX + 220, groundY, groundKey);
        this.createCheckpoint(cursorX + 220, groundY - 90);
        cursorX += 340;
      }
    }

    // 4. Finish Zone & Flagpole
    const finishStartX = cursorX + 60;
    for (let gx = finishStartX; gx <= finishStartX + 500; gx += 250) {
      this.addGroundSegment(gx, groundY, groundKey);
    }

    const flagX = finishStartX + 260;
    const flagY = groundY - 195;

    this.flagpoleSprite = this.add.image(flagX, flagY, 'flagpole_base').setDepth(8);
    this.flagBannerSprite = this.add
      .image(flagX + 48, flagY + 70, 'flag_banner_locked')
      .setDepth(9);

    this.flagStatusText = this.add
      .text(
        flagX,
        flagY - 185,
        `🔒 Bayrak Kilitli\nHedefleri Tamamla (${this.solvedCount}/${this.stations.length})`,
        {
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '19px',
          fontStyle: 'bold',
          color: '#fef08a',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          padding: { x: 14, y: 8 },
          align: 'center'
        }
      )
      .setOrigin(0.5)
      .setDepth(12);

    // Physics overlap zone for flagpole
    this.flagTriggerZone = this.add.zone(flagX, flagY + 20, 90, 280);
    this.physics.world.enable(this.flagTriggerZone, Phaser.Physics.Arcade.STATIC_BODY);

    this.worldWidth = finishStartX + 520;
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight + 220);
  }

  /**
   * Configures a static platform so the player can jump up through it from below
   * or pass through its sides without getting blocked, landing cleanly on top.
   */
  makeOneWayPlatform(plat) {
    if (plat && plat.body) {
      plat.body.checkCollision.up = true;
      plat.body.checkCollision.down = false;
      plat.body.checkCollision.left = false;
      plat.body.checkCollision.right = false;
    }
  }

  addGroundSegment(x, y, textureKey) {
    const seg = this.platformsGroup.create(x, y, textureKey);
    seg.setDepth(6);
    seg.refreshBody();
    return seg;
  }

  createWorldSignpost(x, y, text) {
    const bg = this.add.graphics().setDepth(6);
    bg.fillStyle(0x1e293b, 0.86);
    bg.lineStyle(3, 0xfde047, 1);
    bg.fillRoundedRect(x - 145, y - 48, 290, 64, 14);
    bg.strokeRoundedRect(x - 145, y - 48, 290, 64, 14);

    this.add
      .text(x, y - 16, text, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '15px',
        color: '#ffffff',
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(7);
  }

  createStationSequenceBoard(x, y, stationNumber, challenge) {
    const container = this.add.container(x, y).setDepth(7);

    const isBack = challenge.direction === 'backward';
    const borderColor = isBack ? 0xf97316 : 0x38bdf8;

    const panel = this.add.graphics();
    panel.fillStyle(0x0f172a, 0.9);
    panel.lineStyle(3, borderColor, 1);
    panel.fillRoundedRect(-230, -58, 460, 112, 18);
    panel.strokeRoundedRect(-230, -58, 460, 112, 18);

    const title = this.add
      .text(
        0,
        -34,
        `Soru ${stationNumber}: ${challenge.stepLabel} (${challenge.dirBadge})`,
        {
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '17px',
          color: '#fde047'
        }
      )
      .setOrigin(0.5);

    const seqString = challenge.displaySequence
      .map((n) => (n === null ? '[ ? ]' : String(n)))
      .join('  ➔  ');

    const seqText = this.add
      .text(0, 12, seqString, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '25px',
        fontStyle: 'bold',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    container.add([panel, title, seqText]);
    container.seqText = seqText;
    container.panel = panel;
    return container;
  }

  spawnCoin(x, y) {
    const coin = this.coinsGroup.create(x, y, 'coin_0');
    coin.setDepth(10);
    coin.play('coin_spin');
    return coin;
  }

  spawnCoinArc(centerX, centerY, count = 3, spacing = 48) {
    const startX = centerX - ((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++) {
      const offsetY = Math.abs(i - (count - 1) / 2) * 12;
      this.spawnCoin(startX + i * spacing, centerY + offsetY);
    }
  }

  createCheckpoint(x, y) {
    const cp = this.checkpointsGroup.create(x, y, 'checkpoint_off');
    cp.setDepth(7);
    cp.activated = false;
    cp.refreshBody();
    return cp;
  }

  handleCoinCollect(playerSprite, coin) {
    if (!coin.active) return;
    coin.disableBody(true, true);
    this.coinsCollected += 1;
    progressManager.addCoin(1);
    audioManager.playCoin();

    if (window.uiManager) {
      window.uiManager.updateHUDCounters({
        coins: this.coinsCollected,
        stars: this.starsCollected,
        solvedCount: this.solvedCount,
        totalChallenges: this.stations.length
      });
    }
  }

  handleStarCollect(playerSprite, star) {
    if (!star.active) return;
    star.disableBody(true, true);
    this.starsCollected += 1;
    audioManager.playStar();

    if (window.uiManager) {
      window.uiManager.updateHUDCounters({
        coins: this.coinsCollected,
        stars: this.starsCollected,
        solvedCount: this.solvedCount,
        totalChallenges: this.stations.length
      });
    }
  }

  handleTrampolineBounce(playerSprite, tramp) {
    const landedOnTop =
      playerSprite.body.bottom <= tramp.body.top + 18 &&
      playerSprite.body.velocity.y >= -10;
    if (landedOnTop) {
      playerSprite.setVelocityY(-680);
      audioManager.playJump();
      if (!progressManager.getSettings().reducedMotion) {
        this.tweens.add({
          targets: tramp,
          scaleY: 0.72,
          scaleX: 1.18,
          duration: 90,
          yoyo: true
        });
      }
    }
  }

  handleCheckpointOverlap(playerSprite, cp) {
    if (cp.activated) return;
    cp.activated = true;
    cp.setTexture('checkpoint_on');
    this.lastCheckpointPos = { x: cp.x, y: cp.y - 30 };
    audioManager.playCheckpoint();
    if (window.uiManager) {
      window.uiManager.showFeedbackToast('Kontrol noktası kaydedildi!', 'info', 2200);
    }
  }

  handleChoicePlatformLanding(playerSprite, cPlat) {
    // Trigger only when player lands on TOP of the numbered platform
    const landedOnTop =
      playerSprite.body.bottom <= cPlat.body.top + 18 &&
      playerSprite.body.velocity.y >= -10;

    if (!landedOnTop) return;

    const station = cPlat.stationRef;
    if (!station || station.solved) return;

    const chosenVal = cPlat.optionValue;
    const challenge = station.challenge;

    if (chosenVal === challenge.correctAnswer) {
      // CORRECT ANSWER!
      station.solved = true;
      this.solvedCount += 1;
      this.levelCorrectAnswers += 1;
      const isFirstTry = station.wrongCount === 0;
      if (isFirstTry) {
        this.levelFirstAttemptCorrect += 1;
      }

      cPlat.setTexture('math_platform_correct');
      if (cPlat.hintLabel) {
        cPlat.hintLabel.destroy();
      }

      const solvedSeqStr = challenge.fullSequence.join('  ➔  ');
      station.boardContainer.seqText.setText(`${solvedSeqStr}  ✓`);
      station.boardContainer.seqText.setColor('#86efac');

      this.lastCheckpointPos = { x: cPlat.x, y: cPlat.y - 70 };

      this.starsCollected += 1;
      this.coinsCollected += 2;
      progressManager.addCoin(2);
      progressManager.recordQuestionAttempt(challenge.step, true, isFirstTry);

      audioManager.playCorrectAnswer();
      this.player.triggerHappyReaction();
      this.spawnCelebrationBurst(cPlat.x, cPlat.y - 20);

      const msg = POSITIVE_MESSAGES[this.solvedCount % POSITIVE_MESSAGES.length];
      if (window.uiManager) {
        window.uiManager.showFeedbackToast(msg, 'success', 3200);
        window.uiManager.markHUDChallengeSolved(challenge);
        window.uiManager.updateHUDCounters({
          coins: this.coinsCollected,
          stars: this.starsCollected,
          solvedCount: this.solvedCount,
          totalChallenges: this.stations.length
        });
      }

      if (this.solvedCount >= this.stations.length) {
        this.unlockFinishFlag();
      } else {
        this.time.delayedCall(1400, () => {
          const nextStation = this.stations.find((s) => !s.solved);
          if (nextStation && window.uiManager) {
            window.uiManager.updateHUDMathBanner(nextStation.challenge);
          }
        });
      }
    } else {
      // INCORRECT ANSWER
      const now = this.time.now;
      if (now - cPlat.lastWrongTime < 1400) return;
      cPlat.lastWrongTime = now;

      station.wrongCount += 1;
      this.levelIncorrectAttempts += 1;
      cPlat.setTexture('math_platform_wrong');

      progressManager.recordQuestionAttempt(challenge.step, false, false);
      audioManager.playIncorrectAnswer();

      if (!progressManager.getSettings().reducedMotion) {
        this.tweens.add({
          targets: [cPlat, cPlat.numText],
          x: '+=6',
          duration: 55,
          yoyo: true,
          repeat: 3
        });
      }

      const hintMessage =
        station.wrongCount === 1 ? challenge.hintFirst : challenge.hintDetailed;
      if (window.uiManager) {
        window.uiManager.showFeedbackToast(hintMessage, 'hint', 4500);
      }

      // After 2 errors on the same station, visually highlight the correct platform
      if (station.wrongCount >= 2) {
        const correctPlat = station.choicePlatforms.find(
          (p) => p.optionValue === challenge.correctAnswer
        );
        if (correctPlat && !correctPlat.hintLabel) {
          correctPlat.setTexture('math_platform_hint');
          correctPlat.hintLabel = this.add
            .text(correctPlat.x, correctPlat.y - 46, '✨ İPUCU ✨', {
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '16px',
              fontStyle: 'bold',
              color: '#fde047',
              backgroundColor: 'rgba(107, 33, 168, 0.9)',
              padding: { x: 8, y: 4 }
            })
            .setOrigin(0.5)
            .setDepth(12);
        }
      }
    }
  }

  unlockFinishFlag() {
    if (this.flagUnlocked) return;
    this.flagUnlocked = true;
    this.flagBannerSprite.setTexture('flag_banner_unlocked');
    this.flagStatusText.setText('✨ BAYRAK AÇILDI! ✨\nBayrağa Ulaş ve Bölümü Tamamla!');
    this.flagStatusText.setColor('#86efac');

    audioManager.playFlagUnlock();
    this.spawnCelebrationBurst(this.flagpoleSprite.x, this.flagpoleSprite.y - 60);

    if (window.uiManager) {
      window.uiManager.showFeedbackToast(
        'Harika! Tüm sayı örüntülerini çözdün! Şimdi bitiş bayrağına ulaş!',
        'success',
        4500
      );
    }
  }

  handleFlagOverlap() {
    if (this.levelCompleted) return;

    if (!this.flagUnlocked) {
      const remaining = this.stations.length - this.solvedCount;
      if (window.uiManager) {
        window.uiManager.showFeedbackToast(
          `Bayrağı açmak için kalan ${remaining} sayı sorusunu daha tamamlamalısın!`,
          'hint',
          3200
        );
      }
      return;
    }

    this.levelCompleted = true;
    virtualInput.reset();
    this.player.startVictoryPose();
    audioManager.playLevelComplete();

    this.tweens.add({
      targets: this.flagBannerSprite,
      y: this.flagpoleSprite.y - 95,
      duration: 650,
      ease: 'Back.easeOut'
    });

    this.spawnCelebrationBurst(this.flagpoleSprite.x, this.flagpoleSprite.y - 80);

    const elapsedSec = Math.max(1, Math.round((Date.now() - this.levelStartTime) / 1000));
    progressManager.addPlayTime(elapsedSec);

    const totalAttempts = this.levelCorrectAnswers + this.levelIncorrectAttempts;
    const accuracy =
      totalAttempts > 0
        ? Math.round((this.levelCorrectAnswers / totalAttempts) * 100)
        : 100;

    let earnedStars = 1;
    if (accuracy >= 85 && this.levelIncorrectAttempts <= 1) {
      earnedStars = 3;
    } else if (accuracy >= 60) {
      earnedStars = 2;
    }

    const result = progressManager.completeLevel({
      levelId: this.levelId,
      stars: earnedStars,
      accuracy,
      coinsCollected: this.coinsCollected
    });

    this.time.delayedCall(1000, () => {
      if (window.uiManager) {
        window.uiManager.showVictoryModal({
          levelConfig: this.levelConfig,
          stars: earnedStars,
          correctAnswers: this.levelCorrectAnswers,
          incorrectAttempts: this.levelIncorrectAttempts,
          accuracy,
          nextLevelId: result.nextLevelId
        });
      }
    });
  }

  spawnCelebrationBurst(x, y) {
    if (progressManager.getSettings().reducedMotion) return;
    const emitter = this.add.particles(x, y, 'particle_sparkle', {
      speed: { min: 60, max: 210 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 750,
      quantity: 18,
      blendMode: 'ADD',
      emitting: false
    });
    emitter.setDepth(20);
    emitter.explode(18);
    this.time.delayedCall(850, () => emitter.destroy());
  }

  togglePause(forcePause = null) {
    if (this.levelCompleted) return;
    const nextState = forcePause !== null ? forcePause : !this.isPaused;
    this.isPaused = nextState;
    virtualInput.reset();

    if (this.isPaused) {
      this.physics.world.pause();
      if (window.uiManager) {
        window.uiManager.showPauseModal(this.levelConfig);
      }
    } else {
      this.physics.world.resume();
      if (window.uiManager) {
        window.uiManager.hideModal();
      }
    }
  }

  update(time) {
    if (this.isPaused || this.levelCompleted) {
      if (this.player) this.player.update(time);
      return;
    }

    if (this.player) {
      this.player.update(time);

      for (let i = 0; i < this.stations.length; i++) {
        const st = this.stations[i];
        if (
          !st.solved &&
          Math.abs(this.player.sprite.x - (st.startX + 450)) < 460 &&
          this.activeStationIndex !== i
        ) {
          this.activeStationIndex = i;
          if (window.uiManager) {
            window.uiManager.updateHUDMathBanner(st.challenge);
          }
          break;
        }
      }

      if (this.player.sprite.y > this.worldHeight + 40) {
        this.player.sprite.body.reset(
          this.lastCheckpointPos.x,
          this.lastCheckpointPos.y - 20
        );
        if (window.uiManager) {
          window.uiManager.showFeedbackToast(
            'Güvenli noktaya döndün, maceraya devam edebilirsin!',
            'info',
            2600
          );
        }
      }
    }
  }
}
