import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import '../components/dashboard/Dashboard.css';

const FinancialDetailsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);
    const [summary, setSummary] = useState({ inflow: 0, outflow: 0, net: 0 });

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        if (transactions.length > 0) {
            calculateSummary();
        }
    }, [transactions]);

    const fetchTransactions = async () => {
        try {
            const data = await userService.getTransactions();
            if (data.success) {
                setTransactions(data.transactions || []);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error(t('failed_load_financial', 'Failed to load financial records'));
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = () => {
        if (!transactions || !Array.isArray(transactions)) return;
        let inflow = 0;
        let outflow = 0;

        transactions.forEach(tx => {
            const amount = Math.abs(tx.amount);
            if (['deposit', 'trade_win', 'trade_profit'].includes(tx.type)) {
                inflow += amount;
            } else if (['withdrawal', 'trade_loss', 'trade'].includes(tx.type)) {
                outflow += amount;
            }
        });

        setSummary({
            inflow,
            outflow,
            net: inflow - outflow
        });
    };

    const handleCopy = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'deposit': return 'bi-wallet2';
            case 'withdrawal': return 'bi-box-arrow-up-right';
            case 'trade_win': return 'bi-graph-up-arrow';
            case 'trade_loss': return 'bi-graph-down-arrow';
            case 'trade_profit': return 'bi-cash-stack';
            case 'trade': return 'bi-pcn-chart';
            default: return 'bi-file-earmark-text';
        }
    };

    // Helper to group transactions by date
    const groupTransactionsByDate = (transactions = []) => {
        if (!transactions || !Array.isArray(transactions)) return {};
        const groups = {};
        transactions.forEach(transaction => {
            const date = new Date(transaction.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateKey = format(date, 'MMM dd, yyyy');
            if (date.toDateString() === today.toDateString()) {
                dateKey = t('today', 'Today');
            } else if (date.toDateString() === yesterday.toDateString()) {
                dateKey = t('yesterday', 'Yesterday');
            }

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(transaction);
        });
        return groups;
    };

    const getAmountColor = (type) => {
        if (['deposit', 'trade_win', 'trade_profit'].includes(type)) return '#00bfa5';
        if (['withdrawal', 'trade_loss', 'trade'].includes(type)) return '#ff4d4f';
        return '#ffffff';
    };

    const groupedTransactions = groupTransactionsByDate(transactions);

    return (
        <div className="financial-details-page min-vh-100" style={{ backgroundColor: '#0b0e11', paddingBottom: '90px' }}>
            {/* Majestic Header */}
            <div className="sticky-top" style={{
                background: 'linear-gradient(to bottom, rgba(11, 14, 17, 0.98), rgba(11, 14, 17, 0.85))',
                backdropFilter: 'blur(15px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                zIndex: 1000,
                boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
            }}>
                <div className="d-flex align-items-center justify-content-between p-3">
                    <button className="btn d-flex align-items-center justify-content-center hover-scale"
                        onClick={() => navigate(-1)}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#fff',
                            transition: 'all 0.3s ease'
                        }}>
                        <i className="bi bi-chevron-left fs-5"></i>
                    </button>

                    <div className="text-center">
                        <h6 className="mb-0 fw-bold" style={{
                            background: 'linear-gradient(180deg, #FFFFFF 0%, #A0A0A0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '0.8px',
                            fontSize: '17px',
                            textTransform: 'uppercase'
                        }}>
                            {t('account_change_records', 'Account Change Records')}
                        </h6>
                        <div style={{ fontSize: '9px', color: '#00bfa5', letterSpacing: '2px', fontWeight: 'bold', marginTop: '2px', opacity: 0.8 }}>
                            {t('secure_ledger', 'SECURE LEDGER')}
                        </div>
                    </div>

                    <div className="d-flex justify-content-end" style={{ width: '40px' }}>
                        <UserLanguageSwitcher />
                    </div>
                </div>
            </div>

            <div className="container py-4">
                {/* Summary Dashboard */}
                {!loading && transactions.length > 0 && (
                    <div className="row g-3 mb-4 animate-fade-in">
                        <div className="col-6">
                            <div className="p-3 rounded-4 h-100 position-relative overflow-hidden"
                                style={{ background: 'linear-gradient(165deg, rgba(0, 191, 165, 0.1) 0%, rgba(0, 191, 165, 0.02) 100%)', border: '1px solid rgba(0, 191, 165, 0.2)' }}>
                                <div className="text-success small mb-1 opacity-75 fw-bold" style={{ fontSize: '11px', letterSpacing: '1px' }}>{t('total_inflow', 'TOTAL INFLOW')}</div>
                                <div className="text-white fw-bold fs-5">+{summary.inflow.toFixed(2)}</div>
                                <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }}>
                                    <i className="bi bi-graph-up-arrow text-success" style={{ fontSize: '60px' }}></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="p-3 rounded-4 h-100 position-relative overflow-hidden"
                                style={{ background: 'linear-gradient(165deg, rgba(255, 77, 79, 0.1) 0%, rgba(255, 77, 79, 0.02) 100%)', border: '1px solid rgba(255, 77, 79, 0.2)' }}>
                                <div className="text-danger small mb-1 opacity-75 fw-bold" style={{ fontSize: '11px', letterSpacing: '1px' }}>{t('total_outflow', 'TOTAL OUTFLOW')}</div>
                                <div className="text-white fw-bold fs-5">-{summary.outflow.toFixed(2)}</div>
                                <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }}>
                                    <i className="bi bi-graph-down-arrow text-danger" style={{ fontSize: '60px' }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">{t('loading', 'Loading...')}</span>
                        </div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 mt-5 opacity-50">
                        <i className="bi bi-file-earmark-x text-white mb-3" style={{ fontSize: '48px' }}></i>
                        <div className="text-white small">{t('no_records_found', 'No records found')}</div>
                    </div>
                ) : (
                    <div className="transaction-list">
                        {Object.keys(groupedTransactions).map((dateKey, index) => (
                            <div key={dateKey} className="mb-4">
                                <div className="d-flex align-items-center gap-2 mb-3 ps-2 opacity-75">
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00bfa5' }}></div>
                                    <h6 className="text-white mb-0 fw-bold" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>{dateKey}</h6>
                                    <div className="flex-grow-1" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }}></div>
                                </div>

                                {groupedTransactions[dateKey].map((item) => {
                                    // Determine dynamic styles based on type
                                    const isPositive = ['deposit', 'trade_win', 'trade_profit'].includes(item.type);
                                    const isNegative = ['withdrawal', 'trade_loss', 'trade'].includes(item.type);

                                    // Restore missing content variables
                                    let remark = item.description || item.type;
                                    if (item.type === 'withdrawal') remark = t('request_withdrawal', 'Request withdrawal');
                                    if (item.type === 'trade_win' || item.type === 'trade_loss') remark = t('contract_settlement', 'Contract settlement');
                                    if (item.type === 'trade') remark = t('purchase_contract', 'Purchase contract');

                                    const amount = Math.abs(item.amount).toFixed(2);
                                    const sign = isPositive ? '+' : isNegative ? '-' : '';

                                    const glowColor = isPositive ? 'rgba(0, 191, 165, 0.15)' : isNegative ? 'rgba(255, 77, 79, 0.15)' : 'rgba(255, 255, 255, 0.05)';
                                    const borderColor = isPositive ? 'rgba(0, 191, 165, 0.3)' : isNegative ? 'rgba(255, 77, 79, 0.3)' : 'rgba(255, 255, 255, 0.1)';
                                    const iconGradient = isPositive
                                        ? 'linear-gradient(135deg, rgba(0, 191, 165, 0.2), rgba(0, 191, 165, 0.05))'
                                        : isNegative
                                            ? 'linear-gradient(135deg, rgba(255, 77, 79, 0.2), rgba(255, 77, 79, 0.05))'
                                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))';

                                    // Determine dynamic label for amount
                                    let amountLabel = t('amount', 'Amount');
                                    if (item.type === 'trade_win' || item.type === 'trade_profit') amountLabel = t('profit_amount', 'Profit Amount');
                                    if (item.type === 'trade_loss') amountLabel = t('loss_amount', 'Loss Amount');
                                    if (item.type === 'withdrawal') amountLabel = t('withdrawal_amount', 'Withdrawal Amount');
                                    if (item.type === 'deposit') amountLabel = t('deposit_amount', 'Deposit Amount');
                                    if (item.type === 'trade') amountLabel = t('trade_amount', 'Trade Amount');

                                    return (
                                        <div key={item.id} className="card border-0 mb-3 overflow-hidden animate-fade-in hover-card"
                                            style={{
                                                background: 'linear-gradient(165deg, rgba(22, 27, 38, 0.95) 0%, rgba(18, 22, 31, 0.8) 100%)',
                                                borderRadius: '20px',
                                                boxShadow: `0 10px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
                                                border: `1px solid ${borderColor}`,
                                                backdropFilter: 'blur(10px)',
                                                position: 'relative',
                                                animationDelay: `${index * 0.1}s`
                                            }}>
                                            {/* Ambient Glow Effect */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '-50%',
                                                left: isPositive ? '-20%' : 'auto',
                                                right: isNegative ? '-20%' : 'auto',
                                                width: '60%',
                                                height: '200%',
                                                background: `radial-gradient(circle, ${glowColor} 0%, transparent 60%)`,
                                                transform: 'rotate(25deg)',
                                                pointerEvents: 'none',
                                                zIndex: 0,
                                                opacity: 0.6
                                            }}></div>

                                            <div className="card-body p-4 position-relative" style={{ zIndex: 1 }}>
                                                {/* Card Header: Icon + Type + Date */}
                                                <div className="d-flex align-items-center justify-content-between mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                                                            style={{
                                                                width: '54px',
                                                                height: '54px',
                                                                background: iconGradient,
                                                                border: `1px solid ${borderColor}`,
                                                                boxShadow: `0 0 20px -5px ${glowColor}`
                                                            }}>
                                                            <i className={`bi ${getTransactionIcon(item.type)}`} style={{ fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}></i>
                                                        </div>
                                                        <div>
                                                            <div className="text-white fw-bold text-capitalize" style={{ fontSize: '18px', letterSpacing: '0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                                                {t(item.type, item.type.replace('_', ' '))}
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                                <i className="bi bi-clock text-secondary" style={{ fontSize: '11px' }}></i>
                                                                <div style={{ fontSize: '12px', letterSpacing: '0.3px', fontWeight: '500', color: 'rgba(255,255,255,0.6)' }}>
                                                                    {format(new Date(item.createdAt), 'hh:mm a')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-2"
                                                        style={{
                                                            background: 'rgba(255,255,255,0.05)',
                                                            border: `1px solid ${borderColor}`,
                                                            boxShadow: `0 0 15px -5px ${glowColor}`
                                                        }}>
                                                        <span className="sc-indicator" style={{ background: isPositive ? '#00bfa5' : isNegative ? '#ff4d4f' : '#fff' }}></span>
                                                        <span style={{
                                                            color: isPositive ? '#00bfa5' : isNegative ? '#ff4d4f' : '#fff',
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            letterSpacing: '1px'
                                                        }}>{t('success', 'SUCCESS')}</span>
                                                    </div>
                                                </div>

                                                {/* Card Body: Detailed Rows */}
                                                <div className="d-flex flex-column gap-3">
                                                    {/* Enhanced Transaction ID section */}
                                                    <div className="px-3 py-3 rounded-4"
                                                        style={{
                                                            background: 'rgba(0,0,0,0.3)',
                                                            border: '1px solid rgba(255,255,255,0.04)',
                                                            backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.02), transparent)'
                                                        }}>
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <div className="d-flex align-items-center gap-2" style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                                <i className="bi bi-shield-check" style={{ color: '#00bfa5' }}></i>
                                                                {t('transaction_id', 'Transaction ID')}
                                                            </div>
                                                            <div className="badge-digital" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>
                                                                {t('authenticated', 'AUTHENTICATED')}
                                                            </div>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div className="text-white fw-mono fs-6" style={{ fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', letterSpacing: '1px', opacity: 0.9 }}>
                                                                {item.id.toUpperCase()}
                                                            </div>
                                                            <button
                                                                className="btn btn-sm p-2 d-flex align-items-center justify-content-center"
                                                                onClick={() => handleCopy(item.id)}
                                                                style={{
                                                                    background: copiedId === item.id ? 'rgba(0,191,165,0.1)' : 'rgba(255,255,255,0.05)',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    transition: 'all 0.3s ease',
                                                                    width: '36px',
                                                                    height: '36px'
                                                                }}
                                                            >
                                                                {copiedId === item.id ? (
                                                                    <i className="bi bi-check2 text-success" style={{ fontSize: '16px' }}></i>
                                                                ) : (
                                                                    <i className="bi bi-copy text-secondary" style={{ fontSize: '14px' }}></i>
                                                                )}
                                                            </button>
                                                        </div>
                                                        {copiedId === item.id && (
                                                            <div className="text-success x-small mt-1 animate-fade-in" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                                                                {t('copied_to_clipboard', 'COPIED TO CLIPBOARD')}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Profit Amount - Highlighted with Shimmer */}
                                                    <div className="d-flex justify-content-between align-items-center p-3 rounded-4 position-relative overflow-hidden"
                                                        style={{
                                                            background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                                                            borderLeft: `4px solid ${isPositive ? '#00bfa5' : isNegative ? '#ff4d4f' : '#666'}`
                                                        }}>
                                                        <div className="shimmer-overlay"></div>
                                                        <div className="text-white fw-bold" style={{ fontSize: '14px', letterSpacing: '0.3px' }}>
                                                            {amountLabel}
                                                        </div>
                                                        <div className="fw-bold" style={{
                                                            fontSize: '20px',
                                                            color: getAmountColor(item.type, item.amount),
                                                            textShadow: `0 0 25px ${glowColor}`,
                                                            letterSpacing: '-0.5px'
                                                        }}>
                                                            {sign}{amount}
                                                        </div>
                                                    </div>

                                                    {/* Remark - Enhanced Pill Style */}
                                                    <div className="d-flex justify-content-between align-items-center px-2">
                                                        <div className="d-flex align-items-center gap-2" style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.7)' }}>
                                                            <i className="bi bi-info-circle opacity-50" style={{ fontSize: '12px' }}></i>
                                                            {t('remark', 'Remark')}
                                                        </div>
                                                        <div className="text-white text-end px-3 py-1 rounded-pill"
                                                            style={{
                                                                fontSize: '12px',
                                                                background: 'rgba(255,255,255,0.05)',
                                                                border: '1px solid rgba(255,255,255,0.05)',
                                                                letterSpacing: '0.5px'
                                                            }}>
                                                            {remark}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .hover-scale {
                    transition: transform 0.2s ease;
                }
                .hover-scale:hover {
                    transform: scale(1.1);
                    color: #fff !important;
                }
                .hover-card {
                    transform: translateY(0);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px -5px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1) !important;
                }
                .sc-indicator {
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }
                .shimmer-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.05),
                        transparent
                    );
                    transform: skewX(-20deg) translateX(-150%);
                    animation: shimmer 3s infinite;
                    pointer-events: none;
                }
                @keyframes shimmer {
                    0% { transform: skewX(-20deg) translateX(-150%); }
                    50% { transform: skewX(-20deg) translateX(150%); }
                    100% { transform: skewX(-20deg) translateX(150%); }
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 191, 165, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(0, 191, 165, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 191, 165, 0); }
                }
                .x-small { font-size: 8px; }
            `}</style>
        </div>
    );
};

export default FinancialDetailsPage;
