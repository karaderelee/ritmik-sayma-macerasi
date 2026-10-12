/**
 * Math Question & Sequence Generation Engine for "Ritmik Sayma Macerası"
 * Supports all counting intervals from 2 to 10 (2, 3, 4, 5, 6, 7, 8, 9, 10)
 * and both Forward (İleriye) and Backward (Geriye) skip-counting sequences.
 */

export const ALL_COUNTING_STEPS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export const ACTIVITY_TYPES = {
  CONTINUE_SEQUENCE: 'A', // e.g., 10, 20, 30, __, 50 (or 50, 40, 30, __, 10)
  NEXT_NUMBER: 'B',       // e.g., 4, 8, 12, __ (or 24, 20, 16, __)
  MISSING_NUMBER: 'C',    // e.g., 3, __, 9, 12, 15 (or 30, __, 24, 21, 18)
  IDENTIFY_PLATFORM: 'D', // e.g., 5 -> 10 -> 15 -> [ ? ]
  MIXED_REVIEW: 'E'       // Mixed intervals (2..10) and directions
};

export const COUNTING_DIRECTIONS = {
  FORWARD: 'forward',
  BACKWARD: 'backward',
  MIXED: 'mixed'
};

export const POSITIVE_MESSAGES = [
  'Harika! Doğru sayıyı buldun!',
  'Süpersin! Ritmik saymayı doğru devam ettirdin!',
  'Muhteşem! Bir sonraki platform seni bekliyor!',
  'Çok güzel! Örüntüyü tam isabetle çözdün!'
];

const STEP_LABELS = {
  2: "2'şer",
  3: "3'er",
  4: "4'er",
  5: "5'er",
  6: "6'şar",
  7: "7'şer",
  8: "8'er",
  9: "9'ar",
  10: "10'ar"
};

export function getStepLabel(step) {
  return STEP_LABELS[step] || `${step}'er`;
}

/**
 * Generates a validated forward or backward skip-counting challenge.
 * @param {object} config
 * @param {number[]} config.allowedSteps - Subset of [2, 3, 4, 5, 6, 7, 8, 9, 10]
 * @param {string[]} config.activityTypes - Array of ACTIVITY_TYPES values
 * @param {number} config.difficulty - 1 (easy), 2 (medium), 3 (challenging)
 * @param {number} config.challengeIndex - Index within the level (0, 1, 2...)
 * @param {string} config.directionMode - 'forward' | 'backward' | 'mixed'
 * @returns {object} Validated challenge object
 */
