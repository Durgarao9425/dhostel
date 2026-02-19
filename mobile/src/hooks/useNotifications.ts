import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export type Notification = {
    id: string | number;
    type: 'payment' | 'admission' | 'expense' | 'income' | 'info' | 'warning' | 'success';
    title: string;
    body: string;
    time: string;
    read: boolean;
    data?: any;
    date: string; // original date for sorting
};

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/activity/recent?limit=20');

            if (response.data.success) {
                const activities = response.data.data;
                const formattedNotifications: Notification[] = activities.map((item: any) => {
                    let type: Notification['type'] = 'info';
                    let title = 'Notification';
                    let body = '';

                    // Map activity types to notification types/content
                    if (item.type === 'payment') {
                        type = 'success';
                        title = 'Payment Received';
                        body = `${item.student_name} paid ₹${item.amount}`;
                    } else if (item.type === 'admission') {
                        type = 'info';
                        title = 'New Admission';
                        body = `${item.student_name} joined Room ${item.room_number || 'N/A'}`;
                    } else if (item.type === 'expense') {
                        type = 'warning';
                        title = 'Expense Recorded';
                        body = `${item.category_name}: ₹${item.amount} - ${item.description || ''}`;
                    } else if (item.type === 'income') {
                        type = 'success';
                        title = 'Income Recorded';
                        body = `${item.source}: ₹${item.amount}`;
                    }

                    return {
                        id: item.id || Math.random().toString(),
                        type,
                        title,
                        body,
                        time: new Date(item.created_at).toLocaleString(), // rough formatting
                        date: item.created_at,
                        read: false, // Default to false for now, since we don't have persistence
                        data: item
                    };
                });

                setNotifications(formattedNotifications);
                setUnreadCount(formattedNotifications.length); // All considered unread on fresh load for now
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = (id: string | number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return {
        notifications,
        unreadCount,
        loading,
        refreshNotifications: fetchNotifications,
        markAsRead,
        markAllAsRead
    };
};
