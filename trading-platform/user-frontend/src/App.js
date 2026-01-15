import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import MainLayout from './components/common/MainLayout';
import PrivateRoute from './components/common/PrivateRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MarketPage from './pages/MarketPage';
import HoldingsPage from './pages/HoldingsPage';
import AccountPage from './pages/AccountPage';
import FinancialDetailsPage from './pages/FinancialDetailsPage';
import PaymentMethodPage from './pages/PaymentMethodPage';
import BankCardListPage from './pages/BankCardListPage';
import AddBankCardPage from './pages/AddBankCardPage';
import CryptoWalletListPage from './pages/CryptoWalletListPage';
import WithdrawPage from './pages/WithdrawPage';
import AddCryptoWalletPage from './pages/AddCryptoWalletPage';
import WalletPage from './pages/WalletPage';
import TradePage from './pages/TradePage';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      const dir = ['ar', 'ur'].includes(lng) ? 'rtl' : 'ltr';
      document.dir = dir;
      document.documentElement.lang = lng;
    };

    i18n.on('languageChanged', handleLanguageChange);
    // Set initial direction
    handleLanguageChange(i18n.language);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <div className="App">
            <Toaster position="top-right" />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes with Layout */}
                <Route element={
                  <PrivateRoute>
                    <MainLayout />
                  </PrivateRoute>
                }>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/markets" element={<MarketPage />} />
                  <Route path="/holdings" element={<HoldingsPage />} />
                  <Route path="/profile" element={<AccountPage />} />
                  <Route path="/financial-details" element={<FinancialDetailsPage />} />
                  <Route path="/deposit" element={<PaymentMethodPage />} />
                  <Route path="/wallet/bank-card" element={<BankCardListPage />} />
                  <Route path="/wallet/bank-card/add" element={<AddBankCardPage />} />
                  <Route path="/wallet/crypto-wallet" element={<CryptoWalletListPage />} />
                  <Route path="/wallet/crypto-wallet/add" element={<AddCryptoWalletPage />} />
                  <Route path="/withdraw" element={<WithdrawPage />} />
                  <Route path="/trade/:symbol" element={<TradePage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                </Route>

                {/* Fallback */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;