export function generateMathChallenge({
  allowedSteps = [2],
  activityTypes = ['B', 'D'],
  difficulty = 1,
  challengeIndex = 0,
  directionMode = COUNTING_DIRECTIONS.MIXED
} = {}) {
  const step = allowedSteps[challengeIndex % allowedSteps.length] || 2;
  const rawType = activityTypes[challengeIndex % activityTypes.length] || 'B';
  const activityType =
    rawType === ACTIVITY_TYPES.MIXED_REVIEW
      ? ['A', 'B', 'C', 'D'][challengeIndex % 4]
      : rawType;

  // Determine direction: forward or backward
  let direction = COUNTING_DIRECTIONS.FORWARD;
  if (directionMode === COUNTING_DIRECTIONS.BACKWARD) {
    direction = COUNTING_DIRECTIONS.BACKWARD;
  } else if (directionMode === COUNTING_DIRECTIONS.MIXED) {
    direction =
      challengeIndex % 2 === 1
        ? COUNTING_DIRECTIONS.BACKWARD
        : COUNTING_DIRECTIONS.FORWARD;
  }

  // Determine sequence length and missing index based on activity type
  let sequenceLength = 5;
  let missingIndex = 3;

  if (activityType === ACTIVITY_TYPES.CONTINUE_SEQUENCE) {
    sequenceLength = 5;
    missingIndex = 3;
  } else if (activityType === ACTIVITY_TYPES.NEXT_NUMBER) {
    sequenceLength = 4;
    missingIndex = 3;
  } else if (activityType === ACTIVITY_TYPES.MISSING_NUMBER) {
    sequenceLength = 5;
    missingIndex = challengeIndex % 2 === 0 ? 1 : 2;
  } else {
    sequenceLength = 4;
    missingIndex = 3;
  }

  const fullSequence = [];
  if (direction === COUNTING_DIRECTIONS.FORWARD) {
    const minMultiplier = difficulty === 1 ? 1 : difficulty === 2 ? 2 : 3;
    const maxMultiplier = difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6;
    const multRange = maxMultiplier - minMultiplier + 1;
    const startMultiplier = minMultiplier + ((challengeIndex * 2) % multRange);
    const startNumber = startMultiplier * step;

    for (let i = 0; i < sequenceLength; i++) {
      fullSequence.push(startNumber + i * step);
    }
  } else {
    // Backward counting: start high enough so all numbers remain positive multiples
    const minMultiplier = difficulty === 1 ? 6 : difficulty === 2 ? 7 : 8;
    const maxMultiplier = 10;
    const multRange = maxMultiplier - minMultiplier + 1;
    const startMultiplier = minMultiplier + ((challengeIndex * 2) % multRange);
    const startNumber = startMultiplier * step;

    for (let i = 0; i < sequenceLength; i++) {
      fullSequence.push(startNumber - i * step);
    }
  }

  const correctAnswer = fullSequence[missingIndex];
  const prevNumber =
    missingIndex > 0
      ? fullSequence[missingIndex - 1]
      : direction === COUNTING_DIRECTIONS.FORWARD
      ? correctAnswer - step
      : correctAnswer + step;

  // Build display sequence where missingIndex is null
  const displaySequence = fullSequence.map((val, idx) =>
    idx === missingIndex ? null : val
  );

  // Generate 3 distinct, unambiguous platform options (1 correct + 2 plausible distractors)
  const options = generateValidOptions(correctAnswer, step, fullSequence);

  // Build clear Turkish instruction prompt and hints
  const stepLabel = getStepLabel(step);
  const dirLabel =
    direction === COUNTING_DIRECTIONS.BACKWARD ? 'GERİYE' : 'İLERİYE';
  const dirBadge =
    direction === COUNTING_DIRECTIONS.BACKWARD
      ? '⬅ Geriye Ritmik Sayma'
      : '➡ İleriye Ritmik Sayma';

  let promptText = `${stepLabel} ${dirLabel} ritmik sayarak doğru platforma zıpla!`;
  if (activityType === ACTIVITY_TYPES.MISSING_NUMBER) {
    promptText = `${stepLabel} ${dirLabel} sayma örüntüsündeki eksik sayıyı bul ve o platforma zıpla!`;
  } else if (activityType === ACTIVITY_TYPES.CONTINUE_SEQUENCE) {
    promptText = `${stepLabel} ${dirLabel} ritmik saymayı sürdür ve boşluğa gelecek platforma zıpla!`;
  }

  const hintFirst =
    direction === COUNTING_DIRECTIONS.BACKWARD
      ? `Çok yaklaştın, tekrar deneyelim! Geriye sayarken her adımda ${step} çıkarmayı unutma.`
      : `Çok yaklaştın, tekrar deneyelim! İleriye sayarken her adımda ${step} eklemeyi unutma.`;

  const hintDetailed =
    direction === COUNTING_DIRECTIONS.BACKWARD
      ? `İpucu: Geriye sayıyoruz! ${prevNumber} sayısından ${step} çıkarırsak doğru platform olan ${correctAnswer} sayısına ulaşırız!`
      : `İpucu: İleriye sayıyoruz! ${prevNumber} sayısına ${step} eklersek doğru platform olan ${correctAnswer} sayısına ulaşırız!`;

  const challenge = {
    id: `challenge_${step}_${direction}_${fullSequence[0]}_${missingIndex}_${challengeIndex}`,
    step,
    stepLabel,
    direction,
    dirBadge,
    activityType,
    fullSequence,
    displaySequence,
    missingIndex,
    correctAnswer,
    prevNumber,
    options,
    promptText,
    hintFirst,
    hintDetailed
  };

  if (!validateChallenge(challenge)) {
    return createFallbackChallenge(step, challengeIndex, direction);
  }

  return challenge;
}

/**
 * Generates 3 unique positive integer choices containing the exact correctAnswer
 * and two unambiguous distractors appropriate for 3rd-grade students.
 */
