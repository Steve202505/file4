import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import MainLayout from './components/common/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import AgentLoginPage from './pages/AgentLoginPage';
import AgentDashboardPage from './pages/AgentDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import AgentManagementPage from './pages/AgentManagementPage';
import WithdrawalRecordsPage from './pages/WithdrawalRecordsPage';
import StockOrdersPage from './pages/StockOrdersPage';
import UserBalanceDetailsPage from './pages/UserBalanceDetailsPage';
import UserWalletDetailsPage from './pages/UserWalletDetailsPage';
import MyWalletPage from './pages/MyWalletPage';
import MyBankCardPage from './pages/MyBankCardPage';
import MyCryptoWalletPage from './pages/MyCryptoWalletPage';
import UserDetails from './components/management/UserDetails';
import AuditLogsPage from './pages/AuditLogsPage';
import GlobalSupportPage from './pages/GlobalSupportPage';


function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      const dir = ['ar', 'ur'].includes(lng) ? 'rtl' : 'ltr';
      document.dir = dir;
      document.documentElement.lang = lng;
    };

    i18n.on('languageChanged', handleLanguageChange);
    handleLanguageChange(i18n.language);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <Router>
      <ThemeProvider>
        <ErrorBoundary>
          <div className="App">
            <Toaster position="top-right" />
            <Suspense fallback={<div className="d-flex justify-content-center align-items-center vh-100"><LoadingSpinner /></div>}>
              <Routes>
                <Route path="/login" element={<AgentLoginPage />} />

                {/* Protected Routes */}
                <Route element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route path="/dashboard" element={<AgentDashboardPage />} />
                  <Route path="/user-management" element={<UserManagementPage />} />
                  <Route path="/stock-orders" element={<StockOrdersPage />} />
                  <Route path="/user-balance-details" element={<UserBalanceDetailsPage />} />
                  <Route path="/user-wallet-details" element={
                    <ProtectedRoute requiredRole="admin">
                      <UserWalletDetailsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/user-details/:id" element={<UserDetails />} />
                  <Route path="/agent-management" element={
                    <ProtectedRoute requiredRole="admin">
                      <AgentManagementPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/withdrawals" element={<WithdrawalRecordsPage />} />
                  <Route path="/audit-logs" element={
                    <ProtectedRoute requiredRole="admin">
                      <AuditLogsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/management/global-support" element={
                    <ProtectedRoute requiredRole="admin">
                      <GlobalSupportPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-wallet" element={<MyWalletPage />} />
                  <Route path="/my-wallet/bank-card" element={<MyBankCardPage />} />
                  <Route path="/my-wallet/crypto-wallet" element={<MyCryptoWalletPage />} />
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    </Router>
  );
}

export default App;