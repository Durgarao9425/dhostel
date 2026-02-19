import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ActivityIndicator,
    Modal,
    Alert,
    Dimensions,
} from 'react-native';
import api from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Search,
    X,
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    IndianRupee,
    ChevronRight,
    Bell,
    ChevronLeft
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { HeaderNotification } from '../components/HeaderNotification';
import { Header } from '../components/Header';
import { CustomLoader } from '../components/CustomLoader';
import { ProfileMenu } from '../components/ProfileMenu';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
    'Fully Paid': {
        label: 'Paid',
        color: '#059669',
        bg: '#D1FAE5',
        barColor: '#10B981',
        icon: CheckCircle,
    },
    'Pending': {
        label: 'Unpaid',
        color: '#DC2626',
        bg: '#FEE2E2',
        barColor: '#EF4444',
        icon: AlertCircle,
    },
    'Overdue': {
        label: 'Overdue',
        color: '#B45309',
        bg: '#FEF3C7',
        barColor: '#F59E0B',
        icon: Clock,
    },
    'Partially Paid': {
        label: 'Partial',
        color: '#1D4ED8',
        bg: '#DBEAFE',
        barColor: '#3B82F6',
        icon: TrendingUp,
    },
};

type TabType = 'All' | 'Unpaid' | 'Partial' | 'Paid';

// ─── Helpers ──────────────────────────────────────────────────────────
const fmtINR = (n: number) =>
    n >= 100000
        ? `₹${(n / 100000).toFixed(1)}L`
        : n >= 1000
            ? `₹${(n / 1000).toFixed(1)}K`
            : `₹${n}`;

const getInitials = (first: string, last: string) =>
    `${(first || ' ')[0]}${(last || ' ')[0]}`.toUpperCase();

