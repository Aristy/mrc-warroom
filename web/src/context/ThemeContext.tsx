import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
type FontSize = 'normal' | 'large';

interface ThemeContextValue {
  theme: Theme;
  fontSize: FontSize;
  toggleTheme: () => void;
  setFontSize: (s: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark', fontSize: 'normal',
  toggleTheme: () => {}, setFontSize: () => {},
});

const DARK_VARS = {
  '--bg': '#0f1117', '--surface': '#1a1d27', '--surface2': '#1c2333',
  '--border': '#2a2d3a', '--text': '#e8eaf0', '--text-muted': '#8b8fa8',
};
const LIGHT_VARS = {
  '--bg': '#f0f2f8', '--surface': '#ffffff', '--surface2': '#f5f7fc',
  '--border': '#d1d5db', '--text': '#1a1d27', '--text-muted': '#6b7280',
};

function applyVars(vars: Record<string, string>) {
  Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('wr_theme') as Theme) || 'dark');
  const [fontSize, setFontSizeState] = useState<FontSize>(() => (localStorage.getItem('wr_fontsize') as FontSize) || 'normal');

  useEffect(() => {
    applyVars(theme === 'dark' ? DARK_VARS : LIGHT_VARS);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize === 'large' ? '17px' : '15px';
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('wr_theme', next);
      return next;
    });
  };

  const setFontSize = (s: FontSize) => {
    setFontSizeState(s);
    localStorage.setItem('wr_fontsize', s);
  };

  return (
    <ThemeContext.Provider value={{ theme, fontSize, toggleTheme, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
