import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export const ExpensesTab = ({ navigation }: any) => {
    const [search, setSearch] = useState('');
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    useFocusEffect(
        React.useCallback(() => {
            fetchExpenses();
        }, [])
    );

    const filteredExpenses = expenses.filter(exp =>
        exp.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
        exp.description?.toLowerCase().includes(search.toLowerCase()) ||
        exp.category_name?.toLowerCase().includes(search.toLowerCase()) ||
        exp.bill_number?.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.expenseCard}
            onPress={() => navigation.navigate('ExpenseDetails', { id: item.expense_id })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <Text style={styles.expenseTitle}>{item.category_name}</Text>
                    <Text style={styles.roomText}>{item.vendor_name || 'Generic'}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.expense_date}</Text>
                </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
                {item.description}
            </Text>

            <View style={styles.cardFooter}>
                <Text style={styles.amountText}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</Text>
                <Text style={styles.daysText}>{item.payment_mode}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <Search color="#999999" size={20} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search expenses..."
                    placeholderTextColor="#999999"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FF6B6B" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredExpenses}
                    keyExtractor={(item) => item.expense_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddExpense')}
            >
                <Plus color="#FFFFFF" size={28} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
        borderRadius: 12, paddingHorizontal: 14, height: 46, margin: 16, marginBottom: 10,
        gap: 10
    },
    searchInput: { flex: 1, fontSize: 14, color: '#333333' },
    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
    expenseCard: {
        backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 12,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    headerLeft: { flex: 1 },
    expenseTitle: { fontSize: 16, fontWeight: '700', color: '#333333', marginBottom: 4 },
    roomText: { fontSize: 13, color: '#999999' },
    statusBadge: { backgroundColor: '#FFF4E5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 11, fontWeight: '600', color: '#FF9800' },
    description: { fontSize: 13, color: '#666666', lineHeight: 18, marginBottom: 12 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    amountText: { fontSize: 18, fontWeight: '700', color: '#333333' },
    daysText: { fontSize: 12, color: '#999999' },
    fab: {
        position: 'absolute', bottom: 30, right: 20, width: 56, height: 56,
        borderRadius: 28, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center',
        elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6
    },
});
