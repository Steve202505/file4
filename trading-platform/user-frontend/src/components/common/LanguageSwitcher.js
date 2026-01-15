import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

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

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode).then(() => {
            toast.success(i18n.t('language_changed', 'Language updated'));
        });

        // Persist to backend if logged in
        const token = localStorage.getItem('userToken');
        if (token) {
            import('../../services/userService').then(({ userService }) => {
                userService.updateLocale(langCode);
            }).catch(err => console.error('Failed to load userService for locale update', err));
        }
    };

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <Dropdown>
            <Dropdown.Toggle variant="dark" id="dropdown-language" className="d-flex align-items-center gap-2 border-secondary">
                <span>{currentLang.flag}</span>
                <span className="d-none d-md-inline">{currentLang.name}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-dark">
                {languages.map((lang) => (
                    <Dropdown.Item
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        active={i18n.language === lang.code}
                        className="d-flex align-items-center gap-2"
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
