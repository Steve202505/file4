import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        darkMode: true,
        themeColor: '#409EFF',
        layout: 'top', // Default for user dashboard
        menuWidth: 260,
        showLogo: true,
        showBreadcrumbs: true,
        multipleTabs: false,
        expandOneLevel: true
    });

    useEffect(() => {
        // Apply dark mode
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.setAttribute('data-bs-theme', 'light');
        }
        // Save to local storage could be added here
    }, [settings.darkMode]);

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const resetTheme = () => {
        setSettings({
            darkMode: true,
            themeColor: '#409EFF',
            layout: 'top',
            menuWidth: 260,
            showLogo: true,
            showBreadcrumbs: true,
            multipleTabs: false,
            expandOneLevel: true
        });
    };

    return (
        <ThemeContext.Provider value={{ settings, updateSettings, resetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
