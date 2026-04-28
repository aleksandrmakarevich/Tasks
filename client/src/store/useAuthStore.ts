import { create } from 'zustand';

interface AuthState {
    token: string | null;
    // Функция для сохранения токена (и в память, и в localStorage)
    login: (token: string) => void;
    // Функция для очистки всего при выходе
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    // При старте приложения проверяем, есть ли уже кто-то в системе
    token: localStorage.getItem('token'),

    login: (token) => {
        localStorage.setItem('token', token);
        set({ token });
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ token: null });
    },
}));