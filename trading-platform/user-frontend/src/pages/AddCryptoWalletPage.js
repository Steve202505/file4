import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import './MajesticCommon.css';
import MajesticSelect from '../components/common/MajesticSelect';

const AddCryptoWalletPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        network: '',
        walletAddress: ''
    });

    const networkOptions = [
        { value: 'TRC20', label: t('trc20', 'TRC20'), name: 'network' },
        { value: 'ERC20', label: t('erc20', 'ERC20'), name: 'network' }
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = await userService.addCryptoWallet(formData);
            if (data.success) {
                toast.success(t('wallet_address_added', 'Wallet address added successfully'));
                navigate('/wallet/crypto-wallet');
            }
        } catch (error) {
            console.error('Failed to add crypto wallet:', error);
            toast.error(error.message || t('error_adding_wallet', 'Error adding wallet address'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="majestic-page-wrapper">
            <div className="majestic-header d-flex align-items-center px-3 py-3 justify-content-between">
                <div style={{ width: '40px' }}>
                    <i
                        className="bi bi-chevron-left text-white fs-4 cursor-pointer"
                        onClick={() => navigate('/wallet/crypto-wallet')}
                    ></i>
                </div>
                <h1 className="majestic-header-title flex-grow-1 text-center">
                    {t('add_wallet_address', 'Add Wallet Address')}
                </h1>
                <div style={{ width: '40px' }} className="d-flex justify-content-end">
                    <UserLanguageSwitcher />
                </div>
            </div>

            <div className="majestic-container animate-slide-up">
                <div className="p-4 rounded-4 mb-4" style={{ background: 'rgba(252, 213, 53, 0.05)', border: '1px solid rgba(252, 213, 53, 0.1)' }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded-3" style={{ background: 'rgba(252, 213, 53, 0.1)' }}>
                            <i className="bi bi-shield-lock-fill text-warning fs-4"></i>
                        </div>
                        <div>
                            <div className="text-white fw-bold">{t('secure_vault', 'SECURE VAULT')}</div>
                            <div className="text-secondary small">{t('secure_vault_desc', 'Your wallet addresses are protected by military-grade encryption.')}</div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="majestic-form-group">
                        <div className="majestic-label-row">
                            <span className="majestic-label-dot"></span>
                            <span className="majestic-label-text">{t('network', 'Network')}</span>
                        </div>
                        <MajesticSelect
                            options={networkOptions}
                            value={formData.network}
                            onChange={handleChange}
                            placeholder={t('select_network', 'Select Network')}
                            icon="bi-hdd-network-fill"
                        />
                    </div>

                    <div className="majestic-form-group mb-4">
                        <div className="majestic-label-row">
                            <span className="majestic-label-dot"></span>
                            <span className="majestic-label-text">{t('wallet_address', 'Wallet Address')}</span>
                        </div>
                        <div className="majestic-input-wrapper">
                            <input
                                type="text"
                                name="walletAddress"
                                className="form-control majestic-input-field"
                                placeholder={t('enter_crypto_address', 'Enter Wallet Address')}
                                value={formData.walletAddress}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn majestic-btn-primary w-100 py-3 mt-2"
                    >
                        {submitting ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>{t('submitting', 'Processing...')}</>
                        ) : (
                            <><i className="bi bi-shield-check me-2"></i>{t('submit', 'Submit Address')}</>
                        )}
                    </button>
                </form>

                <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="text-secondary extra-small d-flex gap-2">
                        <i className="bi bi-info-circle text-warning"></i>
                        <span style={{ fontSize: '11px', lineHeight: '1.4' }}>
                            {t('wallet_notice', 'Please double-check your wallet address. Incorrect addresses may result in permanent loss of funds.')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCryptoWalletPage;
