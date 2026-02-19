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
import { Search, Plus, TrendingUp } from 'lucide-react-native';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export const IncomeTab = ({ navigation }: any) => {
    const [search, setSearch] = useState('');
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchIncome = async () => {
        try {
            setLoading(true);
            const response = await api.get('/income');
            if (response.data.success) {
                setRecords(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching income:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to fetch income',
            });
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchIncome();
        }, [])
    );

    const filteredRecords = records.filter(r =>
        r.source.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }: any) => (
        <TouchableOpacity style={styles.card} onPress={() => { }}>
            <View style={[styles.cardLeftAccent, { backgroundColor: '#10B981' }]} />
            <View style={styles.cardContent}>
                <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                    <TrendingUp size={20} color="#16A34A" />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.sourceText}>{item.source}</Text>
                    <Text style={styles.dateText}>{item.income_date}</Text>
                </View>
                <Text style={styles.amountText}>₹{item.amount}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Search color="#94A3B8" size={18} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search income..."
                    placeholderTextColor="#94A3B8"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredRecords}
                    keyExtractor={(item) => item.income_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddIncome')}
            >
                <Plus color="#FFFFFF" size={28} />
            </TouchableOpacity>
        </View>
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
    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
    card: {
        backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 12,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
        overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9', flexDirection: 'row'
    },
    cardLeftAccent: { width: 5 },
    cardContent: { flex: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    cardInfo: { flex: 1 },
    sourceText: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
    dateText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    amountText: { fontSize: 16, fontWeight: '800', color: '#10B981' },
    fab: {
        position: 'absolute', bottom: 30, right: 20, width: 56, height: 56,
        borderRadius: 28, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center',
        elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6
    },
});
