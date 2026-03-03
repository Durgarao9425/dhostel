import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://mhostel-backend.onrender.com/api';

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─────────────────────────────────────────────────────────────────────────────
//  API LOGOUT CALLBACK
// ─────────────────────────────────────────────────────────────────────────────
let logoutCallback: (() => void) | null = null;

export const setLogoutCallback = (callback: () => void) => {
    logoutCallback = callback;
};

// Auto-clear token on 401 (expired/invalid token from old session)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('[api] 401 received — clearing headers and storage');

            // Clear headers immediately to stop further 401 loops
            delete api.defaults.headers.common['Authorization'];

            // Clear local storage
            await AsyncStorage.multiRemove(['token', 'user']);

            // Trigger global logout in AuthContext if callback is registered
            if (logoutCallback) {
                console.log('[api] Triggering global logout callback');
                logoutCallback();
            }
        }
        return Promise.reject(error);
    }
);

export default api;
