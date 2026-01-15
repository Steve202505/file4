import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearAuthData } from '../services/auth';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import './AccountPage.css';

const AccountPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState({
        username: 'Loading...',
        id: '...',
        accountBalance: '0.00',
        creditScore: 0,
        supportMessage: '',
        globalSupportMessage: ''
    });
    const [loading, setLoading] = useState(true);
    const [showBalance, setShowBalance] = useState(true);

    // Modals visibility
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

    // UI States
    const [isCopied, setIsCopied] = useState(false);
    const [passSubmitting, setPassSubmitting] = useState(false);
    const [passFormData, setPassFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        fetchProfile();
        if (location.state?.openSupport) {
            setIsSupportModalOpen(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile();
            if (data.success) {
                setUser(data.user);
            } else {
                toast.error(data.message || t('failed_load_user_data'));
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error(t('failed_load_user_data', 'Failed to load user data'));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        clearAuthData();
        navigate('/login');
        toast.success(t('logout_success', 'Logged out successfully'));
    };

    const handlePassChange = (e) => setPassFormData({ ...passFormData, [e.target.name]: e.target.value });

    const handlePassSubmit = async (e) => {
        e.preventDefault();
        if (passFormData.newPassword !== passFormData.confirmPassword) {
            toast.error(t('passwords_not_match', 'Passwords do not match'));
            return;
        }
        setPassSubmitting(true);
        try {
            const data = await userService.changePassword({
                oldPassword: passFormData.oldPassword,
                newPassword: passFormData.newPassword,
                confirmPassword: passFormData.confirmPassword
            });
            if (data.success) {
                toast.success(t('password_changed_success', 'Password updated!'));
                setIsPassModalOpen(false);
                setPassFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            toast.error(error.message || t('failed_update_password', 'Update failed'));
        } finally {
            setPassSubmitting(false);
        }
    };

    const handleCopySupportMessage = () => {
        // Priority: user-specific message > global message > default
        const effectiveMessage = user.supportMessage || user.globalSupportMessage || '';
        const textToCopy = effectiveMessage || t('no_support_message', 'No support message currently available.');
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            toast.success(t('copied_success', 'Copied successfully!'));
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(() => {
            toast.error(t('copy_failed', 'Failed to copy'));
        });
    };

    // Helper to get the effective support message (personal > global > empty)
    const getEffectiveSupportMessage = () => {
        return user.supportMessage || user.globalSupportMessage || '';
    };

    const renderSupportMessage = (text) => {
        if (!text) return t('no_support_message', 'No support message currently available.');
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-warning text-decoration-underline fw-bold" onClick={(e) => e.stopPropagation()}>
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const formattedBalance = user.accountBalance ? Number(user.accountBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
    const displayId = user.id ? user.id.toString().slice(-6).toUpperCase() : '...';

    const groupedMenuItems = [
        {
            title: t('account_settings', 'Account Settings'),
            items: [
                { label: t('deposit', 'Deposit'), icon: 'bi-box-arrow-in-down', path: '/deposit', color: '#fcd535' },
                { label: t('wallet_settings', 'Wallet Settings'), icon: 'bi-wallet2', path: '/wallet', color: '#0d6efd' },
                { label: t('financial_details', 'Financial Details'), icon: 'bi-journal-text', path: '/financial-details', color: '#cddc39' },
                { label: t('my_holdings', 'My Holdings'), icon: 'bi-pie-chart-fill', path: '/holdings', color: '#6c757d' },
            ]
        },
        {
            title: t('security_support', 'Security & Support'),
            items: [
                { label: t('change_password', 'Change Password'), icon: 'bi-shield-lock', action: 'modal', color: '#ffca2c' },
                { label: t('credit_score', 'Credit Score'), icon: 'bi-stars', action: 'credit_modal', color: '#00b894' },
                { label: t('support', 'Support'), icon: 'bi-headset', action: 'support_modal', color: '#ffc107' },
            ]
        }
    ];

    return (
        <div className="dashboard-wrapper pb-5">
            {/* Header */}
            <div className="dashboard-header glass-card d-flex align-items-center justify-content-between px-3 py-3 position-sticky top-0 mb-3" style={{ zIndex: 1000 }}>
                <div style={{ width: '40px' }}></div>
                <div className="header-title flex-grow-1 text-center fw-bold text-uppercase text-white" style={{ letterSpacing: '2px' }}>
                    {t('my_account', 'My Account')}
                </div>
                <div style={{ width: '40px' }} className="d-flex justify-content-end">
                    <UserLanguageSwitcher />
                </div>
            </div>

            <div className="px-3">
                {/* Profile Card - Majestic Upgrade */}
                <div className="profile-card-premium p-4 mb-4 position-relative overflow-hidden animate-scale-up">
                    <div className="verified-shield-aura">
                        <i className="bi bi-shield-check" style={{ fontSize: '180px' }}></i>
                    </div>

                    <div className="d-flex align-items-center gap-4 position-relative" style={{ zIndex: 2 }}>
                        <div className="position-relative">
                            <div className="d-flex align-items-center justify-content-center rounded-circle shadow-lg"
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'linear-gradient(135deg, #fff7d6 0%, #fcd535 50%, #f7b500 100%)',
                                    border: '2px solid rgba(255, 255, 255, 0.2)',
                                    zIndex: 2,
                                    position: 'relative'
                                }}>
                                <i className="bi bi-person-fill text-dark" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <div className="majestic-avatar-glow"></div>
                        </div>

                        <div className="flex-grow-1">
                            <div className="mb-2 h3 fw-900 text-white" style={{ letterSpacing: '0.5px' }}>
                                {loading ? '...' : user.username}
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="majestic-id-badge">
                                    <span className="text-warning fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>{t('id_label', 'ID')}:</span>
                                    <span className="text-white fw-bold" style={{ fontSize: '12px', letterSpacing: '1.5px' }}>{displayId}</span>
                                </div>
                                <div className="copy-btn-majestic"
                                    onClick={() => {
                                        navigator.clipboard.writeText(displayId);
                                        toast.success(t('id_copied', 'ID SECURED'));
                                    }}>
                                    <i className="bi bi-files text-warning" style={{ fontSize: '14px' }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="balance-card-majestic mb-4 animate-scale-up">
                    <div className="surface-reflection"></div>
                    <div className="royal-aura-glow"></div>

                    {/* Sparkle Particles */}
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="sparkle-particle" style={{
                            left: `${Math.random() * 80 + 10}%`,
                            top: `${Math.random() * 80 + 10}%`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            animationDelay: `${Math.random() * 5}s`
                        }}></div>
                    ))}

                    <div className="majestic-light-beam"></div>

                    <div className="d-flex justify-content-between align-items-center mb-4 position-relative" style={{ zIndex: 2 }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="majestic-wallet-icon-wrapper">
                                <i className="bi bi-wallet2 text-dark" style={{ fontSize: '14px' }}></i>
                                <div className="majestic-wallet-glow"></div>
                            </div>
                            <span className="majestic-balance-label">
                                {t('total_balance', 'TOTAL BALANCE')}
                            </span>
                        </div>
                        <div className="d-flex align-items-center justify-content-center rounded-circle transition-all"
                            style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)' }}
                            onClick={() => setShowBalance(!showBalance)}>
                            <i className={`bi ${showBalance ? 'bi-eye' : 'bi-eye-slash'} text-warning opacity-70`}></i>
                        </div>
                    </div>

                    <div className="majestic-balance-text mb-5 position-relative text-center" style={{ zIndex: 2 }}>
                        {showBalance ? formattedBalance : '••••••'}
                    </div>

                    <div className="d-flex gap-4 position-relative" style={{ zIndex: 2 }}>
                        <button className="btn btn-majestic-glass flex-fill py-3 fw-900"
                            onClick={() => navigate('/markets')}>
                            {t('trade', 'Trade')}
                        </button>
                        <button className="btn btn-majestic-gold flex-fill py-3 fw-900"
                            onClick={() => navigate('/withdraw')}>
                            {t('withdraw', 'Withdraw')}
                        </button>
                    </div>
                </div>

                {/* Quick Actions - Majestic Upgrade */}
                <div className="row g-2 mb-5">
                    {[
                        { label: t('financial', 'Financial'), icon: 'bi-journal-text', path: '/financial-details', color: '#cddc39' },
                        { label: t('holdings', 'Holdings'), icon: 'bi-pie-chart-fill', path: '/holdings', color: '#6c757d' },
                        { label: t('deposit', 'Deposit'), icon: 'bi-box-arrow-in-down', path: '/deposit', color: '#fcd535' },
                    ].map((act, i) => (
                        <div key={i} className="col-4">
                            <div className="majestic-action-item text-center cursor-pointer" onClick={() => navigate(act.path)}>
                                <div className="action-box-majestic">
                                    <div className="action-glow-ambient" style={{ background: act.color }}></div>
                                    <i className={`bi ${act.icon}`} style={{ color: act.color, fontSize: '1.8rem', position: 'relative', zIndex: 3 }}></i>
                                </div>
                                <span className="action-label-majestic">{act.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Menu Sections */}
                {groupedMenuItems.map((group, gIndex) => (
                    <div key={gIndex} className="mb-4">
                        <div className="px-2 mb-2">
                            <span className="text-secondary small fw-bold text-uppercase opacity-50" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                                {group.title}
                            </span>
                        </div>
                        <div className="d-flex flex-column">
                            {group.items.map((item, iIndex) => (
                                <div key={iIndex} className="menu-item-row p-3 d-flex align-items-center justify-content-between text-white"
                                    onClick={() => {
                                        if (item.action === 'modal') setIsPassModalOpen(true);
                                        else if (item.action === 'credit_modal') setIsCreditModalOpen(true);
                                        else if (item.action === 'support_modal') setIsSupportModalOpen(true);
                                        else if (item.path) navigate(item.path);
                                    }}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex align-items-center justify-content-center rounded-3"
                                            style={{ width: '36px', height: '36px', background: `${item.color}15`, border: `1px solid ${item.color}20` }}>
                                            <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: '1.1rem' }}></i>
                                        </div>
                                        <span className="fw-medium">{item.label}</span>
                                    </div>
                                    <i className="bi bi-chevron-right text-secondary opacity-50"></i>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Logout Section - Ultra Premium Majestic Edition */}
                <div className="mt-5 mb-5 border-top border-white border-opacity-10 pt-5 pb-5 position-relative">
                    <div className="logout-glow-ambient"></div>
                    <button
                        onClick={handleLogout}
                        className="btn w-100 py-4 fw-bold d-flex align-items-center justify-content-center gap-3 majestic-btn-ultra"
                        style={{ position: 'relative', overflow: 'hidden' }}
                    >
                        <div className="majestic-btn-inner">
                            <i className="bi bi-power fs-3 logout-icon-pulse"></i>
                            <span style={{ fontSize: '18px', letterSpacing: '3px', fontWeight: '800' }}>{t('logout', 'LOG OUT')}</span>
                        </div>
                        <div className="majestic-btn-shimmer"></div>
                    </button>
                    <div className="text-center mt-4">
                        <div className="d-flex align-items-center justify-content-center gap-2 opacity-25">
                            <span className="premium-dot"></span>
                            <small className="text-white fw-bold" style={{ fontSize: '9px', letterSpacing: '2px' }}>{t('secure_session', 'SECURE ENCRYPTED SESSION')}</small>
                            <span className="premium-dot"></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal - Eternal Majestic Edition */}
            {isPassModalOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-4"
                    style={{ zIndex: 1060, background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(20px)' }}
                    onClick={() => setIsPassModalOpen(false)}>

                    <div className="double-gold-border w-100 overflow-hidden shadow-2xl animate-scale-up"
                        style={{ maxWidth: '440px' }}
                        onClick={e => e.stopPropagation()}>

                        <div className="eternal-majestic-shell w-100 p-5 position-relative">
                            <div className="eternal-glow-breathing"></div>

                            {/* Particle Field */}
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="sparkle-particle" style={{
                                    left: `${Math.random() * 80 + 10}%`,
                                    top: `${Math.random() * 80 + 10}%`,
                                    width: `${Math.random() * 3 + 1}px`,
                                    height: `${Math.random() * 3 + 1}px`,
                                    animationDelay: `${Math.random() * 5}s`
                                }}></div>
                            ))}

                            {/* Diamond Accents */}
                            <div className="diamond-accent dtl"></div>
                            <div className="diamond-accent dtr"></div>
                            <div className="diamond-accent dbl"></div>
                            <div className="diamond-accent dbr"></div>

                            <div className="position-relative z-1">
                                <div className="text-center mb-5">
                                    <div className="d-inline-flex align-items-center justify-content-center mb-4 position-relative">
                                        <div className="position-absolute w-100 h-100 rounded-circle"
                                            style={{ background: 'radial-gradient(circle, rgba(252,213,53,0.3) 0%, transparent 70%)', filter: 'blur(20px)' }}></div>
                                        <i className="bi bi-shield-lock text-warning" style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 0 15px rgba(252,213,53,0.4))' }}></i>
                                    </div>
                                    <h1 className="imperial-gold-header mb-1">{t('change_password_title', 'SECURITY')}</h1>
                                    <small className="text-white fw-bold opacity-40 uppercase" style={{ fontSize: '10px', letterSpacing: '3px' }}>{t('encrypted_vault', 'ENCRYPTED VAULT ACCESS')}</small>
                                </div>

                                <form onSubmit={handlePassSubmit}>
                                    <div className="mb-4">
                                        <label className="majestic-label">{t('old_password', 'CURRENT PASSWORD')}</label>
                                        <div className="majestic-input-group d-flex align-items-center">
                                            <input
                                                type={showPasswords.old ? 'text' : 'password'}
                                                name="oldPassword"
                                                className="form-control majestic-input"
                                                required
                                                onChange={handlePassChange}
                                                value={passFormData.oldPassword}
                                                placeholder={t('enter_old_pass', 'Enter current secret')}
                                            />
                                            <i
                                                className={`bi bi-eye${showPasswords.old ? '-slash' : ''} text-warning opacity-50 cursor-pointer ms-2`}
                                                onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                                            ></i>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="majestic-label">{t('new_password', 'NEW MASTER KEY')}</label>
                                        <div className="majestic-input-group d-flex align-items-center">
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                name="newPassword"
                                                className="form-control majestic-input"
                                                required
                                                onChange={handlePassChange}
                                                value={passFormData.newPassword}
                                                placeholder={t('enter_new_pass', 'Establish new security key')}
                                            />
                                            <i
                                                className={`bi bi-eye${showPasswords.new ? '-slash' : ''} text-warning opacity-50 cursor-pointer ms-2`}
                                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            ></i>
                                        </div>
                                    </div>
                                    <div className="mb-5">
                                        <label className="majestic-label">{t('confirm_password', 'CONFIRM MASTER KEY')}</label>
                                        <div className="majestic-input-group d-flex align-items-center">
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                name="confirmPassword"
                                                className="form-control majestic-input"
                                                required
                                                onChange={handlePassChange}
                                                value={passFormData.confirmPassword}
                                                placeholder={t('confirm_new_pass', 'Re-verify your new key')}
                                            />
                                            <i
                                                className={`bi bi-eye${showPasswords.confirm ? '-slash' : ''} text-warning opacity-50 cursor-pointer ms-2`}
                                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            ></i>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={passSubmitting} className="btn golden-ingot-btn w-100 py-3 mb-2 shadow-2xl">
                                        {passSubmitting ? '...' : t('update', 'UPGRADE SECURITY')}
                                    </button>

                                    <div className="mt-4 text-center opacity-30">
                                        <small className="text-white fw-bold" style={{ fontSize: '9px', letterSpacing: '5px' }}>{t('session_shield', 'SESSION SHIELD ACTIVE')}</small>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Credit Score Modal */}
            {isCreditModalOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-4"
                    style={{ zIndex: 1060, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                    onClick={() => setIsCreditModalOpen(false)}>
                    <div className="rounded-4 p-4 w-100 shadow-lg text-center position-relative"
                        style={{ background: '#131722', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '380px' }}
                        onClick={e => e.stopPropagation()}>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="text-white mb-0 fw-bold">{t('credit_score', 'Credit Score')}</h5>
                            <i className="bi bi-x-lg text-secondary cursor-pointer" onClick={() => setIsCreditModalOpen(false)}></i>
                        </div>

                        <div className="position-relative mb-4 d-flex justify-content-center align-items-center" style={{ minHeight: '180px' }}>
                            <svg width="240" height="140" viewBox="0 0 200 120">
                                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="15" strokeLinecap="round" />
                                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#fcd535" strokeWidth="15" strokeLinecap="round"
                                    strokeDasharray="251.3" strokeDashoffset={251.3 - (251.3 * (user.creditScore || 0) / 100)}
                                    style={{ transition: 'stroke-dashoffset 1.5s ease', filter: 'drop-shadow(0 0 8px rgba(252, 213, 53, 0.5))' }} />
                            </svg>
                            <div className="position-absolute" style={{ top: '65%' }}>
                                <div className="text-white fw-bold display-5 mb-0">{user.creditScore || 0}</div>
                                <div className="text-secondary small fw-bold opacity-50">{t('points', 'POINTS')}</div>
                            </div>
                        </div>

                        <p className="text-secondary small mb-4 opacity-75">{t('credit_desc', 'Your account score is excellent. Keep it up to ensure smooth withdrawals.')}</p>
                        <button className="btn btn-warning w-100 py-3 fw-bold rounded-3 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #fcd535 0%, #f7b500 100%)', border: 'none', color: '#000' }}
                            onClick={() => setIsCreditModalOpen(false)}>
                            {t('close', 'Close')}
                        </button>
                    </div>
                </div>
            )}

            {/* Support Modal - Eternal Majestic Edition */}
            {isSupportModalOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-4"
                    style={{ zIndex: 1060, background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(20px)' }}
                    onClick={() => setIsSupportModalOpen(false)}>

                    <div className="double-gold-border w-100 overflow-hidden shadow-2xl animate-scale-up"
                        style={{ maxWidth: '460px' }}
                        onClick={e => e.stopPropagation()}>

                        <div className="eternal-majestic-shell w-100 p-5 position-relative">
                            <div className="eternal-glow-breathing"></div>

                            {/* Particle Field */}
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="sparkle-particle" style={{
                                    left: `${Math.random() * 80 + 10}%`,
                                    top: `${Math.random() * 80 + 10}%`,
                                    width: `${Math.random() * 4 + 2}px`,
                                    height: `${Math.random() * 4 + 2}px`,
                                    animationDelay: `${Math.random() * 5}s`
                                }}></div>
                            ))}

                            {/* Diamond Accents */}
                            <div className="diamond-accent dtl"></div>
                            <div className="diamond-accent dtr"></div>
                            <div className="diamond-accent dbl"></div>
                            <div className="diamond-accent dbr"></div>

                            <div className="position-relative z-1">
                                {/* Header Section */}
                                <div className="text-center mb-5">
                                    <div className="d-inline-flex align-items-center justify-content-center mb-4 position-relative">
                                        <div className="position-absolute w-100 h-100 rounded-circle"
                                            style={{ background: 'radial-gradient(circle, rgba(252,213,53,0.3) 0%, transparent 70%)', filter: 'blur(20px)' }}></div>
                                        <i className="bi bi-headset text-warning" style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 20px rgba(252,213,53,0.5))' }}></i>
                                    </div>
                                    <h1 className="imperial-gold-header mb-2">{t('support_center', 'Support')}</h1>
                                    <div className="d-flex align-items-center justify-content-center gap-3 opacity-90">
                                        {/* Royal Agent label removed as per request to rename whole section to Support */}
                                    </div>
                                </div>

                                {/* Message Container */}
                                <div className="silk-message-card p-4 pb-5 mb-5">
                                    <div className="silk-pattern"></div>
                                    <div className="position-relative z-2">
                                        <div className="text-warning small fw-bold mb-3 d-flex justify-content-between align-items-center" style={{ letterSpacing: '2.5px' }}>
                                            <span className="opacity-60">{t('imperial_message', 'IMPERIAL NOTICE')}</span>
                                            <i className="bi bi-shield-lock-fill fs-5"></i>
                                        </div>
                                        <div className="text-white" style={{ fontSize: '18px', lineHeight: '2', fontWeight: '500', color: 'rgba(255,255,255,0.98)', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                                            {renderSupportMessage(getEffectiveSupportMessage())}
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center mb-4">
                                    <button className={`btn w-100 d-flex align-items-center justify-content-center gap-3 px-4 py-4 rounded-pill shadow-lg transition-all ${isCopied ? 'btn-success' : 'btn-dark border border-warning border-opacity-20'}`}
                                        style={{ fontSize: '16px', background: isCopied ? '' : 'rgba(0,0,0,0.4)', letterSpacing: '2px', backdropFilter: 'blur(10px)' }}
                                        onClick={handleCopySupportMessage}>
                                        <i className={`bi ${isCopied ? 'bi-check2-circle' : 'bi-stars'} fs-4`}></i>
                                        <span className="fw-900">{isCopied ? t('link_secured', 'LINK SECURED') : t('claim_v_link', 'CLAIM VERIFIED LINK')}</span>
                                    </button>
                                </div>

                                <button className="btn golden-ingot-btn w-100 py-3 mb-2 shadow-2xl"
                                    onClick={() => setIsSupportModalOpen(false)}>
                                    {t('done', 'RETURN TO THRONE')}
                                </button>

                                <div className="mt-4 text-center opacity-30">
                                    <small className="text-white fw-bold" style={{ fontSize: '9px', letterSpacing: '5px' }}>{t('royal_encryption', 'ROYAL ENCRYPTION ACTIVE')}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <div className="bottom-nav">
                <Link to="/dashboard" className="nav-item">
                    <i className="bi bi-house-door-fill"></i>
                    <span>{t('home', 'Home')}</span>
                </Link>
                <Link to="/markets" className="nav-item">
                    <i className="bi bi-graph-up"></i>
                    <span>{t('market', 'Market')}</span>
                </Link>
                <Link to="/holdings" className="nav-item">
                    <i className="bi bi-pie-chart-fill"></i>
                    <span>{t('holdings', 'Holdings')}</span>
                </Link>
                <Link to="/profile" className="nav-item active">
                    <i className="bi bi-person-fill"></i>
                    <span>{t('my_account', 'My Account')}</span>
                </Link>
            </div>
        </div>
    );
};

export default AccountPage;
