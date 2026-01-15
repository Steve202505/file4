import api from './api';

export const agentService = {
    // --- User Management ---
    getUsers: async (params) => {
        try {
            const response = await api.get('/agent/users', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createUser: async (userData) => {
        try {
            const response = await api.post('/agent/users', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateUser: async (userId, userData) => {
        try {
            const response = await api.put(`/agent/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getUser: async (userId) => {
        try {
            const response = await api.get(`/agent/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/agent/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getUserWallets: async (userId) => {
        try {
            const response = await api.get(`/agent/users/${userId}/wallets`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // --- Balance & Finance ---
    adjustBalance: async (userId, data) => {
        try {
            // Corrected endpoint
            const response = await api.post(`/agent/users/${userId}/adjust-balance`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // --- Wallet Management (Agent's Own Wallets) ---
    getMyWallets: async () => {
        try {
            const response = await api.get('/agent/my-wallets');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    addMyBankCard: async (data) => {
        try {
            const response = await api.post('/agent/my-wallets/bank-card', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    addMyCryptoWallet: async (data) => {
        try {
            const response = await api.post('/agent/my-wallets/crypto-wallet', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteMyBankCard: async (id) => {
        try {
            const response = await api.delete(`/agent/my-wallets/bank-card/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteMyCryptoWallet: async (id) => {
        try {
            const response = await api.delete(`/agent/my-wallets/crypto-wallet/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // --- Withdrawals ---
    getWithdrawals: async (params) => {
        try {
            const response = await api.get('/agent/withdrawals', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateWithdrawalStatus: async (id, data) => {
        try {
            const response = await api.put(`/agent/withdrawals/${id}/status`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // --- Trades ---
    getTrades: async (params) => {
        try {
            const response = await api.get('/agent/trades', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // --- Stats ---
    getDashboardStats: async () => {
        try {
            const response = await api.get('/agent/dashboard-stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // --- Win/Loss Control ---
    updateWinLossControl: async (userId, data) => {
        try {
            const response = await api.put(`/agent/users/${userId}/win-loss-control`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // --- Profile ---
    updateProfile: async (data) => {
        try {
            const response = await api.put('/agent/profile', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    changePassword: async (data) => {
        try {
            const response = await api.put('/agent/change-password', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
