import api from './api';

export const userService = {
    // Get user profile
    getProfile: async () => {
        try {
            const response = await api.get('/user/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch profile' };
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/user/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update profile' };
        }
    },

    // Get user balance
    getBalance: async () => {
        try {
            const response = await api.get('/user/balance');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch balance' };
        }
    },

    // Update password (if needed as separate)
    updatePassword: async (passwordData) => {
        try {
            const response = await api.put('/user/profile', passwordData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update password' };
        }
    },

    // Request withdrawal
    withdraw: async (withdrawalData) => {
        try {
            const response = await api.post('/user/withdraw', withdrawalData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to submit withdrawal request' };
        }
    },

    // Get user's referral info
    getReferralInfo: async () => {
        const response = await api.get('/user/referral-info');
        return response.data;
    },

    // Get activity/transaction history
    getTransactions: async (params = {}) => {
        const { page = 1, limit = 50 } = params;
        const response = await api.get(`/user/transactions?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Get trading history
    getTradingHistory: async (params = {}) => {
        const response = await api.get('/trades/history');
        return response.data;
    },

    // Check username availability
    checkUsername: async (username) => {
        const response = await api.get(`/user/check-username?username=${username}`);
        return response.data;
    },

    // Get assigned agent
    getAssignedAgent: async () => {
        const response = await api.get('/user/assigned-agent');
        return response.data;
    },

    // Update locale
    updateLocale: async (locale) => {
        const response = await api.put('/user/locale', { locale });
        return response.data;
    },

    // Bank Card Services
    getBankCards: async () => {
        const response = await api.get('/user/bank-cards');
        return response.data;
    },
    addBankCard: async (data) => {
        const response = await api.post('/user/bank-cards', data);
        return response.data;
    },
    deleteBankCard: async (id) => {
        const response = await api.delete(`/user/bank-cards/${id}`);
        return response.data;
    },

    // Crypto Wallet Services
    getCryptoWallets: async () => {
        const response = await api.get('/user/crypto-wallets');
        return response.data;
    },
    addCryptoWallet: async (data) => {
        const response = await api.post('/user/crypto-wallets', data);
        return response.data;
    },
    deleteCryptoWallet: async (id) => {
        const response = await api.delete(`/user/crypto-wallets/${id}`);
        return response.data;
    },

    // Password & Security
    changePassword: async (data) => {
        const response = await api.put('/user/change-password', data);
        return response.data;
    },

    // Deposit Services
    getDepositAddresses: async () => {
        const response = await api.get('/user/deposit-addresses');
        return response.data;
    }
};

export default userService;
