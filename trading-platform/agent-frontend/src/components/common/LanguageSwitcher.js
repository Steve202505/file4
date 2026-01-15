import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文 (Simplified)', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰', dir: 'rtl' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'km', name: 'Khmer', flag: '🇰🇭' }
];

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const { settings } = useTheme();

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);

        // Persist to backend if logged in
        const token = localStorage.getItem('agentToken');
        if (token) {
            import('../../services/agentService').then(({ agentService }) => {
                agentService.updateLocale(langCode);
            }).catch(err => console.error('Failed to load agentService for locale update', err));
        }
    };

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <Dropdown className="ms-3">
            <Dropdown.Toggle
                variant="link"
                id="dropdown-language"
                size="sm"
                className="d-flex align-items-center gap-2 border text-decoration-none"
                style={{
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-input)',
                    padding: '4px 12px',
                    fontSize: '13px'
                }}
            >
                <span>{currentLang.flag}</span>
                <span className="d-none d-lg-inline">{currentLang.name}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu
                className="shadow-sm mt-2"
                data-bs-theme={settings.darkMode ? 'dark' : 'light'}
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
                {languages.map((lang) => (
                    <Dropdown.Item
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        active={i18n.language === lang.code}
                        className="d-flex align-items-center gap-2"
                        style={{ fontSize: '13px' }}
                    >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LanguageSwitcher;
