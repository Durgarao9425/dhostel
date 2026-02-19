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

export const ExpenseScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [search, setSearch] = useState('');
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('All time');

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/expenses');
            if (response.data.success) {
                setExpenses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to fetch expenses',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchExpenses();
        });
        return unsubscribe;
    }, [navigation]);

    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const thisMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
    const thisMonthExpenses = expenses
        .filter(exp => exp.expense_date?.startsWith(thisMonthStr))
        .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    const filteredExpenses = expenses.filter(exp =>
        exp.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
        exp.description?.toLowerCase().includes(search.toLowerCase()) ||
        exp.category_name?.toLowerCase().includes(search.toLowerCase()) ||
        exp.bill_number?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            {/* Header */}
            <LinearGradient
                colors={[theme.gradientStart, theme.gradientEnd]}
                style={[styles.header, { borderBottomLeftRadius: theme.headerRounded, borderBottomRightRadius: theme.headerRounded }]}
            >
                <View style={styles.headerTop}>
                    {/* Keeping Back Button if it was there, but maybe user wants uniformity? 
                        User said: "remove back button" for FeeManagement. 
                        For ExpenseScreen, let's keep it on the left if it's a detail screen, 
                        or replace with Title if it's a main screen. 
                        However, to add Profile/Notification on the right:
                    */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft color="#FFFFFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Expenses</Text>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <HeaderNotification navigation={navigation} />
                        <ProfileMenu />
                    </View>
                </View>

                {/* Expense Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Expenses</Text>
                        <Text style={styles.statValue}>₹{totalExpenses.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>This Month</Text>
                        <Text style={styles.statValue}>₹{thisMonthExpenses.toLocaleString('en-IN')}</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Search color="#999999" size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search students..."
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

            {/* Expense List */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF6B6B" />
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {filteredExpenses.map((expense) => (
                        <TouchableOpacity
                            key={expense.expense_id}
                            style={styles.expenseCard}
                            onPress={() => navigation.navigate('ExpenseDetails', { id: expense.expense_id })}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.headerLeft}>
                                    <Text style={styles.expenseTitle}>{expense.category_name}</Text>
                                    <Text style={styles.roomText}>{expense.vendor_name || 'Generic'}</Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{expense.expense_date}</Text>
                                </View>
                            </View>

                            <Text style={styles.description} numberOfLines={2}>
                                {expense.description}
                            </Text>

                            <View style={styles.cardFooter}>
                                <Text style={styles.amountText}>₹{parseFloat(expense.amount).toLocaleString('en-IN')}</Text>
                                <Text style={styles.daysText}>{expense.payment_mode}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                    <View style={styles.bottomSpacing} />
                </ScrollView>
            )}

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddExpense')}
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
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
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
        paddingTop: 24, // Increased to match dashboard
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
    expenseCard: {
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
    expenseTitle: {
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
        backgroundColor: '#FFF4E5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FF9800',
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
        bottom: 90, // Positioned above bottom tabs
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

export default ExpenseScreen;