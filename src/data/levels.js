/**
 * Data-Driven Worlds and Levels Configuration for "Ritmik Sayma Macerası"
 * Covers all skip-counting intervals from 2 to 10 (2, 3, 4, 5, 6, 7, 8, 9, 10)
 * in both Forward (İleriye) and Backward (Geriye) directions, plus custom practice mode.
 */

import {
  ACTIVITY_TYPES,
  COUNTING_DIRECTIONS,
  getStepLabel
} from '../math/MathGenerator.js';

export const WORLDS = [
  {
    id: 1,
    key: 'yesil_krallik',
    name: 'YEŞİL KRALLIK',
    subtitle: "2'şer, 5'er ve 10'ar (İleri ve Geri)",
    difficultyLabel: 'Başlangıç',
    description:
      'Yemyeşil tepeler ve ahşap köprüler arasında 2’şer, 5’er ve 10’ar ileriye ve geriye ritmik sayma!',
    theme: {
      skyTop: '#0284c7',
      skyBottom: '#bae6fd',
      hillFar: '#34d399',
      hillNear: '#10b981',
      groundTop: '#22c55e',
      groundBody: '#854d0e',
      platformTop: '#4ade80',
      platformBody: '#a16207',
      accentColor: '#16a34a',
      cardGradient: 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)'
    },
    levels: [
      {
        id: '1-1',
        worldId: 1,
        levelNumber: 1,
        name: 'Çiçekli Patika (İleriye)',
        introText:
          "Yeşil Krallık'a hoş geldin! 2'şer ve 10'ar İLERİYE ritmik sayarak doğru platformlara zıpla!",
        allowedSteps: [2, 10],
        directionMode: COUNTING_DIRECTIONS.FORWARD,
        activityTypes: [
          ACTIVITY_TYPES.NEXT_NUMBER,
          ACTIVITY_TYPES.IDENTIFY_PLATFORM
        ],
        difficulty: 1,
        challengeCount: 3
      },
      {
        id: '1-2',
        worldId: 1,
        levelNumber: 2,
        name: 'Ahşap Köprü (Geriye)',
        introText:
          "Şimdi 2'şer ve 10'ar GERİYE doğru ritmik sayarak köprüleri geçelim!",
        allowedSteps: [2, 10],
        directionMode: COUNTING_DIRECTIONS.BACKWARD,
        activityTypes: [
          ACTIVITY_TYPES.NEXT_NUMBER,
          ACTIVITY_TYPES.CONTINUE_SEQUENCE
        ],
        difficulty: 1,
        challengeCount: 3
      },
      {
        id: '1-3',
        worldId: 1,
        levelNumber: 3,
        name: "Yeşil Tepe (5'er İleri ve Geri)",
        introText:
          "5'er, 2'şer ve 10'ar hem ileriye hem geriye ritmik sayma becerini göster!",
        allowedSteps: [5, 2, 10],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [
          ACTIVITY_TYPES.CONTINUE_SEQUENCE,
          ACTIVITY_TYPES.MISSING_NUMBER,
          ACTIVITY_TYPES.IDENTIFY_PLATFORM
        ],
        difficulty: 2,
        challengeCount: 4
      }
    ]
  },
  {
    id: 2,
    key: 'mantar_ormani',
    name: 'MANTAR ORMANI',
    subtitle: "3'er ve 4'er (İleri ve Geri)",
    difficultyLabel: 'Başlangıç - Orta',
    description:
      'Dev renkli mantarlar ve büyülü ağaçlar arasında 3’er ve 4’er ileriye ve geriye ritmik sayma!',
    theme: {
      skyTop: '#311042',
      skyBottom: '#701a75',
      hillFar: '#6b21a8',
      hillNear: '#4c1d95',
      groundTop: '#c084fc',
      groundBody: '#4c1d95',
      platformTop: '#f97316',
      platformBody: '#9a3412',
      accentColor: '#9333ea',
      cardGradient: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)'
    },
    levels: [
      {
        id: '2-1',
        worldId: 2,
        levelNumber: 1,
        name: "Parlayan Mantarlar (3'er)",
        introText:
          "Mantar Ormanı'nda 3'er ileriye ve geriye ritmik sayarak ilerleyelim!",
        allowedSteps: [3],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [
          ACTIVITY_TYPES.NEXT_NUMBER,
          ACTIVITY_TYPES.IDENTIFY_PLATFORM
        ],
        difficulty: 1,
        challengeCount: 3
      },
      {
        id: '2-2',
        worldId: 2,
        levelNumber: 2,
        name: "Büyülü Ağaç Köprüsü (4'er)",
        introText:
          "4'er ileriye ve geriye sayma örüntülerindeki doğru sayıları bul!",
        allowedSteps: [4],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [
          ACTIVITY_TYPES.MISSING_NUMBER,
          ACTIVITY_TYPES.CONTINUE_SEQUENCE
        ],
        difficulty: 2,
        challengeCount: 4
      },
      {
        id: '2-3',
        worldId: 2,
        levelNumber: 3,
        name: "Ormanın Kalbi (3'er ve 4'er)",
        introText:
          "Ormanın Kalbi'ne ulaşmak için 3'er ve 4'er ileri-geri sayma adımlarını çöz!",
        allowedSteps: [3, 4],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [
          ACTIVITY_TYPES.CONTINUE_SEQUENCE,
          ACTIVITY_TYPES.MISSING_NUMBER,
          ACTIVITY_TYPES.IDENTIFY_PLATFORM
        ],
        difficulty: 2,
        challengeCount: 4
      }
    ]
  },
  {
    id: 3,
    key: 'sayi_colu',
    name: 'SAYI ÇÖLÜ',
    subtitle: "6'şar ve 7'şer (İleri ve Geri)",
    difficultyLabel: 'Orta',
    description:
      'Altın kumullar ve kumtaşı platformlar arasında 6’şar ve 7’şer ileriye ve geriye ritmik sayma!',
    theme: {
      skyTop: '#d97706',
      skyBottom: '#fef08a',
      hillFar: '#f59e0b',
      hillNear: '#d97706',
      groundTop: '#fbbf24',
      groundBody: '#92400e',
      platformTop: '#fde047',
      platformBody: '#b45309',
      accentColor: '#d97706',
      cardGradient: 'linear-gradient(135deg, #ea580c 0%, #ca8a04 100%)'
    },
    levels: [
      {
        id: '3-1',
        worldId: 3,
        levelNumber: 1,
        name: "Altın Kumullar (6'şar)",
        introText:
          "Sayı Çölü'nde 6'şar ileriye ve geriye ritmik sayarak kumtaşı blokları aşalım!",
        allowedSteps: [6],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [
          ACTIVITY_TYPES.NEXT_NUMBER,
          ACTIVITY_TYPES.IDENTIFY_PLATFORM
        ],
        difficulty: 1,
        challengeCount: 3
      },
      {
        id: '3-2',
        worldId: 3,
        levelNumber: 2,
        name: "Vaha Tapınağı (7'şer)",
        introText:
          "Vaha Tapınağı'ndaki 7'şer ileriye ve geriye ritmik sayma taşlarını tamamla!",
        allowedSteps: [7],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [
          ACTIVITY_TYPES.MISSING_NUMBER,
          ACTIVITY_TYPES.CONTINUE_SEQUENCE
        ],
        difficulty: 2,
        challengeCount: 4
      },
      {
        id: '3-3',
        worldId: 3,
        levelNumber: 3,
        name: "Piramit Zirvesi (6'şar ve 7'şer)",
        introText:
          "Piramit Zirvesi'ndeki bayrağı açmak için 6'şar ve 7'şer sayma ustası olduğunu kanıtla!",
        allowedSteps: [6, 7],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [
          ACTIVITY_TYPES.CONTINUE_SEQUENCE,
          ACTIVITY_TYPES.MISSING_NUMBER,
          ACTIVITY_TYPES.NEXT_NUMBER
        ],
        difficulty: 2,
        challengeCount: 4
      }
    ]
  },
  {
    id: 4,
    key: 'bulut_kralligi',
    name: 'BULUT KRALLIĞI',
    subtitle: "8'er ve 9'ar (İleri ve Geri)",
    difficultyLabel: 'Orta - İleri',
    description:
      'Yüzen adalar, pamuk bulutlar ve gökkuşakları üzerinde 8’er ve 9’ar ileriye ve geriye ritmik sayma!',
    theme: {
      skyTop: '#1d4ed8',
      skyBottom: '#e0f2fe',
      hillFar: '#93c5fd',
      hillNear: '#60a5fa',
      groundTop: '#f8fafc',
      groundBody: '#38bdf8',
      platformTop: '#ffffff',
      platformBody: '#0284c7',
      accentColor: '#0284c7',
      cardGradient: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)'
    },
    levels: [
      {
        id: '4-1',
        worldId: 4,
        levelNumber: 1,
        name: "Pamuk Bulutlar (8'er)",
        introText:
          "Bulut Krallığı'nda 8'er ileriye ve geriye sayarak yüzen adalardan zıpla!",
        allowedSteps: [8],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [
          ACTIVITY_TYPES.NEXT_NUMBER,
          ACTIVITY_TYPES.IDENTIFY_PLATFORM
        ],
        difficulty: 1,
        challengeCount: 3
      },
      {
        id: '4-2',
        worldId: 4,
        levelNumber: 2,
        name: "Gökkuşağı Köprüsü (9'ar)",
        introText:
          "Gökkuşağı Köprüsü'ndeki 9'ar ileriye ve geriye ritmik sayma bulutlarını bul!",
        allowedSteps: [9],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [
          ACTIVITY_TYPES.MISSING_NUMBER,
          ACTIVITY_TYPES.CONTINUE_SEQUENCE
        ],
        difficulty: 2,
        challengeCount: 4
      },
      {
        id: '4-3',
        worldId: 4,
        levelNumber: 3,
        name: "Yıldız Adası (8'er ve 9'ar)",
        introText:
          "Yıldız Adası'nın zirvesine 8'er ve 9'ar ileri-geri ritmik sayma adımlarıyla ulaş!",
        allowedSteps: [8, 9],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [
          ACTIVITY_TYPES.CONTINUE_SEQUENCE,
          ACTIVITY_TYPES.MISSING_NUMBER,
          ACTIVITY_TYPES.IDENTIFY_PLATFORM
        ],
        difficulty: 2,
        challengeCount: 4
      }
    ]
  },
  {
    id: 5,
    key: 'buyulu_kale',
    name: 'BÜYÜLÜ KALE',
    subtitle: "2'den 10'a Karışık Ritmik Sayma (İleri & Geri)",
    difficultyLabel: 'Büyük Final',
    description:
      'Işıltılı kapılar ve görkemli kulelerde 2’den 10’a kadar tüm ritmik saymaları birleştiren kutlama kalesi!',
    theme: {
      skyTop: '#1e1b4b',
      skyBottom: '#4338ca',
      hillFar: '#3730a3',
      hillNear: '#312e81',
      groundTop: '#f59e0b',
      groundBody: '#475569',
      platformTop: '#fde047',
      platformBody: '#6366f1',
      accentColor: '#4f46e5',
      cardGradient: 'linear-gradient(135deg, #4f46e5 0%, #e11d48 100%)'
    },
    levels: [
      {
        id: '5-1',
        worldId: 5,
        levelNumber: 1,
        name: 'Kristal Avlu (2, 3, 4, 5, 6)',
        introText:
          "Büyülü Kale'ye hoş geldin! 2'den 6'ya kadar ileriye ve geriye ritmik sayma sorularına dikkat et!",
        allowedSteps: [2, 3, 4, 5, 6],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [ACTIVITY_TYPES.MIXED_REVIEW],
        difficulty: 2,
        challengeCount: 4
      },
      {
        id: '5-2',
        worldId: 5,
        levelNumber: 2,
        name: 'Büyülü Kuleler (6, 7, 8, 9, 10)',
        introText:
          "Kulelere tırmanırken 6, 7, 8, 9 ve 10'ar ileri-geri ritmik sayma örüntülerini çöz!",
        allowedSteps: [6, 7, 8, 9, 10],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [ACTIVITY_TYPES.MIXED_REVIEW],
        difficulty: 2,
        challengeCount: 4
      },
      {
        id: '5-3',
        worldId: 5,
        levelNumber: 3,
        name: "Büyük Zafer Salonu (2'den 10'a Hepsi)",
        introText:
          "Büyük Final! 2'den 10'a kadar ileriye ve geriye tüm ritmik saymaları tamamla ve Şampiyon Bayrağı'na ulaş!",
        allowedSteps: [2, 3, 4, 5, 6, 7, 8, 9, 10],
        directionMode: COUNTING_DIRECTIONS.MIXED,
        activityTypes: [ACTIVITY_TYPES.MIXED_REVIEW],
        difficulty: 3,
        challengeCount: 5
      }
    ]
  }
];

