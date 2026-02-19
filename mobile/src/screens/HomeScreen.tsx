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
            const [studentsRes, roomsRes, feesRes] = await Promise.allSettled([
                api.get('/students'),
                api.get('/rooms'),
                api.get('/monthly-fees'),
            ]);

            const students = studentsRes.status === 'fulfilled' ? studentsRes.value.data?.data || [] : [];
            const rooms = roomsRes.status === 'fulfilled' ? roomsRes.value.data?.data || [] : [];
            const fees = feesRes.status === 'fulfilled' ? feesRes.value.data?.data || [] : [];

            const activeStudents = Array.isArray(students) ? students.filter((s: any) => s.status === 'active') : [];
            const availableRooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'available') : [];
            const pendingFees = Array.isArray(fees) ? fees.filter((f: any) => f.status === 'unpaid' || f.status === 'partial') : [];

            setStats({
                totalStudents: activeStudents.length,
                totalRooms: Array.isArray(rooms) ? rooms.length : 0,
                availableRooms: availableRooms.length,
                monthlyRevenue: 0,
                pendingFees: pendingFees.length,
                dueSoon: [],
            });
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
                {/* Stats Grid */}
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
                        <Text style={styles.statIcon}>👥</Text>
                        <Text style={styles.statValue}>{stats.totalStudents}</Text>
                        <Text style={styles.statLabel}>Active Students</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
                        <Text style={styles.statIcon}>🛏️</Text>
                        <Text style={styles.statValue}>{stats.availableRooms}</Text>
                        <Text style={styles.statLabel}>Available Rooms</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
                        <Text style={styles.statIcon}>⚠️</Text>
                        <Text style={styles.statValue}>{stats.pendingFees}</Text>
                        <Text style={styles.statLabel}>Pending Fees</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
                        <Text style={styles.statIcon}>🏠</Text>
                        <Text style={styles.statValue}>{stats.totalRooms}</Text>
                        <Text style={styles.statLabel}>Total Rooms</Text>
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
    actionLabel: { fontSize: 14, fontWeight: '600' },
});
