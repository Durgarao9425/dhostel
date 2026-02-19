import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    FlatList,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
    Dimensions,
    LayoutAnimation,
    Platform,
    RefreshControl,
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    AlertCircle,
    Search,
    MessageCircle,
    X,
    Wallet,
    CheckCircle,
    Clock,
    TrendingUp
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { HeaderNotification } from '../components/HeaderNotification';
import { ProfileMenu } from '../components/ProfileMenu';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const STATUS_THEME: any = {
    'Fully Paid': { label: 'PAID', color: '#10B981', bg: '#DCFCE7' },
    'Pending': { label: 'UNPAID', color: '#EF4444', bg: '#FEE2E2' },
    'Overdue': { label: 'LATE', color: '#B91C1C', bg: '#FEE2E2' },
    'Partially Paid': { label: 'PARTIAL', color: '#3B82F6', bg: '#DBEAFE' },
};

// ─── INTERNAL MODAL COMPONENT ───────────────────────────────────────
const CollectModal = ({ visible, onClose, fee, onSuccess, theme }: any) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const total = parseFloat(fee?.total_amount || fee?.total_due || 0);
    const paid = parseFloat(fee?.amount_paid || fee?.paid_amount || 0);
    const remaining = Math.max(0, total - paid);

    useEffect(() => {
        if (visible && fee) setAmount(remaining.toString());
    }, [visible, fee]);

    const handleConfirm = async () => {
        if (!amount || parseFloat(amount) <= 0) return Alert.alert('Error', 'Enter a valid amount');
        try {
            setLoading(true);
            const res = await api.post('/monthly-fees/record-payment', {
                student_id: fee.student_id,
                amount: parseFloat(amount),
                payment_date: new Date().toISOString().split('T')[0],
                payment_mode_id: 1, // Defaulting to Cash for speed
                fee_month: fee.fee_month || new Date().toISOString().slice(0, 7)
            });
            if (res.data.success) {
                Toast.show({ type: 'success', text1: 'Payment Successful' });
                onSuccess();
            }
        } catch (e) {
            Alert.alert('Error', 'Could not save payment. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Collect Payment</Text>
                        <TouchableOpacity onPress={onClose}><X color="#64748B" size={24} /></TouchableOpacity>
                    </View>
                    <Text style={styles.modalUser}>{fee?.first_name} {fee?.last_name}</Text>
                    <View style={styles.inputBox}>
                        <Text style={styles.inputLabel}>Enter Amount (₹)</Text>
                        <TextInput
                            style={styles.modalInput}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            autoFocus
                        />
                        <Text style={styles.inputHint}>Total Outstanding: ₹{remaining}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
                        onPress={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmBtnText}>CONFIRM COLLECTION</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// ─── MAIN SCREEN COMPONENT ──────────────────────────────────────────
export default function FeeManagementScreen() {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('Unpaid');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [fees, setFees] = useState<any[]>([]);
    const [payModalVisible, setPayModalVisible] = useState(false);
    const [selectedFee, setSelectedFee] = useState<any>(null);

    const fetchData = useCallback(async (showLoader = false) => {
        try {
            if (showLoader) setLoading(true);
            const res = await api.get('/monthly-fees/summary');
            if (res.data.success) setFees(res.data.data.fees || []);
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Sync Failed' });
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

    const totalOutstanding = useMemo(() => {
        return fees.reduce((sum, f) => {
            const total = parseFloat(f.total_due || f.total_amount || 0);
            const paid = parseFloat(f.paid_amount || f.amount_paid || 0);
            return sum + Math.max(0, total - paid);
        }, 0);
    }, [fees]);

    const filteredFees = useMemo(() => {
        return fees.filter(f => {
            const name = `${f.first_name || ''} ${f.last_name || ''}`.toLowerCase();
            const matches = name.includes(search.toLowerCase()) || f.room_number?.toString().includes(search);
            if (activeTab === 'Unpaid') return matches && (f.fee_status === 'Pending' || f.fee_status === 'Overdue');
            if (activeTab === 'Paid') return matches && f.fee_status === 'Fully Paid';
            return matches && f.fee_status === 'Partially Paid';
        });
    }, [fees, search, activeTab]);

    const renderFeeCard = ({ item }: { item: any }) => {
        const style = STATUS_THEME[item.fee_status] || STATUS_THEME['Pending'];
        const total = parseFloat(item.total_amount || item.total_due || 0);
        const paid = parseFloat(item.amount_paid || item.paid_amount || 0);
        const due = Math.max(0, total - paid);

        return (
            <View style={styles.feeCard}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.studentName}>{item.first_name} {item.last_name}</Text>
                        <Text style={styles.roomText}>Room {item.room_number || 'N/A'}</Text>
                    </View>
                    <View style={[styles.statusTag, { backgroundColor: style.bg }]}>
                        <Text style={[styles.statusText, { color: style.color }]}>{style.label}</Text>
                    </View>
                </View>

                <View style={styles.financialRow}>
                    <View style={styles.priceBlock}>
                        <Text style={styles.finLabel}>RENT</Text>
                        <Text style={styles.finVal}>₹{total}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.priceBlock}>
                        <Text style={[styles.finLabel, { color: '#EF4444' }]}>BALANCE</Text>
                        <Text style={[styles.finVal, { color: '#EF4444' }]}>₹{due}</Text>
                    </View>
                    <View style={styles.actionGroup}>
                        <TouchableOpacity
                            style={styles.nudgeBtn}
                            onPress={() => Linking.openURL(`whatsapp://send?phone=91${item.phone}&text=Hi ${item.first_name}, rent balance ₹${due} is pending.`)}
                        >
                            <MessageCircle size={20} color="#22C55E" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.collectBtn, { backgroundColor: theme.primary }]}
                            onPress={() => { setSelectedFee(item); setPayModalVisible(true); }}
                        >
                            <Text style={styles.collectBtnText}>COLLECT</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={styles.header}>
                <View style={styles.topNav}>
                    <View>
                        <Text style={styles.headerTitle}>Collections</Text>
                        <Text style={styles.debtTotal}>Total Outstanding: ₹{totalOutstanding.toLocaleString('en-IN')}</Text>
                    </View>
                    <HeaderNotification navigation={navigation} />
                </View>
                <View style={styles.searchBar}>
                    <Search color="#94A3B8" size={18} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search student or room..."
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#94A3B8"
                    />
                </View>
                <View style={styles.tabBar}>
                    {['Unpaid', 'Partial', 'Paid'].map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.tab, activeTab === t && styles.activeTab]}
                            onPress={() => { LayoutAnimation.easeInEaseOut(); setActiveTab(t); }}
                        >
                            <Text style={[styles.tabText, activeTab === t ? { color: theme.primary } : { color: '#FFF' }]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>

            <FlatList
                data={filteredFees}
                renderItem={renderFeeCard}
                keyExtractor={(item, index) => item.fee_id?.toString() || index.toString()}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchData(true)} tintColor={theme.primary} />}
                ListEmptyComponent={<View style={styles.empty}><AlertCircle size={40} color="#CBD5E1" /><Text style={styles.emptyText}>No financial records found</Text></View>}
            />

            <CollectModal
                visible={payModalVisible}
                fee={selectedFee}
                theme={theme}
                onClose={() => setPayModalVisible(false)}
                onSuccess={() => { setPayModalVisible(false); fetchData(true); }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingHorizontal: 20, paddingTop: 55, paddingBottom: 25, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    debtTotal: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
    searchBar: { backgroundColor: '#FFF', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 46, marginBottom: 15 },
    input: { flex: 1, marginLeft: 10, fontWeight: '600', color: '#1E293B' },
    tabBar: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.12)', padding: 4, borderRadius: 14 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: '#FFF' },
    tabText: { fontSize: 12, fontWeight: '800' },
    list: { padding: 16, paddingBottom: 100 },
    feeCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    studentName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    roomText: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },
    statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '900' },
    financialRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    priceBlock: { alignItems: 'center' },
    finLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8' },
    finVal: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
    divider: { width: 1, height: 30, backgroundColor: '#F1F5F9' },
    actionGroup: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    nudgeBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
    collectBtn: { paddingHorizontal: 15, height: 42, borderRadius: 12, justifyContent: 'center' },
    collectBtnText: { color: '#FFF', fontWeight: '900', fontSize: 11 },
    empty: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
    emptyText: { marginTop: 10, fontWeight: '600', color: '#64748B' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
    modalUser: { fontSize: 15, color: '#64748B', marginBottom: 25, fontWeight: '600' },
    inputBox: { marginBottom: 30 },
    inputLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 10 },
    modalInput: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 18, fontSize: 24, fontWeight: '900', color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
    inputHint: { fontSize: 11, color: '#94A3B8', marginTop: 10, fontWeight: '600' },
    confirmBtn: { height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4 },
    confirmBtnText: { color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1 }
});