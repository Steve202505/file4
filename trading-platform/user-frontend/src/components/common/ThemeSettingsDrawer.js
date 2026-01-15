import React from 'react';
import { Offcanvas, Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import './ThemeSettingsDrawer.css';

const ThemeSettingsDrawer = ({ show, onHide }) => {
    const { t } = useTranslation();
    const { settings, updateSettings, resetTheme } = useTheme();

    const handleToggle = (key) => {
        updateSettings({ [key]: !settings[key] });
    };

    const handleLayoutChange = (layout) => {
        updateSettings({ layout });
    };

    const handleWidthChange = (delta) => {
        updateSettings({ menuWidth: Math.max(100, Math.min(400, settings.menuWidth + delta)) });
    };

    return (
        <Offcanvas
            show={show}
            onHide={onHide}
            placement="end"
            className="theme-settings-drawer border-0 shadow"
            style={{ width: '300px' }}
            data-bs-theme={settings.darkMode ? 'dark' : 'light'}
        >
            <Offcanvas.Header closeButton className="border-bottom border-light py-3">
                <Offcanvas.Title className="fs-6 fw-bold text-primary">{t('theme_settings')}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-4 theme-drawer-body">
                {/* Style Setting */}
                <div className="setting-group">
                    <div className="setting-label mb-3">{t('style_setting')}</div>
                    <div className="layout-options d-flex gap-3">
                        <div
                            className={`layout-box side-layout ${settings.layout === 'side' ? 'active' : ''}`}
                            onClick={() => handleLayoutChange('side')}
                        >
                            {settings.layout === 'side' && <i className="bi bi-check-lg check-icon"></i>}
                        </div>
                        <div
                            className={`layout-box top-layout ${settings.layout === 'top' ? 'active' : ''}`}
                            onClick={() => handleLayoutChange('top')}
                        >
                            {settings.layout === 'top' && <i className="bi bi-check-lg check-icon"></i>}
                        </div>
                    </div>
                </div>

                {/* Theme Color */}
                <div className="setting-group mt-4">
                    <div className="setting-label mb-3">{t('theme_color')}</div>
                    <div className="d-flex gap-2 flex-wrap">
                        {['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#001529'].map(color => (
                            <div
                                key={color}
                                className={`color-circle ${settings.themeColor === color ? 'active' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => updateSettings({ themeColor: color })}
                            >
                                {settings.themeColor === color && <i className="bi bi-check text-white"></i>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="divider my-4"></div>

                {/* Toggles */}
                <div className="setting-item d-flex justify-content-between align-items-center mb-4">
                    <span className="setting-text">{t('dark_mode')}</span>
                    <Form.Check
                        type="switch"
                        checked={settings.darkMode}
                        onChange={() => handleToggle('darkMode')}
                        className="custom-switch"
                    />
                </div>

                {/* Reset Button */}
                <div className="mt-5">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="reset-btn w-100"
                        onClick={resetTheme}
                    >
                        {t('reset_theme')}
                    </Button>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default ThemeSettingsDrawer;
