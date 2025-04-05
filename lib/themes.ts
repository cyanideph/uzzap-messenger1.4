export type ThemeType = 
  | 'light' 
  | 'dark' 
  | 'pastel' 
  | 'blackpink' 
  | 'blue' 
  | 'sunset' 
  | 'forest';

export interface ThemeColors {
  name: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  title: string; // New color for titles
  titleDark: string; // Title color for dark mode
}

export const themes: Record<ThemeType, ThemeColors> = {
  light: {
    name: 'Light',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(240, 10%, 3.9%)', // Darker text for better contrast
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(240, 10%, 3.9%)',
    primary: 'hsl(240, 5.9%, 10%)',
    primaryForeground: 'hsl(0, 0%, 98%)',
    secondary: 'hsl(240, 4.8%, 95.9%)',
    secondaryForeground: 'hsl(240, 5.9%, 10%)',
    accent: 'hsl(240, 4.8%, 95.9%)',
    accentForeground: 'hsl(240, 5.9%, 10%)',
    muted: 'hsl(240, 4.8%, 95.9%)',
    mutedForeground: 'hsl(240, 3.8%, 46.1%)',
    border: 'hsl(240, 5.9%, 90%)',
    title: 'hsl(142, 76%, 36%)', // Green title for light mode
    titleDark: 'hsl(142, 71%, 45%)', // Brighter green for dark mode
  },
  dark: {
    name: 'Dark',
    background: 'hsl(240, 10%, 3.9%)',
    foreground: 'hsl(0, 0%, 98%)', // Very light text for better contrast in dark mode
    card: 'hsl(240, 10%, 3.9%)',
    cardForeground: 'hsl(0, 0%, 98%)',
    primary: 'hsl(0, 0%, 98%)',
    primaryForeground: 'hsl(240, 5.9%, 10%)',
    secondary: 'hsl(240, 3.7%, 15.9%)',
    secondaryForeground: 'hsl(0, 0%, 98%)',
    accent: 'hsl(240, 3.7%, 15.9%)',
    accentForeground: 'hsl(0, 0%, 98%)',
    muted: 'hsl(240, 3.7%, 15.9%)',
    mutedForeground: 'hsl(240, 5%, 85%)', // Lighter muted text for better contrast
    border: 'hsl(240, 3.7%, 15.9%)',
    title: 'hsl(142, 76%, 36%)', // Green title for light mode
    titleDark: 'hsl(142, 71%, 45%)', // Brighter green for dark mode
  },
  pastel: {
    name: 'Pastel',
    background: 'hsl(210, 20%, 98%)',
    foreground: 'hsl(224, 71%, 4%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(224, 71%, 4%)',
    primary: 'hsl(162, 47%, 50%)', // Soft mint
    primaryForeground: 'hsl(224, 71%, 4%)',
    secondary: 'hsl(346, 100%, 88%)', // Soft pink
    secondaryForeground: 'hsl(224, 71%, 4%)',
    accent: 'hsl(205, 100%, 89%)', // Soft blue
    accentForeground: 'hsl(224, 71%, 4%)',
    muted: 'hsl(60, 100%, 94%)', // Soft yellow
    mutedForeground: 'hsl(224, 71%, 30%)',
    border: 'hsl(220, 13%, 91%)',
    title: 'hsl(142, 76%, 36%)', // Green title for light mode
    titleDark: 'hsl(142, 71%, 45%)', // Brighter green for dark mode
  },
  blackpink: {
    name: 'BlackPink',
    background: 'hsl(300, 2%, 10%)', // Near black with a hint of pink
    foreground: 'hsl(0, 0%, 98%)',
    card: 'hsl(300, 2%, 12%)',
    cardForeground: 'hsl(0, 0%, 98%)',
    primary: 'hsl(330, 82%, 76%)', // Bright pink
    primaryForeground: 'hsl(0, 0%, 10%)',
    secondary: 'hsl(300, 1%, 20%)',
    secondaryForeground: 'hsl(330, 82%, 76%)',
    accent: 'hsl(330, 82%, 50%)', // Deeper pink
    accentForeground: 'hsl(0, 0%, 98%)',
    muted: 'hsl(300, 2%, 15%)',
    mutedForeground: 'hsl(330, 10%, 80%)', // Lighter for better contrast
    border: 'hsl(300, 2%, 25%)',
    title: 'hsl(142, 71%, 45%)', // Green title for dark mode
    titleDark: 'hsl(142, 71%, 45%)', // Same green for dark mode
  },
  blue: {
    name: 'Blue',
    background: 'hsl(210, 40%, 98%)',
    foreground: 'hsl(222, 47%, 11%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(222, 47%, 11%)',
    primary: 'hsl(221, 83%, 53%)', // Vibrant blue
    primaryForeground: 'hsl(210, 40%, 98%)',
    secondary: 'hsl(214, 32%, 91%)',
    secondaryForeground: 'hsl(222, 47%, 11%)',
    accent: 'hsl(217, 91%, 60%)', // Light blue
    accentForeground: 'hsl(210, 40%, 98%)',
    muted: 'hsl(210, 40%, 96%)',
    mutedForeground: 'hsl(215, 16%, 47%)',
    border: 'hsl(214, 32%, 91%)',
    title: 'hsl(142, 76%, 36%)', // Green title for light mode
    titleDark: 'hsl(142, 71%, 45%)', // Brighter green for dark mode
  },
  sunset: {
    name: 'Sunset',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(20, 14%, 4%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(20, 14%, 4%)',
    primary: 'hsl(15, 100%, 55%)', // Orangish
    primaryForeground: 'hsl(0, 0%, 98%)',
    secondary: 'hsl(30, 100%, 97%)',
    secondaryForeground: 'hsl(20, 14%, 4%)',
    accent: 'hsl(269, 100%, 69%)', // Purple
    accentForeground: 'hsl(0, 0%, 98%)',
    muted: 'hsl(60, 100%, 97%)', 
    mutedForeground: 'hsl(20, 5%, 40%)',
    border: 'hsl(20, 5%, 90%)',
    title: 'hsl(142, 76%, 36%)', // Green title for light mode
    titleDark: 'hsl(142, 71%, 45%)', // Brighter green for dark mode
  },
  forest: {
    name: 'Forest',
    background: 'hsl(120, 5%, 7%)', // Dark green tinted black
    foreground: 'hsl(120, 14%, 90%)',
    card: 'hsl(120, 5%, 10%)',
    cardForeground: 'hsl(120, 14%, 90%)',
    primary: 'hsl(142, 72%, 29%)', // Forest green
    primaryForeground: 'hsl(0, 0%, 98%)',
    secondary: 'hsl(120, 5%, 15%)',
    secondaryForeground: 'hsl(120, 14%, 90%)',
    accent: 'hsl(176, 56%, 45%)', // Teal
    accentForeground: 'hsl(0, 0%, 98%)',
    muted: 'hsl(120, 5%, 15%)',
    mutedForeground: 'hsl(120, 5%, 75%)', // Lighter for better contrast
    border: 'hsl(120, 5%, 20%)',
    title: 'hsl(142, 71%, 45%)', // Green title for dark mode
    titleDark: 'hsl(142, 71%, 45%)', // Same green for dark mode
  },
};

// Convert HSL to CSS variable format without converting color
export function getThemeColorVariables(theme: ThemeColors): Record<string, string> {
  return {
    '--background': extractHSLValues(theme.background),
    '--foreground': extractHSLValues(theme.foreground),
    '--card': extractHSLValues(theme.card),
    '--card-foreground': extractHSLValues(theme.cardForeground),
    '--popover': extractHSLValues(theme.card),
    '--popover-foreground': extractHSLValues(theme.cardForeground),
    '--primary': extractHSLValues(theme.primary),
    '--primary-foreground': extractHSLValues(theme.primaryForeground),
    '--secondary': extractHSLValues(theme.secondary),
    '--secondary-foreground': extractHSLValues(theme.secondaryForeground),
    '--muted': extractHSLValues(theme.muted),
    '--muted-foreground': extractHSLValues(theme.mutedForeground),
    '--accent': extractHSLValues(theme.accent),
    '--accent-foreground': extractHSLValues(theme.accentForeground),
    '--destructive': '0 84.2% 60.2%', // Keep destructive the same across themes
    '--destructive-foreground': '0 0% 98%',
    '--border': extractHSLValues(theme.border),
    '--input': extractHSLValues(theme.border),
    '--ring': extractHSLValues(theme.primary),
    '--title': extractHSLValues(theme.title), // Add title color variable
    '--title-dark': extractHSLValues(theme.titleDark), // Add dark mode title color variable
  };
}

// Extract the HSL values from an HSL string
function extractHSLValues(hslString: string): string {
  // Format: hsl(240, 10%, 3.9%)
  const match = hslString.match(/hsl\((\d+),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);
  if (match) {
    return `${match[1]} ${match[2]}% ${match[3]}%`;
  }
  return '0 0% 0%'; // Default fallback
}
