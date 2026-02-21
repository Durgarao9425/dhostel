import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://mhostel-backend.onrender.com/api';

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auto-clear token on 401 (expired/invalid token from old session)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('[api] 401 received — clearing stored token');
            await AsyncStorage.multiRemove(['token', 'user']);
            delete api.defaults.headers.common['Authorization'];
        }
        return Promise.reject(error);
    }
);

export default api;
