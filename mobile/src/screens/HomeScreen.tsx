import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../services/api';

interface DashboardStats {
    totalStudents: number;
    totalRooms: number;
    availableRooms: number;
    monthlyRevenue: number;
    pendingFees: number;
    dueSoon: any[];
}

export default function HomeScreen({ navigation }: any) {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [stats, setStats] = useState<DashboardStats>({
        totalStudents: 0,
        totalRooms: 0,
        availableRooms: 0,
        monthlyRevenue: 0,
        pendingFees: 0,
        dueSoon: [],
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await api.get('/analytics/dashboard-stats');
            if (response.data.success) {
                const d = response.data.data;
                setStats({
                    totalStudents: d.totalStudents,
                    totalRooms: d.totalRooms,
                    availableRooms: d.totalBeds - d.occupiedBeds,
                    monthlyRevenue: d.monthlyIncome,
                    pendingFees: d.pendingDuesCount,
                    dueSoon: [],
                    // Extending interface locally or just using the variables
                    todayRent: d.todayRent,
                    todaySplit: d.todaySplit,
                } as any);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const quickActions = [
        { label: 'Students', icon: '👥', screen: 'Students', color: '#3B82F6' },
        { label: 'Rooms', icon: '🛏️', screen: 'Rooms', color: '#10B981' },
        { label: 'Finance', icon: '💰', screen: 'Finance', color: '#F59E0B' },
        { label: 'Income', icon: '📊', screen: 'Income', color: '#8B5CF6' },
    ];

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Loading Dashboard...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
        >
            {/* Header */}
            <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={styles.header}>
                <Text style={styles.greeting}>👋 Hello, {user?.full_name || user?.email || 'Manager'}</Text>
                <Text style={styles.hostelName}>{user?.hostel_name || 'Hostel Dashboard'}</Text>
                <Text style={styles.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </LinearGradient>

            <View style={styles.content}>
                {/* Today's Highlight */}
                <View style={styles.todayCard}>
                    <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.todayGradient}>
                        <View style={styles.todayMain}>
                            <View>
                                <Text style={styles.todayLabel}>TODAY'S RENT</Text>
                                <Text style={styles.todayValue}>₹{(stats as any).todayRent || 0}</Text>
                            </View>
                            <View style={styles.todayIconCircle}>
                                <Text style={{ fontSize: 24 }}>💰</Text>
                            </View>
                        </View>
                        {(stats as any).todaySplit?.length > 0 && (
                            <View style={styles.todayBreakdown}>
                                {(stats as any).todaySplit.map((s: any, i: number) => (
                                    <View key={i} style={styles.breakdownItem}>
                                        <Text style={styles.breakdownMode}>{s.mode}</Text>
                                        <Text style={styles.breakdownAmt}>₹{s.total}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </LinearGradient>
                </View>

                {/* Stats Grid */}
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
                        <Text style={styles.statIcon}>👥</Text>
                        <Text style={styles.statValue}>{stats.totalStudents}</Text>
                        <Text style={styles.statLabel}>Active Students</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
                        <Text style={styles.statIcon}>🛏️</Text>
                        <Text style={styles.statValue}>{stats.availableRooms}</Text>
                        <Text style={styles.statLabel}>Beds Available</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
                        <Text style={styles.statIcon}>⚠️</Text>
                        <Text style={styles.statValue}>{stats.pendingFees}</Text>
                        <Text style={styles.statLabel}>Pending Fees</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
                        <Text style={styles.statIcon}>📈</Text>
                        <Text style={styles.statValue}>₹{stats.monthlyRevenue}</Text>
                        <Text style={styles.statLabel}>Monthly Income</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    {quickActions.map((action) => (
                        <TouchableOpacity
                            key={action.screen}
                            style={styles.actionCard}
                            onPress={() => navigation.navigate(action.screen)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                                <Text style={styles.actionEmoji}>{action.icon}</Text>
                            </View>
                            <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
    header: { padding: 24, paddingTop: 48, paddingBottom: 32 },
    greeting: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
    hostelName: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
    date: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
    content: { padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginTop: 16, marginBottom: 12 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
        width: '46%', borderLeftWidth: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    statIcon: { fontSize: 24, marginBottom: 8 },
    statValue: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
    statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '46%', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    actionIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    actionEmoji: { fontSize: 26 },
    todayCard: {
        marginBottom: 20,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    todayGradient: {
        padding: 24,
    },
    todayMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    todayLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1.5,
    },
    todayValue: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFFFFF',
        marginTop: 4,
    },
    todayIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    todayBreakdown: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    breakdownItem: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    breakdownMode: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
    },
    breakdownAmt: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 2,
    },
    actionLabel: { fontSize: 14, fontWeight: '600' },
});
