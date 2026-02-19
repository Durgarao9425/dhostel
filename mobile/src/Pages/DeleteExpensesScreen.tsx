import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Trash2, Search } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../services/api';
import Toast from 'react-native-toast-message';

const DeleteExpensesScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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
                text2: 'Failed to fetch expenses'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleDelete = (expense: any) => {
        Alert.alert(
            'Delete Expense',
            `Are you sure you want to delete this expense of ₹${expense.amount}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await api.delete(`/expenses/${expense.expense_id}`);
                            if (response.data.success) {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Deleted',
                                    text2: `Expense deleted successfully`
                                });
                                fetchExpenses();
                            } else {
                                Toast.show({
                                    type: 'error',
                                    text1: 'Error',
                                    text2: response.data.message || 'Failed to delete expense'
                                });
                            }
                        } catch (error) {
                            console.error('Error deleting expense:', error);
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: 'Failed to delete expense'
                            });
                        }
                    }
                }
            ]
        );
    };

    const filteredExpenses = expenses.filter(exp =>
        exp.category_name?.toLowerCase().includes(search.toLowerCase()) ||
        exp.description?.toLowerCase().includes(search.toLowerCase()) ||
        exp.amount?.toString().includes(search)
    );

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.title}>{item.category_name}</Text>
                <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.date}>{item.expense_date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                <Text style={styles.amount}>₹{item.amount}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
            >
                <Trash2 color="#EF4444" size={20} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft color="#FFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Delete Expenses</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.searchContainer}>
                    <Search color="#94A3B8" size={18} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search expenses..."
                        placeholderTextColor="#94A3B8"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredExpenses}
                    keyExtractor={(item) => item.expense_id?.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No expenses found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },

    searchContainer: { backgroundColor: '#FFF', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 46 },
    searchInput: { flex: 1, marginLeft: 10, fontWeight: '600', color: '#1E293B' },

    listContent: { padding: 16 },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 },
    cardContent: { flex: 1, marginRight: 10 },
    title: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    desc: { fontSize: 13, color: '#64748B', marginTop: 2 },
    date: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
    amount: { fontSize: 15, fontWeight: '800', color: '#F59E0B' },
    deleteBtn: { padding: 10, backgroundColor: '#FEF2F2', borderRadius: 12 },

    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#94A3B8', fontSize: 16 }
});

export default DeleteExpensesScreen;
