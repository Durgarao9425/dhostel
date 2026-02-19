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

export const AddIncomeScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [paymentModes, setPaymentModes] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        source: '',
        amount: '',
        payment_mode_id: '1',
        income_date: new Date().toISOString().split('T')[0],
        description: '',
        receipt_number: '',
    });

    useEffect(() => {
        fetchPaymentModes();
    }, []);

    const fetchPaymentModes = async () => {
        try {
            const response = await api.get('/monthly-fees/payment-modes');
            if (response.data.success) {
                setPaymentModes(response.data.data);
                if (response.data.data.length > 0) {
                    const firstModeId = response.data.data[0].payment_mode_id || response.data.data[0].id;
                    setFormData(prev => ({ ...prev, payment_mode_id: firstModeId.toString() }));
                }
            }
        } catch (error) {
            console.error('Error fetching payment modes:', error);
        }
    };

    const handleSave = async () => {
        if (!formData.source || !formData.amount || !formData.income_date) {
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
                source: formData.source,
                amount: parseFloat(formData.amount),
                payment_mode_id: parseInt(formData.payment_mode_id),
                income_date: formData.income_date,
                description: formData.description,
                receipt_number: formData.receipt_number,
            };

            const response = await api.post('/income', payload);

            if (response.data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Income recorded successfully!',
                });
                navigation?.goBack();
            }
        } catch (error: any) {
            console.error('Error saving income:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.error || 'Failed to record income',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header title="Add Income" />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Card style={styles.formCard}>
                    <InputField
                        label="Source *"
                        placeholder="e.g. Maintenance Fee, Parking Fee"
                        value={formData.source}
                        onChangeText={(text) => setFormData({ ...formData, source: text })}
                    />

                    <InputField
                        label="Amount (₹) *"
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={formData.amount}
                        onChangeText={(text) => setFormData({ ...formData, amount: text })}
                    />

                    <InputField
                        label="Income Date *"
                        placeholder="YYYY-MM-DD"
                        value={formData.income_date}
                        onChangeText={(text) => setFormData({ ...formData, income_date: text })}
                    />

                    <Text style={styles.label}>Payment Mode *</Text>
                    <View style={styles.categoryGrid}>
                        {paymentModes.map((mode) => {
                            const mId = mode.payment_mode_id || mode.id;
                            const mName = mode.payment_mode_name || mode.name || 'Unknown';
                            return (
                                <TouchableOpacity
                                    key={mId}
                                    style={[
                                        styles.catButton,
                                        formData.payment_mode_id === mId.toString() && styles.catButtonActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, payment_mode_id: mId.toString() })}
                                >
                                    <Text style={[
                                        styles.catButtonText,
                                        formData.payment_mode_id === mId.toString() && styles.catButtonTextActive
                                    ]}>{mName}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <InputField
                        label="Receipt Number (Optional)"
                        placeholder="e.g. REC-001"
                        value={formData.receipt_number}
                        onChangeText={(text) => setFormData({ ...formData, receipt_number: text })}
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
                            <Text style={styles.buttonText}>Save Income</Text>
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

export default AddIncomeScreen;
