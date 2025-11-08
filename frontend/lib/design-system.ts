/**
 * Town Pass Design System
 * Based on design_docs/color_vars.md
 */

export const colors = {
  primary: {
    50: '#EDF8FA',
    100: '#DBF1F5',
    200: '#B4E2EA',
    300: '#93D4DF',
    400: '#71C5D5',
    500: '#5AB4C5',
    600: '#468D9B',
    700: '#356C77',
    800: '#22474E',
    900: '#112629',
    950: '#081315',
  },
  secondary: {
    50: '#FDF8ED',
    100: '#FCF2DF',
    200: '#F8E3BC',
    300: '#F4D69E',
    400: '#F0C87C',
    500: '#F5BA4B',
    600: '#E7A43C',
    700: '#AD7B2B',
    800: '#74521B',
    900: '#3C2B0B',
    950: '#1C1304',
  },
  grey: {
    50: '#F1F3F4',
    100: '#E3E7E5',
    200: '#CAD1D5',
    300: '#ADB8BE',
    400: '#91A0A8',
    500: '#738995',
    600: '#5E6D76',
    700: '#475259',
    800: '#30383D',
    900: '#171B1D',
    950: '#0B0D0E',
  },
  red: {
    300: '#E29494',
    500: '#D45251',
  },
  orange: {
    300: '#F4B992',
    500: '#FD853A',
  },
  green: {
    500: '#76A732',
  },
} as const;

export const semanticColors = {
  alarm: {
    hover: colors.red[300],
    default: colors.red[500],
  },
  reminder: {
    hover: colors.orange[300],
    default: colors.orange[500],
  },
  disable: colors.grey[200],
  text: {
    direction: colors.grey[400],
    second: colors.grey[700],
    primary: colors.grey[800],
  },
  background: {
    white: '#FFFFFF',
    grey: '#E3E7E9',
  },
} as const;

export const typography = {
  h1: {
    fontSize: '36px',
    lineHeight: '48px',
  },
  h2: {
    fontSize: '24px',
    lineHeight: '32px',
  },
  h3: {
    fontSize: '16px',
    lineHeight: '22px',
  },
  body: {
    fontSize: '14px',
    lineHeight: '20px',
  },
  caption: {
    fontSize: '12px',
    lineHeight: '18px',
  },
} as const;

export const fonts = {
  chinese: 'PingFang SC, PingFang TC, Microsoft JhengHei',
  english: 'Roboto',
  number: 'Roboto',
} as const;

// Type exports
export type PrimaryColor = keyof typeof colors.primary;
export type SecondaryColor = keyof typeof colors.secondary;
export type GreyColor = keyof typeof colors.grey;
export type TypographyVariant = keyof typeof typography;
