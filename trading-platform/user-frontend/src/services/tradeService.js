import api from './api';

export const tradeService = {
    // Place a trade
    placeTrade: async (tradeData) => {
        try {
            const response = await api.post('/trades/place', tradeData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get trade history
    getHistory: async () => {
        try {
            const response = await api.get('/trades/history');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default tradeService;
