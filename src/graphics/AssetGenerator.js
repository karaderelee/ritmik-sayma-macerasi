/**
 * Procedural 3D-Inspired Asset & Animation Generator for Phaser 3
 * Generates all character frames, world tiles, numbered platforms,
 * collectibles, checkpoints, flagpoles, and scenic props locally.
 */

import { CHARACTERS, drawCharacterFrame } from '../data/characters.js';
import { WORLDS } from '../data/levels.js';

export function generateAllGameAssets(scene) {
  generateParticleTextures(scene);
  generateCharacterAssets(scene);
  generateCollectibleAssets(scene);
  generatePlatformAssets(scene);
  generateCheckpointAndFlagAssets(scene);
  generateScenicProps(scene);
}

function createCanvasTex(scene, key, width, height, drawFn) {
  if (scene.textures.exists(key)) return;
  const canvasTex = scene.textures.createCanvas(key, width, height);
  const ctx = canvasTex.getContext();
  drawFn(ctx, width, height);
  canvasTex.refresh();
}

function generateParticleTextures(scene) {
  createCanvasTex(scene, 'particle_sparkle', 24, 24, (ctx, w, h) => {
    const grad = ctx.createRadialGradient(12, 12, 1, 12, 12, 11);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, '#fef08a');
    grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(12, 12, 11, 0, Math.PI * 2);
    ctx.fill();
  });

  createCanvasTex(scene, 'particle_dust', 16, 16, (ctx) => {
    const grad = ctx.createRadialGradient(8, 8, 1, 8, 8, 7);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, Math.PI * 2);
    ctx.fill();
  });
}

function generateCharacterAssets(scene) {
  const frameDefs = [
    { suffix: 'idle_0', pose: 'idle', time: 0 },
    { suffix: 'idle_1', pose: 'idle', time: 0.4 },
    { suffix: 'run_0', pose: 'run1', time: 0.05 },
    { suffix: 'run_1', pose: 'run1', time: 0.15 },
    { suffix: 'run_2', pose: 'run2', time: 0.05 },
    { suffix: 'run_3', pose: 'run2', time: 0.15 },
    { suffix: 'jump_0', pose: 'jump', time: 0 },
    { suffix: 'land_0', pose: 'land', time: 0 },
    { suffix: 'victory_0', pose: 'victory', time: 0.08 },
    { suffix: 'victory_1', pose: 'victory', time: 0.3 }
  ];

  for (const char of CHARACTERS) {
    for (const f of frameDefs) {
      const key = `${char.id}_${f.suffix}`;
      createCanvasTex(scene, key, 96, 96, (ctx, w, h) => {
        drawCharacterFrame(ctx, char, f.pose, f.time, w, h);
      });
    }

    // Create Phaser animations for each character
    if (!scene.anims.exists(`${char.id}_idle`)) {
      scene.anims.create({
        key: `${char.id}_idle`,
        frames: [{ key: `${char.id}_idle_0` }, { key: `${char.id}_idle_1` }],
        frameRate: 3,
        repeat: -1
      });
      scene.anims.create({
        key: `${char.id}_run`,
        frames: [
          { key: `${char.id}_run_0` },
          { key: `${char.id}_run_1` },
          { key: `${char.id}_run_2` },
          { key: `${char.id}_run_3` }
        ],
        frameRate: 10,
        repeat: -1
      });
      scene.anims.create({
        key: `${char.id}_jump`,
        frames: [{ key: `${char.id}_jump_0` }],
        frameRate: 1,
        repeat: 0
      });
      scene.anims.create({
        key: `${char.id}_land`,
        frames: [{ key: `${char.id}_land_0` }],
        frameRate: 1,
        repeat: 0
      });
      scene.anims.create({
        key: `${char.id}_victory`,
        frames: [{ key: `${char.id}_victory_0` }, { key: `${char.id}_victory_1` }],
        frameRate: 5,
        repeat: -1
      });
    }
  }
}

