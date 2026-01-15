import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import './MajesticCommon.css';
import '../components/dashboard/Dashboard.css';

const CryptoWalletListPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async () => {
        try {
            const data = await userService.getCryptoWallets();
            if (data.success) {
                setWallets(data.wallets);
            }
        } catch (error) {
            console.error('Failed to fetch wallets:', error);
            toast.error(t('msg_failed_load_wallets', 'Failed to load crypto wallets'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirm_delete_wallet', 'Are you sure you want to delete this wallet?'))) {
            try {
                const data = await userService.deleteCryptoWallet(id);
                if (data.success) {
                    toast.success(t('msg_wallet_deleted', 'Wallet deleted'));
                    fetchWallets();
                }
            } catch (error) {
                console.error('Failed to delete wallet:', error);
                toast.error(error.message || t('msg_failed_delete_wallet', 'Failed to delete wallet'));
            }
        }
    };

    return (
        <div className="majestic-page-wrapper">
            {/* Majestic Header */}
            <div className="majestic-header d-flex align-items-center px-3 py-3 justify-content-between">
                <div style={{ width: '40px' }}>
                    <i
                        className="bi bi-chevron-left text-white fs-4 cursor-pointer"
                        onClick={() => navigate('/wallet')}
                    ></i>
                </div>
                <h1 className="majestic-header-title flex-grow-1 text-center">
                    {t('crypto_wallet_list', 'My Crypto Wallet')}
                </h1>
                <div style={{ width: '40px' }} className="d-flex justify-content-end">
                    <UserLanguageSwitcher />
                </div>
            </div>

            <div className="majestic-container animate-slide-up">
                {/* User Info Header in List */}
                <div className="d-flex align-items-center justify-content-between mb-4 p-3 rounded-4" style={{ background: 'rgba(252, 213, 53, 0.05)', border: '1px solid rgba(252, 213, 53, 0.1)' }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-shield-check-fill text-dark fs-5"></i>
                        </div>
                        <div>
                            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>{t('secure_vault', 'SECURE VAULT')}</div>
                            <div className="text-white fw-bold">{t('encrypted_addresses', 'Encrypted Addresses')}</div>
                        </div>
                    </div>
                    <div
                        className="p-2 cursor-pointer text-warning opacity-75 hover-opacity-100 transition-all"
                        onClick={() => setShowInfo(!showInfo)}
                    >
                        <i className={`bi ${showInfo ? 'bi-eye-slash' : 'bi-eye'} fs-5`}></i>
                    </div>
                </div>

                {/* Content */}
                <div className="wallet-list">
                    {loading ? (
                        <div className="text-center p-5 text-secondary">{t('loading', 'Loading...')}</div>
                    ) : wallets.length === 0 ? (
                        <div className="text-center p-5 text-secondary">
                            <i className="bi bi-wallet2 fs-1 opacity-25 mb-3 d-block"></i>
                            {t('no_data', 'No wallets secured yet')}
                        </div>
                    ) : (
                        wallets.map((wallet) => (
                            <div key={wallet.id} className="majestic-card">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', background: 'rgba(252, 213, 53, 0.1)' }}>
                                            <i className="bi bi-currency-bitcoin text-warning"></i>
                                        </div>
                                        <div>
                                            <div className="text-secondary extra-small fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>{t('network', 'Network')}</div>
                                            <div className="text-white fw-bold">{wallet.network}</div>
                                        </div>
                                    </div>
                                    <div
                                        className="majestic-delete-btn"
                                        onClick={() => handleDelete(wallet.id)}
                                    >
                                        <i className="bi bi-trash3"></i>
                                    </div>
                                </div>
                                <div className="p-3 rounded-3 position-relative" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <div className="text-secondary extra-small fw-bold text-uppercase mb-1" style={{ fontSize: '9px', letterSpacing: '1px' }}>{t('wallet_address', 'Wallet Address')}</div>
                                    <div className="text-white fw-bold break-all" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>
                                        {showInfo ? wallet.walletAddress : '****' + wallet.walletAddress.slice(-8)}
                                    </div>
                                    <div className="mt-2 d-flex justify-content-end">
                                        <div className="badge text-success border py-1 px-2" style={{ background: 'rgba(40, 167, 69, 0.1)', borderColor: 'rgba(40, 167, 69, 0.25)', fontSize: '10px' }}>
                                            <i className="bi bi-check-circle-fill me-1"></i> {t('active', 'ACTIVE')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Button */}
                <div className="mt-4">
                    <button
                        className="btn majestic-btn-primary w-100 py-3"
                        onClick={() => navigate('/wallet/crypto-wallet/add')}
                    >
                        <i className="bi bi-plus-lg me-2"></i>
                        {t('add_wallet_address', 'Add Wallet Address')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CryptoWalletListPage;
