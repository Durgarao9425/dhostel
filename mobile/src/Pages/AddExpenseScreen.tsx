import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { Header } from '../components/Header';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const AddExpenseScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category_id: '',
        payment_mode_id: '1', // Default to Cash (usually 1)
        expense_date: new Date().toISOString().split('T')[0],
        description: '',
        vendor_name: '',
        bill_number: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/expenses/categories');
            if (response.data.success) {
                setCategories(response.data.data);
                if (response.data.data.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: response.data.data[0].category_id.toString() }));
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSave = async () => {
        if (!formData.category_id || !formData.amount || !formData.expense_date) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill in required fields',
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                hostel_id: user?.hostel_id,
                category_id: parseInt(formData.category_id),
                expense_date: formData.expense_date,
                amount: parseFloat(formData.amount),
                payment_mode_id: parseInt(formData.payment_mode_id),
                vendor_name: formData.vendor_name,
                description: formData.description || formData.title,
                bill_number: formData.bill_number,
            };

            const response = await api.post('/expenses', payload);

            if (response.data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Expense recorded successfully!',
                });
                navigation?.goBack();
            }
        } catch (error: any) {
            console.error('Error saving expense:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.error || 'Failed to record expense',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header title="Add Expense" />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Card style={styles.formCard}>
                    <Text style={styles.label}>Category *</Text>
                    <View style={styles.categoryGrid}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.category_id}
                                style={[
                                    styles.catButton,
                                    formData.category_id === cat.category_id.toString() && styles.catButtonActive
                                ]}
                                onPress={() => setFormData({ ...formData, category_id: cat.category_id.toString() })}
                            >
                                <Text style={[
                                    styles.catButtonText,
                                    formData.category_id === cat.category_id.toString() && styles.catButtonTextActive
                                ]}>{cat.category_name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <InputField
                        label="Amount (₹) *"
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={formData.amount}
                        onChangeText={(text) => setFormData({ ...formData, amount: text })}
                    />

                    <InputField
                        label="Expense Date *"
                        placeholder="YYYY-MM-DD"
                        value={formData.expense_date}
                        onChangeText={(text) => setFormData({ ...formData, expense_date: text })}
                    />

                    <Text style={styles.label}>Payment Mode *</Text>
                    <View style={styles.categoryGrid}>
                        {[
                            { id: '1', name: 'Cash' },
                            { id: '2', name: 'Online' },
                            { id: '3', name: 'Bank Transfer' }
                        ].map((mode) => (
                            <TouchableOpacity
                                key={mode.id}
                                style={[
                                    styles.catButton,
                                    formData.payment_mode_id === mode.id && styles.catButtonActive
                                ]}
                                onPress={() => setFormData({ ...formData, payment_mode_id: mode.id })}
                            >
                                <Text style={[
                                    styles.catButtonText,
                                    formData.payment_mode_id === mode.id && styles.catButtonTextActive
                                ]}>{mode.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <InputField
                        label="Vendor Name (Optional)"
                        placeholder="e.g. Reliance Fresh"
                        value={formData.vendor_name}
                        onChangeText={(text) => setFormData({ ...formData, vendor_name: text })}
                    />

                    <InputField
                        label="Bill Number (Optional)"
                        placeholder="e.g. INV-001"
                        value={formData.bill_number}
                        onChangeText={(text) => setFormData({ ...formData, bill_number: text })}
                    />

                    <InputField
                        label="Description"
                        placeholder="Optional details..."
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        style={{ height: 80 }}
                    />
                </Card>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#FF8585', '#FF6B6B']}
                        style={styles.buttonGradient}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.buttonText}>Save Expense</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { flex: 1, padding: 20 },
    formCard: { padding: 20, marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 12 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    catButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFF'
    },
    catButtonActive: {
        borderColor: '#FF6B6B',
        backgroundColor: '#FFF1F1'
    },
    catButtonText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    catButtonTextActive: { color: '#FF6B6B', fontWeight: '600' },
    saveButton: {
        height: 54,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 40
    },
    disabledButton: { opacity: 0.7 },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    bottomSpacing: { height: 40 },
});

export default AddExpenseScreen;
