/**
 * Main Application Entry Point for "Ritmik Sayma Macerası"
 * Configures Phaser 3, UIManager, keyboard arrow key handling, and tab visibility pausing.
 */

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIManager } from './ui/UIManager.js';
import { progressManager } from './storage/ProgressManager.js';
import { audioManager } from './audio/AudioManager.js';
import { generateMathChallenge, validateChallenge } from './math/MathGenerator.js';
import { keyboardInput, virtualInput } from './entities/Player.js';

const config = {
  type: Phaser.CANVAS,
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#0b1326',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1250 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, GameScene]
};

// Initialize global keyboard arrow key listener immediately
keyboardInput.init();

const game = new Phaser.Game(config);
const uiManager = new UIManager(game);

window.uiManager = uiManager;
window.__RITMIK_GAME__ = {
  game,
  uiManager,
  progressManager,
  audioManager,
  generateMathChallenge,
  validateChallenge,
  keyboardInput,
  virtualInput
};

// Render main menu immediately so UI is responsive right away
uiManager.hasInitializedMenu = true;
uiManager.showMainMenu();

// Safely pause gameplay when browser tab becomes inactive
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    virtualInput.reset();
    const gameScene = game.scene.getScene('GameScene');
    if (
      gameScene &&
      gameScene.scene.isActive() &&
      !gameScene.isPaused &&
      !gameScene.levelCompleted
    ) {
      gameScene.togglePause(true);
    }
  }
});
