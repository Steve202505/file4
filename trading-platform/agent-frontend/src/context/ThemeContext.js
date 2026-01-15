import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('themeSettings');
        return saved ? JSON.parse(saved) : {
            layout: 'side',
            themeColor: '#409EFF',
            darkMode: true,
            multipleTabs: true,
            expandOneLevel: false,
            menuWidth: 200,
            showLogo: true,
            showBreadcrumbs: true,
            sidebarCollapsed: false
        };
    });

    useEffect(() => {
        localStorage.setItem('themeSettings', JSON.stringify(settings));
        applyTheme(settings);
    }, [settings]);

    const applyTheme = (s) => {
        const target = document.body;

        // Helper to convert hex to rgba
        const hexToRgba = (hex, alpha) => {
            let c;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('');
                if (c.length === 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c = '0x' + c.join('');
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
            }
            return hex;
        }

        // Apply Primary Color & Variants
        target.style.setProperty('--primary-blue', s.themeColor);
        target.style.setProperty('--primary-blue-hover', s.themeColor); // Simple fallback/same for now, or lighten?
        target.style.setProperty('--primary-blue-muted', hexToRgba(s.themeColor, 0.15));
        target.style.setProperty('--text-active', s.themeColor);

        // Apply Sidebar Width - If collapsed, force 64px, else use menuWidth
        const actualWidth = s.sidebarCollapsed ? 64 : s.menuWidth;
        target.style.setProperty('--sidebar-width', `${actualWidth}px`);

        // Add collapsed class to body for CSS targeting
        if (s.sidebarCollapsed) {
            target.classList.add('sidebar-collapsed');
        } else {
            target.classList.remove('sidebar-collapsed');
        }

        if (s.darkMode) {
            target.classList.add('dark-mode');
            target.classList.remove('light-mode');
        } else {
            target.classList.add('light-mode');
            target.classList.remove('dark-mode');
        }
    };

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const resetTheme = () => {
        setSettings({
            layout: 'side',
            themeColor: '#409EFF',
            darkMode: true,
            multipleTabs: true,
            expandOneLevel: false,
            menuWidth: 200,
            showLogo: true,
            showBreadcrumbs: true,
            sidebarCollapsed: false
        });
    };

    return (
        <ThemeContext.Provider value={{ settings, updateSettings, resetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
