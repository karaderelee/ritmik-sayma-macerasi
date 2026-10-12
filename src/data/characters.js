/**
 * Original Playable Characters for "Ritmik Sayma Macerası"
 * Includes character metadata and 3D-inspired procedural canvas rendering
 * for both UI animated previews and Phaser sprite frames.
 */

export const CHARACTERS = [
  {
    id: 'kirmizi_kasif',
    name: 'Kırmızı Kaşif',
    title: 'Cesur Macera Öncüsü',
    badgeText: 'Cesur & Atik',
    badgeColor: '#ef4444',
    description: 'Kırmızı kaşif şapkası ve altın pusulasıyla sayı tepelerini aşmaya her zaman hazır!',
    palette: {
      primary: '#ef4444',
      primaryDark: '#b91c1c',
      primaryLight: '#fca5a5',
      secondary: '#2563eb',
      secondaryDark: '#1d4ed8',
      accent: '#fbbf24',
      skin: '#ffedd5',
      skinShadow: '#fdba74',
      shoes: '#78350f'
    }
  },
  {
    id: 'yesil_kasif',
    name: 'Yeşil Kaşif',
    title: 'Neşeli Orman Gezgini',
    badgeText: 'Neşeli & Meraklı',
    badgeColor: '#10b981',
    description: 'Zümrüt yeşili pelerini ve doğa dürbünüyle en gizli sayı örüntülerini bile keşfeder!',
    palette: {
      primary: '#10b981',
      primaryDark: '#047857',
      primaryLight: '#6ee7b7',
      secondary: '#0f766e',
      secondaryDark: '#115e59',
      accent: '#fde047',
      skin: '#ffedd5',
      skinShadow: '#fdba74',
      shoes: '#451a03'
    }
  },
  {
    id: 'prenses_lila',
    name: 'Prenses Lila',
    title: 'Bilge Yıldız Gezgini',
    badgeText: 'Bilge & Zarif',
    badgeColor: '#a855f7',
    description: 'Parlak yıldız tacı ve renkli kraliyet kıyafetiyle bulutların üzerindeki sayıları çözer!',
    palette: {
      primary: '#a855f7',
      primaryDark: '#6b21a8',
      primaryLight: '#e9d5ff',
      secondary: '#ec4899',
      secondaryDark: '#be185d',
      accent: '#fef08a',
      skin: '#fff1f2',
      skinShadow: '#fecdd3',
      shoes: '#831843'
    }
  },
  {
    id: 'mantar_dost',
    name: 'Mantar Dost',
    title: 'Sevimli Orman Rehberi',
    badgeText: 'Sevimli & Dost Canlısı',
    badgeColor: '#f97316',
    description: 'Işıltılı benekli şapkası ve minik fener çantasıyla Mantar Ormanı’nın en neşeli rehberi!',
    palette: {
      primary: '#f97316',
      primaryDark: '#c2410c',
      primaryLight: '#fed7aa',
      secondary: '#0ea5e9',
      secondaryDark: '#0369a1',
      accent: '#fef08a',
      skin: '#fffbeb',
      skinShadow: '#fde68a',
      shoes: '#9a3412'
    }
  },
  {
    id: 'dino_pati',
    name: 'Dino Pati',
    title: 'Sevimli Dinozor Yoldaş',
    badgeText: 'Enerjik & Sadık',
    badgeColor: '#06b6d4',
    description: 'Turkuaz sırt dikenleri, kaşif fuları ve neşeli kuyruğuyla zıplayarak saymayı çok sever!',
    palette: {
      primary: '#06b6d4',
      primaryDark: '#0e7490',
      primaryLight: '#a5f3fc',
      secondary: '#f59e0b',
      secondaryDark: '#b45309',
      accent: '#fde047',
      skin: '#cffafe',
      skinShadow: '#67e8f9',
      shoes: '#ea580c'
    }
  }
];

export function getCharacterById(id) {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}

