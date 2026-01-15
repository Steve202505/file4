// Auth utility functions for agent
export const isAgentAuthenticated = () => {
  return !!localStorage.getItem('agentToken');
};

export const getCurrentAgent = () => {
  const agentData = localStorage.getItem('agentData');
  return agentData ? JSON.parse(agentData) : null;
};

export const setAgentAuthData = (token, agent) => {
  localStorage.setItem('agentToken', token);
  localStorage.setItem('agentData', JSON.stringify(agent));
};

export const clearAgentAuthData = () => {
  localStorage.removeItem('agentToken');
  localStorage.removeItem('agentData');
};

export const isAdmin = () => {
  const agent = getCurrentAgent();
  return agent && agent.role === 'admin';
};

export const hasPermission = (permission) => {
  const agent = getCurrentAgent();
  return agent && agent.permissions && agent.permissions.includes(permission);
};