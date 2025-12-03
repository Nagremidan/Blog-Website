import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Hardcode theme to 'light'
    const theme = 'light';

    // Force data-theme attribute to 'light' to clean up any stale 'dark' attribute
    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'light');
    }, []);

    // No-op toggle function to prevent errors in components that might still call it
    const toggleTheme = () => {
        console.warn('Theme toggling is disabled.');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
