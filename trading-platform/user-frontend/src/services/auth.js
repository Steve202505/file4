// Auth utility functions
export const isAuthenticated = () => {
  return !!localStorage.getItem('userToken');
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const setAuthData = (token, user) => {
  localStorage.setItem('userToken', token);
  localStorage.setItem('userData', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
};

export const getAuthToken = () => {
  return localStorage.getItem('userToken');
};