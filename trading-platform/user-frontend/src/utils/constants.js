// API Constants
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

// App Constants
export const APP_CONFIG = {
  NAME: process.env.REACT_APP_WEBSITE_NAME || 'Trading Platform',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  SUPPORT_EMAIL: 'support@tradingplatform.com',
  SUPPORT_PHONE: '+1 (555) 123-4567'
};

// Trading Constants
export const TRADING_CONFIG = {
  MIN_TRADE_AMOUNT: 10,
  MAX_TRADE_AMOUNT: 100000,
  DEFAULT_LEVERAGE: 1,
  MAX_LEVERAGE: 100,
  TRADING_FEE_PERCENT: 0.1,
  WITHDRAWAL_FEE_PERCENT: 0.5,
  MIN_WITHDRAWAL: 50,
  MAX_WITHDRAWAL: 10000
};

// Market Pairs
export const MARKET_PAIRS = [
  { value: 'BTC/USDT', label: 'BTC/USDT', base: 'BTC', quote: 'USDT' },
  { value: 'ETH/USDT', label: 'ETH/USDT', base: 'ETH', quote: 'USDT' },
  { value: 'BNB/USDT', label: 'BNB/USDT', base: 'BNB', quote: 'USDT' },
  { value: 'XRP/USDT', label: 'XRP/USDT', base: 'XRP', quote: 'USDT' },
  { value: 'ADA/USDT', label: 'ADA/USDT', base: 'ADA', quote: 'USDT' },
  { value: 'SOL/USDT', label: 'SOL/USDT', base: 'SOL', quote: 'USDT' },
  { value: 'DOT/USDT', label: 'DOT/USDT', base: 'DOT', quote: 'USDT' },
  { value: 'DOGE/USDT', label: 'DOGE/USDT', base: 'DOGE', quote: 'USDT' }
];

// Order Types
export const ORDER_TYPES = [
  { value: 'market', label: 'Market Order' },
  { value: 'limit', label: 'Limit Order' },
  { value: 'stop', label: 'Stop Order' },
  { value: 'stop_limit', label: 'Stop Limit Order' }
];

// Timeframes for Charts
export const TIMEFRAMES = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' }
];

// Transaction Types
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRADE: 'trade',
  FEE: 'fee',
  BONUS: 'bonus',
  REFERRAL: 'referral'
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PROCESSING: 'processing'
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  AGENT: 'agent',
  ADMIN: 'admin'
};

// Win/Loss Control Levels
export const WINLOSS_CONTROL_LEVELS = [
  { value: 'none', label: 'No Control', color: 'secondary' },
  { value: 'low', label: 'Low Control', color: 'info' },
  { value: 'medium', label: 'Medium Control', color: 'warning' },
  { value: 'high', label: 'High Control', color: 'danger' }
];

// Color Themes
export const COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  SUCCESS: '#28a745',
  DANGER: '#dc3545',
  WARNING: '#ffc107',
  INFO: '#17a2b8',
  LIGHT: '#f8f9fa',
  DARK: '#343a40'
};

// Chart Colors
export const CHART_COLORS = {
  GREEN: '#10b981',
  RED: '#ef4444',
  BLUE: '#3b82f6',
  YELLOW: '#f59e0b',
  PURPLE: '#8b5cf6',
  GRAY: '#6b7280'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  AGENT_TOKEN: 'agentToken',
  AGENT_DATA: 'agentData',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_TRADES: 'recentTrades'
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN: 'Password must be at least 6 characters',
  PASSWORD_MATCH: 'Passwords do not match',
  MOBILE_INVALID: 'Please enter a valid mobile number',
  AMOUNT_MIN: 'Amount is too small',
  AMOUNT_MAX: 'Amount exceeds maximum limit'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logged out successfully',
  SIGNUP: 'Account created successfully!',
  PROFILE_UPDATE: 'Profile updated successfully',
  PASSWORD_CHANGE: 'Password changed successfully',
  TRADE_PLACED: 'Trade placed successfully',
  DEPOSIT_SUCCESS: 'Deposit request submitted',
  WITHDRAWAL_SUCCESS: 'Withdrawal request submitted'
};

// Date/Time Formats
export const DATE_FORMATS = {
  SHORT_DATE: 'MM/DD/YYYY',
  LONG_DATE: 'MMMM DD, YYYY',
  SHORT_TIME: 'HH:mm',
  LONG_TIME: 'HH:mm:ss',
  DATETIME: 'MM/DD/YYYY HH:mm',
  FULL_DATETIME: 'MMMM DD, YYYY HH:mm:ss'
};

// Feature Flags (for future features)
export const FEATURE_FLAGS = {
  ENABLE_2FA: false,
  ENABLE_WITHDRAWAL: true,
  ENABLE_DEPOSIT: true,
  ENABLE_REFERRAL_SYSTEM: true,
  ENABLE_TRADING: true,
  MAINTENANCE_MODE: false
};

// Default Settings
export const DEFAULT_SETTINGS = {
  THEME: 'light',
  LANGUAGE: 'en',
  CURRENCY: 'USD',
  TIMEZONE: 'UTC',
  NOTIFICATIONS: {
    EMAIL: true,
    SMS: false,
    PUSH: true
  }
};

export default {
  API_CONFIG,
  APP_CONFIG,
  TRADING_CONFIG,
  MARKET_PAIRS,
  ORDER_TYPES,
  TIMEFRAMES,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  USER_ROLES,
  WINLOSS_CONTROL_LEVELS,
  COLORS,
  CHART_COLORS,
  STORAGE_KEYS,
  VALIDATION_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_FORMATS,
  FEATURE_FLAGS,
  DEFAULT_SETTINGS
};