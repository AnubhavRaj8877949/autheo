/**
 * Autheo brand constants for JavaScript consumers.
 *
 * CSS/SCSS must read the tokens in `src/styles/_autheo-tokens.scss`
 * (`var(--brand-primary)` etc.). This module exists only for the small
 * number of places that cannot use CSS custom properties:
 *
 *   - the MUI palette in `src/theme.js` (MUI parses colours at runtime)
 *   - canvas / third-party widgets that need a literal colour
 *
 * Values are taken from the official Autheo brand palette (autheo.com).
 * Keep this file and `_autheo-tokens.scss` in sync.
 */
export const AUTHEO = {
  // Primary — network / signal teal
  teal: "#00fed9",
  tealDark: "#00d4b5",
  tealMid: "#00b89e",
  tealDeep: "#00806f",
  tealInk: "#00705f",
  onTeal: "#04241f",

  // Secondary — value / rewards gold
  gold: "#f0b90b",
  goldDeep: "#b8860b",
  goldPale: "#fbe7a1",
  onGold: "#241a00",

  // Ground — "dazzle"
  dazzle: "#0b0c17",
  dazzleRaised: "#10111f",
  dazzleElevated: "#171930",

  // Neutrals
  zinc200: "#e4e4e7",
  zinc400: "#a1a1aa",
  zinc500: "#71717a",
  zinc700: "#3f3f46",

  // Light-surface ink
  ink: "#0b0c17",
  inkSecondary: "#4b5563",

  // Status
  success: "#34d399",
  warning: "#f0b90b",
  error: "#f87171",
  info: "#7dd3fc",
};

export default AUTHEO;
