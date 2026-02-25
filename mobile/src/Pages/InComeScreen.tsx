import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus, Search, Calendar, ChevronDown } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { ProfileMenu } from '../components/ProfileMenu';
import { useTheme } from '../../contexts/ThemeContext';
import { HeaderNotification } from '../components/HeaderNotification';

export const IncomeScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [search, setSearch] = useState('');
    const [incomes, setIncomes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Day' | 'Week' | 'Month'>('Day');

    const [error, setError] = useState(false);
    const fetchIncomes = async () => {
        try {
            setLoading(true);
            setError(false);
            const response = await api.get('/income');
            if (response.data.success) {
                setIncomes(response.data.data || []);
            } else {
                setError(true);
            }
        } catch (error) {
            console.error('Error fetching incomes:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchIncomes);
        return unsubscribe;
    }, [navigation]);

    const totalIncome = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
    const dObj = new Date();
    const todayStr = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
    const todayIncome = incomes
        .filter(inc => (inc.income_date || '').startsWith(todayStr))
        .reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);

    const todaySplit = incomes
        .filter(inc => (inc.income_date || '').startsWith(todayStr))
        .reduce((acc: any, inc) => {
            const mode = inc.payment_mode || 'Cash';
            acc[mode] = (acc[mode] || 0) + parseFloat(inc.amount);
            return acc;
        }, {});

    const filteredIncomes = incomes.filter(inc =>
        inc.source?.toLowerCase().includes(search.toLowerCase()) ||
        inc.description?.toLowerCase().includes(search.toLowerCase())
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {(['Day', 'Week', 'Month'] as const).map(tab => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                    onPress={() => setActiveTab(tab)}
                >
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderDayContent = () => {
        const dailyGrouped = filteredIncomes.reduce((acc: any, inc) => {
            const date = inc.income_date;
            if (!acc[date]) acc[date] = { date, total: 0, count: 0, items: [] };
            acc[date].total += parseFloat(inc.amount);
            acc[date].count += 1;
            acc[date].items.push(inc);
            return acc;
        }, {});

        const sortedDays = Object.values(dailyGrouped).sort((a: any, b: any) => b.date.localeCompare(a.date));

        return (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Today's Collection Card */}
                <View style={styles.dailySplitCard}>
                    <Text style={styles.splitTitle}>Today's Collection</Text>
                    <Text style={styles.splitAmount}>₹{todayIncome.toLocaleString('en-IN')}</Text>
                    <View style={styles.splitGrid}>
                        {Object.entries(todaySplit).map(([mode, amt]: any) => (
                            <View key={mode} style={styles.splitItem}>
                                <Text style={styles.splitMode}>{mode}</Text>
                                <Text style={styles.splitVal}>₹{amt.toLocaleString()}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Text style={styles.sectionHeader}>Recent Collections</Text>
                {sortedDays.map((day: any) => (
                    <TouchableOpacity
                        key={day.date}
                        style={styles.dayGroupCard}
                        onPress={() => navigation.navigate('IncomeDetails', { date: day.date, items: day.items })}
                    >
                        <View style={styles.dayHeader}>
                            <View>
                                <Text style={styles.dayText}>{new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                                <Text style={styles.countText}>{day.count} Payments</Text>
                            </View>
                            <Text style={styles.dayTotal}>₹{day.total.toLocaleString()}</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '100%', backgroundColor: theme.primary }]} />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    const renderGraphPlaceholder = (title: string) => (
        <View style={styles.graphPlaceholder}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>{title} Performance</Text>
            </View>
            <View style={styles.mockChart}>
                <LinearGradient colors={[theme.primary + '20', 'transparent']} style={styles.chartGradient}>
                    {/* Simulated Bars */}
                    <View style={styles.barsRow}>
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <View key={i} style={[styles.bar, { height: `${h}%`, backgroundColor: theme.primary }]} />
                        ))}
                    </View>
                </LinearGradient>
            </View>
            <View style={styles.chartFooter}>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft color="#FFFFFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Financial Insights</Text>
                    <ProfileMenu />
                </View>
                {renderTabs()}
            </LinearGradient>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>Oops! Failed to load data</Text>
                    <Text style={styles.errorSub}>Please check your connection and try again.</Text>
                    <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={fetchIncomes}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {activeTab === 'Day' ? renderDayContent() : renderGraphPlaceholder(activeTab)}
                </View>
            )}

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddIncome')}>
                <Plus color="#FFFFFF" size={28} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
    tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', padding: 4, borderRadius: 14, marginTop: 10 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    activeTab: { backgroundColor: '#FFFFFF' },
    tabText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
    activeTabText: { color: '#1E293B' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, padding: 16 },
    dailySplitCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
    splitTitle: { fontSize: 13, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.2, textTransform: 'uppercase' },
    splitAmount: { fontSize: 32, fontWeight: '900', color: '#1E293B', marginVertical: 8 },
    splitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
    splitItem: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', minWidth: '47%' },
    splitMode: { fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
    splitVal: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginTop: 2 },
    sectionHeader: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16, marginTop: 10 },
    dayGroupCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    dayText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    countText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
    dayTotal: { fontSize: 18, fontWeight: '900', color: '#10B981' },
    progressBar: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
    graphPlaceholder: { padding: 20, flex: 1 },
    chartHeader: { marginBottom: 20 },
    chartTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
    mockChart: { height: 200, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, elevation: 3 },
    chartGradient: { flex: 1, justifyContent: 'flex-end' },
    barsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: '100%', paddingHorizontal: 10 },
    bar: { width: 15, borderRadius: 8 },
    chartFooter: { marginTop: 16, alignItems: 'center' },
    footerText: { fontSize: 14, color: '#10B981', fontWeight: '700' },
    fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, zIndex: 100 },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
    errorSub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24 },
    retryBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, elevation: 4 },
    retryText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});

export default IncomeScreen;