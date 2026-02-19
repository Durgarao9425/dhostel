import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
    LayoutAnimation
} from 'react-native';
import {
    CheckCircle,
    AlertCircle,
    Clock,
    TrendingUp,
    Search,
    X,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';

type TabType = 'Unpaid' | 'Paid' | 'Partial';

const TABS: { key: TabType; label: string }[] = [
    { key: 'Unpaid', label: 'Unpaid' },
    { key: 'Paid', label: 'Paid' },
    { key: 'Partial', label: 'Partial' }
];

const STATUS_CONFIG: any = {
    'Fully Paid': { label: 'Paid', color: '#4CAF50', bg: '#E8F5E9', icon: CheckCircle },
    'Pending': { label: 'Unpaid', color: '#FF6B6B', bg: '#FFF0F0', icon: AlertCircle },
    'Overdue': { label: 'Overdue', color: '#FF9800', bg: '#FFF3E0', icon: Clock },
    'Partially Paid': { label: 'Partial', color: '#42A5F5', bg: '#E3F2FD', icon: TrendingUp },
};

const ProgressBar = ({ paid, total, color }: { paid: number; total: number; color: string }) => {
    const safeTotal = total || 0;
    const safePaid = paid || 0;
    const pct = safeTotal > 0 ? Math.min((safePaid / safeTotal) * 100, 100) : 0;
    return (
        <View style={{ height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginTop: 12 }}>
            <View style={{ height: 6, borderRadius: 3, width: `${pct}%`, backgroundColor: color }} />
        </View>
    );
};

export const CollectionTab = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('Unpaid');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [fees, setFees] = useState<any[]>([]);
    const [payModalVisible, setPayModalVisible] = useState(false);
    const [selectedFee, setSelectedFee] = useState<any>(null);
    const [paymentModes, setPaymentModes] = useState<any[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    useEffect(() => {
        fetchPaymentModes();
    }, []);

    const fetchData = async () => {
        try {
            if (fees.length === 0) setLoading(true);
            const res = await api.get('/monthly-fees/summary');
            if (res.data.success) {
                setFees(res.data.data.fees);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentModes = async () => {
        try {
            const res = await api.get('/monthly-fees/payment-modes');
            if (res.data.success) setPaymentModes(res.data.data);
        } catch (e) { console.error(e); }
    };

    const changeTab = (tab: TabType) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveTab(tab);
    };

    const filteredFees = fees.filter(f => {
        const fullName = `${f.first_name || ''} ${f.last_name || ''}`.toLowerCase();
        const searchLower = search.toLowerCase();
        const matchesSearch = fullName.includes(searchLower);

        let matchesTab = false;
        if (activeTab === 'Unpaid') matchesTab = f.fee_status === 'Pending' || f.fee_status === 'Overdue';
        if (activeTab === 'Paid') matchesTab = f.fee_status === 'Fully Paid';
        if (activeTab === 'Partial') matchesTab = f.fee_status === 'Partially Paid';

        return matchesSearch && matchesTab;
    });

    const handleCollect = (fee: any) => {
        setSelectedFee(fee);
        setPayModalVisible(true);
    };

    const renderCard = ({ item }: any) => {
        if (!item) return null;
        const conf = STATUS_CONFIG[item.fee_status] || STATUS_CONFIG['Pending'];
        const Icon = conf.icon;
        const totalAmount = item.total_amount || 0;
        const amountPaid = item.amount_paid || 0;
        const dueAmount = totalAmount - amountPaid;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('PaymentDetails', { feeId: item?.fee_id })}
                activeOpacity={0.9}
            >
                <View style={[styles.cardLeftAccent, { backgroundColor: conf.color }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: conf.bg }]}>
                            <Icon size={20} color={conf.color} />
                        </View>
                        <View>
                            <Text style={styles.studentName}>{item.first_name || 'Unknown'} {item.last_name || ''}</Text>
                            <Text style={styles.roomText}>Room {item.room_number || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={styles.cardRight}>
                        <Text style={[styles.amount, { color: conf.color }]}>₹{totalAmount}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: conf.bg }]}>
                            <Text style={[styles.statusText, { color: conf.color }]}>{conf.label}</Text>
                        </View>
                    </View>
                </View>
                {amountPaid > 0 && amountPaid < totalAmount && (
                    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                        <ProgressBar paid={amountPaid} total={totalAmount} color={conf.color} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                            <Text style={{ fontSize: 11, color: '#94A3B8' }}>Paid: ₹{amountPaid}</Text>
                            <Text style={{ fontSize: 11, color: '#94A3B8' }}>Due: ₹{dueAmount}</Text>
                        </View>
                    </View>
                )}
                {(item.fee_status === 'Pending' || item.fee_status === 'Overdue' || item.fee_status === 'Partially Paid') && (
                    <TouchableOpacity
                        style={[styles.quickPayBtn, { borderTopColor: '#F1F5F9', borderTopWidth: 1 }]}
                        onPress={() => handleCollect(item)}
                    >
                        <Text style={[styles.quickPayText, { color: theme.primary }]}>Collect Payment</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Search color="#94A3B8" size={18} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={`Search ${activeTab.toLowerCase()} students...`}
                    placeholderTextColor="#94A3B8"
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><X color="#94A3B8" size={18} /></TouchableOpacity>}
            </View>

            {/* Tabs */}
            <View style={styles.tabsRow}>
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
                            onPress={() => changeTab(tab.key)}
                        >
                            <Text style={[styles.tabText, isActive ? { color: theme.primary } : { color: '#64748B' }]}>{tab.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* List */}
            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredFees}
                    keyExtractor={(item) => item?.fee_id ? item.fee_id.toString() : Math.random().toString()}
                    renderItem={renderCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <AlertCircle size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No data available</Text>
                        </View>
                    }
                />
            )}

            {/* Collect Fee Modal */}
            {selectedFee && <CollectModal
                visible={payModalVisible}
                onClose={() => setPayModalVisible(false)}
                fee={selectedFee}
                modes={paymentModes}
                onSuccess={() => {
                    setPayModalVisible(false);
                    fetchData();
                }}
            />}
        </View>
    );
};

