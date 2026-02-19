import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, StatusBar, ActivityIndicator, Dimensions, Linking, Modal, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Download, Calendar, X, ChevronLeft } from 'lucide-react-native';
import api from '../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
type Period = 'day' | 'week' | 'month';

// FIX 1: Use local date parts instead of toISOString() to avoid IST timezone shift bug
function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getKey(period: Period, date: Date): string {
    if (period === 'day') return toLocalDateString(date);
    if (period === 'week') {
        const d = new Date(date);
        // FIX 2: Correct Monday calculation (handles Sunday = 0)
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        return toLocalDateString(d);
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

function getDateLabel(period: Period, date: Date): string {
    if (period === 'day') {
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();
        if (isToday) return 'Today';
        if (isYesterday) return 'Yesterday';
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    if (period === 'week') {
        const start = new Date(date);
        // FIX 2: Correct Monday calculation
        const day = start.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        start.setDate(start.getDate() + diff);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        return `${fmt(start)} – ${fmt(end)}`;
    }
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

// FIX 3: Chart title for all periods including daily
function getChartTitle(period: Period): string {
    if (period === 'day') return 'Hourly Breakdown';
    if (period === 'week') return 'Daily Breakdown';
    return 'Weekly Breakdown';
}

// ── BAR CHART ─────────────────────────────────────────────────
function BarChart({ bars }: { bars: { label: string; value: number }[] }) {
    if (!bars || bars.length === 0) return null;
    const maxVal = Math.max(...bars.map(b => b.value), 1);
    const CHART_H = 100;

    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: CHART_H + 24, paddingTop: 16 }}>
            {bars.map((b, i) => {
                const barH = Math.max((b.value / maxVal) * CHART_H, b.value > 0 ? 6 : 3);
                const isHighest = b.value === maxVal && b.value > 0;
                return (
                    <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H + 24 }}>
                        {isHighest && (
                            <Text style={bc.barTopLabel}>
                                ₹{b.value >= 1000 ? `${(b.value / 1000).toFixed(1)}k` : b.value.toLocaleString('en-IN')}
                            </Text>
                        )}
                        <View style={[
                            bc.bar,
                            {
                                height: barH,
                                backgroundColor: isHighest ? '#FF6B6B' : b.value > 0 ? '#CBD5E1' : '#F1F5F9',
                                shadowColor: isHighest ? '#FF6B6B' : 'transparent',
                                shadowOpacity: 0.4,
                                shadowRadius: 6,
                            }
                        ]} />
                        <Text style={[bc.barLabel, { color: isHighest ? '#FF6B6B' : '#94A3B8' }]}>
                            {b.label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

const bc = StyleSheet.create({
    bar: { width: 22, borderRadius: 6, marginBottom: 6 },
    barLabel: { fontSize: 10, fontWeight: '700' },
    barTopLabel: { fontSize: 10, fontWeight: '800', color: '#FF6B6B', marginBottom: 4 },
});

// ── MAIN SCREEN ───────────────────────────────────────────────
export default function IncomeDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const initialPeriod: Period = route.params?.period || 'month';

    const [period, setPeriod] = useState<Period>(initialPeriod);
    const [refDate, setRefDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    // Export State
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportStart, setExportStart] = useState(() => {
        const d = new Date();
        d.setDate(1); // Default to first of current month
        return d;
    });
    const [exportEnd, setExportEnd] = useState(new Date());
    const [isExporting, setIsExporting] = useState(false);
    const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
    const { theme } = useTheme();

    // FIX 4: Export downloads ALL data — added all=true param + local date strings + validation
    const handleExport = async () => {
        if (exportStart > exportEnd) {
            Alert.alert('Invalid Range', 'Start date must be before end date.');
            return;
        }

        setIsExporting(true);
        try {
            // Use local date string (not ISO) to avoid timezone shift
            const startStr = toLocalDateString(exportStart);
            const endStr = toLocalDateString(exportEnd);
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert('Error', 'Authentication token not found. Please log in again.');
                return;
            }

            const baseURL = (api.defaults.baseURL || 'http://192.168.1.4:5000/api').replace(/\/$/, '');
            // all=true tells backend to return ALL records without pagination
            const exportUrl = `${baseURL}/income/export?startDate=${startStr}&endDate=${endStr}&token=${encodeURIComponent(token)}&all=true`;

            const supported = await Linking.canOpenURL(exportUrl);
            if (supported) {
                await Linking.openURL(exportUrl);
                setShowExportModal(false);
            } else {
                Alert.alert('Error', 'Cannot open export link');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    // ── Load data ─────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // FIX 1: Use local date string to avoid UTC timezone shift (IST +5:30 bug)
            const dateStr = toLocalDateString(refDate);
            const res = await api.get('/income/analytics', {
                params: { type: period, date: dateStr },
                timeout: 15000,
            });

            if (res.data?.success) {
                setData(res.data.data ?? null);
            } else {
                setData(null);
                setError(res.data?.message || 'No data returned from server.');
            }
        } catch (e: any) {
            console.log(e);
            setData(null);
            if (e?.code === 'ECONNABORTED') {
                setError('Request timed out. Check your connection.');
            } else {
                setError('Failed to load data. Tap to retry.');
            }
        } finally {
            setLoading(false);
        }
    }, [period, refDate]);

    useEffect(() => { load(); }, [load]);

    // ── Date navigation ───────────────────────────────────────
    const shiftDate = (dir: -1 | 1) => {
        const d = new Date(refDate);
        if (period === 'day') d.setDate(d.getDate() + dir);
        if (period === 'week') d.setDate(d.getDate() + dir * 7);
        if (period === 'month') d.setMonth(d.getMonth() + dir);
        setRefDate(new Date(d)); // Force new object reference
    };

    // Prevent navigating to future dates
    const canGoForward = (): boolean => {
        const today = new Date();
        if (period === 'day') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const refStart = new Date(refDate);
            refStart.setHours(0, 0, 0, 0);
            return refStart < todayStart;
        }
        if (period === 'week') {
            const thisWeekMonday = new Date();
            const d = thisWeekMonday.getDay();
            thisWeekMonday.setDate(thisWeekMonday.getDate() - (d === 0 ? 6 : d - 1));
            thisWeekMonday.setHours(0, 0, 0, 0);
            const refMonday = new Date(refDate);
            const rd = refMonday.getDay();
            refMonday.setDate(refMonday.getDate() - (rd === 0 ? 6 : rd - 1));
            refMonday.setHours(0, 0, 0, 0);
            return refMonday < thisWeekMonday;
        }
        return !(refDate.getFullYear() === today.getFullYear() && refDate.getMonth() === today.getMonth());
    };

    const total = data?.total_amount ?? 0;
    const transactionsList = data?.transactions ?? [];
    const transactionsCount = transactionsList.length;
    const rent = data?.breakdown?.rent ?? 0;
    const maintenance = data?.breakdown?.other ?? 0;
    const other = 0;
    const bars: { label: string; value: number }[] = data?.graph ?? [];

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" />

            {/* ── HEADER ───────────────────────────────────── */}
            <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={s.header}>
                {/* Nav row */}
                <View style={s.navRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <ChevronLeft color="#FFF" size={24} />
                    </TouchableOpacity>
                    <Text style={s.screenTitle}>Earnings</Text>
                    <TouchableOpacity onPress={() => setShowExportModal(true)} style={s.exportBtn}>
                        <Download color="#FFF" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Day / Week / Month tabs */}
                <View style={s.tabs}>
                    {(['day', 'week', 'month'] as const).map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[s.tab, period === p && s.tabActive]}
                            onPress={() => {
                                if (period !== p) {
                                    // FIX 5: Clear stale data immediately on tab switch
                                    setData(null);
                                    setError(null);
                                    setPeriod(p);
                                }
                            }}
                        >
                            <Text style={[s.tabText, period === p && s.tabTextActive]}>
                                {p === 'day' ? 'Daily' : p === 'week' ? 'Weekly' : 'Monthly'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Date picker row */}
                <View style={s.dateRow}>
                    <TouchableOpacity onPress={() => shiftDate(-1)} style={s.arrowBtn}>
                        <Text style={s.arrowText}>‹</Text>
                    </TouchableOpacity>
                    <Text style={s.dateText}>{getDateLabel(period, refDate)}</Text>
                    <TouchableOpacity
                        onPress={() => { if (canGoForward()) shiftDate(1); }}
                        style={[s.arrowBtn, !canGoForward() && { opacity: 0.35 }]}
                    >
                        <Text style={s.arrowText}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* BIG AMOUNT */}
                {loading
                    ? <ActivityIndicator color="#fff" size="large" style={{ marginVertical: 20 }} />
                    : <Text style={s.bigAmount}>₹{total.toLocaleString('en-IN')}</Text>
                }
                {!loading && transactionsCount > 0 && (
                    <Text style={s.transactionsText}>
                        {transactionsCount} payment{transactionsCount > 1 ? 's' : ''} received
                    </Text>
                )}
                {!loading && total === 0 && !error && (
                    <Text style={s.transactionsText}>No payments this period</Text>
                )}
                {!loading && error && (
                    <Text style={[s.transactionsText, { color: '#FCA5A5' }]}>{error}</Text>
                )}
            </LinearGradient>

            {/* ── SCROLL BODY ──────────────────────────────── */}
            <ScrollView
                contentContainerStyle={s.body}
                showsVerticalScrollIndicator={false}
            >
                {/* Retry button on error */}
                {!loading && error && (
                    <TouchableOpacity style={s.retryBtn} onPress={load}>
                        <Text style={s.retryText}>Tap to Retry</Text>
                    </TouchableOpacity>
                )}

                {/* FIX 3: Bar chart card — now shows for ALL periods (day, week, month) */}
                {!loading && bars.length > 0 && total > 0 && (
                    <View style={s.card}>
                        <Text style={s.cardTitle}>{getChartTitle(period)}</Text>
                        <BarChart bars={bars} />
                    </View>
                )}

                {/* Breakdown — where did money come from */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>Where it came from</Text>

                    <View style={s.breakdownItem}>
                        <Text style={s.bdIcon}>🏠</Text>
                        <Text style={s.bdLabel}>Rent</Text>
                        <Text style={s.bdAmount}>₹{rent.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={s.divider} />
                    <View style={s.breakdownItem}>
                        <Text style={s.bdIcon}>🔧</Text>
                        <Text style={s.bdLabel}>Maintenance</Text>
                        <Text style={s.bdAmount}>₹{maintenance.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={s.divider} />
                    <View style={s.breakdownItem}>
                        <Text style={s.bdIcon}>⚡</Text>
                        <Text style={s.bdLabel}>Other</Text>
                        <Text style={s.bdAmount}>₹{other.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={[s.divider, { backgroundColor: '#E2E8F0', height: 2 }]} />
                    <View style={s.breakdownItem}>
                        <Text style={s.bdIcon}>💰</Text>
                        <Text style={[s.bdLabel, { fontWeight: '800', color: '#1E293B' }]}>Total</Text>
                        <Text style={[s.bdAmount, { color: '#FF6B6B', fontSize: 18 }]}>
                            ₹{total.toLocaleString('en-IN')}
                        </Text>
                    </View>
                </View>

                {/* Recent Transactions List */}
                {transactionsList.length > 0 && (
                    <View style={s.card}>
                        <Text style={s.cardTitle}>Recent Transactions</Text>
                        {transactionsList.map((item: any, idx: number) => (
                            <TouchableOpacity
                                key={item.id ?? idx}
                                style={[s.transItem, idx === transactionsList.length - 1 && { borderBottomWidth: 0 }]}
                                onPress={() => {
                                    if (item.student_id) {
                                        navigation.navigate('StudentDetails', { studentId: item.student_id });
                                    }
                                }}
                            >
                                <View style={s.transIconBg}>
                                    <Text style={s.transIcon}>{item.type === 'Rent' ? '🏠' : '💰'}</Text>
                                </View>
                                <View style={s.transInfo}>
                                    <Text style={s.transTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={s.transSub} numberOfLines={1}>
                                        {item.subtitle} · {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </Text>
                                </View>
                                <Text style={s.transAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Empty state */}
                {!loading && !error && total === 0 && transactionsList.length === 0 && (
                    <View style={s.emptyCard}>
                        <Text style={s.emptyIcon}>📭</Text>
                        <Text style={s.emptyTitle}>No Transactions</Text>
                        <Text style={s.emptyText}>No income recorded for this {period}.</Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Export Modal */}
            <Modal
                visible={showExportModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowExportModal(false)}
            >
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Export Income Report</Text>
                            <TouchableOpacity onPress={() => setShowExportModal(false)}>
                                <X size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={s.modalLabel}>Select Date Range</Text>
                        <Text style={s.modalSubLabel}>All transactions in this range will be exported</Text>

                        <View style={s.dateInputs}>
                            <TouchableOpacity style={s.dateInput} onPress={() => setStartDatePickerVisible(true)}>
                                <Calendar size={18} color="#64748B" />
                                <Text style={s.dateInputText}>
                                    {exportStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                            </TouchableOpacity>
                            <Text style={{ color: '#94A3B8', fontWeight: '700' }}>→</Text>
                            <TouchableOpacity style={s.dateInput} onPress={() => setEndDatePickerVisible(true)}>
                                <Calendar size={18} color="#64748B" />
                                <Text style={s.dateInputText}>
                                    {exportEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {exportStart > exportEnd && (
                            <Text style={s.exportWarning}>⚠️ Start date must be before end date</Text>
                        )}

                        <TouchableOpacity
                            style={[
                                s.exportConfirmBtn,
                                (isExporting || exportStart > exportEnd) && s.exportConfirmBtnDisabled
                            ]}
                            onPress={handleExport}
                            disabled={isExporting || exportStart > exportEnd}
                        >
                            {isExporting ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Text style={s.exportConfirmText}>Download Excel (All Data)</Text>
                                    <Download size={18} color="#FFF" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <DateTimePickerModal
                isVisible={isStartDatePickerVisible}
                mode="date"
                date={exportStart}
                maximumDate={new Date()}
                onConfirm={(date) => {
                    setExportStart(date);
                    setStartDatePickerVisible(false);
                }}
                onCancel={() => setStartDatePickerVisible(false)}
            />
            <DateTimePickerModal
                isVisible={isEndDatePickerVisible}
                mode="date"
                date={exportEnd}
                maximumDate={new Date()}
                onConfirm={(date) => {
                    setExportEnd(date);
                    setEndDatePickerVisible(false);
                }}
                onCancel={() => setEndDatePickerVisible(false)}
            />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F1F5F9' },

    // ── Header ──────────────────────────────────────────────
    header: {
        paddingTop: 54,
        paddingBottom: 28,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backBtn: {
        width: 40, height: 40,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    screenTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
    exportBtn: {
        width: 40, height: 40,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },

    tabs: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.18)',
        borderRadius: 14,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1, paddingVertical: 8,
        borderRadius: 11, alignItems: 'center',
    },
    tabActive: { backgroundColor: '#FFFFFF' },
    tabText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
    tabTextActive: { color: '#FF6B6B' },

    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    arrowBtn: {
        width: 40, height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    arrowText: { fontSize: 24, color: '#fff', fontWeight: '400' },
    dateText: {
        fontSize: 15, fontWeight: '700', color: '#fff',
        flex: 1, textAlign: 'center',
    },

    bigAmount: {
        fontSize: 48, fontWeight: '900', color: '#fff',
        textAlign: 'center', letterSpacing: -1, marginBottom: 6,
    },
    transactionsText: {
        fontSize: 13, fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },

    // ── Body ────────────────────────────────────────────────
    body: { padding: 16 },

    retryBtn: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
    retryText: { color: '#FF6B6B', fontWeight: '700', fontSize: 14 },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
    },

    // ── Breakdown ────────────────────────────────────────────
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
    },
    bdIcon: { fontSize: 22, width: 32 },
    bdLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#334155' },
    bdAmount: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9' },

    // ── Transactions ────────────────────────────────────────
    transItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    transIconBg: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
        marginRight: 12,
    },
    transIcon: { fontSize: 20 },
    transInfo: { flex: 1, marginRight: 8 },
    transTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    transSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    transAmount: { fontSize: 14, fontWeight: '800', color: '#059669' },

    // ── Empty state ──────────────────────────────────────────
    emptyCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
    emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },

    // ── Modal ────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24 },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    modalLabel: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 4 },
    modalSubLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 14 },
    dateInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    dateInput: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F1F5F9', padding: 12, borderRadius: 12,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    dateInputText: { fontSize: 12, fontWeight: '600', color: '#1E293B', flexShrink: 1 },
    exportWarning: {
        fontSize: 12, color: '#EF4444',
        fontWeight: '600', marginBottom: 12,
    },
    exportConfirmBtn: {
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        elevation: 2,
    },
    exportConfirmBtnDisabled: { backgroundColor: '#94A3B8' },
    exportConfirmText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});