export function getAllLevels() {
  const list = [];
  for (const world of WORLDS) {
    for (const lvl of world.levels) {
      list.push({ ...lvl, world });
    }
  }
  return list;
}

export function getLevelById(levelId) {
  if (typeof levelId === 'string' && levelId.startsWith('custom_')) {
    // Format: custom_<step>_<directionMode>
    const parts = levelId.split('_');
    const step = Number(parts[1]) || 2;
    const dir = parts[2] || COUNTING_DIRECTIONS.MIXED;
    return createCustomPracticeLevel(step, dir);
  }
  const all = getAllLevels();
  return all.find((l) => l.id === levelId) || all[0];
}

export function createCustomPracticeLevel(
  step = 2,
  directionMode = COUNTING_DIRECTIONS.MIXED
) {
  const stepLabel = getStepLabel(step);
  const dirText =
    directionMode === COUNTING_DIRECTIONS.FORWARD
      ? 'İleriye'
      : directionMode === COUNTING_DIRECTIONS.BACKWARD
      ? 'Geriye'
      : 'İleri ve Geriye';
  const worldIndex = (step - 2) % WORLDS.length;
  const world = WORLDS[worldIndex] || WORLDS[0];

  return {
    id: `custom_${step}_${directionMode}`,
    worldId: world.id,
    levelNumber: 1,
    name: `${stepLabel} ${dirText} Sayma Parkuru`,
    introText: `${stepLabel} ${dirText.toUpperCase()} ritmik sayma parkuruna hoş geldin! Doğru numaralı platformlara zıplayarak bayrağı aç!`,
    allowedSteps: [step],
    directionMode,
    activityTypes: [
      ACTIVITY_TYPES.NEXT_NUMBER,
      ACTIVITY_TYPES.CONTINUE_SEQUENCE,
      ACTIVITY_TYPES.MISSING_NUMBER,
      ACTIVITY_TYPES.IDENTIFY_PLATFORM
    ],
    difficulty: 1,
    challengeCount: 4,
    world
  };
}

export function getNextLevelId(currentLevelId) {
  if (typeof currentLevelId === 'string' && currentLevelId.startsWith('custom_')) {
    const parts = currentLevelId.split('_');
    const step = Number(parts[1]) || 2;
    const dir = parts[2] || COUNTING_DIRECTIONS.MIXED;
    const nextStep = step < 10 ? step + 1 : 2;
    return `custom_${nextStep}_${dir}`;
  }
  const all = getAllLevels();
  const idx = all.findIndex((l) => l.id === currentLevelId);
  if (idx >= 0 && idx + 1 < all.length) {
    return all[idx + 1].id;
  }
  return null;
}
