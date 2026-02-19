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
    const [selectedMonth, setSelectedMonth] = useState('All time');

    const fetchIncomes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/income');
            if (response.data.success) {
                setIncomes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching incomes:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to fetch incomes',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchIncomes();
        });
        return unsubscribe;
    }, [navigation]);

    const totalIncome = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
    const thisMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
    const thisMonthIncome = incomes
        .filter(inc => inc.income_date?.startsWith(thisMonthStr))
        .reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);

    const filteredIncomes = incomes.filter(inc =>
        inc.source?.toLowerCase().includes(search.toLowerCase()) ||
        inc.description?.toLowerCase().includes(search.toLowerCase()) ||
        inc.receipt_number?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={[theme.gradientStart, theme.gradientEnd]}
                style={[styles.header, { borderBottomLeftRadius: theme.headerRounded, borderBottomRightRadius: theme.headerRounded }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft color="#FFFFFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Income</Text>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <HeaderNotification navigation={navigation} />
                        <ProfileMenu />
                    </View>
                </View>

                {/* Income Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Income</Text>
                        <Text style={styles.statValue}>₹{totalIncome.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>This Month</Text>
                        <Text style={styles.statValue}>₹{thisMonthIncome.toLocaleString('en-IN')}</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Search color="#999999" size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search income..."
                        placeholderTextColor="#999999"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity style={styles.monthPicker}>
                    <Calendar color="#666666" size={18} />
                    <Text style={styles.monthText}>{selectedMonth}</Text>
                    <ChevronDown color="#666666" size={16} />
                </TouchableOpacity>
            </View>

            {/* Income List */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF6B6B" />
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {filteredIncomes.map((income) => (
                        <TouchableOpacity
                            key={income.income_id}
                            style={styles.incomeCard}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.headerLeft}>
                                    <Text style={styles.incomeTitle}>{income.source}</Text>
                                    <Text style={styles.roomText}>{income.payment_mode || 'N/A'}</Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{income.income_date}</Text>
                                </View>
                            </View>

                            {income.description && (
                                <Text style={styles.description} numberOfLines={2}>
                                    {income.description}
                                </Text>
                            )}

                            <View style={styles.cardFooter}>
                                <Text style={styles.amountText}>₹{parseFloat(income.amount).toLocaleString('en-IN')}</Text>
                                {income.receipt_number && (
                                    <Text style={styles.daysText}>Receipt: {income.receipt_number}</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                    <View style={styles.bottomSpacing} />
                </ScrollView>
            )}

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddIncome')}
                activeOpacity={0.9}
            >
                <Plus color="#FFFFFF" size={28} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        paddingTop: 55,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 14,
    },
    statLabel: {
        fontSize: 12,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 6,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
        gap: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 44,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333333',
    },
    monthPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        gap: 6,
    },
    monthText: {
        fontSize: 13,
        color: '#666666',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    incomeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerLeft: {
        flex: 1,
    },
    incomeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 4,
    },
    roomText: {
        fontSize: 13,
        color: '#999999',
    },
    statusBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4CAF50',
    },
    description: {
        fontSize: 13,
        color: '#666666',
        lineHeight: 18,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333333',
    },
    daysText: {
        fontSize: 12,
        color: '#999999',
    },
    bottomSpacing: {
        height: 120,
    },
    fab: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FF6B6B',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        zIndex: 2000,
    },
});

export default IncomeScreen;