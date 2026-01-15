import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import UserLanguageSwitcher from '../common/UserLanguageSwitcher';
import { INITIAL_MARKETS, CRYPTO_ICONS } from '../../constants/markets';
import goldCoin from '../../assets/images/gold-coin.jpg';
import '../../pages/MajesticCommon.css';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [markets, setMarkets] = useState(INITIAL_MARKETS);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await userService.getProfile();
      if (data.success) {
        setUser(data.user);
        setBalance(data.user.accountBalance);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const handleMarketClick = (market) => {
    const symbol = market.pair.replace('/', '').toUpperCase();
    navigate(`/trade/${symbol}`);
  };

  return (
    <div className="majestic-page-wrapper" style={{ paddingBottom: '90px' }}>
      {/* Majestic Header */}
      <div className="majestic-header d-flex align-items-center px-3 py-3 justify-content-between">
        <div style={{ width: '40px' }} className="d-flex align-items-center">
          <div className="rounded-3 p-2 text-warning d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', background: 'rgba(252, 213, 53, 0.1)' }}>
            <i className="bi bi-grid-fill" style={{ fontSize: '14px' }}></i>
          </div>
        </div>
        <h1 className="majestic-header-title flex-grow-1 text-center majestic-header-home">
          {t('home_title', 'HOME')}
        </h1>
        <div style={{ width: '40px' }} className="d-flex justify-content-end">
          <UserLanguageSwitcher />
        </div>
      </div>

      <div className="majestic-container animate-slide-up">
        {/* Ticker */}
        <div className="ticker-container-majestic mb-4 shadow-sm">
          <div className="ticker-icon-box-majestic">
            <i className="bi bi-megaphone-fill text-warning"></i>
          </div>
          <div className="ticker-wrapper-majestic">
            <div className="ticker-text-majestic">
              <span>{t('ticker_message', 'Stable and reliable trading platform, Please contact the staff if you need help...')}</span>
              <span className="ms-5">{t('ticker_message', 'Stable and reliable trading platform, Please contact the staff if you need help...')}</span>
            </div>
          </div>
        </div>

        {/* Premium Balance Card */}
        <div className="balance-section-majestic mb-4">
          <div className="balance-card-majestic shadow-lg">
            <div className="ambient-glow" style={{ position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(252, 213, 53, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
            <div className="balance-info-majestic">
              <div className="balance-label-majestic">{t('available_balance', 'Available Balance')}</div>
              <div className="balance-amount-majestic">
                {balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="d-flex gap-2 mt-4">
                <button className="majestic-btn-primary flex-grow-1 py-2 rounded-pill" style={{ fontSize: '12px' }} onClick={() => navigate('/deposit')}>
                  <i className="bi bi-plus-lg me-1"></i> {t('deposit', 'Deposit')}
                </button>
                <button className="majestic-btn-outline flex-grow-1 py-2 rounded-pill text-white" style={{ fontSize: '12px', border: '1px solid rgba(255, 255, 255, 0.2)' }} onClick={() => navigate('/withdraw')}>
                  <i className="bi bi-box-arrow-up me-1"></i> {t('withdraw', 'Withdraw')}
                </button>
              </div>
            </div>
            <div className="card-decoration-majestic">
              <div className="coin-premium-wrapper-majestic shadow-lg">
                <img src={goldCoin} alt={t('gold_coin', 'Gold Coin')} className="coin-premium-majestic" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="row g-3 mb-4">
          <div className="col-6">
            <div className="majestic-card p-3 d-flex align-items-center gap-3 cursor-pointer transition-all" onClick={() => navigate('/financial-details')}>
              <div className="p-2 rounded-3 text-info" style={{ background: 'rgba(0, 184, 217, 0.1)' }}>
                <i className="bi bi-journal-text fs-5"></i>
              </div>
              <div className="text-white small fw-bold">{t('history', 'History')}</div>
            </div>
          </div>
          <div className="col-6">
            <div className="majestic-card p-3 d-flex align-items-center gap-3 cursor-pointer transition-all" onClick={() => navigate('/wallet')}>
              <div className="p-2 rounded-3 text-success" style={{ background: 'rgba(14, 203, 129, 0.1)' }}>
                <i className="bi bi-safe2 fs-5"></i>
              </div>
              <div className="text-white small fw-bold">{t('vault', 'Vault')}</div>
            </div>
          </div>
        </div>

        {/* Market Watchlist Section */}
        <div className="section-header d-flex justify-content-between align-items-center mb-3 px-1">
          <h6 className="text-white m-0 fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>{t('market_watchlist', 'Market Watchlist')}</h6>
          <Link to="/markets" className="text-warning small text-decoration-none">{t('see_all', 'See All')}</Link>
        </div>

        <div className="market-list-majestic d-flex flex-column gap-3">
          {markets.map((market) => {
            const isUp = market.isUp;
            return (
              <div className="majestic-card market-item-majestic p-3" key={market.id} onClick={() => handleMarketClick(market)}>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <div className="coin-icon-majestic shadow-sm">
                      {CRYPTO_ICONS[market.symbol] ? (
                        React.createElement(CRYPTO_ICONS[market.symbol], { size: 18, color: "#000" })
                      ) : (
                        <span style={{ fontSize: '14px', fontWeight: '800' }}>{market.symbol[0]}</span>
                      )}
                    </div>
                    <div>
                      <div className="pair-name-majestic text-white fw-bold">{market.pair}</div>
                      <div className="text-secondary extra-small fw-bold opacity-50" style={{ fontSize: '10px' }}>Vol: 24h</div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="market-price-majestic text-white fw-bold mb-1">{market.price}</div>
                    <div className={`market-change-badge-majestic ${isUp ? 'up' : 'down'}`}>
                      {isUp ? '+' : ''}{market.change}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <Link to="/dashboard" className="nav-item active">
          <i className="bi bi-house-door-fill text-gold"></i>
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
        .majestic-header-home {
            background: linear-gradient(135deg, #ffffff 0%, #fcd535 50%, #ffffff 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: majestic-text-shimmer 4s linear infinite, majestic-text-breathe 4s ease-in-out infinite;
            font-weight: 900 !important;
            letter-spacing: 2px !important;
            text-transform: uppercase !important;
        }

        @keyframes majestic-text-shimmer {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
        }

        @keyframes majestic-text-breathe {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
        }

        .ticker-container-majestic {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            display: flex;
            align-items: center;
            overflow: hidden;
            height: 40px;
        }
        .ticker-icon-box-majestic {
            padding: 0 12px;
            background: rgba(255, 255, 255, 0.02);
            height: 100%;
            display: flex;
            align-items: center;
            border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        .ticker-wrapper-majestic {
            flex-grow: 1;
            overflow: hidden;
            position: relative;
        }
        .ticker-text-majestic {
            display: inline-block;
            white-space: nowrap;
            padding-left: 100%;
            animation: ticker-majestic 30s linear infinite;
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            font-weight: 500;
        }
        @keyframes ticker-majestic {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-100%, 0, 0); }
        }
        .balance-card-majestic {
            background: linear-gradient(135deg, #1e2329 0%, #0b1118 100%);
            border-radius: 24px;
            padding: 24px;
            position: relative;
            overflow: hidden;
            display: flex;
            justify-content: space-between;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .balance-label-majestic {
            color: rgba(255, 255, 255, 0.5);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .balance-amount-majestic {
            color: #fff;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -1px;
        }
        .coin-premium-wrapper-majestic {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid rgba(252, 213, 53, 0.4);
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            box-shadow: 0 0 25px rgba(252, 213, 53, 0.3);
            animation: majestic-float 4s ease-in-out infinite, majestic-pulse 3s ease-in-out infinite;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .coin-premium-wrapper-majestic::after {
            content: "";
            position: absolute;
            top: -50%;
            left: -150%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                to right,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.05) 45%,
                rgba(255, 255, 255, 0.3) 50%,
                rgba(255, 255, 255, 0.05) 55%,
                rgba(255, 255, 255, 0) 100%
            );
            transform: rotate(30deg);
            animation: majestic-shine 3s infinite;
            z-index: 10;
        }
        .coin-premium-wrapper-majestic:hover {
            transform: scale(1.1);
            border-color: rgba(252, 213, 53, 0.9);
            box-shadow: 0 0 40px rgba(252, 213, 53, 0.5);
        }
        .coin-premium-majestic {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: drop-shadow(0 0 15px rgba(252, 213, 53, 0.5));
            transform: scale(1.5); /* Scale up to crop out the white background edges */
            clip-path: circle(42%); /* Further crop to ensure only the coin is visible */
        }

        @keyframes majestic-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }

        @keyframes majestic-pulse {
            0%, 100% { box-shadow: 0 0 25px rgba(252, 213, 53, 0.3); }
            50% { box-shadow: 0 0 45px rgba(252, 213, 53, 0.5); }
        }

        @keyframes majestic-shine {
            0% { left: -150%; }
            20% { left: 100%; }
            100% { left: 100%; }
        }
        .coin-icon-majestic {
            width: 36px;
            height: 36px;
            background: #fcd535;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .market-change-badge-majestic {
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            display: inline-block;
        }
        .market-change-badge-majestic.up {
            background: rgba(14, 203, 129, 0.1);
            color: #0ecb81;
        }
        .market-change-badge-majestic.down {
            background: rgba(246, 70, 93, 0.1);
            color: #f6465d;
        }
        .extra-small { font-size: 11px; }
      `}</style>
    </div>
  );
};

export default Dashboard;