/**
 * MenuScene: Renders an animated 3D-inspired fantasy landscape in Phaser
 * with rolling green hills, drifting clouds, distant castle, rotating coins,
 * glowing particles, and the selected hero performing an idle animation.
 */

import Phaser from 'phaser';
import { progressManager } from '../storage/ProgressManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this.clouds = [];
    this.heroSprite = null;
  }

  create() {
    const { width, height } = this.scale;

    // 1. Cinematic Sky Gradient
    this.add.image(width / 2, height / 2, 'sky_menu');

    // Warm sun glow in upper right
    const sunGfx = this.add.graphics();
    sunGfx.fillStyle(0xfef08a, 0.28);
    sunGfx.fillCircle(width * 0.78, height * 0.22, 130);
    sunGfx.fillStyle(0xfef9c3, 0.55);
    sunGfx.fillCircle(width * 0.78, height * 0.22, 70);

    // 2. Drifting Fluffy Clouds
    this.clouds = [];
    const cloudCoords = [
      { x: 180, y: 120, scale: 0.9, speed: 0.25 },
      { x: 540, y: 85, scale: 1.1, speed: 0.18 },
      { x: 960, y: 140, scale: 0.85, speed: 0.3 },
      { x: 1180, y: 95, scale: 0.7, speed: 0.22 }
    ];
    cloudCoords.forEach((c) => {
      const img = this.add.image(c.x, c.y, 'deco_cloud_puff').setScale(c.scale).setAlpha(0.9);
      this.clouds.push({ sprite: img, speed: c.speed });
    });

    // 3. Distant Castle on Far Hill
    this.add.image(width * 0.78, height * 0.52, 'deco_castle_distant').setScale(0.95);

    // 4. Layered Rolling Green Hills
    this.add.image(width / 2, height - 150, 'hills_far_yesil_krallik');
    this.add.image(width / 2, height - 110, 'hills_near_yesil_krallik');

    // 5. Foreground Ground Tiles & Trees
    for (let gx = 0; gx < width + 256; gx += 250) {
      this.add.image(gx, height - 24, 'ground_yesil_krallik');
    }

    this.add.image(110, height - 125, 'deco_tree').setScale(0.95);
    this.add.image(1160, height - 120, 'deco_tree').setScale(1.05);
    this.add.image(920, height - 82, 'bouncy_mushroom').setScale(0.9);

    // Numbered stepping platforms & sparkling coins in background scene
    const samplePlatforms = [
      { x: 640, y: height - 150, num: '2' },
      { x: 790, y: height - 210, num: '4' },
      { x: 940, y: height - 270, num: '6' }
    ];
    samplePlatforms.forEach((p) => {
      this.add.image(p.x, p.y, 'math_platform_step').setScale(0.9);
      this.add
        .text(p.x, p.y - 2, p.num, {
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#ffffff'
        })
        .setOrigin(0.5);

      const coin = this.add.sprite(p.x, p.y - 52, 'coin_0').setScale(0.9);
      coin.play('coin_spin');
    });

    // 6. Original Hero Performing Idle Animation in the Meadow
    const charId = progressManager.getSelectedCharacter();
    this.heroSprite = this.add.sprite(500, height - 102, `${charId}_idle_0`).setScale(1.25);
    this.heroSprite.play(`${charId}_idle`);

    // 7. Gentle Floating Sparkle Particles
    if (!progressManager.getSettings().reducedMotion) {
      this.add.particles(0, 0, 'particle_sparkle', {
        x: { min: 50, max: width - 50 },
        y: { min: 80, max: height - 100 },
        lifespan: 3500,
        speedY: { min: -15, max: -35 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.7, end: 0 },
        frequency: 260,
        blendMode: 'ADD'
      });
    }

    // Listen for character changes from UI so the background hero updates live
    this.events.on('update-hero', (newCharId) => {
      if (this.heroSprite && this.heroSprite.scene) {
        this.heroSprite.play(`${newCharId}_idle`, true);
      }
    });

    // Notify UIManager that MenuScene is active
    if (window.uiManager && !window.uiManager.hasInitializedMenu) {
      window.uiManager.hasInitializedMenu = true;
      window.uiManager.showMainMenu();
    }
  }

  update() {
    if (progressManager.getSettings().reducedMotion) return;
    const { width } = this.scale;
    for (const c of this.clouds) {
      c.sprite.x += c.speed;
      if (c.sprite.x > width + 120) {
        c.sprite.x = -120;
      }
    }
  }
}
