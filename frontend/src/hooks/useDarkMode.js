import { useState, useEffect } from 'react';

export function useDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check localStorage for saved preference
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            return JSON.parse(saved);
        }
        // Default to dark mode (current behavior)
        return true;
    });

    useEffect(() => {
        const root = document.documentElement;

        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Save to localStorage
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    return { isDarkMode, toggleDarkMode };
}