const AVATAR_COLORS = ['#FF6B6B', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
const avatarColor = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── Payment Progress Bar ─────────────────────────────────────────────
const ProgressBar = ({ paid, total, color }: { paid: number; total: number; color: string }) => {
    const pct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;
    return (
        <View style={prog.track}>
            <View style={[prog.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
        </View>
    );
};
const prog = StyleSheet.create({
    track: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
    fill: { height: 4, borderRadius: 2 },
});

// ─── Fee Card ─────────────────────────────────────────────────────────
const FeeCard = ({ fee, onCollect, onReceipt, onPress }: any) => {
    const cfg = STATUS_CONFIG[fee.fee_status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG['Pending'];
    const Icon = cfg.icon;
    const paid = (fee.amount || 0) - (fee.balance || 0);
    const total = fee.amount || 0;
    const isPaid = fee.fee_status === 'Fully Paid';

    // Unified Full Card for all statuses
    return (
        <TouchableOpacity
            style={card.wrap}
            activeOpacity={0.9}
            onPress={onPress}
        >
            {/* Left accent bar */}
            <View style={[card.accent, { backgroundColor: cfg.barColor }]} />

            <View style={card.inner}>
                {/* Row 1: Avatar + Name + Status chip */}
                <View style={card.topRow}>
                    <View style={[card.avatar, { backgroundColor: avatarColor(fee.first_name || 'A') }]}>
                        <Text style={card.avatarText}>{getInitials(fee.first_name, fee.last_name)}</Text>
                    </View>

                    <View style={card.nameBlock}>
                        <Text style={card.name}>{fee.first_name} {fee.last_name}</Text>
                        <Text style={card.sub}>Room {fee.room_number || '—'} • {fee.fee_month}</Text>
                    </View>

                    <View style={[card.chip, { backgroundColor: cfg.bg }]}>
                        <Icon color={cfg.color} size={11} />
                        <Text style={[card.chipText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                </View>

                {/* Row 2: Amounts */}
                <View style={card.amtRow}>
                    <View>
                        {isPaid ? (
                            <>
                                <Text style={card.amtLabel}>Paid Amount</Text>
                                <Text style={[card.amtBig, { color: '#10B981' }]}>
                                    {`₹${(paid || 0).toLocaleString('en-IN')}`}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={card.amtLabel}>Balance Due</Text>
                                <Text style={[card.amtBig, { color: '#DC2626' }]}>
                                    {`₹${(fee.balance || 0).toLocaleString('en-IN')}`}
                                </Text>
                            </>
                        )}
                    </View>
                    <View style={card.amtRight}>
                        {isPaid ? (
                            <TouchableOpacity onPress={() => onReceipt(fee)}>
                                <Text style={[card.amtLabel, { color: '#0284C7', fontWeight: '700' }]}>View Receipt &gt;</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <Text style={card.amtLabel}>Total Fee</Text>
                                <Text style={card.amtSub}>
                                    ₹{total.toLocaleString('en-IN')}
                                </Text>
                            </>
                        )}
                    </View>
                </View>

                {/* Row 3: Progress bar */}
                <ProgressBar paid={paid} total={total} color={cfg.barColor} />

                {/* Row 4: Action button */}
                {/* Row 4: Action button (Only for unpaid/partial collection) */}
                <View style={[card.actionRow, isPaid && { marginTop: 0 }]}>
                    <Text style={card.monthTag}>{fee.fee_month}</Text>
                    {!isPaid && (
                        <TouchableOpacity
                            style={[card.btn, { backgroundColor: cfg.barColor }]}
                            onPress={() => onCollect(fee)}
                            activeOpacity={0.85}
                        >
                            <IndianRupee color="#FFFFFF" size={13} />
                            <Text style={card.btnText}>Collect</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const card = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    accent: { width: 4 },
    inner: { flex: 1, padding: 14, gap: 10 },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatar: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
    nameBlock: { flex: 1 },
    name: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
    sub: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
    chip: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 20, gap: 4,
    },
    chipText: { fontSize: 10, fontWeight: '700' },
    amtRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    amtLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '500', marginBottom: 2 },
    amtBig: { fontSize: 20, fontWeight: '800' },
    amtRight: { alignItems: 'flex-end' },
    amtSub: { fontSize: 12, fontWeight: '600', color: '#475569' },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    monthTag: { fontSize: 11, color: '#CBD5E1', fontWeight: '500' },
    btn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingVertical: 7, paddingHorizontal: 14,
        borderRadius: 20,
    },
    btnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
    receiptBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 2,
        paddingVertical: 7, paddingHorizontal: 10,
        borderRadius: 20, backgroundColor: '#E0F2FE',
    },
    receiptBtnText: { fontSize: 12, fontWeight: '700', color: '#0284C7' },
});

// ─── Summary Strip ────────────────────────────────────────────────────
const SummaryStrip = ({ summary, total }: { summary: any; total: number }) => {
    const collected = summary?.total_paid || 0;
    const pending = summary?.total_pending || 0;
    const pct = total > 0 ? Math.round((collected / total) * 100) : 0;

    return (
        <View style={sum.wrap}>
            {/* Collection progress ring replacement — horizontal bar */}
            <LinearGradient colors={['#FF8585', '#FF6B6B']} style={sum.progressCard}>
                <View style={sum.progressTop}>
                    <Text style={sum.progressLabel}>Collection Progress</Text>
                    <Text style={sum.progressPct}>{pct}%</Text>
                </View>
                <View style={sum.bigBar}>
                    <View style={[sum.bigFill, { width: `${pct}%` as any }]} />
                </View>
                <View style={sum.progressBottom}>
                    <Text style={sum.progressSub}>₹{collected.toLocaleString('en-IN')} of ₹{total.toLocaleString('en-IN')}</Text>
                </View>
            </LinearGradient>

            {/* Two stat cards */}
            <View style={sum.cards}>
                <View style={sum.statCard}>
                    <View style={[sum.statDot, { backgroundColor: '#FEE2E2' }]}>
                        <AlertCircle color="#DC2626" size={14} />
                    </View>
                    <Text style={sum.statAmt}>{fmtINR(pending)}</Text>
                    <Text style={sum.statLabel}>Pending</Text>
                </View>
                <View style={sum.statCard}>
                    <View style={[sum.statDot, { backgroundColor: '#D1FAE5' }]}>
                        <CheckCircle color="#059669" size={14} />
                    </View>
                    <Text style={sum.statAmt}>{fmtINR(collected)}</Text>
                    <Text style={sum.statLabel}>Collected</Text>
                </View>
            </View>
        </View>
    );
};

const sum = StyleSheet.create({
    wrap: { paddingHorizontal: 16, marginBottom: 16, gap: 10 },
    progressCard: {
        borderRadius: 16, padding: 16, gap: 8,
    },
    progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    progressLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
    progressPct: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
    bigBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' },
    bigFill: { height: 8, backgroundColor: '#FFFFFF', borderRadius: 4 },
    progressBottom: {},
    progressSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
    cards: { flexDirection: 'row', gap: 10 },
    statCard: {
        flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14,
        padding: 12, alignItems: 'center', gap: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    },
    statDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    statAmt: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
});

// ─── Tab Bar ──────────────────────────────────────────────────────────
const TABS: { key: TabType; label: string; color: string }[] = [
    { key: 'All', label: 'All', color: '#3B82F6' },
    { key: 'Unpaid', label: 'Unpaid', color: '#EF4444' },
    { key: 'Partial', label: 'Partial', color: '#8B5CF6' },
    { key: 'Paid', label: 'Paid', color: '#10B981' },
];

// ─── Collect Modal ────────────────────────────────────────────────────
const CollectModal = ({
    visible,
    fee,
    paymentModes,
    onClose,
    onConfirm,
}: any) => {
    const [amount, setAmount] = useState('');
    const [modeId, setModeId] = useState('');
    const [txnId, setTxnId] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (fee) {
            setAmount(fee.balance?.toString() || '');
            setModeId(paymentModes?.[0]?.payment_mode_id?.toString() || '1');
            setTxnId('');
            setNotes('');
        }
    }, [fee, visible]);

    if (!fee) return null;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={modal.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity style={modal.sheet} activeOpacity={1}>
                    {/* Handle */}
                    <View style={modal.handle} />

                    {/* Header */}
                    <View style={modal.header}>
                        <View>
                            <Text style={modal.title}>Collect Fee</Text>
                            <Text style={modal.sub}>{fee.first_name} {fee.last_name} • Room {fee.room_number}</Text>
                        </View>
                        <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
                            <X color="#64748B" size={18} />
                        </TouchableOpacity>
                    </View>

                    {/* Balance banner */}
                    <View style={modal.balanceBanner}>
                        <Text style={modal.balanceLabel}>Balance Due</Text>
                        <Text style={modal.balanceAmt}>₹{(fee.balance || 0).toLocaleString('en-IN')}</Text>
                    </View>

                    <ScrollView
                        contentContainerStyle={modal.body}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Amount */}
                        <Text style={modal.label}>Amount (₹) <Text style={modal.req}>*</Text></Text>
                        <TextInput
                            style={modal.input}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder="Enter amount"
                            placeholderTextColor="#CBD5E1"
                        />

                        {/* Payment Mode */}
                        <Text style={modal.label}>Payment Mode <Text style={modal.req}>*</Text></Text>
                        <View style={modal.chipRow}>
                            {(paymentModes || []).map((m: any) => {
                                const active = modeId === m.payment_mode_id.toString();
                                return (
                                    <TouchableOpacity
                                        key={m.payment_mode_id}
                                        style={[modal.modeChip, active && modal.modeChipActive]}
                                        onPress={() => setModeId(m.payment_mode_id.toString())}
                                    >
                                        <Text style={[modal.modeText, active && modal.modeTextActive]}>
                                            {m.payment_mode_name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Transaction ID */}
                        <Text style={modal.label}>Transaction ID <Text style={modal.opt}>(Optional)</Text></Text>
                        <TextInput
                            style={modal.input}
                            value={txnId}
                            onChangeText={setTxnId}
                            placeholder="e.g. UPI Ref No."
                            placeholderTextColor="#CBD5E1"
                        />

                        {/* Notes */}
                        <Text style={modal.label}>Notes <Text style={modal.opt}>(Optional)</Text></Text>
                        <TextInput
                            style={[modal.input, modal.textarea]}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Add a note..."
                            placeholderTextColor="#CBD5E1"
                            multiline
                            numberOfLines={2}
                            textAlignVertical="top"
                        />

                        {/* Confirm button */}
                        <TouchableOpacity
                            style={modal.confirmBtn}
                            onPress={() => onConfirm({ amount, modeId, txnId, notes })}
                            activeOpacity={0.85}
                        >
                            <IndianRupee color="#FFFFFF" size={16} />
                            <Text style={modal.confirmText}>Confirm Payment</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const modal = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        maxHeight: '88%',
    },
    handle: {
        width: 36, height: 4, backgroundColor: '#E2E8F0',
        borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4,
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    sub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    closeBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
    },
    balanceBanner: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#FFF5F5', paddingHorizontal: 20, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#FEE2E2',
    },
    balanceLabel: { fontSize: 12, color: '#DC2626', fontWeight: '600' },
    balanceAmt: { fontSize: 20, fontWeight: '900', color: '#DC2626' },
    body: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32, gap: 4 },
    label: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 12, marginBottom: 6 },
    req: { color: '#FF6B6B', fontWeight: '800' },
    opt: { color: '#CBD5E1', fontWeight: '500' },
    input: {
        backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
        borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
        fontSize: 14, color: '#0F172A',
    },
    textarea: { minHeight: 60, textAlignVertical: 'top' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    modeChip: {
        paddingVertical: 8, paddingHorizontal: 14,
        borderRadius: 20, backgroundColor: '#F1F5F9',
        borderWidth: 1.5, borderColor: 'transparent',
    },
    modeChipActive: { backgroundColor: '#FFF0F0', borderColor: '#FF6B6B' },
    modeText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
    modeTextActive: { color: '#FF6B6B' },
    confirmBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: '#FF6B6B', paddingVertical: 15, borderRadius: 14,
        marginTop: 20,
        shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
    },
    confirmText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});

// ─── Main Screen ──────────────────────────────────────────────────────
export const FeeCollectionScreen = ({ navigation, route }: any) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('All');
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [fees, setFees] = useState<any[]>([]);

    const [payModalVisible, setPayModalVisible] = useState(false);
    const [selectedFee, setSelectedFee] = useState<any>(null);
    const [payLoading, setPayLoading] = useState(false);
    const [paymentModes, setPaymentModes] = useState<any[]>([]);

    useEffect(() => {
        if (route.params?.initialTab) {
            const map: Record<string, TabType> = {
                'Unpaid': 'Unpaid', 'Partially Paid': 'Partial', 'Paid': 'Paid',
            };
            setActiveTab(map[route.params.initialTab] || 'All');
        }
    }, [route.params?.initialTab]);

    const fetchSummary = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const res = await api.get('/monthly-fees/summary');
            if (res.data.success) {
                setSummary(res.data.data.summary);
                setFees(res.data.data.fees);
            }
        } catch (e) { console.error(e); }
        finally { if (showLoader) setLoading(false); }
    };

    const fetchPaymentModes = async () => {
        try {
            const res = await api.get('/monthly-fees/payment-modes');
            if (res.data.success) setPaymentModes(res.data.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchSummary(); fetchPaymentModes(); }, []);

    // Counts
    const paidCount = fees.filter(f => f.fee_status === 'Fully Paid').length;
    const unpaidCount = fees.filter(f => f.fee_status === 'Pending' || f.fee_status === 'Overdue').length;
    const partialCount = fees.filter(f => f.fee_status === 'Partially Paid').length;
    const totalAmt = (summary?.total_paid || 0) + (summary?.total_pending || 0);

    const counts: Record<TabType, number> = {
        All: fees.length, Unpaid: unpaidCount, Partial: partialCount, Paid: paidCount,
    };

    // Filter
    const filteredFees = fees.filter(f => {
        const fullName = `${f.first_name || ''} ${f.last_name || ''}`.toLowerCase();
        const matchSearch = fullName.includes(search.toLowerCase());
        if (activeTab === 'Paid') return matchSearch && f.fee_status === 'Fully Paid';
        if (activeTab === 'Unpaid') return matchSearch && (f.fee_status === 'Pending' || f.fee_status === 'Overdue');
        if (activeTab === 'Partial') return matchSearch && f.fee_status === 'Partially Paid';
        return matchSearch;
    });

    const openCollect = (fee: any) => { setSelectedFee(fee); setPayModalVisible(true); };

    const handleConfirmPayment = async ({ amount, modeId, txnId, notes }: any) => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount.'); return;
        }
        try {
            setPayLoading(true);
            const payload = {
                student_id: selectedFee.student_id,
                hostel_id: selectedFee.hostel_id,
                amount: parseFloat(amount),
                payment_date: new Date().toISOString().split('T')[0],
                due_date: selectedFee.due_date?.substring(0, 10) || new Date().toISOString().split('T')[0],
                payment_mode_id: parseInt(modeId),
                transaction_id: txnId || null,
                notes,
                fee_month: selectedFee.fee_month,
            };
            const res = await api.post('/monthly-fees/record-payment', payload);
            if (res.data.success) {
                // Keep loader visible while fetching updated summary
                await fetchSummary(false); // Silent refresh
                Toast.show({ type: 'success', text1: 'Payment recorded successfully!' });
                setPayModalVisible(false);
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to record payment');
        } finally {
            setPayLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />

            {/* Custom Header similar to StudentsScreen */}
            <LinearGradient
                colors={[theme.gradientStart, theme.gradientEnd]}
                style={[styles.header, { borderBottomLeftRadius: theme.headerRounded, borderBottomRightRadius: theme.headerRounded }]}
            >
                <View style={styles.headerTop}>
                    {/* Back button added as requested */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft color="#FFFFFF" size={26} />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <HeaderNotification navigation={navigation} />
                        <ProfileMenu />
                    </View>
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.greeting}>Fee Collection</Text>
                </View>
            </LinearGradient>

            {/* ── Body ── */}
            <ScrollView
                style={styles.body}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bodyContent}
                stickyHeaderIndices={[1]}
            >
                {/* Summary strip */}
                <SummaryStrip summary={summary} total={totalAmt} />

                {/* Sticky: Tabs + Search */}
                <View style={styles.stickyBlock}>
                    {/* Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsRow}
                    >
                        {TABS.map(t => {
                            const active = activeTab === t.key;
                            return (
                                <TouchableOpacity
                                    key={t.key}
                                    style={[styles.tab, active && { backgroundColor: t.color, borderColor: t.color }]}
                                    onPress={() => setActiveTab(t.key)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.tabText, active && styles.tabTextActive]}>
                                        {t.label}
                                    </Text>
                                    <View style={[styles.tabCount, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                                        <Text style={[styles.tabCountText, active && { color: '#FFFFFF' }]}>
                                            {counts[t.key]}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Search */}
                    <View style={styles.searchWrap}>
                        <View style={styles.searchBox}>
                            <Search color="#94A3B8" size={16} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search student name..."
                                placeholderTextColor="#CBD5E1"
                                value={search}
                                onChangeText={setSearch}
                            />
                            {search.length > 0 && (
                                <TouchableOpacity onPress={() => setSearch('')}>
                                    <X color="#CBD5E1" size={16} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* List */}
                <View style={styles.list}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listLabel}>
                            {filteredFees.length} {activeTab === 'All' ? 'students' : activeTab.toLowerCase()} records
                        </Text>
                    </View>

                    {loading ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color="#FF6B6B" />
                        </View>
                    ) : filteredFees.length === 0 ? (
                        <View style={styles.centered}>
                            <View style={styles.emptyCircle}>
                                <CheckCircle color="#CBD5E1" size={28} />
                            </View>
                            <Text style={styles.emptyTitle}>No records found</Text>
                        </View>
                    ) : (
                        filteredFees.map(fee => (
                            <FeeCard
                                key={`${fee.student_id}-${fee.fee_month}`}
                                fee={fee}
                                onCollect={openCollect}
                                onReceipt={(f: any) => navigation.navigate('Receipt', { feeData: f })}
                                onPress={() => navigation.navigate('StudentDetails', { studentId: fee.student_id })}
                            />
                        ))
                    )}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            <CollectModal
                visible={payModalVisible}
                fee={selectedFee}
                paymentModes={paymentModes}
                onClose={() => setPayModalVisible(false)}
                onConfirm={handleConfirmPayment}
            />

            <CustomLoader visible={payLoading} message="Processing Payment..." />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    // Header Styles
    header: {
        paddingTop: 55,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    greeting: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },

    body: { flex: 1 },
    bodyContent: { paddingTop: 16 },
    stickyBlock: {
        backgroundColor: '#F8FAFC',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tabsRow: {
        paddingHorizontal: 16,
        gap: 8,
        paddingBottom: 12,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        gap: 6,
    },
    tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    tabTextActive: { color: '#FFFFFF' },
    tabCount: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 10,
    },
    tabCountText: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
    searchWrap: { paddingHorizontal: 16 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 44,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#0F172A',
    },
    list: { paddingBottom: 100, paddingHorizontal: 16 },
    listHeader: { marginBottom: 10 },
    listLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
    centered: { padding: 40, alignItems: 'center' },
    emptyCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#CBD5E1' },
});

export default FeeCollectionScreen;
