import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { IndianRupee, Calendar, User, Hash, Download } from 'lucide-react-native';
import { DUMMY_PAYMENTS } from '../constants/dummyData';

export const PaymentDetailsScreen = ({ route }: any) => {
    const { id } = route.params || { id: '1' };
    const payment = DUMMY_PAYMENTS.find(p => p.id === id) || DUMMY_PAYMENTS[0];

    const InfoRow = ({ icon, label, value }: any) => (
        <View style={styles.infoRow}>
            <View style={styles.iconBox}>
                {icon}
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Payment Details"
                rightElement={
                    <TouchableOpacity>
                        <Download size={22} color="#FFF" />
                    </TouchableOpacity>
                }
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.amountSection}>
                    <Text style={styles.amountLabel}>Total Paid</Text>
                    <View style={styles.amountWrapper}>
                        <IndianRupee size={32} color="#FF6B6B" />
                        <Text style={styles.amountText}>{payment.amount.toLocaleString()}</Text>
                    </View>
                    <Badge
                        label={payment.status}
                        variant={payment.status === 'Paid' ? 'success' : payment.status === 'Pending' ? 'warning' : 'error'}
                        style={styles.statusBadge}
                    />
                </View>

                <Card style={styles.detailsCard}>
                    <InfoRow
                        icon={<User size={18} color="#64748B" />}
                        label="Student Name"
                        value={payment.studentName}
                    />
                    <View style={styles.divider} />
                    <InfoRow
                        icon={<Hash size={18} color="#64748B" />}
                        label="Transaction ID"
                        value={`TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`}
                    />
                    <View style={styles.divider} />
                    <InfoRow
                        icon={<Calendar size={18} color="#64748B" />}
                        label="Payment Date"
                        value={payment.date}
                    />
                    <View style={styles.divider} />
                    <InfoRow
                        icon={<IndianRupee size={18} color="#64748B" />}
                        label="Payment Mode"
                        value={payment.method || 'UPI / GPay'}
                    />
                </Card>

                <Button
                    title="Download Receipt"
                    onPress={() => { }}
                    variant="outline"
                    style={styles.actionButton}
                />

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { flex: 1, padding: 20 },
    amountSection: { alignItems: 'center', marginVertical: 30 },
    amountLabel: { fontSize: 14, color: '#64748B', marginBottom: 8 },
    amountWrapper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    amountText: { fontSize: 40, fontWeight: '800', color: '#1E293B' },
    statusBadge: { marginTop: 16 },
    detailsCard: { padding: 0, marginBottom: 24 },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
    infoValue: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#F1F5F9' },
    actionButton: { marginTop: 8 },
    bottomSpacing: { height: 40 },
});

export default PaymentDetailsScreen;
