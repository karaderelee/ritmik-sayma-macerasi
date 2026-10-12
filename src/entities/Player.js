/**
 * Player Controller for "Ritmik Sayma Macerası"
 * Supports:
 * - Keyboard Arrow Keys (ArrowLeft, ArrowRight, ArrowUp, Space) as primary controls
 * - Interactive Whiteboard (Etkileşimli Tahta) touch controls via virtualInput
 * - Hold-Jump Hover/Float ("Zıplama tuşunu bırakıncaya kadar havada kalma / yükselme")
 *   so the player can effortlessly reach any answer box, including the furthest back box.
 */

import Phaser from 'phaser';
import { audioManager } from '../audio/AudioManager.js';
import { progressManager } from '../storage/ProgressManager.js';

// Shared input state for Interactive Whiteboard touch buttons and global keyboard tracking
export const virtualInput = {
  left: false,
  right: false,
  up: false,
  reset() {
    this.left = false;
    this.right = false;
    this.up = false;
  }
};

export const keyboardInput = {
  left: false,
  right: false,
  up: false,
  initialized: false,
  init() {
    if (this.initialized) return;
    this.initialized = true;

    const handleKey = (e, isDown) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      const code = e.code || '';
      const key = e.key || '';

      let matched = false;

      if (
        code === 'ArrowLeft' ||
        key === 'ArrowLeft' ||
        key === 'Left' ||
        code === 'KeyA' ||
        key === 'a' ||
        key === 'A'
      ) {
        this.left = isDown;
        matched = true;
      }

      if (
        code === 'ArrowRight' ||
        key === 'ArrowRight' ||
        key === 'Right' ||
        code === 'KeyD' ||
        key === 'd' ||
        key === 'D'
      ) {
        this.right = isDown;
        matched = true;
      }

      if (
        code === 'ArrowUp' ||
        key === 'ArrowUp' ||
        key === 'Up' ||
        code === 'Space' ||
        key === ' ' ||
        code === 'KeyW' ||
        key === 'w' ||
        key === 'W'
      ) {
        this.up = isDown;
        matched = true;
      }

      if (matched || code === 'ArrowDown' || key === 'ArrowDown') {
        if (document.activeElement && document.activeElement !== document.body) {
          document.activeElement.blur?.();
        }
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', (e) => handleKey(e, true), {
      capture: true,
      passive: false
    });
    window.addEventListener('keyup', (e) => handleKey(e, false), {
      capture: true,
      passive: false
    });
    window.addEventListener('blur', () => {
      this.left = false;
      this.right = false;
      this.up = false;
      virtualInput.reset();
    });
  }
};

export class Player {
  constructor(scene, x, y, charId) {
    this.scene = scene;
    this.charId = charId;

    keyboardInput.init();
    virtualInput.reset();

    this.sprite = scene.physics.add.sprite(x, y, `${charId}_idle_0`);
    this.sprite.setDepth(15);
    this.sprite.setCollideWorldBounds(false);

    // Hitbox tuned for forgiving, accurate platforming
    this.sprite.body.setSize(42, 66);
    this.sprite.body.setOffset(27, 22);
    this.sprite.body.setMaxVelocity(360, 820);
    this.sprite.body.setDragX(1400);

    // Movement & jump/hover parameters
    this.moveSpeed = 310;
    this.jumpVelocity = -620;
    this.coyoteTimeMs = 170;
    this.lastGroundedTime = 0;
    this.wasGrounded = false;
    this.isHovering = false;
    this.lastHoverSparkleTime = 0;
    this.isCelebrating = false;
    this.controlsEnabled = true;

    // Also keep Phaser cursor keys synced for automated tests & standard input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keySpace = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.sprite.play(`${this.charId}_idle`, true);
  }

