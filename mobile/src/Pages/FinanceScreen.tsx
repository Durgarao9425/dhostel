import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, Modal,
    TextInput, Alert, ActivityIndicator, Dimensions, LayoutAnimation,
    RefreshControl, Linking, ScrollView, Platform, UIManager, InteractionManager,
    Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MessageCircle, X, TrendingUp, TrendingDown, ChevronRight, ChevronLeft, Calendar, Tag, Plus, Receipt } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import api from '../services/api';
import { HeaderNotification } from '../components/HeaderNotification';
import { ProfileMenu } from '../components/ProfileMenu';
import { useTheme } from '../../contexts/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─────────────────────────────────────────────────────────────────────────────
//  MODULE-LEVEL CACHE
// ─────────────────────────────────────────────────────────────────────────────
type CacheStore = { fees: any[]; expenses: any[]; modes: any[]; lastFetched: string; dirty: boolean; };
const STORE: CacheStore = { fees: [], expenses: [], modes: [], lastFetched: '', dirty: false };
// FIX: Disable aggressive caching so payments made on other screens (StudentDetails) 
// are reflected immediately when returning to this screen.
// STALE_MS already declared
const STALE_MS = 0;
const isFresh = (monthStr: string) => !STORE.dirty && STORE.fees.length > 0 && STORE.lastFetched === monthStr;
// Set dirty initially to force first fetch correctly
STORE.dirty = true;

// Status theme – canonical + legacy names (all keys are lowercase)
const STATUS_THEME: Record<string, { label: string; color: string; bg: string }> = {
    // Canonical backend statuses
    'paid': { label: 'PAID', color: '#10B981', bg: '#DCFCE7' },
    'partial': { label: 'PARTIAL', color: '#3B82F6', bg: '#DBEAFE' },
    'unpaid': { label: 'UNPAID', color: '#EF4444', bg: '#FEE2E2' },
    'overdue': { label: 'OVERDUE', color: '#B91C1C', bg: '#FEE2E2' },
    'upcoming': { label: 'UPCOMING', color: '#64748B', bg: '#F1F5F9' },

    // Legacy / alternative labels from older backend versions
    'fully paid': { label: 'PAID', color: '#10B981', bg: '#DCFCE7' },
    'partially paid': { label: 'PARTIAL', color: '#3B82F6', bg: '#DBEAFE' },
    'pending': { label: 'UPCOMING', color: '#64748B', bg: '#F1F5F9' },
    'due soon': { label: 'DUE SOON', color: '#F59E0B', bg: '#FEF3C7' },
};

// All sets use lowercase; always compare with status.toLowerCase()
const UNPAID_STATUSES = new Set([
    'unpaid',
    'overdue',
    'upcoming',
    'pending',
    'due soon',
    'due',
    'pending due',
    'unpaid due',
]);

const PAID_STATUSES = new Set([
    'paid',
    'fully paid',
    'cleared',
]);

const PARTIAL_STATUSES = new Set([
    'partial',
    'partially paid',
    'part paid',
]);

const CAT_COLORS: Record<string, string> = {
    'Electricity': '#F59E0B',
    'Water': '#0EA5E9',
    'Maintenance': '#8B5CF6',
    'Salary': '#10B981',
    'Groceries': '#F97316',
    'Internet': '#06B6D4',
    'Cleaning': '#EC4899',
    'Other': '#64748B',
};
const catColor = (name: string) => CAT_COLORS[name] || '#64748B';

const sf = (v: any): number => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

