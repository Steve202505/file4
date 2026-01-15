import { Btc, Eth, Ltc, Xrp, Bch, Str, Etc } from 'react-cryptocoins';

export const INITIAL_MARKETS = [
    { id: 11, symbol: 'XAU', pair: 'Gold/USD', price: '2598.45', change: '+0.54%', isUp: true },
    { id: 12, symbol: 'XAU', pair: 'Gold/EURO', price: '2412.30', change: '+0.42%', isUp: true },
    { id: 1, symbol: 'BTC', pair: 'BTC/USDT', price: '92201.00', change: '+1.47%', isUp: true },
    { id: 2, symbol: 'ETH', pair: 'ETH/USDT', price: '3157.36', change: '+1.26%', isUp: true },
    { id: 3, symbol: 'LTC', pair: 'LTC/USDT', price: '79.24', change: '-1.50%', isUp: false },
    { id: 4, symbol: 'XRP', pair: 'XRP/USDT', price: '2.09612', change: '+0.31%', isUp: true },
    { id: 5, symbol: 'BCH', pair: 'BCH/USDT', price: '648.15', change: '-1.03%', isUp: false },
    { id: 6, symbol: 'HBAR', pair: 'HBAR/USDT', price: '0.119531', change: '+2.25%', isUp: true },
    { id: 7, symbol: 'USDC', pair: 'USDC/USDT', price: '1.0011', change: '+0.00%', isUp: true },
    { id: 8, symbol: 'XLM', pair: 'XLM/USDT', price: '0.227993', change: '+1.13%', isUp: true },
    { id: 9, symbol: 'AVAX', pair: 'AVAX/USDT', price: '14.0714', change: '+1.92%', isUp: true },
    { id: 10, symbol: 'ETC', pair: 'ETC/USDT', price: '12.6322', change: '+1.37%', isUp: true },
];

export const CRYPTO_ICONS = {
    BTC: Btc,
    ETH: Eth,
    LTC: Ltc,
    XRP: Xrp,
    BCH: Bch,
    XLM: Str,
    ETC: Etc,
};
