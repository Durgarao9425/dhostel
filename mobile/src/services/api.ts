import axios from 'axios';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    // Connect to Render backend
    return 'https://staytrack-backend.onrender.com/api';
};

export const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;