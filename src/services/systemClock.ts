import type { Clock, Epoch } from '../core/time';

/**
 * The one and only adapter that reads the real wall-clock. It lives outside the
 * core on purpose: the core is deterministic and clock-injected, so the single
 * impure read is fenced here at the boundary.
 */
export const systemClock: Clock = {
  now: (): Epoch => Date.now(),
};
