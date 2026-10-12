/**
 * Persistent Progress & Mastery Storage Manager for "Ritmik Sayma Macerası"
 * Uses versioned, schema-validated LocalStorage with graceful recovery.
 */

import { CHARACTERS } from '../data/characters.js';
import { getAllLevels, getNextLevelId } from '../data/levels.js';

const STORAGE_KEY = 'ritmik_sayma_macerasi_save_v1';
const SAVE_VERSION = 1;

const COUNTING_STEPS = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];

function createDefaultSkillEntry() {
  return {
    attempted: 0,
    correct: 0,
    firstAttemptCorrect: 0,
    incorrect: 0
  };
}

export function createDefaultSaveData() {
  const skills = {};
  for (const step of COUNTING_STEPS) {
    skills[step] = createDefaultSkillEntry();
  }

  return {
    version: SAVE_VERSION,
    selectedCharacter: CHARACTERS[0].id,
    unlockedLevels: ['1-1'],
    completedLevels: {},
    totalStars: 0,
    totalCoins: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    firstAttemptCorrect: 0,
    incorrectAttempts: 0,
    retries: 0,
    playTimeSeconds: 0,
    lastPlayedLevel: '1-1',
    skills,
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      volume: 0.8,
      reducedMotion: false
    }
  };
}

class ProgressManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const fresh = createDefaultSaveData();
        this.save(fresh);
        return fresh;
      }
      const parsed = JSON.parse(raw);
      return this.validateAndMigrate(parsed);
    } catch (err) {
      console.warn('Kayıt verisi okunamadı, varsayılan profil oluşturuluyor:', err);
      const fresh = createDefaultSaveData();
      this.save(fresh);
      return fresh;
    }
  }

  validateAndMigrate(parsed) {
    const def = createDefaultSaveData();
    if (!parsed || typeof parsed !== 'object') return def;

    const validCharIds = new Set(CHARACTERS.map((c) => c.id));
    const validLevelIds = new Set(getAllLevels().map((l) => l.id));

    const data = {
      version: SAVE_VERSION,
      selectedCharacter: validCharIds.has(parsed.selectedCharacter)
        ? parsed.selectedCharacter
        : def.selectedCharacter,
      unlockedLevels: Array.isArray(parsed.unlockedLevels)
        ? parsed.unlockedLevels.filter((id) => validLevelIds.has(id))
        : ['1-1'],
      completedLevels:
        parsed.completedLevels && typeof parsed.completedLevels === 'object'
          ? parsed.completedLevels
          : {},
      totalStars: Math.max(0, Number(parsed.totalStars) || 0),
      totalCoins: Math.max(0, Number(parsed.totalCoins) || 0),
      questionsAnswered: Math.max(0, Number(parsed.questionsAnswered) || 0),
      correctAnswers: Math.max(0, Number(parsed.correctAnswers) || 0),
      firstAttemptCorrect: Math.max(0, Number(parsed.firstAttemptCorrect) || 0),
      incorrectAttempts: Math.max(0, Number(parsed.incorrectAttempts) || 0),
      retries: Math.max(0, Number(parsed.retries) || 0),
      playTimeSeconds: Math.max(0, Number(parsed.playTimeSeconds) || 0),
      lastPlayedLevel: validLevelIds.has(parsed.lastPlayedLevel)
        ? parsed.lastPlayedLevel
        : '1-1',
      skills: {},
      settings: {
        soundEnabled:
          parsed.settings && typeof parsed.settings.soundEnabled === 'boolean'
            ? parsed.settings.soundEnabled
            : true,
        musicEnabled:
          parsed.settings && typeof parsed.settings.musicEnabled === 'boolean'
            ? parsed.settings.musicEnabled
            : true,
        volume:
          parsed.settings && typeof parsed.settings.volume === 'number'
            ? Math.min(1, Math.max(0, parsed.settings.volume))
            : 0.8,
        reducedMotion:
          parsed.settings && typeof parsed.settings.reducedMotion === 'boolean'
            ? parsed.settings.reducedMotion
            : false
      }
    };

    if (!data.unlockedLevels.includes('1-1')) {
      data.unlockedLevels.unshift('1-1');
    }

    for (const step of COUNTING_STEPS) {
      const s = parsed.skills && parsed.skills[step];
      data.skills[step] = {
        attempted: Math.max(0, Number(s?.attempted) || 0),
        correct: Math.max(0, Number(s?.correct) || 0),
        firstAttemptCorrect: Math.max(0, Number(s?.firstAttemptCorrect) || 0),
        incorrect: Math.max(0, Number(s?.incorrect) || 0)
      };
    }

    // Recalculate totalStars from completedLevels to prevent drift
    data.totalStars = this.computeTotalStars(data.completedLevels);

    return data;
  }

  computeTotalStars(completedLevels) {
    let sum = 0;
    for (const key of Object.keys(completedLevels || {})) {
      const entry = completedLevels[key];
      if (entry && typeof entry.stars === 'number') {
        sum += Math.min(3, Math.max(0, entry.stars));
      }
    }
    return sum;
  }

  save(dataToSave = this.data) {
    try {
      this.data = dataToSave;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.warn('Kayıt verisi yazılamadı:', err);
    }
  }

  resetProgress() {
    const currentSettings = { ...this.data.settings };
    const fresh = createDefaultSaveData();
    fresh.settings = currentSettings;
    this.save(fresh);
    return this.data;
  }

  getSelectedCharacter() {
    return this.data.selectedCharacter;
  }

  setSelectedCharacter(charId) {
    const valid = CHARACTERS.some((c) => c.id === charId);
    if (valid) {
      this.data.selectedCharacter = charId;
      this.save();
    }
  }

  isLevelUnlocked(levelId) {
    return this.data.unlockedLevels.includes(levelId);
  }

  isLevelCompleted(levelId) {
    return Boolean(this.data.completedLevels[levelId]?.completed);
  }

  getLevelStats(levelId) {
    return (
      this.data.completedLevels[levelId] || {
        completed: false,
        stars: 0,
        bestAccuracy: 0,
        bestCoins: 0,
        plays: 0
      }
    );
  }

  setLastPlayedLevel(levelId) {
    if (this.isLevelUnlocked(levelId)) {
      this.data.lastPlayedLevel = levelId;
      this.save();
    }
  }

  addPlayTime(seconds) {
    if (seconds > 0 && Number.isFinite(seconds)) {
      this.data.playTimeSeconds += Math.round(seconds);
      this.save();
    }
  }

  addCoin(amount = 1) {
    this.data.totalCoins += amount;
    this.save();
  }

  /**
   * Records a student's answer to a math platform challenge.
   * @param {number} step - Counting interval (2, 3, 4, 5, 10)
   * @param {boolean} isCorrect - Whether the student landed on the correct platform
   * @param {boolean} isFirstAttemptForChallenge - True if no prior wrong tries on this station
   */
  recordQuestionAttempt(step, isCorrect, isFirstAttemptForChallenge) {
    const stepKey = String(step);
    if (!this.data.skills[stepKey]) {
      this.data.skills[stepKey] = createDefaultSkillEntry();
    }
    const skill = this.data.skills[stepKey];

    if (isCorrect) {
      this.data.questionsAnswered += 1;
      this.data.correctAnswers += 1;
      skill.attempted += 1;
      skill.correct += 1;

      if (isFirstAttemptForChallenge) {
        this.data.firstAttemptCorrect += 1;
        skill.firstAttemptCorrect += 1;
      } else {
        this.data.retries += 1;
      }
    } else {
      this.data.incorrectAttempts += 1;
      skill.incorrect += 1;
    }

    this.save();
  }

  /**
   * Records level completion, awards stars (1-3), unlocks the next level, and saves best performance.
   */
  completeLevel({ levelId, stars, accuracy, coinsCollected }) {
    const prev = this.getLevelStats(levelId);
    const earnedStars = Math.min(3, Math.max(1, stars));

    this.data.completedLevels[levelId] = {
      completed: true,
      stars: Math.max(prev.stars || 0, earnedStars),
      bestAccuracy: Math.max(prev.bestAccuracy || 0, Math.round(accuracy)),
      bestCoins: Math.max(prev.bestCoins || 0, coinsCollected || 0),
      plays: (prev.plays || 0) + 1
    };

    const nextId = getNextLevelId(levelId);
    if (nextId && !this.data.unlockedLevels.includes(nextId)) {
      this.data.unlockedLevels.push(nextId);
    }

    this.data.totalStars = this.computeTotalStars(this.data.completedLevels);
    this.save();

    return {
      nextLevelId: nextId,
      levelStats: this.data.completedLevels[levelId]
    };
  }

  /**
   * Computes explicit mastery status for a counting skill ('2', '3', '4', '5', '10').
   * Mastery thresholds:
   * - Henüz başlanmadı: 0 correct answers
   * - Gelişiyor: 1-2 correct answers OR first-attempt accuracy < 60%
   * - İyi gidiyor: >= 3 correct answers AND first-attempt accuracy >= 60% (not yet 6 correct at >=80%)
   * - Başarıyla tamamlandı: >= 6 correct answers AND first-attempt accuracy >= 80%
   */
  getSkillMastery(step) {
    const skill = this.data.skills[String(step)] || createDefaultSkillEntry();
    const { attempted, correct, firstAttemptCorrect, incorrect } = skill;

    if (correct === 0 && incorrect === 0) {
      return {
        label: 'Henüz başlanmadı',
        badgeClass: 'mastery-none',
        progressPercent: 0,
        firstAttemptAccuracy: 0,
        correct,
        attempted
      };
    }

    const firstAttemptAccuracy =
      attempted > 0 ? Math.round((firstAttemptCorrect / attempted) * 100) : 0;

    // Progress bar combines target volume (6 solved questions = 60% weight) + first-attempt accuracy (40% weight)
    const volumeScore = Math.min(1, correct / 6) * 60;
    const accuracyScore = (firstAttemptAccuracy / 100) * 40;
    let progressPercent = Math.round(volumeScore + accuracyScore);

    if (correct >= 6 && firstAttemptAccuracy >= 80) {
      return {
        label: 'Başarıyla tamamlandı',
        badgeClass: 'mastery-mastered',
        progressPercent: Math.max(85, Math.min(100, progressPercent)),
        firstAttemptAccuracy,
        correct,
        attempted
      };
    }

    if (correct >= 3 && firstAttemptAccuracy >= 60) {
      return {
        label: 'İyi gidiyor',
        badgeClass: 'mastery-good',
        progressPercent: Math.max(60, Math.min(84, progressPercent)),
        firstAttemptAccuracy,
        correct,
        attempted
      };
    }

    return {
      label: 'Gelişiyor',
      badgeClass: 'mastery-developing',
      progressPercent: Math.max(15, Math.min(59, progressPercent)),
      firstAttemptAccuracy,
      correct,
      attempted
    };
  }

  getSettings() {
    return this.data.settings;
  }

  updateSettings(partial) {
    this.data.settings = {
      ...this.data.settings,
      ...partial
    };
    this.save();
    return this.data.settings;
  }
}

export const progressManager = new ProgressManager();
