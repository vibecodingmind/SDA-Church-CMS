import { useState } from 'react';

const TOKEN_KEY = 'iam_token';
const USER_KEY = 'iam_user';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<{ id: string; email: string; fullName: string } | null>(
    () => {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    }
  );

  const login = (accessToken: string, userData: { id: string; email: string; fullName: string }) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return { token, user, login, logout };
}
