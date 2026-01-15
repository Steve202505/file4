import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

const UserLanguageSwitcher = () => {
    const { t, i18n } = useTranslation();
    const [isLangModalOpen, setIsLangModalOpen] = useState(false);

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'km', name: 'Khmer', flag: '🇰🇭' },
        { code: 'uk', name: 'Українська', flag: '🇺🇦' },
        { code: 'ur', name: 'اردو', flag: '🇵🇰' }
    ];

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode).then(() => {
            setIsLangModalOpen(false);
            toast.success(i18n.t('language_changed', 'Language updated'));
        });
    };

    const modalContent = (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-4"
            style={{
                zIndex: 9999,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(20px)',
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={() => setIsLangModalOpen(false)}
        >
            <div
                className="rounded-4 overflow-hidden w-100 shadow-2xl"
                style={{
                    background: 'linear-gradient(180deg, #1a1f2c 0%, #0d1117 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    maxWidth: '400px',
                    animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                    <h5 className="text-white mb-0 fw-bold">{t('select_language', 'Select Language')}</h5>
                    <i className="bi bi-x-lg text-white opacity-50" style={{ cursor: 'pointer' }} onClick={() => setIsLangModalOpen(false)}></i>
                </div>
                <div className="p-2" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {languages.map((lang) => (
                        <div
                            key={lang.code}
                            className="d-flex align-items-center justify-content-between p-3 mb-2 rounded-3 action-item"
                            onClick={() => handleLanguageChange(lang.code)}
                            style={{
                                background: i18n.language === lang.code ? 'rgba(255, 202, 44, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                border: i18n.language === lang.code ? '1px solid rgba(255, 202, 44, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
                                <span className={`text-white ${i18n.language === lang.code ? 'fw-bold' : ''}`}>{lang.name}</span>
                            </div>
                            {i18n.language === lang.code && (
                                <i className="bi bi-check2-circle text-warning fs-5"></i>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <style>
                {`
                    @keyframes scaleUp {
                        from { transform: scale(0.9); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}
            </style>
        </div>
    );

    return (
        <>
            <button
                className="d-flex align-items-center justify-content-center border-0 shadow-sm hover-scale lang-switcher-btn"
                onClick={() => setIsLangModalOpen(true)}
                style={{
                    cursor: 'pointer',
                    width: '38px',
                    height: '38px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '50%',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                title={t('select_language', 'Select Language')}
            >
                <i className="bi bi-globe fs-5"></i>
            </button>

            {isLangModalOpen && ReactDOM.createPortal(modalContent, document.body)}

            <style>
                {`
                    .lang-switcher-btn:active {
                        transform: scale(0.9);
                    }
                    .lang-switcher-btn:hover {
                        background: rgba(255, 255, 255, 0.12) !important;
                        border-color: rgba(255, 255, 255, 0.25) !important;
                    }
                    .action-item:hover {
                        background: rgba(255, 255, 255, 0.08) !important;
                        transform: translateX(5px);
                    }
                `}
            </style>
        </>
    );
};

export default UserLanguageSwitcher;
