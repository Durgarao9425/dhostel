import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';

// Custom StayNow Logo Icon
const StayNowLogo = () => (
    <Svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        {/* House outline */}
        <Path
            d="M60 20L20 50V95C20 97.7614 22.2386 100 25 100H95C97.7614 100 100 97.7614 100 95V50L60 20Z"
            fill="white"
            fillOpacity="0.95"
        />
        {/* Roof */}
        <Path
            d="M60 15L15 52H25L60 25L95 52H105L60 15Z"
            fill="white"
        />
        {/* Letter S */}
        <SvgText
            x="60"
            y="48"
            fontSize="32"
            fontWeight="700"
            fill="#FF6B6B"
            textAnchor="middle"
        >
            S
        </SvgText>
        {/* Bed icon */}
        <Rect x="38" y="58" width="44" height="4" rx="2" fill="#FF6B6B" />
        <Rect x="38" y="64" width="44" height="18" rx="3" fill="#FF6B6B" />
        <Rect x="38" y="82" width="4" height="12" rx="1" fill="#FF6B6B" />
        <Rect x="78" y="82" width="4" height="12" rx="1" fill="#FF6B6B" />
    </Svg>
);

export const SplashScreen = ({ navigation }: any) => {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;

        const timer = setTimeout(() => {
            if (user) {
                // If user is logged in, resetting the navigation stack to Main
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
            } else {
                navigation.replace('Login');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigation, user, loading]);

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <LinearGradient
                colors={['#FF8585', '#FF6B6B', '#FF5A5A']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <StayNowLogo />
                    </View>

                    <Text style={styles.appName}>StayNow</Text>
                    <Text style={styles.tagline}>Smart Hostel Management</Text>

                    <View style={styles.dotsContainer}>
                        <View style={[styles.dot, styles.dotActive]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 30,
    },
    appName: {
        fontSize: 48,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '400',
        opacity: 0.95,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 80,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    dotActive: {
        backgroundColor: '#FFFFFF',
    },
});

export default SplashScreen;