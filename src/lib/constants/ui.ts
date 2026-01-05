// src/lib/constants/ui.ts

export const UI_CONSTANTS = {
  // Touch targets
  TOUCH_TARGET_MIN: 44, // px - Apple/Google guideline
  TOUCH_TARGET_COMFORTABLE: 48, // px

  // Icon sizes
  ICON_SIZE_SMALL: 12, // h-3 w-3
  ICON_SIZE_DEFAULT: 16, // h-4 w-4
  ICON_SIZE_MEDIUM: 20, // h-5 w-5
  ICON_SIZE_LARGE: 24, // h-6 w-6

  // Breakpoints (Tailwind defaults)
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const;

