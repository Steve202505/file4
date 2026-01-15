import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import './MajesticCommon.css';
import '../components/dashboard/Dashboard.css';

const BankCardListPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const data = await userService.getBankCards();
            if (data.success) {
                setCards(data.cards);
            }
        } catch (error) {
            console.error('Failed to fetch cards:', error);
            toast.error(t('failed_load_cards', 'Failed to load bank cards'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirm_delete_card', 'Are you sure you want to delete this card?'))) {
            try {
                const data = await userService.deleteBankCard(id);
                if (data.success) {
                    toast.success(t('card_deleted', 'Card deleted successfully'));
                    fetchCards();
                }
            } catch (error) {
                console.error('Failed to delete card:', error);
                toast.error(error.message || t('failed_delete_card', 'Failed to delete card'));
            }
        }
    };

    const maskName = (name) => {
        if (!name) return '...';
        if (!showInfo) return '****' + name.slice(-2);
        return name;
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
                    {t('bank_card_list', 'Bank Card List')}
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
                            <i className="bi bi-person-fill text-dark fs-5"></i>
                        </div>
                        <div>
                            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>{t('verified_account', 'VERIFIED ACCOUNT')}</div>
                            <div className="text-white fw-bold">{cards.length > 0 ? maskName(cards[0].username) : '...'}</div>
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
                <div className="card-list">
                    {loading ? (
                        <div className="text-center p-5 text-secondary">{t('loading', 'Loading...')}</div>
                    ) : cards.length === 0 ? (
                        <div className="text-center p-5 text-secondary">
                            <i className="bi bi-card-list fs-1 opacity-25 mb-3 d-block"></i>
                            {t('no_cards_added', 'No bank cards added yet')}
                        </div>
                    ) : (
                        cards.map((card) => (
                            <div key={card.id} className="majestic-card">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', background: 'rgba(252, 213, 53, 0.1)' }}>
                                            <i className="bi bi-bank text-warning"></i>
                                        </div>
                                        <div>
                                            <div className="text-secondary extra-small fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>{t('bank_name', 'Bank Name')}</div>
                                            <div className="text-white fw-bold">{card.bankName}</div>
                                        </div>
                                    </div>
                                    <div
                                        className="majestic-delete-btn"
                                        onClick={() => handleDelete(card.id)}
                                    >
                                        <i className="bi bi-trash3"></i>
                                    </div>
                                </div>
                                <div className="p-3 rounded-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <div className="text-secondary extra-small fw-bold text-uppercase mb-1" style={{ fontSize: '9px', letterSpacing: '1px' }}>{t('account_number', 'Account Number')}</div>
                                    <div className="text-white fw-bold family-monospace fs-5" style={{ letterSpacing: '2px' }}>
                                        {showInfo ? card.accountNumber.replace(/(\d{4})/g, '$1 ').trim() : '**** **** **** ' + card.accountNumber.slice(-4)}
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
                        onClick={() => navigate('/wallet/bank-card/add')}
                    >
                        <i className="bi bi-plus-lg me-2"></i>
                        {t('add_bank_card', 'Add Bank Card')}
                    </button>
                </div>

                <div className="text-center mt-4 text-secondary opacity-50 small">
                    {cards.length > 0 ? t('no_more_data', 'No more data available') : ''}
                </div>
            </div>
        </div>
    );
};

export default BankCardListPage;
