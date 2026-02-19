import React, { createContext, useContext, useState, useEffect } from 'react';

const commonLayout = {
    headerRounded: 30, // Always rounded for "Premium" look
    shadowOpacity: 0.1,
    elevation: 4,
    background: '#F8FAFC',
    cardBg: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#64748B',
    white: '#FFFFFF',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
};

export const themes = {
    coral: {
        ...commonLayout,
        id: 'coral',
        name: 'Coral Red',
        primary: '#FF6B6B',
        gradientStart: '#FF8585',
        gradientEnd: '#FF6B6B',
        lightBg: '#FFF5F5',
    },
    blue: {
        ...commonLayout,
        id: 'blue',
        name: 'Ocean Blue',
        primary: '#3B82F6',
        gradientStart: '#60A5FA',
        gradientEnd: '#3B82F6',
        lightBg: '#EFF6FF',
    },
    green: {
        ...commonLayout,
        id: 'green',
        name: 'Emerald Green',
        primary: '#10B981',
        gradientStart: '#34D399',
        gradientEnd: '#10B981',
        lightBg: '#ECFDF5',
    },
    purple: {
        ...commonLayout,
        id: 'purple',
        name: 'Royal Purple',
        primary: '#8B5CF6',
        gradientStart: '#A78BFA',
        gradientEnd: '#8B5CF6',
        lightBg: '#F5F3FF',
    },
    orange: {
        ...commonLayout,
        id: 'orange',
        name: 'Sunset Orange',
        primary: '#F97316',
        gradientStart: '#FB923C',
        gradientEnd: '#F97316',
        lightBg: '#FFF7ED',
    },
};

import AsyncStorage from '@react-native-async-storage/async-storage';

// ... (keep lines 3-66 same, but I will provide context in tool call if needed or just use replace for the whole file if easier. Since I need to change Context definition and Provider, it's a large chunk).

export type ThemeId = keyof typeof themes;

const ThemeContext = createContext({
    theme: themes.coral,
    themeId: 'coral' as ThemeId,
    setThemeId: (id: ThemeId) => { },
    isDark: false,
    toggleTheme: () => { },
    fontSize: 14,
    setFontSize: (size: number) => { },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [themeId, setThemeId] = useState<ThemeId>('coral');
    const [isDark, setIsDark] = useState(false);
    const [fontSize, setFontSize] = useState(14); // Default font size

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const storedThemeId = await AsyncStorage.getItem('themeId');
                if (storedThemeId && themes[storedThemeId as ThemeId]) {
                    setThemeId(storedThemeId as ThemeId);
                }
                const storedFontSize = await AsyncStorage.getItem('fontSize');
                if (storedFontSize) {
                    const parsedSize = parseInt(storedFontSize, 10);
                    if (!isNaN(parsedSize)) setFontSize(parsedSize);
                }
            } catch (e) {
                console.error('Failed to load theme settings', e);
            }
        };
        loadSettings();
    }, []);

    const theme = themes[themeId];

    const toggleTheme = () => setIsDark(!isDark);

    const handleSetThemeId = (id: ThemeId) => {
        setThemeId(id);
        AsyncStorage.setItem('themeId', id).catch(e => console.error(e));
    };

    const handleSetFontSize = (size: number) => {
        setFontSize(size);
        AsyncStorage.setItem('fontSize', size.toString()).catch(e => console.error(e));
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            themeId,
            setThemeId: handleSetThemeId,
            isDark,
            toggleTheme,
            fontSize,
            setFontSize: handleSetFontSize
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

export default themes.coral;

