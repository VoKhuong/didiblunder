/**
 * Theme preference helpers.
 *
 * `src/app.html` cannot import this module because its pre-paint script runs
 * before the bundle loads, so it duplicates `THEME_STORAGE_KEY` as a literal.
 * Keep both values identical when changing the key.
 */
export const THEME_STORAGE_KEY = 'didiblunder-theme';

export type Theme = 'light' | 'dark';

const isTheme = (value: string | null): value is Theme => value === 'light' || value === 'dark';

export function getStoredTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null;

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function getPreferredTheme(): Theme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark';

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? getPreferredTheme();
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  document.documentElement.classList.toggle('dark', theme === 'dark');

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode, quota); the class change still applies.
  }
}