function generateValidOptions(correctAnswer, step, fullSequence) {
  const candidates = [
    correctAnswer + step,
    correctAnswer - step,
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
    correctAnswer + Math.max(1, Math.floor(step / 2)),
    correctAnswer + step + 1
  ];

  const distractorSet = new Set();
  for (const cand of candidates) {
    if (
      cand > 0 &&
      cand !== correctAnswer &&
      !fullSequence.includes(cand) &&
      !distractorSet.has(cand)
    ) {
      distractorSet.add(cand);
      if (distractorSet.size === 2) break;
    }
  }

  let offset = 1;
  while (distractorSet.size < 2) {
    const fallbackCand = correctAnswer + offset;
    if (
      fallbackCand > 0 &&
      fallbackCand !== correctAnswer &&
      !distractorSet.has(fallbackCand)
    ) {
      distractorSet.add(fallbackCand);
    }
    offset++;
  }

  const allChoices = [correctAnswer, ...Array.from(distractorSet)];

  // Deterministic rotation so correct option position varies across 0, 1, 2
  const shift = correctAnswer % 3;
  const rotated = [];
  for (let i = 0; i < 3; i++) {
    rotated.push(allChoices[(i + shift) % 3]);
  }
  return rotated;
}

/**
 * Validates that a generated challenge satisfies all mathematical and pedagogical rules
 * for both forward and backward skip counting.
 */
export function validateChallenge(challenge) {
  if (!challenge || typeof challenge.correctAnswer !== 'number') return false;
  if (!Array.isArray(challenge.fullSequence) || challenge.fullSequence.length < 3)
    return false;
  if (!Array.isArray(challenge.options) || challenge.options.length !== 3)
    return false;

  const isBackward = challenge.direction === COUNTING_DIRECTIONS.BACKWARD;
  const expectedDiff = isBackward ? -challenge.step : challenge.step;

  for (let i = 1; i < challenge.fullSequence.length; i++) {
    if (challenge.fullSequence[i] - challenge.fullSequence[i - 1] !== expectedDiff) {
      return false;
    }
    if (challenge.fullSequence[i] <= 0) {
      return false;
    }
  }

  if (challenge.fullSequence[challenge.missingIndex] !== challenge.correctAnswer) {
    return false;
  }

  const uniqueOpts = new Set(challenge.options);
  if (uniqueOpts.size !== challenge.options.length) return false;
  if (!uniqueOpts.has(challenge.correctAnswer)) return false;

  return true;
}

function createFallbackChallenge(
  step = 2,
  index = 0,
  direction = COUNTING_DIRECTIONS.FORWARD
) {
  const isBack = direction === COUNTING_DIRECTIONS.BACKWARD;
  const fullSequence = isBack
    ? [step * 6, step * 5, step * 4, step * 3]
    : [step, step * 2, step * 3, step * 4];
  const correctAnswer = fullSequence[3];
  const prevNumber = fullSequence[2];
  const stepLabel = getStepLabel(step);

  return {
    id: `fallback_${step}_${direction}_${index}`,
    step,
    stepLabel,
    direction,
    dirBadge: isBack ? '⬅ Geriye Ritmik Sayma' : '➡ İleriye Ritmik Sayma',
    activityType: ACTIVITY_TYPES.NEXT_NUMBER,
    fullSequence,
    displaySequence: [fullSequence[0], fullSequence[1], fullSequence[2], null],
    missingIndex: 3,
    correctAnswer,
    prevNumber,
    options: [correctAnswer - 1, correctAnswer, correctAnswer + 2],
    promptText: `${stepLabel} ${isBack ? 'GERİYE' : 'İLERİYE'} ritmik sayarak doğru platforma zıpla!`,
    hintFirst: isBack
      ? `Çok yaklaştın, tekrar deneyelim! Geriye sayarken her adımda ${step} çıkarmayı unutma.`
      : `Çok yaklaştın, tekrar deneyelim! İleriye sayarken her adımda ${step} eklemeyi unutma.`,
    hintDetailed: isBack
      ? `İpucu: ${prevNumber} sayısından ${step} çıkarırsak doğru platform olan ${correctAnswer} sayısına ulaşırız!`
      : `İpucu: ${prevNumber} sayısına ${step} eklersek doğru platform olan ${correctAnswer} sayısına ulaşırız!`
  };
}
