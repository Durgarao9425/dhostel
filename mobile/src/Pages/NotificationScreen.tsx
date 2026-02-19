import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Bell, CreditCard, UserPlus, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react-native';
import { useNotifications, Notification } from '../hooks/useNotifications';
import { useNavigation } from '@react-navigation/native';

export const NotificationScreen = () => {
    const { notifications, loading, refreshNotifications, markAllAsRead, markAsRead } = useNotifications();
    const navigation = useNavigation<any>();

    const onRefresh = () => {
        refreshNotifications();
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={20} color="#10B981" />; // Payment/Income
            case 'info': return <UserPlus size={20} color="#3B82F6" />; // Admission
            case 'warning': return <AlertTriangle size={20} color="#EF4444" />; // Expense
            default: return <Bell size={20} color="#64748B" />;
        }
    };

    const getBgColor = (type: Notification['type']) => {
        switch (type) {
            case 'success': return '#ECFDF5';
            case 'info': return '#EFF6FF';
            case 'warning': return '#FEF3C7';
            default: return '#F8FAFC';
        }
    };

    const handleNotifClick = (notif: Notification) => {
        markAsRead(notif.id);

        // Navigation logic based on type/content
        if (notif.type === 'success' && notif.title.includes('Payment')) {
            navigation.navigate('FeeManagementTab');
        } else if (notif.type === 'info' && notif.title.includes('Admission')) {
            if (notif.data && notif.data.id) {
                navigation.navigate('StudentDetails', { studentId: notif.data.id });
            } else {
                navigation.navigate('StudentsTab');
            }
        } else if (notif.type === 'warning' && notif.title.includes('Expense')) {
            navigation.navigate('Expenses');
        } else if (notif.type === 'success' && notif.title.includes('Income')) {
            navigation.navigate('Income');
        }
    };

    return (
        <View style={styles.container}>
            <Header
                title="Notifications"
                rightElement={
                    <TouchableOpacity onPress={markAllAsRead}>
                        <CheckCircle2 size={24} color="#FFF" />
                    </TouchableOpacity>
                }
            />
            {loading && notifications.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#FF6B6B" />
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
                >
                    {notifications.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Bell size={48} color="#CBD5E1" />
                            <Text style={styles.emptyTitle}>No new notifications</Text>
                            <Text style={styles.emptySubtitle}>We'll notify you when something important happens.</Text>
                        </View>
                    ) : (
                        notifications.map((notif) => (
                            <TouchableOpacity key={notif.id} onPress={() => handleNotifClick(notif)} activeOpacity={0.8}>
                                <Card style={[styles.notifCard, !notif.read && styles.unreadCard]}>
                                    <View style={styles.row}>
                                        <View style={[styles.iconContainer, { backgroundColor: getBgColor(notif.type) }]}>
                                            {getIcon(notif.type)}
                                        </View>
                                        <View style={styles.textContainer}>
                                            <View style={styles.headerRow}>
                                                <Text style={[styles.notifTitle, !notif.read && styles.unreadText]}>{notif.title}</Text>
                                                <Text style={styles.notifTime}>{notif.time}</Text>
                                            </View>
                                            <Text style={styles.notifMessage} numberOfLines={2}>{notif.body}</Text>
                                        </View>
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        ))
                    )}
                    <View style={styles.bottomSpacing} />
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { flex: 1, padding: 20 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    notifCard: { marginBottom: 12, padding: 12, borderLeftWidth: 0 },
    unreadCard: { backgroundColor: '#FFFFFF', borderLeftWidth: 3, borderLeftColor: '#FF6B6B' },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    textContainer: { flex: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    notifTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
    unreadText: { fontWeight: '700', color: '#0F172A' },
    notifTime: { fontSize: 11, color: '#94A3B8' },
    notifMessage: { fontSize: 13, color: '#64748B', lineHeight: 18 },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8 },
    bottomSpacing: { height: 40 },
});

export default NotificationScreen;
