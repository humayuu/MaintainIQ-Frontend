// Small localStorage helpers for the auth session. Centralising the keys here
// keeps them consistent across axiosClient and AuthContext.
export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const setStoredUser = (user) =>
  localStorage.setItem(USER_KEY, JSON.stringify(user));

export const clearStoredUser = () => localStorage.removeItem(USER_KEY);