function generateCollectibleAssets(scene) {
  // 4-frame rotating coin
  const widths = [32, 22, 10, 22];
  widths.forEach((cw, idx) => {
    createCanvasTex(scene, `coin_${idx}`, 40, 40, (ctx) => {
      ctx.save();
      ctx.translate(20, 20);
      const grad = ctx.createLinearGradient(-cw / 2, -16, cw / 2, 16);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#facc15');
      grad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, cw / 2, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (cw > 14) {
        ctx.strokeStyle = '#fef9c3';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, cw / 2 - 4, 11, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });
  });

  if (!scene.anims.exists('coin_spin')) {
    scene.anims.create({
      key: 'coin_spin',
      frames: [{ key: 'coin_0' }, { key: 'coin_1' }, { key: 'coin_2' }, { key: 'coin_3' }],
      frameRate: 8,
      repeat: -1
    });
  }

  // 3D Golden Star
  createCanvasTex(scene, 'star_item', 52, 52, (ctx) => {
    ctx.save();
    ctx.translate(26, 26);
    drawStarShape(ctx, 0, 0, 5, 22, 10, '#fde047', '#ca8a04');
    // Cute eyes on star
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-4, -1, 2.2, 0, Math.PI * 2);
    ctx.arc(4, -1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawStarShape(ctx, cx, cy, spikes, outerR, innerR, fill, stroke) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  const grad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, outerR);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, fill);
  grad.addColorStop(1, '#eab308');

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerR;
    y = cy + Math.sin(rot) * outerR;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerR;
    y = cy + Math.sin(rot) * innerR;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function generatePlatformAssets(scene) {
  // Menu Sky Gradient Texture
  createCanvasTex(scene, 'sky_menu', 1280, 720, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.65, '#bae6fd');
    grad.addColorStop(1, '#fef9c3');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });

  for (const world of WORLDS) {
    const t = world.theme;
    // World Sky Gradient Texture
    createCanvasTex(scene, `sky_${world.key}`, 1280, 720, (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, t.skyTop);
      grad.addColorStop(1, t.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    });

    // Far Rolling Hills Texture (1280 x 340)
    createCanvasTex(scene, `hills_far_${world.key}`, 1280, 340, (ctx, w, h) => {
      ctx.fillStyle = t.hillFar;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, 140);
      ctx.quadraticCurveTo(w * 0.25, 30, w * 0.5, 130);
      ctx.quadraticCurveTo(w * 0.75, 220, w, 140);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    });

    // Near Rolling Hills Texture (1280 x 260)
    createCanvasTex(scene, `hills_near_${world.key}`, 1280, 260, (ctx, w, h) => {
      ctx.fillStyle = t.hillNear;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, 110);
      ctx.quadraticCurveTo(w * 0.3, 25, w * 0.6, 115);
      ctx.quadraticCurveTo(w * 0.82, 175, w, 110);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    });

    // Ground segment block (256 x 80)
    createCanvasTex(scene, `ground_${world.key}`, 256, 80, (ctx, w, h) => {
      // Main body
      const bodyGrad = ctx.createLinearGradient(0, 16, 0, h);
      bodyGrad.addColorStop(0, t.groundBody);
      bodyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(2, 10, w - 4, h - 12, 14);
      ctx.fill();
      ctx.stroke();

      // Top lush layer
      ctx.fillStyle = t.groundTop;
      ctx.beginPath();
      ctx.roundRect(2, 2, w - 4, 24, 12);
      ctx.fill();
      ctx.stroke();

      // Top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.roundRect(10, 5, w - 20, 6, 4);
      ctx.fill();
    });

    // Floating scenic platform (160 x 44)
    createCanvasTex(scene, `platform_${world.key}`, 160, 44, (ctx, w, h) => {
      ctx.fillStyle = t.platformBody;
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(2, 8, w - 4, h - 10, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = t.platformTop;
      ctx.beginPath();
      ctx.roundRect(2, 2, w - 4, 18, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.roundRect(10, 5, w - 20, 5, 3);
      ctx.fill();
    });
  }

  // Numbered Math Platforms (High-contrast 3D Beveled Badges: 128 x 54)
  const mathStates = [
    {
      key: 'math_platform_step',
      top: '#38bdf8',
      bottom: '#0369a1',
      border: '#bae6fd'
    },
    {
      key: 'math_platform_neutral',
      top: '#fbbf24',
      bottom: '#b45309',
      border: '#fef08a'
    },
    {
      key: 'math_platform_correct',
      top: '#22c55e',
      bottom: '#15803d',
      border: '#bbf7d0'
    },
    {
      key: 'math_platform_wrong',
      top: '#fb7185',
      bottom: '#be123c',
      border: '#fecdd3'
    },
    {
      key: 'math_platform_hint',
      top: '#a855f7',
      bottom: '#6b21a8',
      border: '#fde047'
    }
  ];

  for (const st of mathStates) {
    createCanvasTex(scene, st.key, 128, 54, (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, st.top);
      grad.addColorStop(1, st.bottom);

      ctx.fillStyle = grad;
      ctx.strokeStyle = st.border;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(3, 3, w - 6, h - 6, 16);
      ctx.fill();
      ctx.stroke();

      // Inner dark plate for ultra-crisp number contrast
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.beginPath();
      ctx.roundRect(12, 9, w - 24, h - 18, 11);
      ctx.fill();

      // Glossy top shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.beginPath();
      ctx.roundRect(14, 6, w - 28, 7, 4);
      ctx.fill();
    });
  }

  // Safe Bouncy Mushroom Trampoline (76 x 56)
  createCanvasTex(scene, 'bouncy_mushroom', 76, 56, (ctx) => {
    // Stem
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(26, 26, 24, 28, 6);
    ctx.fill();
    ctx.stroke();

    // Glowing bouncy cap
    const capGrad = ctx.createRadialGradient(38, 14, 4, 38, 22, 34);
    capGrad.addColorStop(0, '#f472b6');
    capGrad.addColorStop(1, '#db2777');
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.ellipse(38, 22, 34, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fdf2f8';
    [20, 38, 56].forEach((cx) => {
      ctx.beginPath();
      ctx.arc(cx, 18, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

function generateCheckpointAndFlagAssets(scene) {
  // Checkpoint Lantern (64 x 110)
  ['checkpoint_off', 'checkpoint_on'].forEach((key) => {
    const active = key === 'checkpoint_on';
    createCanvasTex(scene, key, 64, 110, (ctx) => {
      // Base & Post
      ctx.fillStyle = '#475569';
      ctx.fillRect(28, 34, 8, 72);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(14, 96, 36, 12, 5);
      ctx.fill();

      // Crystal Orb
      const grad = ctx.createRadialGradient(32, 24, 2, 32, 24, 20);
      if (active) {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#4ade80');
        grad.addColorStop(1, '#15803d');
      } else {
        grad.addColorStop(0, '#cbd5e1');
        grad.addColorStop(1, '#475569');
      }
      ctx.fillStyle = grad;
      ctx.strokeStyle = active ? '#fde047' : '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(32, 24, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  });

  // Finish Flagpole Base & Pole (80 x 320)
  createCanvasTex(scene, 'flagpole_base', 80, 320, (ctx) => {
    // Pedestal
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(10, 286, 60, 30, 8);
    ctx.fill();
    ctx.stroke();

    // Metallic Pole
    const poleGrad = ctx.createLinearGradient(34, 0, 46, 0);
    poleGrad.addColorStop(0, '#f8fafc');
    poleGrad.addColorStop(0.5, '#cbd5e1');
    poleGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = poleGrad;
    ctx.fillRect(35, 28, 10, 260);

    // Top Golden Finial Orb
    const orbGrad = ctx.createRadialGradient(37, 18, 2, 40, 22, 16);
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(0.4, '#fde047');
    orbGrad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(40, 22, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Flag Banner Locked vs Unlocked (110 x 68)
  createCanvasTex(scene, 'flag_banner_locked', 110, 68, (ctx) => {
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(4, 6);
    ctx.lineTo(102, 22);
    ctx.lineTo(84, 36);
    ctx.lineTo(102, 50);
    ctx.lineTo(4, 62);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lock icon in center
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.roundRect(34, 28, 20, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(44, 26, 7, Math.PI, 0, false);
    ctx.stroke();
  });

  createCanvasTex(scene, 'flag_banner_unlocked', 110, 68, (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, 100, 60);
    grad.addColorStop(0, '#22c55e');
    grad.addColorStop(1, '#16a34a');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(4, 6);
    ctx.lineTo(104, 22);
    ctx.lineTo(86, 36);
    ctx.lineTo(104, 50);
    ctx.lineTo(4, 62);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    drawStarShape(ctx, 44, 34, 5, 15, 7, '#fde047', '#ca8a04');
  });
}

function generateScenicProps(scene) {
  // Fluffy 3D Cloud
  createCanvasTex(scene, 'deco_cloud_puff', 180, 90, (ctx) => {
    const grad = ctx.createLinearGradient(0, 15, 0, 80);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(1, 'rgba(224, 242, 254, 0.85)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(52, 54, 28, 0, Math.PI * 2);
    ctx.arc(90, 40, 34, 0, Math.PI * 2);
    ctx.arc(130, 54, 26, 0, Math.PI * 2);
    ctx.roundRect(45, 48, 90, 32, 16);
    ctx.fill();
  });

  // Lush Fantasy Tree
  createCanvasTex(scene, 'deco_tree', 120, 160, (ctx) => {
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(48, 86, 24, 70, 6);
    ctx.fill();

    const foliageGrad = ctx.createRadialGradient(52, 50, 8, 60, 65, 55);
    foliageGrad.addColorStop(0, '#86efac');
    foliageGrad.addColorStop(0.5, '#22c55e');
    foliageGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = foliageGrad;
    ctx.beginPath();
    ctx.arc(60, 52, 38, 0, Math.PI * 2);
    ctx.arc(36, 78, 28, 0, Math.PI * 2);
    ctx.arc(84, 78, 28, 0, Math.PI * 2);
    ctx.fill();
  });

  // Distant Magical Castle Silhouette
  createCanvasTex(scene, 'deco_castle_distant', 260, 240, (ctx) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;

    // Main keep & towers
    ctx.fillRect(70, 90, 120, 140);
    ctx.fillRect(40, 70, 36, 160);
    ctx.fillRect(184, 70, 36, 160);
    ctx.fillRect(110, 45, 40, 185);

    // Conical roofs
    ctx.fillStyle = '#ec4899';
    [
      [34, 70, 58, 24, 82, 70],
      [178, 70, 202, 24, 226, 70],
      [102, 45, 130, 6, 158, 45]
    ].forEach(([x1, y1, x2, y2, x3, y3]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
    });

    // Golden windows & gate
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(130, 230, 24, Math.PI, 0, false);
    ctx.fill();
  });
}
