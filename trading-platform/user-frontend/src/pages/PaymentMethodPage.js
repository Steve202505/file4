import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import './MajesticCommon.css';
import '../components/dashboard/Dashboard.css';

const PaymentMethodPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [depositAddresses, setDepositAddresses] = useState({ bankCards: [], cryptoWallets: [] });

    useEffect(() => {
        fetchDepositAddresses();
    }, []);

    const fetchDepositAddresses = async () => {
        try {
            const data = await userService.getDepositAddresses();
            if (data.success) {
                setDepositAddresses({
                    bankCards: data.bankCards || [],
                    cryptoWallets: data.cryptoWallets || []
                });
            }
        } catch (error) {
            console.error('Failed to fetch deposit addresses:', error);
            toast.error(t('error_fetch_deposit', 'Failed to fetch deposit addresses'));
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(t('copied', 'Copied to clipboard!'));
        });
    };

    return (
        <div className="majestic-page-wrapper" style={{ minHeight: '100vh', paddingBottom: '90px' }}>
            {/* Majestic Header */}
            <div className="majestic-header d-flex align-items-center px-3 py-3 justify-content-between">
                <div style={{ width: '40px' }}>
                    <i
                        className="bi bi-chevron-left text-white fs-4 cursor-pointer"
                        onClick={() => navigate('/wallet')}
                    ></i>
                </div>
                <h1 className="majestic-header-title flex-grow-1 text-center">
                    {t('deposit', 'Deposit Funds')}
                </h1>
                <div style={{ width: '40px' }} className="d-flex justify-content-end">
                    <UserLanguageSwitcher />
                </div>
            </div>

            <div className="majestic-container animate-slide-up">
                {/* Majestic Welcome Banner */}
                <div className="majestic-card overflow-hidden position-relative p-4 mb-4 text-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, rgba(252, 213, 53, 0.1), rgba(252, 213, 53, 0.02))', border: '1px solid rgba(252, 213, 53, 0.15)' }}>
                    <div className="ambient-glow" style={{ position: 'absolute', top: '-50%', right: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(252, 213, 53, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
                    <div className="p-3 rounded-circle d-inline-block mb-3 shadow-sm" style={{ border: '1px solid rgba(252, 213, 53, 0.2)', background: 'rgba(252, 213, 53, 0.1)' }}>
                        <i className="bi bi-wallet2 text-warning fs-1"></i>
                    </div>
                    <h4 className="text-white fw-bold mb-2">{t('funding_center', 'Funding Center')}</h4>
                    <p className="text-secondary small mb-0 opacity-75">{t('deposit_instruction', 'Securely transfer funds using the methods provided below.')}</p>
                </div>

                {loading ? (
                    <div className="d-flex flex-column gap-3">
                        {[1, 2].map(i => <div key={i} className="majestic-card skeleton-loading" style={{ height: '200px' }}></div>)}
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-4">

                        {/* Bank Transfer Section */}
                        {depositAddresses.bankCards.length > 0 && (
                            <section>
                                <div className="d-flex align-items-center gap-2 mb-3 ps-2">
                                    <div style={{ width: '4px', height: '16px', background: '#0d6efd', borderRadius: '2px' }}></div>
                                    <h6 className="text-white m-0 fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>{t('bank_transfer', 'Bank Transfer')}</h6>
                                </div>
                                {depositAddresses.bankCards.map(card => (
                                    <div key={card.id} className="majestic-card p-0 overflow-hidden mb-3">
                                        <div className="p-3 d-flex justify-content-between align-items-center border-bottom border-white border-opacity-10" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="p-2 rounded-3 text-primary" style={{ background: 'rgba(0, 123, 255, 0.1)' }}>
                                                    <i className="bi bi-bank2"></i>
                                                </div>
                                                <span className="text-white fw-bold">{card.bankName}</span>
                                            </div>
                                            <span className="badge text-primary border px-2 py-1 rounded-pill extra-small" style={{ background: 'rgba(0, 123, 255, 0.1)', borderColor: 'rgba(0, 123, 255, 0.25)' }}>LOCAL</span>
                                        </div>
                                        <div className="p-4">
                                            <div className="mb-4">
                                                <div className="text-secondary extra-small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('account_name', 'Beneficiary Name')}</div>
                                                <div className="text-white fw-bold fs-5">{card.accountName}</div>
                                            </div>
                                            <div className="mb-4">
                                                <div className="text-secondary extra-small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('account_number_label', 'Account Number')}</div>
                                                <div className="d-flex align-items-center justify-content-between p-3 rounded-4 border border-white border-opacity-5" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                                                    <span className="text-white fw-bold font-monospace fs-4" style={{ letterSpacing: '1px' }}>{card.accountNumber}</span>
                                                    <button className="btn btn-sm btn-link text-warning p-0 shadow-none h-auto" onClick={() => copyToClipboard(card.accountNumber)}>
                                                        <i className="bi bi-files fs-5"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            {card.username && (
                                                <div className="p-2 px-3 rounded-3 text-secondary extra-small d-flex gap-2 align-items-center" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                                    <i className="bi bi-info-circle"></i>
                                                    <span>{t('branch_info', 'Details')}: {card.username}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Crypto Transfer Section */}
                        {depositAddresses.cryptoWallets.length > 0 && (
                            <section>
                                <div className="d-flex align-items-center gap-2 mb-3 ps-2">
                                    <div style={{ width: '4px', height: '16px', background: '#fcd535', borderRadius: '2px' }}></div>
                                    <h6 className="text-white m-0 fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>{t('crypto_transfer', 'Crypto Transfer')}</h6>
                                </div>
                                {depositAddresses.cryptoWallets.map(wallet => (
                                    <div key={wallet.id} className="majestic-card p-0 overflow-hidden mb-3">
                                        <div className="p-3 d-flex justify-content-between align-items-center border-bottom border-white border-opacity-10" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="p-2 rounded-3 text-warning" style={{ background: 'rgba(252, 213, 53, 0.1)' }}>
                                                    <i className="bi bi-currency-bitcoin"></i>
                                                </div>
                                                <span className="text-white fw-bold">{wallet.network}</span>
                                            </div>
                                            <span className="badge text-warning border px-2 py-1 rounded-pill extra-small" style={{ background: 'rgba(252, 213, 53, 0.1)', borderColor: 'rgba(252, 213, 53, 0.25)' }}>GLOBAL</span>
                                        </div>
                                        <div className="p-4">
                                            <div className="mb-4">
                                                <div className="text-secondary extra-small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('wallet_address', 'Wallet Address')}</div>
                                                <div className="d-flex align-items-start gap-3 p-3 rounded-4 border border-white border-opacity-5" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                                                    <div className="text-white fw-bold font-monospace small text-break flex-grow-1" style={{ letterSpacing: '0.5px', lineHeight: '1.5' }}>
                                                        {wallet.walletAddress}
                                                    </div>
                                                    <button className="btn btn-sm btn-link text-warning p-0 shadow-none h-auto" onClick={() => copyToClipboard(wallet.walletAddress)}>
                                                        <i className="bi bi-files fs-5"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            {wallet.alias && (
                                                <div className="p-2 px-3 rounded-3 text-secondary extra-small d-flex gap-2 align-items-center" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                                    <i className="bi bi-shield-lock"></i>
                                                    <span>{t('note', 'Instruction')}: {wallet.alias}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )}

                        {depositAddresses.bankCards.length === 0 && depositAddresses.cryptoWallets.length === 0 && (
                            <div className="majestic-card text-center py-5 opacity-50">
                                <div className="mb-3">
                                    <i className="bi bi-slash-circle fs-1 text-secondary"></i>
                                </div>
                                <h6 className="text-white mb-2">{t('no_deposit_methods', 'No payment methods available.')}</h6>
                                <p className="text-secondary small">{t('contact_support_desc', 'Please contact our support for manual funding.')}</p>
                                <button className="btn majestic-btn-outline mt-3 px-4 py-2" onClick={() => navigate('/profile')}>
                                    {t('contact_support', 'Go to Support')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-4 text-center mt-2">
                    <div className="text-secondary small d-flex align-items-center justify-content-center gap-2 opacity-50">
                        <i className="bi bi-shield-check text-success"></i>
                        <span>{t('secure_encryption', 'End-to-End Encrypted Transfers')}</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .extra-small { font-size: 11px; }
                .skeleton-loading {
                    background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
                    background-size: 200% 100%;
                    animation: shimmy 1.5s infinite;
                }
                @keyframes shimmy {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

export default PaymentMethodPage;
