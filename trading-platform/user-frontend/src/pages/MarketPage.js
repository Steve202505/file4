import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import { INITIAL_MARKETS, CRYPTO_ICONS } from '../constants/markets';
import '../components/dashboard/Dashboard.css';
import './MajesticCommon.css';

const MarketPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const markets = INITIAL_MARKETS;

    return (
        <div className="majestic-page-wrapper" style={{ paddingBottom: '90px' }}>
            {/* Majestic Header */}
            <div className="majestic-header d-flex align-items-center px-3 py-3 justify-content-between">
                <div style={{ width: '40px' }}></div>
                <h1 className="majestic-header-title flex-grow-1 text-center">
                    {t('market_list', 'Market List')}
                </h1>
                <div style={{ width: '40px' }} className="d-flex justify-content-end">
                    <UserLanguageSwitcher />
                </div>
            </div>

            <div className="majestic-container animate-slide-up">
                <div className="market-list-premium">
                    {markets.map((market, index) => {
                        const IconComponent = CRYPTO_ICONS[market.symbol];
                        return (
                            <div
                                className="market-item-majestic animate-fade-in"
                                key={market.id}
                                onClick={() => navigate(`/trade/${market.pair.replace('/', '').toUpperCase()}`)}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="market-item-left">
                                    <div className="coin-icon-majestic">
                                        {IconComponent ? (
                                            React.createElement(IconComponent, { size: 24 })
                                        ) : (
                                            <span className="coin-text-fallback">{market.symbol[0]}</span>
                                        )}
                                    </div>
                                    <div className="pair-info-majestic">
                                        <div className="pair-name-majestic">{market.pair}</div>
                                        <div className="pair-symbol-majestic">{market.symbol}</div>
                                    </div>
                                </div>
                                <div className="market-item-right">
                                    <div className="price-info-majestic">
                                        <div className="current-price-majestic">{market.price}</div>
                                        <div className={`price-change-majestic ${market.isUp ? 'up' : 'down'}`}>
                                            <i className={`bi bi-caret-${market.isUp ? 'up' : 'down'}-fill me-1`}></i>
                                            {market.change}
                                        </div>
                                    </div>
                                    <i className="bi bi-chevron-right ms-3 opacity-25"></i>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="bottom-nav">
                <Link to="/dashboard" className="nav-item">
                    <i className="bi bi-house-door"></i>
                    <span>{t('home', 'Home')}</span>
                </Link>
                <Link to="/markets" className="nav-item active">
                    <i className="bi bi-graph-up-fill text-gold"></i>
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
                .market-list-premium {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .market-item-majestic {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
                .market-item-majestic:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(252, 213, 53, 0.2);
                    transform: translateX(4px);
                }
                .market-item-left {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .coin-icon-majestic {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, rgba(252, 213, 53, 0.2), rgba(252, 213, 53, 0.05));
                    border: 1px solid rgba(252, 213, 53, 0.1);
                    border-radius: 12px;
                    color: #fcd535;
                }
                .pair-info-majestic {
                    display: flex;
                    flex-direction: column;
                }
                .pair-name-majestic {
                    color: #ffffff;
                    font-weight: 700;
                    font-size: 16px;
                    letter-spacing: 0.3px;
                }
                .pair-symbol-majestic {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 12px;
                    font-weight: 500;
                }
                .market-item-right {
                    display: flex;
                    align-items: center;
                }
                .price-info-majestic {
                    text-align: right;
                }
                .current-price-majestic {
                    color: #ffffff;
                    font-weight: 700;
                    font-size: 16px;
                    margin-bottom: 2px;
                }
                .price-change-majestic {
                    font-size: 12px;
                    font-weight: 600;
                }
                .price-change-majestic.up { color: #00bfa5; }
                .price-change-majestic.down { color: #ff6b6b; }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};

export default MarketPage;
