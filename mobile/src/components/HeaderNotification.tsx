import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Modal, Platform } from 'react-native';
import { Bell, CheckCircle, AlertCircle, Info, X, ChevronRight } from 'lucide-react-native';
import { useNotifications, Notification } from '../hooks/useNotifications';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export const HeaderNotification = ({ navigation }: { navigation?: any }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
    const [showNotif, setShowNotif] = useState(false);
    const nav = navigation || useNavigation();
    const insets = useSafeAreaInsets();

    const handleNotifClick = (notif: Notification) => {
        markAsRead(notif.id);
        setShowNotif(false);

        // Navigation logic based on type/content
        if (notif.type === 'payment' || notif.title.includes('Payment')) {
            nav.navigate('FeeManagementTab');
        } else if (notif.type === 'admission' || notif.title.includes('Admission')) {
            if (notif.data && notif.data.id) {
                nav.navigate('StudentDetails', { studentId: notif.data.id });
            } else {
                nav.navigate('StudentsTab');
            }
        } else if (notif.type === 'expense' || notif.title.includes('Expense')) {
            nav.navigate('Expenses');
        } else if (notif.type === 'income' || notif.title.includes('Income')) {
            nav.navigate('Income');
        } else {
            // Default fallback
            nav.navigate('Notifications');
        }
    };

    const handleViewAll = () => {
        setShowNotif(false);
        nav.navigate('Notifications');
    };

    const getIcon = (type: Notification['type']) => {
        if (type === 'success') return <CheckCircle color="#059669" size={16} />;
        if (type === 'warning') return <AlertCircle color="#D97706" size={16} />;
        return <Info color="#3B82F6" size={16} />;
    };

    const getIconBg = (type: Notification['type']) => {
        if (type === 'success') return '#D1FAE5';
        if (type === 'warning') return '#FEF3C7';
        return '#DBEAFE';
    };

    return (
        <View style={{ zIndex: 1000 }}>
            <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => setShowNotif(true)}
                activeOpacity={0.8}
            >
                <Bell color="#FFFFFF" size={24} />
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal
                visible={showNotif}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowNotif(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.backdrop}
                        activeOpacity={1}
                        onPress={() => setShowNotif(false)}
                    />

                    <View style={[styles.notifDropdown, { top: Platform.OS === 'ios' ? insets.top + 50 : 60 }]}>
                        <View style={styles.notifArrow} />
                        <View style={styles.notifHeader}>
                            <View style={styles.notifHeaderLeft}>
                                <Text style={styles.notifTitle}>Notifications</Text>
                                {unreadCount > 0 && (
                                    <View style={styles.notifCountBadge}>
                                        <Text style={styles.notifCountText}>{unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.notifHeaderRight}>
                                {unreadCount > 0 && (
                                    <TouchableOpacity onPress={markAllAsRead}>
                                        <Text style={styles.markAllText}>Mark all read</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => setShowNotif(false)} style={styles.notifCloseBtn}>
                                    <X color="#999999" size={14} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.scrollContainer}>
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#FF6B6B" />
                                </View>
                            ) : notifications.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Bell color="#E0E0E0" size={32} />
                                    <Text style={styles.emptyText}>No new notifications</Text>
                                </View>
                            ) : (
                                <ScrollView style={styles.notifScroll} showsVerticalScrollIndicator={false}>
                                    {notifications.slice(0, 5).map((n, index) => (
                                        <TouchableOpacity
                                            key={`notif-${index}-${Date.now()}`}
                                            style={[styles.notifItem, !n.read && styles.notifItemUnread]}
                                            onPress={() => handleNotifClick(n)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[styles.notifIconBox, { backgroundColor: getIconBg(n.type) }]}>
                                                {getIcon(n.type)}
                                            </View>
                                            <View style={styles.notifBody}>
                                                <Text style={styles.notifItemTitle}>{n.title}</Text>
                                                <Text style={styles.notifItemBody} numberOfLines={2}>{n.body}</Text>
                                                <Text style={styles.notifTime}>{n.time}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </View>

                        <TouchableOpacity style={styles.viewAllBtn} onPress={handleViewAll}>
                            <Text style={styles.viewAllBtnText}>View All Activities</Text>
                            <ChevronRight color="#FF6B6B" size={14} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FFCC00',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#FF6B6B',
    },
    badgeText: { fontSize: 9, fontWeight: '800', color: '#333333' },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    notifDropdown: {
        position: 'absolute',
        right: 16, // Padding from right edge
        width: width - 32, // Full width minus padding
        maxWidth: 360,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
        overflow: 'hidden',
    },
    notifArrow: {
        position: 'absolute',
        top: -7,
        right: 14,
        width: 0,
        height: 0,
        borderLeftWidth: 7,
        borderRightWidth: 7,
        borderBottomWidth: 7,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#FFFFFF',
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    notifHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    notifTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
    notifCountBadge: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 10,
    },
    notifCountText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
    notifHeaderRight: { flexDirection: 'row', alignItems: 'center' },
    markAllText: { fontSize: 11, color: '#FF6B6B', fontWeight: '600' },
    notifCloseBtn: { marginLeft: 10, padding: 2 },
    scrollContainer: {
        maxHeight: 500,
        minHeight: 250,
    },
    notifScroll: { flex: 1 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    emptyText: { fontSize: 12, color: '#AAAAAA', marginTop: 8 },
    notifItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F8F8',
        gap: 10,
    },
    notifItemUnread: { backgroundColor: '#FFFAF9' },
    notifIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    notifBody: { flex: 1, gap: 2 },
    notifItemTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
    notifItemBody: { fontSize: 12, color: '#777777', lineHeight: 16 },
    notifTime: { fontSize: 10, color: '#BBBBBB', fontWeight: '500', marginTop: 2 },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: '#FAFAFA',
        gap: 6
    },
    viewAllBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF6B6B'
    }
});