// FIX: Local date string — avoids IST timezone shift from toISOString()
function toLocalDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  RENT CARD
// ─────────────────────────────────────────────────────────────────────────────
const RentCard = React.memo(({ item, themeColor, onNavigate, onCollect, onWhatsApp }: {
    item: any; themeColor: string;
    onNavigate: (id: number) => void;
    onCollect: (item: any) => void;
    onWhatsApp: (phone: string, name: string, due: number) => void;
}) => {
    const statusKey = (item.fee_status ?? '').toLowerCase();
    const status = STATUS_THEME[statusKey] ?? STATUS_THEME['upcoming'];
    let total = sf(item.monthly_rent || item.total_amount || item.total_due || item.amount || 0);
    let paid = sf(item.amount_paid || item.paid_amount || item.received_amount || 0);
    if (statusKey === 'paid' || statusKey === 'fully paid') {
        if (total > 0 && paid <= 0) paid = total;
        if (paid > 0 && total <= 0) total = paid;
    }
    const due = item.fee_status === 'Fully Paid' ? 0 : Math.max(0, total - paid);

    return (
        <TouchableOpacity style={C.feeCard} activeOpacity={0.9} onPress={() => onNavigate(item.student_id)}>
            <View style={[C.statusStripe, { backgroundColor: status.color }]} />
            <View style={C.feeCardInner}>
                <View style={C.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={C.studentName}>{item.first_name} {item.last_name}</Text>
                        <Text style={C.roomText}>Room {item.room_number || 'N/A'}</Text>
                    </View>
                    <View style={[C.statusPill, { backgroundColor: status.bg }]}>
                        <Text style={[C.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>
                <View style={C.financialRow}>
                    <View style={C.priceBlock}>
                        <Text style={C.finLabel}>RENT</Text>
                        <Text style={C.finVal}>₹{total}</Text>
                    </View>
                    <View style={C.sep} />
                    <View style={C.priceBlock}>
                        <Text style={[C.finLabel, { color: '#10B981' }]}>PAID</Text>
                        <Text style={[C.finVal, { color: '#10B981' }]}>₹{paid}</Text>
                        {(paid > 0 && item.updated_at) && (
                            <Text style={{ fontSize: 8, color: '#10B981', marginTop: 2, fontWeight: '600' }}>
                                {new Date(item.updated_at).toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                    <View style={C.sep} />
                    <View style={C.priceBlock}>
                        <Text style={[C.finLabel, { color: due > 0 ? '#EF4444' : '#10B981' }]}>BALANCE</Text>
                        <Text style={[C.finVal, { color: due > 0 ? '#EF4444' : '#10B981' }]}>₹{due}</Text>
                    </View>
                </View>
                {due > 0 && (
                    <View style={C.actionFooter}>
                        <TouchableOpacity style={C.nudgeBtn} onPress={() => onWhatsApp(item.phone, item.first_name, due)}>
                            <MessageCircle size={14} color="#22C55E" />
                            <Text style={C.nudgeText}>WhatsApp</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[C.collectBtn, { backgroundColor: themeColor }]} onPress={() => onCollect(item)}>
                            <Text style={C.collectBtnText}>COLLECT</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
//  EXPENSE CARD
// ─────────────────────────────────────────────────────────────────────────────
const ExpenseCard = React.memo(({ item, onPress }: { item: any; onPress: (i: any) => void }) => {
    const d = new Date(item.expense_date);
    const day = d.getDate();
    const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
    const color = catColor(item.category_name);
    const amt = sf(item.amount);

    return (
        <TouchableOpacity style={C.expCard} activeOpacity={0.88} onPress={() => onPress(item)}>
            <View style={[C.expTopBar, { backgroundColor: color }]} />
            <View style={C.expCardBody}>
                <View style={C.expTopRow}>
                    <View style={[C.expDateBadge, { backgroundColor: color + '15', borderColor: color + '30' }]}>
                        <Text style={[C.expDay, { color }]}>{day}</Text>
                        <Text style={[C.expMonth, { color }]}>{month}</Text>
                    </View>
                    <View style={C.expAmountBlock}>
                        <Text style={C.expAmountLabel}>AMOUNT</Text>
                        <Text style={C.expAmountVal}>₹{amt.toLocaleString('en-IN')}</Text>
                    </View>
                </View>
                <Text style={C.expTitle} numberOfLines={1}>{item.title}</Text>
                <View style={C.expBottomRow}>
                    <View style={[C.expCatChip, { backgroundColor: color + '15' }]}>
                        <View style={[C.expCatDot, { backgroundColor: color }]} />
                        <Text style={[C.expCatText, { color }]}>{item.category_name || 'Other'}</Text>
                    </View>
                    <View style={C.expArrow}>
                        <ChevronRight size={14} color={color} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
//  COLLECT DRAWER
// ─────────────────────────────────────────────────────────────────────────────
const CollectDrawer = React.memo(({
    visible, onClose, selectedFee, paymentModes,
    payAmount, setPayAmount, payNotes, setPayNotes,
    payTransactionId, setPayTransactionId,
    payDate, setPayDate, payDueDate, setPayDueDate,
    payModeId, setPayModeId, payLoading,
    onConfirm, themeColor,
}: any) => {
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isDueDatePickerVisible, setDueDatePickerVisibility] = useState(false);

    React.useEffect(() => {
        Animated.timing(backdropOpacity, {
            toValue: visible ? 1 : 0,
            duration: visible ? 220 : 160,
            delay: visible ? 80 : 0,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const handleConfirmDate = (d: Date) => { setPayDate(toLocalDateStr(d)); setDatePickerVisibility(false); };
    const handleConfirmDueDate = (d: Date) => { setPayDueDate(toLocalDateStr(d)); setDueDatePickerVisibility(false); };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={S.modalRoot}>
                <Animated.View style={[S.modalBackdrop, { opacity: backdropOpacity }]} />
                <View style={S.modalOverlay}>
                    <View style={S.drawerContent}>
                        <View style={S.drawerHandle} />
                        <View style={S.drawerHeader}>
                            <Text style={S.drawerTitle}>Record Payment</Text>
                            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <X color="#64748B" size={20} />
                            </TouchableOpacity>
                        </View>

                        {selectedFee && (
                            <View style={S.infoSummary}>
                                <View>
                                    <Text style={S.summaryName}>{selectedFee.first_name} {selectedFee.last_name}</Text>
                                    <Text style={S.summaryRoom}>Room {selectedFee.room_number}</Text>
                                </View>
                                <View style={S.summaryAmtBox}>
                                    <Text style={S.summaryAmtLabel}>DUE</Text>
                                    <Text style={S.summaryAmt}>₹{payAmount}</Text>
                                </View>
                            </View>
                        )}

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <Text style={S.label}>Amount (₹) *</Text>
                            <TextInput style={S.inputField} keyboardType="numeric" value={payAmount} onChangeText={setPayAmount} />

                            <View style={S.row}>
                                <View style={{ flex: 1, marginRight: 6 }}>
                                    <Text style={S.label}>Payment Date *</Text>
                                    <TouchableOpacity style={S.dateField} onPress={() => setDatePickerVisibility(true)}>
                                        <Calendar size={14} color="#64748B" />
                                        <Text style={S.dateTextLabel}>{payDate}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, marginLeft: 6 }}>
                                    <Text style={S.label}>Due Date *</Text>
                                    <TouchableOpacity style={S.dateField} onPress={() => setDueDatePickerVisibility(true)}>
                                        <Calendar size={14} color="#64748B" />
                                        <Text style={S.dateTextLabel}>{payDueDate}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={S.label}>Payment Mode</Text>
                            <View style={S.modeRow}>
                                {paymentModes.map((m: any) => {
                                    const mId = (m.payment_mode_id || m.id)?.toString();
                                    const mName = m.payment_mode_name || m.name || 'Cash';
                                    const active = payModeId === mId;
                                    return (
                                        <TouchableOpacity key={mId}
                                            style={[S.modeChip, active && { backgroundColor: themeColor, borderColor: themeColor }]}
                                            onPress={() => setPayModeId(mId)}>
                                            <Text style={[S.modeText, active && { color: '#FFF' }]}>{mName}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={S.label}>Transaction ID (Optional)</Text>
                            <TextInput style={S.inputField} value={payTransactionId}
                                onChangeText={setPayTransactionId} placeholder="e.g. UPI-123456" />

                            <Text style={S.label}>Notes</Text>
                            <TextInput style={[S.inputField, { height: 64, textAlignVertical: 'top' }]}
                                value={payNotes} onChangeText={setPayNotes} multiline placeholder="Any remarks..." />

                            <View style={{ height: 14 }} />
                            <TouchableOpacity
                                style={[S.submitBtn, { backgroundColor: themeColor }, payLoading && { opacity: 0.6 }]}
                                onPress={onConfirm} disabled={payLoading}>
                                {payLoading ? (
                                    <View style={S.submitLoadingRow}>
                                        <ActivityIndicator color="#FFF" size="small" />
                                        <Text style={S.submitBtnText}>Processing...</Text>
                                    </View>
                                ) : (
                                    <Text style={S.submitBtnText}>CONFIRM PAYMENT</Text>
                                )}
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </View>

            <DateTimePickerModal isVisible={isDatePickerVisible} mode="date"
                onConfirm={handleConfirmDate} onCancel={() => setDatePickerVisibility(false)} date={new Date(payDate)} />
            <DateTimePickerModal isVisible={isDueDatePickerVisible} mode="date"
                onConfirm={handleConfirmDueDate} onCancel={() => setDueDatePickerVisibility(false)} date={new Date(payDueDate)} />
        </Modal>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function FinanceScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const [mode, setMode] = useState<'Rent' | 'Expense'>('Rent');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Unpaid' | 'Partial' | 'Paid'>('All');
    const [search, setSearch] = useState('');
    const [fees, setFees] = useState<any[]>(() => STORE.fees);
    const [expenses, setExpenses] = useState<any[]>(() => STORE.expenses);
    const [paymentModes, setPaymentModes] = useState<any[]>(() => STORE.modes);
    const [initialLoading, setInitialLoading] = useState(() => STORE.fees.length === 0);
    const [summary, setSummary] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthStr, setMonthStr] = useState(() => toLocalDateStr(new Date()).slice(0, 7));

    // Modal
    const [collectModalVisible, setCollectModalVisible] = useState(false);
    const [selectedFee, setSelectedFee] = useState<any>(null);
    const [payAmount, setPayAmount] = useState('');
    const [payNotes, setPayNotes] = useState('');
    const [payTransactionId, setPayTransactionId] = useState('');
    const [payDate, setPayDate] = useState(() => toLocalDateStr(new Date()));
    const [payDueDate, setPayDueDate] = useState(() => {
        const d = new Date(); d.setMonth(d.getMonth() + 1); return toLocalDateStr(d);
    });
    const [payModeId, setPayModeId] = useState(() => STORE.modes[0]?.payment_mode_id?.toString() || '1');
    const [payLoading, setPayLoading] = useState(false);

    const fetchingRef = useRef(false);

    // Update monthStr when currentDate changes
    useEffect(() => {
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        setMonthStr(`${y}-${m}`);
    }, [currentDate]);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (fetchingRef.current) return;
        // Construct YYYY-MM
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const currentMonthStr = `${y}-${m}`;

        if (!isRefresh && isFresh(currentMonthStr)) {
            setFees(STORE.fees);
            setExpenses(STORE.expenses);
            setPaymentModes(STORE.modes);
            return;
        }

        fetchingRef.current = true;
        try {
            if (isRefresh) setRefreshing(true);
            else if (STORE.fees.length === 0) setInitialLoading(true);

            // Calculate start/end dates for expenses
            const startDate = `${currentMonthStr}-01`;
            const lastDay = new Date(y, currentDate.getMonth() + 1, 0).getDate();
            const endDate = `${currentMonthStr}-${String(lastDay).padStart(2, '0')}`;

            const reqs: Promise<any>[] = [
                api.get('/monthly-fees/summary', { params: { fee_month: currentMonthStr } }),
                api.get('/expenses', { params: { startDate, endDate } })
            ];
            if (STORE.modes.length === 0) reqs.push(api.get('/monthly-fees/payment-modes'));

            const results = await Promise.allSettled(reqs);
            const [fR, eR, mR] = results;

            if (fR.status === 'fulfilled' && fR.value.data.success) {
                const payload = fR.value.data.data || {};
                const rawFees = Array.isArray(payload) ? payload : (payload.fees || []);
                const summaryData = Array.isArray(payload) ? null : payload.summary;

                console.log(`[FinanceScreen] Fetched ${rawFees.length} fees for ${currentMonthStr}`);
                STORE.fees = rawFees;
                setFees(rawFees);
                if (summaryData) setSummary(summaryData);
            } else {
                console.warn('[FinanceScreen] Fees fetch failed or empty', fR.status);
                setFees([]);
            }

            if (eR.status === 'fulfilled' && eR.value.data.success) {
                const expData = eR.value.data.data ?? [];
                STORE.expenses = expData; setExpenses(expData);
            } else {
                setExpenses([]);
            }

            if (mR?.status === 'fulfilled' && mR.value.data.success) {
                const modes = mR.value.data.data;
                STORE.modes = modes; setPaymentModes(modes);
                const first = modes[0];
                if (first) setPayModeId((first.payment_mode_id || first.id)?.toString() || '1');
            }

            STORE.lastFetched = currentMonthStr; STORE.dirty = false;
        } catch (e) {
            console.error('Finance fetch:', e);
            Toast.show({ type: 'error', text1: 'Failed to load data.' });
        } finally {
            fetchingRef.current = false;
            setInitialLoading(false);
            setRefreshing(false);
        }
    }, [currentDate]);

    useFocusEffect(useCallback(() => {
        // Always check if we need to fetch (e.g. if dirty or month changed)
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        // REMOVED fetch skip to ensure data is always fresh when navigating back
        const task = InteractionManager.runAfterInteractions(() => { fetchData(); });
        return () => task.cancel();
    }, [fetchData, currentDate]));

    useEffect(() => {
        if (route.params?.filter === 'today') {
            // "Today" likely implies "Current Month" in monthly view, but user wants to see today's activity.
            // We set month to current.
            setCurrentDate(new Date());
            setStatusFilter('Paid');
            navigation.setParams({ filter: undefined });
        }
    }, [route.params]);

    const shiftMonth = useCallback((delta: number) => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + delta);
        setCurrentDate(d);
        // Explicitly mark dirty to ensure refetch? No, useEffect[currentDate] handles it.
    }, [currentDate]);

    const getMonthLabel = () => currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const handleNavigate = useCallback((id: number) => navigation.navigate('StudentDetails', { studentId: id }), [navigation]);
    const handleWhatsApp = useCallback((phone: string, name: string, due: number) => {
        Linking.openURL(`whatsapp://send?phone=91${phone}&text=Hi ${name}, your rent balance ₹${due} is pending.`);
    }, []);
    const handleExpensePress = useCallback((item: any) => navigation.navigate('ExpenseDetails', { expense: item }), [navigation]);

    const openCollectModal = useCallback((item: any) => {
        const total = sf(item.total_amount || item.total_due || item.monthly_rent || 0);
        const paid = sf(item.amount_paid || item.paid_amount || 0);
        setSelectedFee(item);
        setPayAmount(Math.max(0, total - paid).toString());
        setPayNotes(''); setPayTransactionId('');
        setPayDate(toLocalDateStr(new Date()));
        const next = new Date(); next.setMonth(next.getMonth() + 1);
        setPayDueDate(toLocalDateStr(next));
        setCollectModalVisible(true);
    }, []);

    const handleCollectRent = useCallback(async () => {
        if (!payAmount || parseFloat(payAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount'); return;
        }
        try {
            setPayLoading(true);
            const payload: any = {
                student_id: selectedFee.student_id,
                amount: parseFloat(payAmount),
                payment_date: payDate,
                payment_mode_id: parseInt(payModeId || '1'),
                notes: payNotes,
                transaction_id: payTransactionId,
                fee_month: selectedFee.fee_month || new Date().toISOString().slice(0, 7),
                due_date: payDueDate,
            };
            if (selectedFee.hostel_id) payload.hostel_id = selectedFee.hostel_id;

            const res = await api.post('/monthly-fees/record-payment', payload);
            if (res.data.success) {
                setCollectModalVisible(false);
                Toast.show({
                    type: 'success',
                    text1: '✓ Payment Collected!',
                    text2: `₹${payAmount} recorded for ${selectedFee.first_name}`,
                });

                // Backend is the single source of truth for status/tabs/counts.
                // Mark cache dirty and re-fetch from API.
                STORE.dirty = true;
                setTimeout(() => fetchData(true), 600);
            }
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.error || 'Payment failed.');
        } finally {
            setPayLoading(false);
        }
    }, [payAmount, payDate, payModeId, payNotes, payTransactionId, payDueDate, selectedFee, fetchData]);

    const totalDebt = useMemo(() =>
        fees.reduce((s, f) => s + Math.max(0, sf(f.total_amount || f.total_due || f.monthly_rent) - sf(f.amount_paid || f.paid_amount)), 0),
        [fees]);

    // ─── FIX: Rewritten filteredData with correct, robust status filtering ───
    const filteredData = useMemo(() => {
        const q = search.toLowerCase().trim();

        if (mode === 'Rent') {
            return fees.filter(f => {
                // Search filter
                const nameMatch = `${f.first_name ?? ''} ${f.last_name ?? ''}`.toLowerCase().includes(q);
                const roomMatch = f.room_number?.toString().includes(q);
                if (q && !nameMatch && !roomMatch) return false;

                // Date filter — check multiple date fields so records aren't hidden wrongly
                // Removed local date filter because we now filter by month via API.
                // Status filtering remains local on the fetched monthly dataset.

                // FIX: Status filter — use Sets so any backend variation is handled (case-insensitive)
                const status = (f.fee_status ?? '').toLowerCase();

                if (statusFilter === 'All') return true;

                if (statusFilter === 'Unpaid') {
                    // Show truly unpaid/overdue records
                    // Also include records where due > 0 regardless of status label
                    const due = Math.max(0, sf(f.total_amount || f.total_due || f.monthly_rent) - sf(f.amount_paid || f.paid_amount));
                    return UNPAID_STATUSES.has(status) || (due > 0 && !PAID_STATUSES.has(status) && !PARTIAL_STATUSES.has(status));
                }
                if (statusFilter === 'Paid') {
                    // Show fully paid records
                    return PAID_STATUSES.has(status);
                }
                if (statusFilter === 'Partial') {
                    // Show partially paid records
                    // Also catch: paid > 0 but not fully paid
                    const paid = sf(f.amount_paid || f.paid_amount || 0);
                    const total = sf(f.total_amount || f.total_due || f.monthly_rent || 0);
                    return PARTIAL_STATUSES.has(status) || (paid > 0 && total > 0 && paid < total);
                }
                return true;
            });
        }

        // Expenses
        return expenses.filter(e => {
            // Local search filter
            const nameMatch = e.category_name?.toLowerCase().includes(q) || e.title?.toLowerCase().includes(q);
            if (q && !nameMatch) return false;
            // Date range is handled by API now.
            return true;
        });
    }, [mode, statusFilter, fees, expenses, search]);

    // Debug log — remove after testing
    // console.log('fees total:', fees.length, 'filtered:', filteredData.length, 'statusFilter:', statusFilter);

    const rentKeyExtractor = useCallback((item: any) => `s${item.student_id}`, []);
    const expenseKeyExtractor = useCallback((item: any) => `e${item.expense_id ?? item.id}`, []);

    const renderRentItem = useCallback(({ item }: { item: any }) => (
        <RentCard item={item} themeColor={theme.primary}
            onNavigate={handleNavigate} onCollect={openCollectModal} onWhatsApp={handleWhatsApp} />
    ), [theme.primary, handleNavigate, openCollectModal, handleWhatsApp]);

    const renderExpenseItem = useCallback(({ item }: { item: any }) => (
        <ExpenseCard item={item} onPress={handleExpensePress} />
    ), [handleExpensePress]);

    // Count badges for each filter tab
    const unpaidCount = useMemo(() => fees.filter(f => {
        const status = (f.fee_status ?? '').toLowerCase();
        const due = Math.max(0, sf(f.total_amount || f.total_due || f.monthly_rent) - sf(f.amount_paid || f.paid_amount));
        return UNPAID_STATUSES.has(status) || (due > 0 && !PAID_STATUSES.has(status) && !PARTIAL_STATUSES.has(status));
    }).length, [fees]);

    const partialCount = useMemo(() => fees.filter(f => {
        const status = (f.fee_status ?? '').toLowerCase();
        const paid = sf(f.amount_paid || f.paid_amount || 0);
        const total = sf(f.total_amount || f.total_due || f.monthly_rent || 0);
        return PARTIAL_STATUSES.has(status) || (paid > 0 && total > 0 && paid < total);
    }).length, [fees]);

    const paidCount = useMemo(() => fees.filter(f => {
        const status = (f.fee_status ?? '').toLowerCase();
        return PAID_STATUSES.has(status);
    }).length, [fees]);

    return (
        <View style={S.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={S.header}>
                <View style={S.headerTop}>
                    <View>
                        <Text style={S.headerTitle}>Finance Hub</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={S.debtText}>Due: ₹{totalDebt.toLocaleString('en-IN')}</Text>
                            <View style={{ width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.4)' }} />
                            <Text style={S.debtText}>Collected: ₹{(summary?.total_paid || 0).toLocaleString('en-IN')}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <HeaderNotification navigation={navigation} /><ProfileMenu />
                    </View>
                </View>
                <View style={S.tabContainer}>
                    {(['Rent', 'Expense'] as const).map(m => (
                        <TouchableOpacity key={m} style={[S.tab, mode === m && S.activeTab]}
                            onPress={() => { LayoutAnimation.easeInEaseOut(); setMode(m); }}>
                            {m === 'Rent'
                                ? <TrendingUp color={mode === m ? theme.primary : '#FFF'} size={15} />
                                : <TrendingDown color={mode === m ? theme.primary : '#FFF'} size={15} />}
                            <Text style={[S.tabText, { color: mode === m ? theme.primary : '#FFF' }]}>
                                {m === 'Rent' ? 'INCOME' : 'EXPENSES'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>

            <View style={S.searchSection}>
                <View style={S.searchBar}>
                    <Search color="#94A3B8" size={17} />
                    <TextInput style={S.searchInput} placeholder="Search name or room..."
                        value={search} onChangeText={setSearch} autoCorrect={false} autoCapitalize="none" />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <X color="#94A3B8" size={16} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Date Navigator replaces Filter Picker */}
                <View style={[S.searchBar, { marginTop: 0, marginBottom: 12, justifyContent: 'space-between', backgroundColor: 'transparent', paddingHorizontal: 4 }]}>
                    <TouchableOpacity onPress={() => shiftMonth(-1)} style={S.navArrow}>
                        <ChevronLeft color="#64748B" size={20} />
                    </TouchableOpacity>
                    <View style={S.dateBadge}>
                        <Calendar size={14} color="#64748B" style={{ marginRight: 6 }} />
                        <Text style={S.dateBadgeText}>{getMonthLabel()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => shiftMonth(1)} style={S.navArrow}>
                        <ChevronRight color="#64748B" size={20} />
                    </TouchableOpacity>
                </View>

                {mode === 'Rent' && (
                    <View style={S.filterRow}>
                        {([
                            { key: 'All', label: 'All', count: fees.length },
                            { key: 'Unpaid', label: 'Unpaid', count: unpaidCount },
                            { key: 'Partial', label: 'Partial', count: partialCount },
                            { key: 'Paid', label: 'Paid', count: paidCount },
                        ] as const).map(({ key, label, count }) => (
                            <TouchableOpacity key={key} onPress={() => setStatusFilter(key)}
                                style={[S.filterBtn, statusFilter === key && { backgroundColor: theme.primary }]}>
                                <Text style={[S.filterLabel, statusFilter === key && { color: '#FFF' }]}>
                                    {label}
                                    {count > 0 ? ` (${count})` : ''}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {initialLoading ? (
                <View style={S.loaderWrap}>
                    <ActivityIndicator color={theme.primary} size="large" />
                    <Text style={S.loaderText}>Loading...</Text>
                </View>
            ) : (
                <FlatList
                    key={mode}
                    data={filteredData}
                    keyExtractor={mode === 'Rent' ? rentKeyExtractor : expenseKeyExtractor}
                    renderItem={mode === 'Rent' ? renderRentItem : renderExpenseItem}
                    contentContainerStyle={S.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { STORE.dirty = true; fetchData(true); }} />
                    }
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10} maxToRenderPerBatch={10} windowSize={7}
                    removeClippedSubviews={Platform.OS === 'android'}
                    ListHeaderComponent={mode === 'Expense' && expenses.length > 0 ? (
                        <View style={S.expSummaryCard}>
                            <View style={S.expSummaryLeft}>
                                <Text style={S.expSummaryLabel}>THIS MONTH</Text>
                                <Text style={S.expSummaryTotal}>
                                    ₹{expenses
                                        .filter(e => new Date(e.expense_date).getMonth() === new Date().getMonth())
                                        .reduce((s, e) => s + sf(e.amount), 0)
                                        .toLocaleString('en-IN')}
                                </Text>
                                <Text style={S.expSummaryCount}>{expenses.length} total expenses</Text>
                            </View>
                            <View style={S.expSummaryDivider} />
                            <View style={S.expSummaryRight}>
                                {Object.entries(
                                    expenses.reduce((acc: any, e) => {
                                        const k = e.category_name || 'Other';
                                        acc[k] = (acc[k] || 0) + sf(e.amount);
                                        return acc;
                                    }, {})
                                ).slice(0, 3).map(([cat, total]: any) => (
                                    <View key={cat} style={S.expCatRow}>
                                        <View style={[S.expCatBullet, { backgroundColor: catColor(cat) }]} />
                                        <Text style={S.expCatName} numberOfLines={1}>{cat}</Text>
                                        <Text style={S.expCatAmt}>₹{sf(total).toLocaleString('en-IN')}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : null}
                    ListEmptyComponent={
                        <View style={S.emptyWrap}>
                            <Text style={S.emptyEmoji}>
                                {mode === 'Rent'
                                    ? statusFilter === 'Paid' ? '🎉' : '✅'
                                    : '📋'}
                            </Text>
                            <Text style={S.emptyText}>
                                {mode === 'Rent'
                                    ? statusFilter === 'All'
                                        ? 'No records found for this month'
                                        : `No ${statusFilter.toLowerCase()} records found`
                                    : 'No expenses found'}
                            </Text>

                        </View>
                    }
                />
            )}

            {mode === 'Expense' && (
                <TouchableOpacity style={[S.fab, { backgroundColor: '#F59E0B' }]}
                    onPress={() => navigation.navigate('AddExpense')} activeOpacity={0.85}>
                    <Plus color="#FFF" size={26} />
                </TouchableOpacity>
            )}

            <CollectDrawer
                visible={collectModalVisible}
                onClose={() => setCollectModalVisible(false)}
                selectedFee={selectedFee}
                paymentModes={paymentModes}
                payAmount={payAmount} setPayAmount={setPayAmount}
                payNotes={payNotes} setPayNotes={setPayNotes}
                payTransactionId={payTransactionId} setPayTransactionId={setPayTransactionId}
                payDate={payDate} setPayDate={setPayDate}
                payDueDate={payDueDate} setPayDueDate={setPayDueDate}
                payModeId={payModeId} setPayModeId={setPayModeId}
                payLoading={payLoading}
                onConfirm={handleCollectRent}
                themeColor={theme.primary}
            />


        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────────────────
const { width } = Dimensions.get('window');

const C = StyleSheet.create({
    // Rent card
    feeCard: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, flexDirection: 'row', overflow: 'hidden' },
    statusStripe: { width: 5 },
    feeCardInner: { flex: 1, padding: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    studentName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
    roomText: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 1 },
    statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    statusText: { fontSize: 9, fontWeight: '900' },
    financialRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 12, marginBottom: 10 },
    priceBlock: { alignItems: 'center', flex: 1 },
    finLabel: { fontSize: 8, fontWeight: '800', color: '#94A3B8', marginBottom: 3, letterSpacing: 0.3 },
    finVal: { fontSize: 15, fontWeight: '900', color: '#1E293B' },
    sep: { width: 1, height: 22, backgroundColor: '#E2E8F0' },
    actionFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    nudgeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4', paddingVertical: 9, borderRadius: 10, gap: 5 },
    nudgeText: { color: '#16A34A', fontWeight: '700', fontSize: 11 },
    collectBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10 },
    collectBtnText: { color: '#FFF', fontWeight: '900', fontSize: 11, letterSpacing: 0.4 },

    // Expense card
    expCard: { backgroundColor: '#FFF', borderRadius: 18, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, overflow: 'hidden' },
    expTopBar: { height: 4 },
    expCardBody: { padding: 14 },
    expTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    expDateBadge: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
    expDay: { fontSize: 20, fontWeight: '900', lineHeight: 22 },
    expMonth: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginTop: 1 },
    expAmountBlock: { alignItems: 'flex-end' },
    expAmountLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 2 },
    expAmountVal: { fontSize: 22, fontWeight: '900', color: '#EF4444' },
    expTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
    expBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    expCatChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
    expCatDot: { width: 6, height: 6, borderRadius: 3 },
    expCatText: { fontSize: 10, fontWeight: '700' },
    expArrow: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },

    // Nav
    navArrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 1 },
    dateBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, elevation: 1 },
    dateBadgeText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
});

const S = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
    debtText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '700', marginTop: 2 },
    tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.12)', padding: 4, borderRadius: 14 },
    tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 11, flexDirection: 'row', justifyContent: 'center', gap: 7 },
    activeTab: { backgroundColor: '#FFF' },
    tabText: { fontSize: 11, fontWeight: '900' },
    searchSection: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 14, height: 46, borderRadius: 14, elevation: 2, marginBottom: 10 },
    searchInput: { flex: 1, marginLeft: 10, marginRight: 6, fontWeight: '600', color: '#1E293B' },
    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
    filterBtn: { flex: 1, paddingVertical: 9, borderRadius: 18, backgroundColor: '#E2E8F0', alignItems: 'center' },
    filterLabel: { fontSize: 12, fontWeight: '700', color: '#64748B' },
    listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 150 },
    loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loaderText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
    emptyWrap: { paddingTop: 60, alignItems: 'center', gap: 8 },
    emptyEmoji: { fontSize: 40, marginBottom: 4 },
    emptyText: { fontSize: 14, color: '#94A3B8', fontWeight: '600', textAlign: 'center' },
    clearDateBtn: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FEE2E2', borderRadius: 10 },
    clearDateText: { fontSize: 13, color: '#EF4444', fontWeight: '700' },
    fab: { position: 'absolute', bottom: 130, right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 10, zIndex: 999 },

    // Modal / Drawer
    modalRoot: { flex: 1 },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 0 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', zIndex: 1 },
    drawerContent: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: 0, maxHeight: '90%' },
    drawerHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
    drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    drawerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
    infoSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 14 },
    summaryName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
    summaryRoom: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
    summaryAmtBox: { alignItems: 'flex-end' },
    summaryAmtLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 2 },
    summaryAmt: { fontSize: 20, fontWeight: '900', color: '#EF4444' },
    label: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, marginTop: 12 },
    inputField: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 13, fontSize: 15, color: '#1E293B', fontWeight: '600' },
    row: { flexDirection: 'row' },
    dateField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, gap: 8 },
    dateTextLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
    modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    modeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
    modeText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
    submitBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', minHeight: 52 },
    submitLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14, letterSpacing: 0.8 },

    // Expense summary banner
    expSummaryCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 18, marginBottom: 14, flexDirection: 'row', alignItems: 'stretch' },
    expSummaryLeft: { flex: 1, justifyContent: 'center' },
    expSummaryLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2, marginBottom: 4 },
    expSummaryTotal: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 2 },
    expSummaryCount: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
    expSummaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 18 },
    expSummaryRight: { flex: 1, justifyContent: 'center', gap: 6 },
    expCatRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    expCatBullet: { width: 6, height: 6, borderRadius: 3 },
    expCatName: { flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
    expCatAmt: { fontSize: 11, fontWeight: '800', color: '#FFF' },

    // Nav
    navArrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 1 },
    dateBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, elevation: 1 },
    dateBadgeText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
});