const CollectModal = ({ visible, onClose, fee, modes, onSuccess }: any) => {
    const remaining = fee?.balance || fee?.total_due || 0;
    const [amount, setAmount] = useState('');
    const [modeId, setModeId] = useState<number>(1);
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!amount) return Alert.alert('Error', 'Please enter amount');

        try {
            setLoading(true);
            const payload = {
                student_id: fee.student_id,
                hostel_id: fee.hostel_id,
                amount: parseFloat(amount),
                payment_date: new Date().toISOString().split('T')[0],
                due_date: fee.due_date || new Date().toISOString().split('T')[0],
                payment_mode_id: modeId,
                notes: remarks,
                fee_id: fee.fee_id // Optional but good to pass if we have it
            };

            await api.post('/monthly-fees/record-payment', payload);
            Toast.show({ type: 'success', text1: 'Success', text2: 'Payment collected successfully' });
            onSuccess();
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to collect payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={styles.modalTitle}>Collect Fee</Text>
                            <Text style={styles.modalSubtitle}>{fee?.first_name} {fee?.last_name}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}><X color="#64748B" size={24} /></TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Amount (₹)</Text>
                            <TextInput
                                style={styles.input}
                                value={amount}
                                onChangeText={setAmount}
                                placeholder={`${remaining}`}
                                keyboardType="numeric"
                                autoFocus
                            />
                            <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                                Outstanding: ₹{remaining}
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Payment Mode</Text>
                            <View style={styles.chips}>
                                {modes && modes.map((m: any) => (
                                    <TouchableOpacity
                                        key={m.payment_mode_id || m.id}
                                        style={[styles.chip, modeId === (m.payment_mode_id || m.id) && styles.activeChip]}
                                        onPress={() => setModeId(m.payment_mode_id || m.id)}
                                    >
                                        <Text style={[styles.chipText, modeId === (m.payment_mode_id || m.id) && styles.activeChipText]}>
                                            {m.payment_mode_name || m.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Remarks</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                value={remarks}
                                onChangeText={setRemarks}
                                placeholder="Optional notes..."
                                multiline
                            />
                        </View>

                        <TouchableOpacity style={styles.payBtn} onPress={handleSubmit} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.payBtnText}>Confirm Payment</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
        borderRadius: 14, paddingHorizontal: 14, height: 46, margin: 16, marginBottom: 12,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A', fontWeight: '500' },
    tabsRow: {
        flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 14, padding: 4, marginHorizontal: 16, marginBottom: 12
    },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
    activeTab: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
    inactiveTab: {},
    tabText: { fontSize: 13, fontWeight: '700' },
    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
    card: {
        backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 12,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
        overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9',
    },
    cardLeftAccent: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 5 },
    cardContent: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 21 },
    cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    studentName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
    roomText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    cardRight: { alignItems: 'flex-end', gap: 6 },
    amount: { fontSize: 16, fontWeight: '800' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    statusText: { fontSize: 11, fontWeight: '700' },
    quickPayBtn: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    quickPayText: { fontSize: 14, fontWeight: '600' },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80, opacity: 0.6 },
    emptyText: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#64748B' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    modalSubtitle: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    modalBody: {},
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 10 },
    input: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, fontSize: 16, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' },
    chips: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#F1F5F9' },
    activeChip: { backgroundColor: '#FFF0F0', borderColor: '#FF6B6B' },
    chipText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
    activeChipText: { color: '#FF6B6B' },
    payBtn: { backgroundColor: '#FF6B6B', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 12 },
    payBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});
