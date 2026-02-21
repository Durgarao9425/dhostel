import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, StatusBar, Linking, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { HeaderNotification } from '../components/HeaderNotification';
import { ProfileMenu } from '../components/ProfileMenu';

const INITIAL_STATE = {
    hostelName: 'My Hostel',
    monthAmount: 0,
    pendingAmount: 0,
    occupiedBeds: 0,
    totalBeds: 0,
    availableBeds: 0,
    todayAmount: 0,
    unpaidStudents: [] as any[],
};

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { theme } = useTheme();
    const [data, setData] = useState(INITIAL_STATE);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const [statsRes, todayRes, summaryRes] = await Promise.all([
                api.get('/analytics/dashboard-stats'),
                api.get('/income/analytics?type=day'),
                api.get('/monthly-fees/summary')
            ]);

            if (statsRes.data.success) {
                const d = statsRes.data.data;
                const todayData = todayRes.data.success ? todayRes.data.data : {};

                // Process Top 5 Defaulters
                let topDefaulters: any[] = [];
                if (summaryRes.data.success && summaryRes.data.data?.fees) {
                    const fees = summaryRes.data.data.fees;
                    topDefaulters = fees
                        .filter((f: any) => (f.balance || 0) > 0)
                        .sort((a: any, b: any) => (b.balance || 0) - (a.balance || 0))
                        .slice(0, 5)
                        .map((f: any) => {
                            const now = new Date();
                            // If due_date is null, assume strict logic: due immediately or default to safe date
                            // Using current date as fallback means not overdue unless strictly > today
                            const due = f.due_date ? new Date(f.due_date) : new Date();
                            const diffTime = now.getTime() - due.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const isOverdue = diffDays > 0;

                            return {
                                id: f.student_id,
                                name: `${f.first_name || ''} ${f.last_name || ''}`.trim(),
                                amount: f.balance || 0,
                                phone: f.phone,
                                isOverdue,
                                daysLate: isOverdue ? diffDays : 0,
                                daysLeft: isOverdue ? 0 : Math.abs(diffDays) // Ensure positive
                            };
                        });
                }

                setData({
                    hostelName: 'My Hostel',
                    monthAmount: d.feeCollection || 0,
                    pendingAmount: d.pendingDuesAmount || 0,
                    occupiedBeds: d.occupiedBeds || 0,
                    totalBeds: d.totalBeds || 0,
                    availableBeds: (d.totalBeds || 0) - (d.occupiedBeds || 0),
                    todayAmount: todayData.total_income || 0,
                    unpaidStudents: topDefaulters
                });
            }
        } catch (e) {
            console.log('Dashboard load error:', e);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const call = (phone: string) => Linking.openURL(`tel:${phone}`);

    const collectedPct = Math.round((data.monthAmount / (data.monthAmount + data.pendingAmount)) * 100);

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                style={s.body}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
            >
                <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={s.header}>
                    <View style={s.headerTopRow}>
                        <View>
                            <Text style={s.greeting}>Hello,</Text>
                            <Text style={s.userName}>{user?.full_name || 'Owner'}</Text>
                        </View>
                        <View style={s.headerActions}>
                            <HeaderNotification navigation={navigation} />
                            <ProfileMenu />
                        </View>
                    </View>

                    <Text style={s.amountLabel}>This Month's Collection</Text>
                    <Text style={s.bigAmount}>₹{data.monthAmount.toLocaleString('en-IN')}</Text>

                    <View style={s.progressBg}>
                        <View style={[s.progressFill, { width: `${collectedPct}%` as any }]} />
                    </View>
                    <Text style={s.progressText}>
                        {collectedPct}% collected · ₹{data.pendingAmount.toLocaleString('en-IN')} still pending
                    </Text>

                    <View style={s.statsRow}>
                        <TouchableOpacity
                            style={s.statBox}
                            onPress={() => navigation.navigate('RoomsTab', { filter: 'Full' })}
                        >
                            <Text style={s.statNum}>{data.occupiedBeds}</Text>
                            <Text style={s.statLbl}>Rooms Filled</Text>
                        </TouchableOpacity>
                        <View style={s.statDivider} />
                        <TouchableOpacity
                            style={s.statBox}
                            onPress={() => navigation.navigate('RoomsTab', { filter: 'Vacant' })}
                        >
                            <Text style={s.statNum}>{data.availableBeds}</Text>
                            <Text style={s.statLbl}>Empty Beds</Text>
                        </TouchableOpacity>
                        <View style={s.statDivider} />
                        <TouchableOpacity
                            style={s.statBox}
                            onPress={() => navigation.navigate('FinanceTab', { filter: 'today' })}
                        >
                            <Text style={s.statNum}>
                                ₹{data.todayAmount ? data.todayAmount.toLocaleString('en-IN') : '0'}
                            </Text>
                            <Text style={s.statLbl}>Today Rent</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={s.bodyContent}>
                    <TouchableOpacity
                        style={s.earningsBtn}
                        onPress={() => navigation.navigate('IncomeDetails', { period: 'month' })}
                        activeOpacity={0.85}
                    >
                        <Text style={s.earningsBtnIcon}>📊</Text>
                        <View>
                            <Text style={s.earningsBtnTitle}>See Full Earnings Report</Text>
                            <Text style={s.earningsBtnSub}>Day · Week · Month breakdown</Text>
                        </View>
                        <Text style={s.earningsBtnArrow}>›</Text>
                    </TouchableOpacity>

                    {data.unpaidStudents.length > 0 && (
                        <View style={s.section}>
                            <Text style={s.sectionTitle}>⚠️  Who Hasn't Paid?</Text>
                            {data.unpaidStudents.map(student => (
                                <TouchableOpacity
                                    key={student.id}
                                    style={[s.studentCard, student.isOverdue && s.studentCardOverdue]}
                                    activeOpacity={0.9}
                                    onPress={() => navigation.navigate('StudentDetails', { studentId: student.id })}
                                >
                                    <View style={[s.stripe, { backgroundColor: student.isOverdue ? '#EF4444' : '#F59E0B' }]} />

                                    <View style={s.studentInfo}>
                                        <Text style={s.studentName}>{student.name}</Text>
                                        <Text style={[
                                            s.studentDays,
                                            { color: student.isOverdue ? '#EF4444' : '#D97706' }
                                        ]}>
                                            {student.isOverdue
                                                ? `${student.daysLate} days overdue`
                                                : `Due in ${student.daysLeft} day${student.daysLeft !== 1 ? 's' : ''}`}
                                        </Text>
                                    </View>

                                    <Text style={s.studentAmount}>₹{student.amount.toLocaleString('en-IN')}</Text>

                                    <TouchableOpacity
                                        style={[s.callBtn, student.isOverdue && s.callBtnRed]}
                                        onPress={() => call(student.phone)}
                                    >
                                        <Text style={s.callBtnText}>📞 Call</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F1F5F9' },


    header: {
        paddingTop: 50,
        paddingBottom: 28,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
    },
    userName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    amountLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.75)',
        marginBottom: 4,
    },
    bigAmount: {
        fontSize: 44,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
        marginBottom: 16,
    },
    progressBg: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 99,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 99,
    },
    progressText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.18)',
        borderRadius: 16,
        paddingVertical: 14,
    },
    statBox: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
    statNum: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 2 },
    statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },

    body: { flex: 1 },
    bodyContent: { padding: 16 },

    earningsBtn: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    earningsBtnIcon: { fontSize: 28 },
    earningsBtnTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
    earningsBtnSub: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
    earningsBtnArrow: { marginLeft: 'auto', fontSize: 26, color: '#CBD5E1', fontWeight: '300' },

    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 12 },

    studentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#FDE68A',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    studentCardOverdue: {
        borderColor: '#FECACA',
    },
    stripe: {
        width: 5,
        alignSelf: 'stretch',
    },
    studentInfo: { flex: 1, paddingVertical: 14, paddingLeft: 12 },
    studentName: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 3 },
    studentDays: { fontSize: 12, fontWeight: '600' },
    studentAmount: {
        fontSize: 15,
        fontWeight: '900',
        color: '#1E293B',
        paddingHorizontal: 10,
    },
    callBtn: {
        backgroundColor: '#FEF3C7',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 12,
    },
    callBtnRed: { backgroundColor: '#FEE2E2' },
    callBtnText: { fontSize: 12, fontWeight: '700', color: '#92400E' },

    quickLinks: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    quickBtn: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
    },
    quickIcon: { fontSize: 24 },
    quickLabel: { fontSize: 11, fontWeight: '700', color: '#475569' },
});