import { create } from "zustand";

interface User {
  id: number;
  staff_name: string;
  role_name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;

  setAuth: (token: string, user: User) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  setAuth: (token, user) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    set({
      token,
      user,
    });
  },

  logout: () => {
    localStorage.clear();

    set({
      token: null,
      user: null,
    });
  },
}));