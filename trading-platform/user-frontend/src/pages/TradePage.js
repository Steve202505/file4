import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import CandleChart from '../components/trade/CandleChart';
import { tradeService } from '../services/tradeService';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import './MajesticCommon.css';
import './TradePage.css';

const TradePage = () => {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [interval, setInterval] = useState('5m');
    const [priceData, setPriceData] = useState({ price: '0.00', high: '0.00', low: '0.00', open: '0.00' });

    // Trade Modal State
    const [showTradeModal, setShowTradeModal] = useState(false);
    const [tradeType, setTradeType] = useState('buy'); // 'buy' for Up, 'sell' for Down
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState(60);

    const assetSymbol = (symbol || 'BTCUSDT').toUpperCase();

    // Callback to receive real-time updates from CandleChart
    const handlePriceUpdate = React.useCallback((data) => {
        setPriceData(data);
    }, []);

    const intervals = [
        { label: '1M', value: '1m' },
        { label: '5M', value: '5m' },
        { label: '15M', value: '15m' },
        { label: '30M', value: '30m' },
        { label: '1H', value: '1h' },
        { label: '1D', value: '1d' },
    ];

    const openTradeModal = (type) => {
        setTradeType(type);
        setShowTradeModal(true);
    };

    const handlePlaceTrade = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            toast.error(t('msg_enter_valid_amount', 'Please enter a valid amount'));
            return;
        }

        try {
            const data = await tradeService.placeTrade({
                pair: assetSymbol,
                type: tradeType,
                amount: parseFloat(amount),
                entryPrice: parseFloat(priceData.price),
                duration: duration
            });

            if (data.success) {
                toast.success(t('trade_placed_success', 'Trade placed successfully!'));
                setShowTradeModal(false);
                setAmount('');
            }
        } catch (error) {
            toast.error(error.message || t('trade_failed', 'Trade failed'));
        }
    };

    return (
        <div className="majestic-page-wrapper trade-dashboard-wrapper">
            {/* Majestic Header for Trade */}
            <div className="majestic-header d-flex align-items-center px-3 py-3 justify-content-between">
                <div style={{ width: '40px' }}>
                    <i className="bi bi-chevron-left text-white fs-4 cursor-pointer" onClick={() => navigate(-1)}></i>
                </div>
                <div className="flex-grow-1 text-center d-flex align-items-center justify-content-center gap-2">
                    <h1 className="majestic-header-title m-0" style={{ fontSize: '20px' }}>{assetSymbol}</h1>
                    <div className="live-indicator-dot" title={t('realtime_live', 'Real-time Live')}></div>
                </div>
                <div style={{ width: '40px' }} className="d-flex justify-content-end">
                    <UserLanguageSwitcher />
                </div>
            </div>

            {/* Price Info Bar */}
            <div className="price-info-bar d-flex justify-content-between align-items-center">
                <div className="text-white display-5 fw-bold main-price-display">
                    {priceData.price}
                </div>
                <div className="price-stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">{t('high', 'HIGH')}</span>
                        <span className="stat-value">{priceData.high}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">{t('low', 'LOW')}</span>
                        <span className="stat-value text-danger">{priceData.low}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">{t('open', 'OPEN')}</span>
                        <span className="stat-value">{priceData.open}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">{t('label_24h', '24H')}</span>
                        <span className="stat-value text-success">+1.24%</span>
                    </div>
                </div>
            </div>

            {/* Interval Selector */}
            <div className="interval-selector-container">
                <div className="segmented-pill">
                    {intervals.map((int) => (
                        <div
                            key={int.value}
                            className={`pill-item ${interval === int.value ? 'active' : ''}`}
                            onClick={() => setInterval(int.value)}
                        >
                            {int.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="trade-chart-outer">
                <CandleChart symbol={assetSymbol} interval={interval} onPriceUpdate={handlePriceUpdate} />
            </div>

            {/* Bottom Actions */}
            <div className="trade-actions-footer">
                <button
                    className="btn-premium-action btn-up-gradient"
                    onClick={() => openTradeModal('buy')}
                >
                    <span className="action-label">{t('buy_up', 'Buy Up')}</span>
                    <span className="action-sub">{t('call_option', 'Call Option')}</span>
                </button>
                <button
                    className="btn-premium-action btn-down-gradient"
                    onClick={() => openTradeModal('sell')}
                >
                    <span className="action-label">{t('sell_down', 'Buy Down')}</span>
                    <span className="action-sub">{t('put_option', 'Put Option')}</span>
                </button>
            </div>

            {/* Trade Modal */}
            <Modal show={showTradeModal} onHide={() => setShowTradeModal(false)} centered contentClassName="glass-card border-0 shadow-lg">
                <Modal.Header closeButton closeVariant="white" className="border-bottom border-secondary border-opacity-10 backdrop-blur" style={{ background: 'rgba(20, 24, 30, 0.8)' }}>
                    <Modal.Title className="text-warning fw-bold">
                        {t('trade', 'Trade')}: {assetSymbol}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 trade-modal-body" style={{ background: '#0b1118' }}>
                    <Form onSubmit={handlePlaceTrade}>
                        <div className="d-flex gap-3 mb-4">
                            <Button
                                variant={tradeType === 'buy' ? 'success' : 'outline-dark'}
                                className="flex-grow-1 py-3 fw-bold rounded-4"
                                onClick={() => setTradeType('buy')}
                                style={{ border: tradeType === 'buy' ? 'none' : '1px solid rgba(255,255,255,0.1)', color: tradeType === 'buy' ? '#fff' : '#848e9c' }}
                            >
                                <i className="bi bi-graph-up-arrow me-2"></i>
                                {t('buy', 'Buy')}
                            </Button>
                            <Button
                                variant={tradeType === 'sell' ? 'danger' : 'outline-dark'}
                                className="flex-grow-1 py-3 fw-bold rounded-4"
                                onClick={() => setTradeType('sell')}
                                style={{ border: tradeType === 'sell' ? 'none' : '1px solid rgba(255,255,255,0.1)', color: tradeType === 'sell' ? '#fff' : '#848e9c' }}
                            >
                                <i className="bi bi-graph-down-arrow me-2"></i>
                                {t('sell', 'Sell')}
                            </Button>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-secondary fw-bold mb-2">{t('entry_price', 'Current Entry Price')}</Form.Label>
                            <Form.Control
                                type="text"
                                value={priceData.price || ''}
                                disabled
                                className="bg-dark text-white border-secondary border-opacity-25 py-3 rounded-3 fw-bold"
                                style={{ fontSize: '18px' }}
                            />
                        </Form.Group>

                        <div className="row g-3">
                            <div className="col-12">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-secondary fw-bold mb-2">{t('amount', 'Trading Amount')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder={t('enter_amount', 'Enter amount')}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        className="bg-dark text-white border-secondary border-opacity-25 py-3 rounded-3"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-12">
                                <Form.Group className="mb-4">
                                    <Form.Label className="small text-secondary fw-bold mb-2">{t('duration', 'Trade Duration')}</Form.Label>
                                    <Form.Select
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value))}
                                        className="bg-dark text-white border-secondary border-opacity-25 py-3 rounded-3"
                                    >
                                        <option value="30">30 {t('seconds_short', 'Seconds')}</option>
                                        <option value="60">60 {t('seconds_short', 'Seconds')}</option>
                                        <option value="120">120 {t('seconds_short', 'Seconds')}</option>
                                        <option value="300">300 {t('seconds_short', 'Seconds')}</option>
                                        <option value="600">600 {t('seconds_short', 'Seconds')}</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        <Button
                            className="w-100 py-3 fw-bold rounded-4 shadow-lg btn-shimmer majestic-btn-primary"
                            type="submit"
                        >
                            {t('place_trade', 'Execute Trade')}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default TradePage;
