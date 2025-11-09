import { authAPI } from './api';

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const getUser = async () => {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const response = await authAPI.getMe();
    return response.data.user;
  } catch (error) {
    return null;
  }
};

export const logout = () => {
  setAuthToken(null);
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const hasRole = (user, roles) => {
  if (!user) return false;
  return roles.includes(user.role);
};