  update(time) {
    if (!this.sprite || !this.sprite.body) return;

    const body = this.sprite.body;
    const grounded = body.blocked.down || body.touching.down;

    if (grounded) {
      this.lastGroundedTime = time;
      this.isHovering = false;
      if (!this.wasGrounded) {
        audioManager.playLand();
        this.spawnDustParticles();
      }
    }
    this.wasGrounded = grounded;

    if (!this.controlsEnabled || this.isCelebrating) {
      body.setVelocityX(0);
      if (this.isCelebrating) {
        this.sprite.play(`${this.charId}_victory`, true);
      }
      return;
    }

    const leftDown =
      keyboardInput.left ||
      virtualInput.left ||
      Boolean(this.cursors?.left?.isDown);
    const rightDown =
      keyboardInput.right ||
      virtualInput.right ||
      Boolean(this.cursors?.right?.isDown);
    const jumpDown =
      keyboardInput.up ||
      virtualInput.up ||
      Boolean(this.cursors?.up?.isDown) ||
      Boolean(this.keySpace?.isDown);

    // Horizontal movement
    if (leftDown && !rightDown) {
      body.setVelocityX(-this.moveSpeed);
      this.sprite.setFlipX(true);
    } else if (rightDown && !leftDown) {
      body.setVelocityX(this.moveSpeed);
      this.sprite.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    // Jump & Hold-to-Hover ("Zıplama tuşunu bırakıncaya kadar havada kalma")
    const canCoyoteJump =
      grounded || time - this.lastGroundedTime <= this.coyoteTimeMs;

    if (jumpDown) {
      if (canCoyoteJump && !this.isHovering) {
        // Initial jump launch from ground
        body.setVelocityY(this.jumpVelocity);
        this.isHovering = true;
        this.lastGroundedTime = 0;
        audioManager.playJump();
        this.spawnDustParticles();
      } else {
        // Holding Jump in mid-air:
        // If below comfortable flight ceiling (y > 350), smoothly ascend;
        // once at peak height (y <= 350), hover steadily in the air until the key is released!
        this.isHovering = true;
        if (this.sprite.y > 355) {
          body.setVelocityY(Math.min(body.velocity.y, -340));
        } else {
          // Hover in place horizontally so player can steer over any answer box
          body.setVelocityY(Math.sin(time * 0.012) * 18);
        }

        if (time - this.lastHoverSparkleTime > 140) {
          this.lastHoverSparkleTime = time;
          this.spawnHoverSparkle();
        }
      }
    } else {
      this.isHovering = false;
    }

    // Animation state machine
    if (!grounded) {
      this.sprite.play(`${this.charId}_jump`, true);
    } else if (Math.abs(body.velocity.x) > 15) {
      this.sprite.play(`${this.charId}_run`, true);
    } else {
      this.sprite.play(`${this.charId}_idle`, true);
    }
  }

  triggerHappyReaction() {
    if (!this.sprite) return;
    const reduced = progressManager.getSettings().reducedMotion;
    if (!reduced) {
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 130,
        yoyo: true,
        repeat: 1
      });
    }
  }

  startVictoryPose() {
    this.isCelebrating = true;
    if (this.sprite && this.sprite.body) {
      this.sprite.body.setVelocityX(0);
      this.sprite.play(`${this.charId}_victory`, true);
    }
  }

  spawnHoverSparkle() {
    if (progressManager.getSettings().reducedMotion) return;
    if (!this.scene || !this.sprite) return;

    const emitter = this.scene.add.particles(
      this.sprite.x,
      this.sprite.y + 34,
      'particle_sparkle',
      {
        speedY: { min: 30, max: 80 },
        speedX: { min: -30, max: 30 },
        scale: { start: 0.45, end: 0 },
        lifespan: 240,
        quantity: 2,
        blendMode: 'ADD',
        emitting: false
      }
    );
    emitter.setDepth(14);
    emitter.explode(2);
    this.scene.time.delayedCall(280, () => emitter.destroy());
  }

  spawnDustParticles() {
    if (progressManager.getSettings().reducedMotion) return;
    if (!this.scene || !this.sprite) return;

    const emitter = this.scene.add.particles(
      this.sprite.x,
      this.sprite.y + 30,
      'particle_dust',
      {
        speed: { min: 20, max: 70 },
        angle: { min: 200, max: 340 },
        scale: { start: 0.9, end: 0 },
        lifespan: 320,
        quantity: 5,
        emitting: false
      }
    );
    emitter.setDepth(14);
    emitter.explode(5);
    this.scene.time.delayedCall(400, () => emitter.destroy());
  }
}
