import api from './api';

export const adminService = {
  // Get all agents
  getAgents: async () => {
    try {
      const response = await api.get('/admin/agents');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new agent
  createAgent: async (agentData) => {
    try {
      const response = await api.post('/admin/agents', agentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update agent
  updateAgent: async (id, agentData) => {
    try {
      const response = await api.put(`/admin/agents/${id}`, agentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete agent
  deleteAgent: async (id) => {
    try {
      const response = await api.delete(`/admin/agents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get audit logs (if needed)
  getAuditLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/audit-logs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get global settings
  getGlobalSettings: async () => {
    try {
      const response = await api.get('/admin/global-settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update global settings
  updateGlobalSettings: async (data) => {
    try {
      const response = await api.put('/admin/global-settings', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};