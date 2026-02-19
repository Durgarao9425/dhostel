import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import te from './locales/te.json';
import hi from './locales/hi.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
    en: { translation: en },
    te: { translation: te },
    hi: { translation: hi },
};

// Get saved language or default to English
const getInitialLanguage = async () => {
    try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        return savedLanguage || 'en';
    } catch (error) {
        console.error('Error loading language:', error);
        return 'en';
    }
};

// Initialize with English first, then update with saved language
getInitialLanguage().then((language) => {
    i18n.changeLanguage(language);
});

i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v4',
        resources,
        lng: 'en', // Default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export const changeLanguage = async (languageCode: string) => {
    try {
        await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
        await i18n.changeLanguage(languageCode);
    } catch (error) {
        console.error('Error changing language:', error);
    }
};

export const getCurrentLanguage = () => i18n.language;

export const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
];

export default i18n;
