import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext({
    theme: 'dark', fontSize: 'normal',
    toggleTheme: () => { }, setFontSize: () => { },
});
const DARK_VARS = {
    '--bg': '#0f1117', '--surface': '#1a1d27', '--surface2': '#1c2333',
    '--border': '#2a2d3a', '--text': '#e8eaf0', '--text-muted': '#8b8fa8',
};
const LIGHT_VARS = {
    '--bg': '#f0f2f8', '--surface': '#ffffff', '--surface2': '#f5f7fc',
    '--border': '#d1d5db', '--text': '#1a1d27', '--text-muted': '#6b7280',
};
function applyVars(vars) {
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
}
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('wr_theme') || 'dark');
    const [fontSize, setFontSizeState] = useState(() => localStorage.getItem('wr_fontsize') || 'normal');
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
    const setFontSize = (s) => {
        setFontSizeState(s);
        localStorage.setItem('wr_fontsize', s);
    };
    return (_jsx(ThemeContext.Provider, { value: { theme, fontSize, toggleTheme, setFontSize }, children: children }));
}
export function useTheme() { return useContext(ThemeContext); }