/**
 * Draws an original 3D-shaded stylized character onto a 2D canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} char - Character definition object
 * @param {string} pose - 'idle' | 'run1' | 'run2' | 'jump' | 'land' | 'victory'
 * @param {number} time - Animation timestamp in seconds
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export function drawCharacterFrame(ctx, char, pose = 'idle', time = 0, width = 96, height = 96) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2 + 6;
  const scale = width / 96;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Calculate pose offsets for smooth 3D-like squash & stretch
  let bobY = 0;
  let squashX = 1;
  let stretchY = 1;
  let leftLegAngle = 0;
  let rightLegAngle = 0;
  let leftArmAngle = 0.2;
  let rightArmAngle = -0.2;
  let bodyTilt = 0;

  if (pose === 'idle') {
    bobY = Math.sin(time * 4) * 2.2;
    squashX = 1 + Math.sin(time * 4) * 0.025;
    stretchY = 1 - Math.sin(time * 4) * 0.025;
    leftArmAngle = 0.25 + Math.sin(time * 4) * 0.08;
    rightArmAngle = -0.25 - Math.sin(time * 4) * 0.08;
  } else if (pose === 'run1' || pose === 'run2') {
    const phase = pose === 'run1' ? time * 10 : time * 10 + Math.PI;
    bobY = -Math.abs(Math.sin(phase)) * 4;
    bodyTilt = 0.1;
    leftLegAngle = Math.sin(phase) * 0.55;
    rightLegAngle = -Math.sin(phase) * 0.55;
    leftArmAngle = -Math.sin(phase) * 0.5;
    rightArmAngle = Math.sin(phase) * 0.5;
  } else if (pose === 'jump') {
    bobY = -6;
    squashX = 0.92;
    stretchY = 1.09;
    leftLegAngle = -0.35;
    rightLegAngle = 0.45;
    leftArmAngle = -0.85;
    rightArmAngle = -2.3; // Raised right arm
  } else if (pose === 'land') {
    bobY = 5;
    squashX = 1.14;
    stretchY = 0.86;
    leftLegAngle = -0.25;
    rightLegAngle = 0.25;
    leftArmAngle = 0.6;
    rightArmAngle = -0.6;
  } else if (pose === 'victory') {
    bobY = -Math.abs(Math.sin(time * 7)) * 6;
    squashX = 1 + Math.sin(time * 7) * 0.04;
    stretchY = 1 - Math.sin(time * 7) * 0.04;
    leftArmAngle = -2.4 + Math.sin(time * 10) * 0.2;
    rightArmAngle = 2.4 - Math.sin(time * 10) * 0.2;
    leftLegAngle = -0.2;
    rightLegAngle = 0.2;
  }

  // Soft ground ambient shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
  ctx.beginPath();
  const shadowWidth = Math.max(14, 24 - Math.max(0, -bobY));
  ctx.ellipse(0, 34, shadowWidth, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.translate(0, bobY);
  ctx.scale(squashX, stretchY);
  ctx.rotate(bodyTilt);

  const p = char.palette;

  // Special tail or cape behind body
  if (char.id === 'dino_pati') {
    ctx.save();
    ctx.fillStyle = p.primary;
    ctx.strokeStyle = p.primaryDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 12);
    ctx.quadraticCurveTo(-32, 18 + Math.sin(time * 6) * 4, -28, 4);
    ctx.quadraticCurveTo(-20, 4, -12, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (char.id === 'prenses_lila' || char.id === 'yesil_kasif') {
    // Flowing adventure cape
    ctx.save();
    ctx.fillStyle = char.id === 'prenses_lila' ? p.secondary : p.primaryDark;
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.quadraticCurveTo(-24, 14, -18, 26);
    ctx.lineTo(14, 24);
    ctx.quadraticCurveTo(18, 10, 12, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Legs & Boots
  drawLimb(ctx, -8, 18, leftLegAngle, p.secondaryDark, p.shoes);
  drawLimb(ctx, 8, 18, rightLegAngle, p.secondaryDark, p.shoes);

  // Torso (3D shaded rounded body)
  ctx.save();
  const bodyGrad = ctx.createRadialGradient(-5, 0, 3, 0, 6, 22);
  bodyGrad.addColorStop(0, p.secondary);
  bodyGrad.addColorStop(1, p.secondaryDark);
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (char.id === 'prenses_lila') {
    // Royal adventure tunic flare
    ctx.moveTo(-13, -4);
    ctx.lineTo(13, -4);
    ctx.quadraticCurveTo(19, 16, 17, 22);
    ctx.lineTo(-17, 22);
    ctx.quadraticCurveTo(-19, 16, -13, -4);
  } else {
    ctx.roundRect(-15, -4, 30, 25, 11);
  }
  ctx.fill();
  ctx.stroke();

  // Chest emblem / compass / scarf
  ctx.fillStyle = p.accent;
  ctx.beginPath();
  ctx.arc(0, 7, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  // Arms
  drawArm(ctx, -15, 2, leftArmAngle, p.primary, p.skin);
  drawArm(ctx, 15, 2, rightArmAngle, p.primary, p.skin);

  // Head (Large expressive 3D-shaded head)
  ctx.save();
  ctx.translate(0, -16);
  const headGrad = ctx.createRadialGradient(-6, -6, 4, 0, 0, 20);
  headGrad.addColorStop(0, '#ffffff');
  headGrad.addColorStop(0.25, p.skin);
  headGrad.addColorStop(1, p.skinShadow);

  ctx.fillStyle = headGrad;
  ctx.strokeStyle = 'rgba(0,0,0,0.32)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 15.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(244, 63, 94, 0.28)';
  ctx.beginPath();
  ctx.ellipse(-9.5, 3.5, 3.8, 2.2, 0, 0, Math.PI * 2);
  ctx.ellipse(9.5, 3.5, 3.8, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Expressive Eyes with catchlights
  drawEye(ctx, -6, -1.5, pose === 'victory');
  drawEye(ctx, 6, -1.5, pose === 'victory');

  // Cheerful Mouth
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (pose === 'jump' || pose === 'victory') {
    ctx.fillStyle = '#be123c';
    ctx.arc(0, 5, 4.2, 0, Math.PI, false);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.arc(0, 4.2, 4, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();
  }

  // Character-Specific Headgear / Crown / Mushroom Cap / Dino Crest
  drawHeadgear(ctx, char);

  ctx.restore();
  ctx.restore();
}

function drawLimb(ctx, x, y, angle, pantColor, shoeColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = pantColor;
  ctx.beginPath();
  ctx.roundRect(-4.5, 0, 9, 10, 4);
  ctx.fill();

  ctx.fillStyle = shoeColor;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(-5.5, 7, 13, 8, 4);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawArm(ctx, x, y, angle, sleeveColor, handColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = sleeveColor;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(-4, 0, 8, 12, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = handColor;
  ctx.beginPath();
  ctx.arc(0, 13, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawEye(ctx, x, y, happySquint = false) {
  ctx.save();
  ctx.translate(x, y);
  if (happySquint) {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 1, 3.8, Math.PI, 0, false);
    ctx.stroke();
  } else {
    // Sclera
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.8, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris/Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0.5, 0, 2.5, 3.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Specular catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-0.6, -1.5, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHeadgear(ctx, char) {
  const p = char.palette;
  ctx.save();

  if (char.id === 'kirmizi_kasif' || char.id === 'yesil_kasif') {
    // Explorer Dome Cap with Visor & Goggle Strap
    const capGrad = ctx.createRadialGradient(-5, -14, 2, 0, -10, 20);
    capGrad.addColorStop(0, p.primaryLight);
    capGrad.addColorStop(0.4, p.primary);
    capGrad.addColorStop(1, p.primaryDark);

    ctx.fillStyle = capGrad;
    ctx.strokeStyle = 'rgba(0,0,0,0.38)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -6, 17.5, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Visor brim
    ctx.fillStyle = p.primaryDark;
    ctx.beginPath();
    ctx.ellipse(4, -6, 18, 4.5, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Badge on cap
    ctx.fillStyle = p.accent;
    ctx.beginPath();
    ctx.arc(0, -12, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (char.id === 'prenses_lila') {
    // Stylish hair + Star Tiara
    ctx.fillStyle = '#7e22ce';
    ctx.beginPath();
    ctx.arc(0, -5, 18, Math.PI * 0.95, Math.PI * 0.05, false);
    ctx.fill();

    // Golden Crown / Star Tiara
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-11, -13);
    ctx.lineTo(-7, -23);
    ctx.lineTo(-2, -16);
    ctx.lineTo(0, -26);
    ctx.lineTo(2, -16);
    ctx.lineTo(7, -23);
    ctx.lineTo(11, -13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gem in crown
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(0, -17, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (char.id === 'mantar_dost') {
    // Oversized 3D Spotted Mushroom Dome Cap
    const domeGrad = ctx.createRadialGradient(-6, -18, 4, 0, -14, 24);
    domeGrad.addColorStop(0, p.primaryLight);
    domeGrad.addColorStop(0.35, p.primary);
    domeGrad.addColorStop(1, p.primaryDark);

    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = 'rgba(0,0,0,0.38)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -12, 23, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing cream spots
    ctx.fillStyle = '#fef9c3';
    [
      [-11, -12, 4.5],
      [0, -18, 5.2],
      [11, -11, 4.2]
    ].forEach(([sx, sy, sr]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (char.id === 'dino_pati') {
    // Cheerful Dinosaur dorsal crest spikes & explorer goggles
    ctx.fillStyle = p.secondary;
    ctx.strokeStyle = p.secondaryDark;
    ctx.lineWidth = 1.6;
    [
      [-9, -14, 5],
      [-2, -17, 6],
      [6, -15, 5]
    ].forEach(([sx, sy, sr]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  ctx.restore();
}
