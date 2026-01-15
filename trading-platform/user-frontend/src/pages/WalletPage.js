import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { userService } from '../services/userService';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import './MajesticCommon.css';
import './WalletPage.css';

const WalletPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const data = await userService.getProfile();
            if (data.success) {
                setBalance(data.user.accountBalance);
            }
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="majestic-page-wrapper" style={{ paddingBottom: '90px' }}>
            {/* Majestic Header */}
            <div className="majestic-header d-flex align-items-center px-3 py-3 justify-content-between">
                <div style={{ width: '40px' }}>
                    <i className="bi bi-chevron-left text-white fs-4 cursor-pointer" onClick={() => navigate('/profile')}></i>
                </div>
                <h1 className="majestic-header-title flex-grow-1 text-center">
                    {t('wallet', 'My Wallet')}
                </h1>
                <div style={{ width: '40px' }} className="d-flex justify-content-end">
                    <UserLanguageSwitcher />
                </div>
            </div>

            <div className="majestic-container animate-slide-up">
                {/* Balance Dashboard */}
                <div className="majestic-card p-0 overflow-hidden mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #1e2329 0%, #0b1118 100%)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div className="p-4 text-center position-relative">
                        <div className="ambient-glow" style={{ position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(252, 213, 53, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
                        <div className="text-secondary small fw-bold text-uppercase mb-2" style={{ letterSpacing: '1px' }}>{t('available_balance', 'Available Balance')}</div>
                        <div className="text-white fw-bold mb-1" style={{ fontSize: '38px', letterSpacing: '-1px' }}>
                            {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-success small fw-bold">
                            <i className="bi bi-shield-check me-1"></i> {t('assets_secured', 'Assets Secured')}
                        </div>
                    </div>
                    <div className="d-flex border-top border-white border-opacity-5">
                        <div className="flex-grow-1 p-3 text-center border-end border-white border-opacity-5 cursor-pointer hover-bg-opacity-5 transition-all" style={{ background: 'transparent' }} onClick={() => navigate('/deposit')}>
                            <i className="bi bi-plus-circle text-warning fs-4 d-block mb-1"></i>
                            <span className="text-white small fw-bold">{t('deposit', 'Deposit')}</span>
                        </div>
                        <div className="flex-grow-1 p-3 text-center cursor-pointer hover-bg-opacity-5 transition-all" style={{ background: 'transparent' }} onClick={() => navigate('/withdraw')}>
                            <i className="bi bi-arrow-up-circle text-primary fs-4 d-block mb-1"></i>
                            <span className="text-white small fw-bold">{t('withdraw', 'Withdraw')}</span>
                        </div>
                    </div>
                </div>

                {/* Secure Management Section */}
                <h6 className="text-secondary small fw-bold text-uppercase mb-3 ps-2" style={{ letterSpacing: '1px' }}>{t('secure_management', 'SECURE MANAGEMENT')}</h6>

                <div className="majestic-card p-0 overflow-hidden mb-4">
                    <div className="wallet-menu-item d-flex align-items-center justify-content-between p-3 border-bottom border-white border-opacity-5 cursor-pointer" onClick={() => navigate('/wallet/bank-card')}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-2 rounded-3 text-primary" style={{ background: 'rgba(0, 123, 255, 0.1)' }}>
                                <i className="bi bi-credit-card-2-front fs-5"></i>
                            </div>
                            <div>
                                <div className="text-white fw-bold small">{t('bank_cards', 'Bank Cards')}</div>
                                <div className="text-secondary extra-small" style={{ fontSize: '10px' }}>{t('manage_bank_accounts', 'Manage Withdrawal Methods')}</div>
                            </div>
                        </div>
                        <i className="bi bi-chevron-right text-secondary small"></i>
                    </div>

                    <div className="wallet-menu-item d-flex align-items-center justify-content-between p-3 border-bottom border-white border-opacity-5 cursor-pointer" onClick={() => navigate('/wallet/crypto-wallet')}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-2 rounded-3 text-warning" style={{ background: 'rgba(252, 213, 53, 0.1)' }}>
                                <i className="bi bi-currency-bitcoin fs-5"></i>
                            </div>
                            <div>
                                <div className="text-white fw-bold small">{t('crypto_wallets', 'Crypto Wallets')}</div>
                                <div className="text-secondary extra-small" style={{ fontSize: '10px' }}>{t('manage_crypto_addresses', 'Secure On-chain Storage')}</div>
                            </div>
                        </div>
                        <i className="bi bi-chevron-right text-secondary small"></i>
                    </div>

                    <div className="wallet-menu-item d-flex align-items-center justify-content-between p-3 cursor-pointer" onClick={() => navigate('/financial-details')}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-2 rounded-3 text-info" style={{ background: 'rgba(23, 162, 184, 0.1)' }}>
                                <i className="bi bi-clock-history fs-5"></i>
                            </div>
                            <div>
                                <div className="text-white fw-bold small">{t('transaction_history', 'Transaction History')}</div>
                                <div className="text-secondary extra-small" style={{ fontSize: '10px' }}>{t('view_all_records', 'Audit Your Logs')}</div>
                            </div>
                        </div>
                        <i className="bi bi-chevron-right text-secondary small"></i>
                    </div>
                </div>

                {/* Security Message */}
                <div className="p-4 rounded-4 text-center mt-5" style={{ background: 'rgba(252, 213, 53, 0.02)', border: '1px dashed rgba(252, 213, 53, 0.1)' }}>
                    <i className="bi bi-shield-lock-fill text-warning fs-3 mb-2 d-block"></i>
                    <h6 className="text-white fw-bold mb-2">{t('funds_safety', 'Your Funds are Safe')}</h6>
                    <p className="text-secondary small mb-0 px-3 opacity-75">{t('wallet_encryption_note', 'All wallet details are encrypted and stored in an isolated secure environment.')}</p>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="bottom-nav">
                <Link to="/dashboard" className="nav-item">
                    <i className="bi bi-house-door"></i>
                    <span>{t('home', 'Home')}</span>
                </Link>
                <Link to="/markets" className="nav-item">
                    <i className="bi bi-graph-up"></i>
                    <span>{t('market', 'Market')}</span>
                </Link>
                <Link to="/holdings" className="nav-item">
                    <i className="bi bi-pie-chart"></i>
                    <span>{t('holdings', 'Holdings')}</span>
                </Link>
                <Link to="/profile" className="nav-item">
                    <i className="bi bi-person"></i>
                    <span>{t('my_account', 'My Account')}</span>
                </Link>
            </div>

            <style jsx>{`
                .hover-bg-opacity-5:hover { background-color: rgba(255, 255, 255, 0.05) !important; }
                .extra-small { font-size: 11px; }
                .wallet-menu-item:active { background-color: rgba(255, 255, 255, 0.03); }
            `}</style>
        </div>
    );
};

export default WalletPage;
