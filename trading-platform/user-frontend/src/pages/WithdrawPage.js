import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import { toast } from 'react-hot-toast';
import './MajesticCommon.css';
import '../components/dashboard/Dashboard.css';

const WithdrawPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('bank'); // bank or crypto
    const [bankCards, setBankCards] = useState([]);
    const [cryptoWallets, setCryptoWallets] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [balance, setBalance] = useState(0);

    const [creditScore, setCreditScore] = useState(100);
    const [isLowScoreModalOpen, setIsLowScoreModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, bankRes, cryptoRes] = await Promise.all([
                userService.getProfile(),
                userService.getBankCards(),
                userService.getCryptoWallets()
            ]);

            if (profileRes.success) {
                setBalance(profileRes.user.accountBalance);
                setCreditScore(profileRes.user.creditScore ?? 0);
            }
            if (bankRes.success) setBankCards(bankRes.cards);
            if (cryptoRes.success) setCryptoWallets(cryptoRes.wallets || []);
        } catch (error) {
            console.error('Failed to fetch withdrawal data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();

        // Check Credit Score
        if (creditScore < 100) {
            setIsLowScoreModalOpen(true);
            return;
        }

        if (!amount || amount <= 0) return toast.error(t('msg_enter_valid_amount', 'Enter valid amount'));
        if (!selectedId) return toast.error(t('select_payment_method', 'Select a payment method'));

        setSubmitting(true);
        try {
            const details = method === 'bank'
                ? bankCards.find(c => c.id === selectedId)
                : cryptoWallets.find(w => w.id === selectedId);

            const response = await userService.withdraw({
                amount: parseFloat(amount),
                method: method,
                accountDetails: details
            });

            if (response.success) {
                toast.success(t('withdrawal_request_submitted', 'Withdrawal request submitted'));
                navigate('/profile');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || t('withdrawal_failed', 'Withdrawal failed'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="majestic-page-wrapper" style={{ minHeight: '100vh', background: '#0b1118' }}>
            {/* Majestic Header */}
            <div className="majestic-header d-flex align-items-center px-3 py-3 justify-content-between">
                <div style={{ width: '40px' }}>
                    <i className="bi bi-chevron-left text-white fs-4 cursor-pointer" onClick={() => navigate('/wallet')}></i>
                </div>
                <h1 className="majestic-header-title flex-grow-1 text-center">
                    {t('withdraw', 'Withdraw')}
                </h1>
                <div style={{ width: '40px' }} className="d-flex justify-content-end">
                    <UserLanguageSwitcher />
                </div>
            </div>

            <div className="majestic-container animate-slide-up">
                {/* Balance Card */}
                <div className="majestic-card p-4 mb-4 text-center overflow-hidden position-relative shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(252, 213, 53, 0.1), rgba(252, 213, 53, 0.02))', border: '1px solid rgba(252, 213, 53, 0.15)' }}>
                    <div className="text-secondary small fw-bold text-uppercase mb-2" style={{ letterSpacing: '1px' }}>{t('available_balance', 'Available Balance')}</div>
                    <div className="text-white fw-bold" style={{ fontSize: '36px', letterSpacing: '-1px' }}>{balance.toFixed(2)}</div>
                </div>

                <form onSubmit={handleWithdraw}>
                    <div className="majestic-form-group">
                        <div className="majestic-label-row">
                            <span className="majestic-label-dot"></span>
                            <span className="majestic-label-text">{t('withdrawal_amount', 'Withdrawal Amount')}</span>
                        </div>
                        <div className="majestic-input-wrapper">
                            <input
                                type="number"
                                className="form-control majestic-input-field p-3"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="majestic-form-group mb-4">
                        <div className="majestic-label-row">
                            <span className="majestic-label-dot"></span>
                            <span className="majestic-label-text">{t('withdrawal_method', 'Withdrawal Method')}</span>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className={`btn flex-grow-1 py-3 rounded-4 fw-bold transition-all ${method === 'bank' ? 'majestic-btn-primary' : 'text-secondary border border-white border-opacity-10'}`}
                                style={method !== 'bank' ? { background: 'rgba(255, 255, 255, 0.05)' } : {}}
                                onClick={() => { setMethod('bank'); setSelectedId(''); }}
                            >
                                <i className="bi bi-bank2 me-2"></i>
                                {t('bank_card', 'Bank Card')}
                            </button>
                            <button
                                type="button"
                                className={`btn flex-grow-1 py-3 rounded-4 fw-bold transition-all ${method === 'crypto' ? 'majestic-btn-primary' : 'text-secondary border border-white border-opacity-10'}`}
                                style={method !== 'crypto' ? { background: 'rgba(255, 255, 255, 0.05)' } : {}}
                                onClick={() => { setMethod('crypto'); setSelectedId(''); }}
                            >
                                <i className="bi bi-wallet2 me-2"></i>
                                {t('crypto_wallet', 'Crypto Wallet')}
                            </button>
                        </div>
                    </div>

                    <div className="majestic-form-group mb-5">
                        <div className="majestic-label-row">
                            <span className="majestic-label-dot"></span>
                            <span className="majestic-label-text">{t('select_account', 'Select Account')}</span>
                        </div>
                        <div className="majestic-input-wrapper">
                            <select
                                className="form-control majestic-input-field appearance-none"
                                value={selectedId}
                                onChange={(e) => setSelectedId(e.target.value)}
                            >
                                <option value="">{t('choose_account', '-- Choose Account --')}</option>
                                {method === 'bank' ? (
                                    bankCards.map(c => <option key={c.id} value={c.id}>{c.bankName} - {c.accountNumber}</option>)
                                ) : (
                                    cryptoWallets.map(w => <option key={w.id} value={w.id}>{w.network} - {w.walletAddress.slice(0, 10)}...</option>)
                                )}
                            </select>
                        </div>
                        {((method === 'bank' && bankCards.length === 0) || (method === 'crypto' && cryptoWallets.length === 0)) && !loading && (
                            <div
                                className="text-warning small mt-3 d-flex align-items-center gap-2 px-2 py-2 rounded-3 border border-warning border-opacity-10"
                                style={{ background: 'rgba(252, 213, 53, 0.05)', cursor: 'pointer' }}
                                onClick={() => navigate(method === 'bank' ? '/wallet/bank-card/add' : '/wallet/crypto-wallet/add')}
                            >
                                <i className="bi bi-plus-circle-fill"></i>
                                <span className="fw-bold">{method === 'bank' ? t('add_bank_card_first', 'Add Bank Card first') : t('add_wallet_first', 'Add Wallet first')}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || loading || !amount || !selectedId}
                        className="btn majestic-btn-primary w-100 py-3 fw-bold shadow-lg"
                    >
                        {submitting ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>{t('processing', 'Processing...')}</>
                        ) : (
                            <><i className="bi bi-shield-check me-2"></i>{t('submit_withdrawal', 'Submit Withdrawal')}</>
                        )}
                    </button>
                </form>
            </div>

            {/* Low Credit Score Modal */}
            {isLowScoreModalOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-4"
                    style={{ zIndex: 1060, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                    onClick={() => setIsLowScoreModalOpen(false)}
                >
                    <div
                        className="majestic-card p-4 w-100 text-center animate-slide-up"
                        style={{ maxWidth: '350px', border: '1px solid rgba(255, 77, 79, 0.2)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-3 p-4 rounded-circle d-inline-block" style={{ background: 'rgba(220, 53, 69, 0.1)' }}>
                            <i className="bi bi-exclamation-octagon text-danger" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <h5 className="text-white fw-bold mb-3">{t('insufficient_credit_score', 'Insufficient Credit Score')}</h5>
                        <p className="text-secondary small mb-4 px-2" style={{ lineHeight: '1.6' }}>
                            {t('credit_score_reason', { score: creditScore })}
                        </p>
                        <button
                            className="btn majestic-btn-primary w-100 fw-bold py-3"
                            onClick={() => setIsLowScoreModalOpen(false)}
                        >
                            {t('understood', 'Understood')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WithdrawPage;
