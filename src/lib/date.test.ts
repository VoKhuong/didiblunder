import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getRelativeTimeFromNowString } from '$lib/date';

const NOW = new Date('2024-01-01T12:00:00.000Z');

const secondsAgo = (seconds: number) => new Date(NOW.getTime() - seconds * 1000);

describe('getRelativeTimeFromNowString', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats seconds', () => {
    expect(getRelativeTimeFromNowString(secondsAgo(1))).toBe('1 second ago');
    expect(getRelativeTimeFromNowString(secondsAgo(30))).toBe('30 seconds ago');
  });

  it('formats minutes', () => {
    expect(getRelativeTimeFromNowString(secondsAgo(60))).toBe('1 minute ago');
    expect(getRelativeTimeFromNowString(secondsAgo(5 * 60))).toBe('5 minutes ago');
  });

  it('formats hours', () => {
    expect(getRelativeTimeFromNowString(secondsAgo(60 * 60))).toBe('1 hour ago');
    expect(getRelativeTimeFromNowString(secondsAgo(3 * 60 * 60))).toBe('3 hours ago');
  });

  it('formats days', () => {
    expect(getRelativeTimeFromNowString(secondsAgo(24 * 60 * 60))).toBe('1 day ago');
    expect(getRelativeTimeFromNowString(secondsAgo(2 * 24 * 60 * 60))).toBe('2 days ago');
  });

  it('formats months using 30-day months', () => {
    expect(getRelativeTimeFromNowString(secondsAgo(30 * 24 * 60 * 60))).toBe('1 month ago');
    expect(getRelativeTimeFromNowString(secondsAgo(60 * 24 * 60 * 60))).toBe('2 months ago');
  });

  it('formats years using 365-day years', () => {
    expect(getRelativeTimeFromNowString(secondsAgo(365 * 24 * 60 * 60))).toBe('1 year ago');
    expect(getRelativeTimeFromNowString(secondsAgo(2 * 365 * 24 * 60 * 60))).toBe('2 years ago');
  });
});
