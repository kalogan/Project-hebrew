import type { Epoch } from '../time';
import { MS_PER_DAY } from '../time';
import { DEFAULT_CONFIG, type CardState, type Rating, type SchedulerConfig } from './types';

const MS_PER_MIN = 60_000;

/** A brand-new, never-seen card, due immediately at `now`. */
export function newCard(now: Epoch, config: SchedulerConfig = DEFAULT_CONFIG): CardState {
  return {
    ease: config.startingEase,
    intervalDays: 0,
    step: 0,
    reps: 0,
    lapses: 0,
    due: now,
    lastReviewed: null,
    phase: 'new',
  };
}

/** Is the card due for review at the given moment? */
export function isDue(card: CardState, now: Epoch): boolean {
  return card.due <= now;
}

function clampEase(ease: number, config: SchedulerConfig): number {
  return Math.max(config.minEase, ease);
}

function clampIntervalDays(days: number, config: SchedulerConfig): number {
  return Math.min(config.maxIntervalDays, Math.max(1, Math.round(days)));
}

/**
 * Advance a card given how the learner rated their recall, at time `now`.
 * Pure and deterministic: same (card, rating, now, config) always yields the
 * same next state. Returns a NEW state; never mutates the input.
 */
export function review(
  card: CardState,
  rating: Rating,
  now: Epoch,
  config: SchedulerConfig = DEFAULT_CONFIG,
): CardState {
  const next: CardState = { ...card, lastReviewed: now };

  if (card.phase === 'new' || card.phase === 'learning') {
    return reviewLearning(next, rating, now, config);
  }
  return reviewGraduated(next, rating, now, config);
}

function dueInMinutes(now: Epoch, minutes: number): Epoch {
  return now + minutes * MS_PER_MIN;
}

function graduate(card: CardState, intervalDays: number, now: Epoch): CardState {
  return {
    ...card,
    phase: 'review',
    step: -1,
    intervalDays,
    reps: card.reps + 1,
    due: now + intervalDays * MS_PER_DAY,
  };
}

function reviewLearning(card: CardState, rating: Rating, now: Epoch, config: SchedulerConfig): CardState {
  const steps = config.learningStepsMin;

  switch (rating) {
    case 'again':
      return { ...card, phase: 'learning', step: 0, reps: 0, due: dueInMinutes(now, steps[0] ?? 1) };
    case 'hard': {
      // Repeat the current step (clamped into range).
      const step = Math.min(Math.max(card.step, 0), steps.length - 1);
      return { ...card, phase: 'learning', step, due: dueInMinutes(now, steps[step] ?? 1) };
    }
    case 'good': {
      const nextStep = Math.max(card.step, 0) + 1;
      if (nextStep >= steps.length) {
        return graduate(card, config.graduatingIntervalDays, now);
      }
      return { ...card, phase: 'learning', step: nextStep, due: dueInMinutes(now, steps[nextStep] ?? 1) };
    }
    case 'easy':
      return graduate(card, config.easyIntervalDays, now);
  }
}

function reviewGraduated(card: CardState, rating: Rating, now: Epoch, config: SchedulerConfig): CardState {
  if (rating === 'again') {
    // Lapse: drop ease, send back to relearning at the first step.
    return {
      ...card,
      ease: clampEase(card.ease + config.easeDelta.again, config),
      phase: 'learning',
      step: 0,
      reps: 0,
      lapses: card.lapses + 1,
      intervalDays: 0,
      due: dueInMinutes(now, config.learningStepsMin[0] ?? 1),
    };
  }

  const ease = clampEase(card.ease + config.easeDelta[rating], config);
  let intervalDays: number;
  switch (rating) {
    case 'hard':
      intervalDays = card.intervalDays * config.hardMultiplier;
      break;
    case 'good':
      intervalDays = card.intervalDays * card.ease;
      break;
    case 'easy':
      intervalDays = card.intervalDays * card.ease * config.easyBonus;
      break;
  }
  const clamped = clampIntervalDays(intervalDays, config);
  return {
    ...card,
    ease,
    intervalDays: clamped,
    reps: card.reps + 1,
    due: now + clamped * MS_PER_DAY,
  };
}
