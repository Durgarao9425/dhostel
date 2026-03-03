import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    StatusBar,
    Dimensions,
} from 'react-native';
import { ChevronLeft, Share2, Copy, QrCode } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

const PRIMARY = '#FF6B6B';
const PRIMARY_LIGHT = '#FFF1F1';
const PRIMARY_BG = '#FFE4E4';

export default function TenantQRScreen({ navigation }: any) {
    const { user } = useAuth();
    const { theme } = useTheme();

    const baseURL = (api.defaults.baseURL || 'http://192.168.1.4:5000/api').replace(/\/api\/?$/, '');
    const formUrl = `${baseURL}/api/public/register/${user?.hostel_id || 1}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formUrl)}&bgcolor=ffffff&color=1a1a1a&margin=8`;

    const float1 = useRef(new Animated.Value(0)).current;
    const float2 = useRef(new Animated.Value(0)).current;
    const fadeIn = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeIn, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        const loop1 = Animated.loop(
            Animated.sequence([
                Animated.timing(float1, { toValue: -8, duration: 1800, useNativeDriver: true }),
                Animated.timing(float1, { toValue: 0, duration: 1800, useNativeDriver: true }),
            ])
        );
        const loop2 = Animated.loop(
            Animated.sequence([
                Animated.timing(float2, { toValue: 6, duration: 2200, useNativeDriver: true }),
                Animated.timing(float2, { toValue: 0, duration: 2200, useNativeDriver: true }),
            ])
        );
        loop1.start();
        loop2.start();
        return () => { loop1.stop(); loop2.stop(); };
    }, []);

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF5F5" />

            {/* Top Nav */}
            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="#1E293B" size={28} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Registration QR</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Main Card */}
            <Animated.View style={[styles.card, { opacity: fadeIn }]}>

                {/* QR Illustration Area */}
                <View style={styles.illustrationArea}>
                    <View style={styles.bgCircle} />

                    {/* Floating badge: QR icon */}
                    <Animated.View style={[styles.floatBadge, styles.floatLeft, { transform: [{ translateY: float1 }] }]}>
                        <QrCode size={20} color="#FFF" />
                    </Animated.View>

                    {/* Floating badge: Share icon */}
                    <Animated.View style={[styles.floatBadge, styles.floatRight, { transform: [{ translateY: float2 }] }]}>
                        <Share2 size={20} color="#FFF" />
                    </Animated.View>

                    {/* QR Code Box */}
                    <View style={styles.qrBox}>
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                        <Image
                            source={{ uri: qrUrl }}
                            style={styles.qrImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Text Content */}
                <Text style={styles.cardTitle}>Registration Form{'\n'}Quick Access</Text>
                <Text style={styles.cardSubtitle}>
                    New tenants can scan this QR code to quickly fill out
                    their registration details directly on their smartphone.
                </Text>

                {/* URL Pill */}
                <TouchableOpacity
                    style={styles.urlPill}
                    activeOpacity={0.7}
                    onPress={() => { }}
                >
                    <Text style={styles.urlText} numberOfLines={1}>
                        {formUrl}
                    </Text>
                    <Copy size={12} color={PRIMARY} style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footerNote}>
                    <Text style={styles.footerNoteText}>
                        Scanning will open the secure registration portal.
                    </Text>
                </View>

            </Animated.View>

            <View style={{ height: 20 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FFF5F5',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 54,
    },

    /* ── Top Nav ── */
    topNav: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -0.5,
    },

    /* ── Main Card ── */
    card: {
        flex: 1,
        width: width - 32,
        backgroundColor: '#FFFFFF',
        borderRadius: 36,
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 32,
        paddingHorizontal: 24,
        marginTop: 10,
        marginBottom: 30,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 10,
    },

    /* ── QR Illustration ── */
    illustrationArea: {
        width: 220,
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    bgCircle: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: PRIMARY_BG,
    },
    floatBadge: {
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
        zIndex: 10,
    },
    floatLeft: {
        left: -8,
        bottom: 38,
    },
    floatRight: {
        right: -8,
        top: 18,
    },

    /* ── QR Box ── */
    qrBox: {
        width: 148,
        height: 148,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        zIndex: 5,
    },
    qrImage: {
        width: 120,
        height: 120,
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: '#CBD5E1',
        borderWidth: 2.5,
    },
    cornerTL: { top: 10, left: 10, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
    cornerTR: { top: 10, right: 10, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
    cornerBL: { bottom: 10, left: 10, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
    cornerBR: { bottom: 10, right: 10, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },

    /* ── Text ── */
    cardTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
        textAlign: 'center',
        lineHeight: 30,
        letterSpacing: -0.3,
        marginBottom: 12,
    },
    cardSubtitle: {
        fontSize: 13.5,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
        paddingHorizontal: 8,
    },

    /* ── URL Pill ── */
    urlPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PRIMARY_LIGHT,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        width: '100%',
        marginTop: 10,
    },
    urlText: {
        flex: 1,
        fontSize: 12,
        color: PRIMARY,
        fontWeight: '700',
    },

    /* ── Footer ── */
    footerNote: {
        marginTop: 'auto' as any,
        alignItems: 'center',
    },
    footerNoteText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
        textAlign: 'center',
    },
});