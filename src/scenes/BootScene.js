/**
 * BootScene: Generates all procedural 3D-shaded textures and animations
 * before launching MenuScene.
 */

import Phaser from 'phaser';
import { generateAllGameAssets } from '../graphics/AssetGenerator.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    generateAllGameAssets(this);
    this.scene.start('MenuScene');
  }
}
