import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { tradeService } from '../services/tradeService';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import { ALL_ASSETS } from '../constants/assets';
import { toast } from 'react-hot-toast';
import './MajesticCommon.css';
import './HoldingsPage.css';

const HoldingsPage = () => {
    const { t } = useTranslation();
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter State
    const [filterAsset, setFilterAsset] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');
    const [filterDuration, setFilterDuration] = useState('ALL');

    useEffect(() => {
        fetchHoldings();
    }, []);

    const fetchHoldings = async () => {
        try {
            const data = await tradeService.getHistory();
            if (data.success) {
                setHoldings(data.trades);
            }
        } catch (error) {
            console.error('Failed to fetch holdings:', error);
            toast.error(t('failed_load_holdings', 'Failed to load holdings'));
        } finally {
            setLoading(false);
        }
    };

    const uniqueAssets = useMemo(() => {
        return ['ALL', ...ALL_ASSETS];
    }, []);

    const filteredHoldings = useMemo(() => {
        return holdings.filter(h => {
            const assetMatch = filterAsset === 'ALL' || h.pair === filterAsset;
            const typeMatch = filterType === 'ALL' ||
                (filterType === 'BUY' && h.type === 'buy') ||
                (filterType === 'SELL' && h.type === 'sell');
            const durationMatch = filterDuration === 'ALL' || h.duration === parseInt(filterDuration);
            return assetMatch && typeMatch && durationMatch;
        });
    }, [holdings, filterAsset, filterType, filterDuration]);

    const stats = useMemo(() => {
        if (!filteredHoldings.length) return { totalPnL: 0, winRate: 0, activeCount: 0 };
        const totalPnL = filteredHoldings.reduce((acc, h) => acc + (h.pnl || 0), 0);
        const wins = filteredHoldings.filter(h => h.pnl > 0).length; // Positive is profit
        const winRate = ((wins / filteredHoldings.length) * 100).toFixed(1);
        return { totalPnL, winRate, activeCount: filteredHoldings.length };
    }, [filteredHoldings]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const resetFilters = () => {
        setFilterAsset('ALL');
        setFilterType('ALL');
        setFilterDuration('ALL');
    };

    return (
        <div className="majestic-page-wrapper holdings-dashboard-wrapper" style={{ paddingBottom: '90px' }}>
            {/* Majestic Header */}
            <div className="majestic-header d-flex align-items-center px-3 py-3 justify-content-between">
                <div style={{ width: '40px' }}></div>
                <h1 className="majestic-header-title flex-grow-1 text-center">
                    {t('holdings', 'Holdings')}
                </h1>
                <div style={{ width: '40px' }} className="d-flex justify-content-end">
                    <UserLanguageSwitcher />
                </div>
            </div>

            <div className="majestic-container animate-slide-up">
                {/* Portfolio Summary */}
                <div className="portfolio-summary-container p-0 mb-4">
                    <div className="summary-glass-card shadow-lg" style={{ border: '1px solid rgba(252, 213, 53, 0.1)' }}>
                        <div className="summary-label">{t('total_portfolio_pnl', 'Total Portfolio PnL')}</div>
                        <div className="total-equity" style={{ color: stats.totalPnL >= 0 ? '#2ebd85' : '#ea3943' }}>
                            {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(2)}
                        </div>
                        <div className="stats-row">
                            <div className="stat-box">
                                <span className="stat-label">{t('active_trades', 'ACTIVE TRADES')}</span>
                                <span className="stat-val text-white">{stats.activeCount}</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">{t('win_rate', 'WIN RATE')}</span>
                                <span className="stat-val text-warning">{stats.winRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Holdings List */}
                <div className="holdings-list-section p-0">
                    <div className="section-header">
                        <span className="section-title text-uppercase opacity-50 small fw-bold" style={{ letterSpacing: '1px' }}>{t('recent_activity', 'RECENT ACTIVITY')}</span>
                        <div
                            className={`p-2 rounded-3 cursor-pointer ${filterAsset !== 'ALL' || filterType !== 'ALL' || filterDuration !== 'ALL' ? 'bg-warning text-dark' : 'text-white'}`}
                            style={filterAsset === 'ALL' && filterType === 'ALL' && filterDuration === 'ALL' ? { background: 'rgba(255, 255, 255, 0.05)' } : {}}
                            onClick={() => setIsFilterOpen(true)}
                        >
                            <i className="bi bi-sliders2-vertical"></i>
                        </div>
                    </div>

                    {loading ? (
                        <div className="d-flex flex-column gap-3 mt-3">
                            {[1, 2, 3].map(i => <div key={i} className="skeleton-card" style={{ height: '140px' }}></div>)}
                        </div>
                    ) : filteredHoldings.length === 0 ? (
                        <div className="empty-holdings-state py-5 mt-4">
                            <div className="p-4 rounded-circle d-inline-block mb-3" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                <i className="bi bi-inbox empty-icon m-0 opacity-50"></i>
                            </div>
                            <h5 className="text-white opacity-75">{t('no_holdings_found', 'No holdings found')}</h5>
                            <p className="text-muted small mb-4">{t('try_adjusting_filters', 'Try adjusting your filters.')}</p>
                            <button className="btn majestic-btn-primary px-5" onClick={resetFilters}>
                                {t('clear_filters', 'Clear Filters')}
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3 mt-2">
                            {filteredHoldings.map((item) => {
                                const isBuy = item.type === 'buy';
                                const isProfit = (item.pnl || 0) > 0;
                                const pnlClass = isProfit ? 'pnl-profit' : 'pnl-loss';

                                return (
                                    <div key={item.id} className="trade-card-premium shadow-sm m-0">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex flex-column gap-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="pair-badge rounded-pill px-3" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                                        {item.pair}
                                                    </span>
                                                    <span className={`badge rounded-pill px-3 py-2`} style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', background: isBuy ? 'rgba(46, 189, 133, 0.1)' : 'rgba(234, 57, 67, 0.1)', color: isBuy ? '#2ebd85' : '#ea3943' }}>
                                                        {isBuy ? t('buy_up_call', 'Call') : t('buy_down_put', 'Put')}
                                                    </span>
                                                </div>
                                                <div className="price-flow mt-1">
                                                    <div className="d-flex flex-column">
                                                        <span className="text-secondary extra-small text-uppercase" style={{ fontSize: '9px' }}>{t('entry', 'Entry')}</span>
                                                        <span className="text-white fw-bold">{item.entryPrice}</span>
                                                    </div>
                                                    <i className="bi bi-arrow-right text-secondary opacity-25"></i>
                                                    <div className="d-flex flex-column">
                                                        <span className="text-secondary extra-small text-uppercase" style={{ fontSize: '9px' }}>{t('exit', 'Exit')}</span>
                                                        <span className={`fw-bold ${pnlClass}`}>{item.exitPrice || item.entryPrice}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pnl-display text-end">
                                                <div className={`pnl-main ${pnlClass}`} style={{ fontSize: '22px' }}>
                                                    {item.pnl ? (item.pnl >= 0 ? '+' : '') : ''}
                                                    {item.pnl ? item.pnl.toFixed(2) : '0.00'}
                                                </div>
                                                <div className="time-stamp fw-bold text-uppercase opacity-50" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                                                    {item.duration}{t('seconds_short', 's')} {t('trade', 'Trade')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer-info p-3 mt-2 rounded-3">
                                            <div className="d-flex justify-content-between w-100">
                                                <div className="d-flex flex-column">
                                                    <span className="text-secondary opacity-50" style={{ fontSize: '9px', textTransform: 'uppercase' }}>{t('date', 'Date')}</span>
                                                    <span className="time-stamp text-white opacity-75" style={{ fontSize: '11px' }}>{formatDate(item.createdAt)}</span>
                                                </div>
                                                <div className="d-flex flex-column text-end">
                                                    <span className="text-secondary opacity-50" style={{ fontSize: '9px', textTransform: 'uppercase' }}>{t('resolution', 'Resolution')}</span>
                                                    <span className={`time-stamp fw-bold ${item.resolveAt ? 'text-warning' : 'text-secondary'}`} style={{ fontSize: '11px' }}>
                                                        {item.resolveAt ? t('resolved', 'Resolved') : t('pending', 'Pending')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Sheet */}
            {isFilterOpen && (
                <>
                    <div className="filter-overlay" onClick={() => setIsFilterOpen(false)}></div>
                    <div className="filter-sheet majestic-glass" style={{ background: 'linear-gradient(180deg, rgba(22, 27, 38, 0.98) 0%, rgba(11, 14, 17, 1) 100%)' }}>
                        <div className="filter-handle"></div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="text-white fw-bold m-0">{t('filter_trades', 'Filter Trades')}</h4>
                            <i className="bi bi-x-lg text-secondary cursor-pointer" onClick={() => setIsFilterOpen(false)}></i>
                        </div>

                        <div className="filter-group">
                            <span className="filter-group-label">{t('asset_symbol', 'Asset Symbol')}</span>
                            <div className="filter-options-grid">
                                {uniqueAssets.map(asset => (
                                    <div
                                        key={asset}
                                        className={`filter-option ${filterAsset === asset ? 'active' : ''}`}
                                        onClick={() => setFilterAsset(asset)}
                                    >
                                        {asset}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <span className="filter-group-label">{t('order_type', 'Order Type')}</span>
                            <div className="filter-options-grid">
                                {['ALL', 'BUY', 'SELL'].map(type => (
                                    <div
                                        key={type}
                                        className={`filter-option ${filterType === type ? 'active' : ''}`}
                                        onClick={() => setFilterType(type)}
                                    >
                                        {type === 'ALL' ? t('all', 'ALL') : type === 'BUY' ? t('buy', 'BUY') : t('sell', 'SELL')}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group mb-5">
                            <span className="filter-group-label">{t('duration', 'Duration')}</span>
                            <div className="filter-options-grid">
                                {['ALL', '30', '60', '120', '300', '600'].map(d => (
                                    <div
                                        key={d}
                                        className={`filter-option ${filterDuration === d ? 'active' : ''}`}
                                        onClick={() => setFilterDuration(d)}
                                    >
                                        {d === 'ALL' ? t('all', 'ALL') : `${d}${t('seconds_short', 's')}`}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="filter-actions d-grid gap-3" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
                            <button className="btn majestic-btn-outline" onClick={resetFilters}>{t('reset', 'Reset')}</button>
                            <button className="btn majestic-btn-primary" onClick={() => setIsFilterOpen(false)}>{t('apply_filters', 'Apply')}</button>
                        </div>
                    </div>
                </>
            )}

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
                <Link to="/holdings" className="nav-item active">
                    <i className="bi bi-pie-chart-fill text-gold"></i>
                    <span>{t('holdings', 'Holdings')}</span>
                </Link>
                <Link to="/profile" className="nav-item">
                    <i className="bi bi-person"></i>
                    <span>{t('my_account', 'My Account')}</span>
                </Link>
            </div>
        </div>
    );
};

export default HoldingsPage;
