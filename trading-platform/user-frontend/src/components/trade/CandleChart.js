import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

const CandleChart = ({ symbol = 'btcusdt', interval = '5m', onPriceUpdate }) => {
    const { t } = useTranslation();
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const candleSeriesRef = useRef();
    const volumeSeriesRef = useRef();
    const wsRef = useRef();

    // Optimization: Use ref for legend values to avoid React re-renders on every mouse move
    const legendRef = useRef(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        let isMounted = true;
        let crosshairSubscription = null;

        // Initialize Chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#848e9c',
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.05)',
                visible: true,
            },
            timeScale: {
                barSpacing: 10,
                minBarSpacing: 5,
                borderColor: 'rgba(255, 255, 255, 0.05)',
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: 'rgba(212, 175, 55, 0.2)',
                    labelBackgroundColor: '#1e222d',
                },
                horzLine: {
                    color: 'rgba(212, 175, 55, 0.2)',
                    labelBackgroundColor: '#1e222d',
                },
            },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#0ecb81',
            downColor: '#f6465d',
            borderVisible: false,
            wickUpColor: '#0ecb81',
            wickDownColor: '#f6465d',
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#26a69a',
            priceFormat: { type: 'volume' },
            priceScaleId: '', // overlay
        });

        volumeSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        volumeSeriesRef.current = volumeSeries;

        // Manual Resize Handling
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chartContainerRef.current);

        // Helper to update Legend DOM directly
        const updateLegend = (data) => {
            if (legendRef.current) {
                const { time, open, high, low, close } = data;
                legendRef.current.innerHTML = `
                    <span>${t('legend_time', 'Time')}: <span style="color: #d1d4dc">${time}</span></span>
                    <span>${t('legend_open', 'O')}: <span style="color: #d1d4dc">${open}</span></span>
                    <span>${t('legend_high', 'H')}: <span style="color: #d1d4dc">${high}</span></span>
                    <span>${t('legend_low', 'L')}: <span style="color: #d1d4dc">${low}</span></span>
                    <span>${t('legend_close', 'C')}: <span style="color: #d1d4dc">${close}</span></span>
                `;
            }
        };

        // Legend dynamics
        crosshairSubscription = (param) => {
            if (!isMounted || !param.time || param.point === undefined || !param.seriesData.get(candleSeries)) {
                return;
            }
            const data = param.seriesData.get(candleSeries);
            updateLegend({
                time: new Date(param.time * 1000).toLocaleString(),
                open: data.open.toFixed(2),
                high: data.high.toFixed(2),
                low: data.low.toFixed(2),
                close: data.close.toFixed(2)
            });
        };
        chart.subscribeCrosshairMove(crosshairSubscription);

        // Mock Data Generator for unsupported symbols (like Gold)
        const generateMockData = (basePrice, count = 500) => {
            const data = [];
            let time = Math.floor(Date.now() / 1000) - (count * 60 * (interval === '1h' ? 60 : interval === '1d' ? 1440 : 5));
            let price = basePrice;

            for (let i = 0; i < count; i++) {
                const volatility = price * 0.002; // 0.2% volatility
                const change = (Math.random() - 0.5) * volatility;
                const open = price;
                const close = price + change;
                const high = Math.max(open, close) + Math.random() * volatility * 0.5;
                const low = Math.min(open, close) - Math.random() * volatility * 0.5;

                data.push({
                    time: time,
                    open: parseFloat(open.toFixed(2)),
                    high: parseFloat(high.toFixed(2)),
                    low: parseFloat(low.toFixed(2)),
                    close: parseFloat(close.toFixed(2))
                });

                price = close;
                time += 60 * (interval === '1h' ? 60 : interval === '1d' ? 1440 : 5);
            }
            return data;
        };

        // Fetch Historical Data
        const fetchHistory = async () => {
            try {
                let apiSymbol = symbol.toUpperCase();
                let isMock = false;

                // Heuristic: If it contains GOLD, EURO, or is an unknown format, use mock
                if (apiSymbol.includes('GOLD') || apiSymbol.includes('EURO')) {
                    isMock = true;
                }

                let formattedData = [];
                let formattedVolume = [];

                if (isMock) {
                    const basePrice = apiSymbol.includes('GOLD') ? 2598 : (apiSymbol.includes('EUR') ? 2412 : 100);
                    const mockKlines = generateMockData(basePrice);
                    formattedData = mockKlines;
                    formattedVolume = mockKlines.map(d => ({
                        time: d.time,
                        value: Math.random() * 1000,
                        color: d.close >= d.open ? 'rgba(14, 203, 129, 0.3)' : 'rgba(246, 70, 93, 0.3)'
                    }));
                } else {
                    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${apiSymbol}&interval=${interval}&limit=500`);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();

                    if (!isMounted) return;

                    formattedData = data.map(d => ({
                        time: d[0] / 1000,
                        open: parseFloat(d[1]),
                        high: parseFloat(d[2]),
                        low: parseFloat(d[3]),
                        close: parseFloat(d[4]),
                    }));
                    formattedVolume = data.map(d => ({
                        time: d[0] / 1000,
                        value: parseFloat(d[5]),
                        color: parseFloat(d[4]) >= parseFloat(d[1]) ? 'rgba(14, 203, 129, 0.3)' : 'rgba(246, 70, 93, 0.3)',
                    }));
                }

                candleSeries.setData(formattedData);
                volumeSeries.setData(formattedVolume);

                // Set initial legend
                const last = formattedData[formattedData.length - 1];
                updateLegend({
                    time: new Date(last.time * 1000).toLocaleString(),
                    open: last.open.toFixed(2),
                    high: last.high.toFixed(2),
                    low: last.low.toFixed(2),
                    close: last.close.toFixed(2)
                });

                if (onPriceUpdate) {
                    onPriceUpdate({
                        price: last.close.toFixed(2),
                        high: last.high.toFixed(2),
                        low: last.low.toFixed(2),
                        open: last.open.toFixed(2)
                    });
                }

                // If mock, start simulated live updates
                if (isMock) {
                    const simulationInterval = setInterval(() => {
                        if (!isMounted) return;

                        const currentLast = formattedData[formattedData.length - 1];

                        const volatility = currentLast.close * 0.0002;
                        const change = (Math.random() - 0.5) * volatility;

                        const newClose = currentLast.close + change;
                        const newHigh = Math.max(currentLast.high, newClose);
                        const newLow = Math.min(currentLast.low, newClose);

                        currentLast.close = parseFloat(newClose.toFixed(2));
                        currentLast.high = parseFloat(newHigh.toFixed(2));
                        currentLast.low = parseFloat(newLow.toFixed(2));

                        const updatedCandle = { ...currentLast };
                        candleSeries.update(updatedCandle);

                        updateLegend({
                            time: new Date(updatedCandle.time * 1000).toLocaleString(),
                            open: updatedCandle.open.toFixed(2),
                            high: updatedCandle.high.toFixed(2),
                            low: updatedCandle.low.toFixed(2),
                            close: updatedCandle.close.toFixed(2)
                        });

                        if (onPriceUpdate) {
                            onPriceUpdate({
                                price: updatedCandle.close.toFixed(2),
                                high: updatedCandle.high.toFixed(2),
                                low: updatedCandle.low.toFixed(2),
                                open: updatedCandle.open.toFixed(2)
                            });
                        }
                    }, 1000);

                    return () => clearInterval(simulationInterval);
                }

            } catch (error) {
                if (isMounted) console.error('Error fetching history:', error);
            }
        };

        const simulationCleanup = fetchHistory();

        // WebSocket for Real-time (Only for real crypto)
        let ws = null;
        if (!symbol.toUpperCase().includes('GOLD') && !symbol.toUpperCase().includes('EURO')) {
            const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
            const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}`;
            ws = new WebSocket(wsUrl);

            ws.onmessage = (event) => {
                if (!isMounted) return;
                try {
                    const message = JSON.parse(event.data);
                    const kline = message.k;
                    if (!kline) return;

                    const candle = {
                        time: kline.t / 1000,
                        open: parseFloat(kline.o),
                        high: parseFloat(kline.h),
                        low: parseFloat(kline.l),
                        close: parseFloat(kline.c),
                    };
                    const volume = {
                        time: kline.t / 1000,
                        value: parseFloat(kline.v),
                        color: parseFloat(kline.c) >= parseFloat(kline.o) ? 'rgba(14, 203, 129, 0.3)' : 'rgba(246, 70, 93, 0.3)',
                    };

                    candleSeries.update(candle);
                    volumeSeries.update(volume);

                    if (onPriceUpdate) {
                        onPriceUpdate({
                            price: candle.close.toFixed(2),
                            high: candle.high.toFixed(2),
                            low: candle.low.toFixed(2),
                            open: candle.open.toFixed(2)
                        });
                    }
                } catch (e) { }
            };
            wsRef.current = ws;
        }

        return () => {
            isMounted = false;
            resizeObserver.disconnect();

            simulationCleanup.then(cleanup => {
                if (typeof cleanup === 'function') cleanup();
            });

            if (chartRef.current) {
                if (crosshairSubscription) {
                    chartRef.current.unsubscribeCrosshairMove(crosshairSubscription);
                }
                chartRef.current.remove();
                chartRef.current = null;
            }

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [symbol, interval, onPriceUpdate]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '400px' }}>
            <div
                ref={legendRef}
                style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 10,
                    fontSize: '11px',
                    color: '#848e9c',
                    display: 'flex',
                    gap: '8px',
                    pointerEvents: 'none',
                    background: 'rgba(11, 17, 24, 0.7)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                }}
            >
                <span>${t('legend_time', 'Time')}: -</span>
                <span>${t('legend_open', 'O')}: -</span>
                <span>${t('legend_high', 'H')}: -</span>
                <span>${t('legend_low', 'L')}: -</span>
                <span>${t('legend_close', 'C')}: -</span>
            </div>
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default CandleChart;
