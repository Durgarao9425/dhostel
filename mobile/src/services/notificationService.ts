import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const notificationService = {
    async registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }

            // Get Expo Push Token
            try {
                // Expo updated their API, projectId is optional if using EAS
                token = (await Notifications.getExpoPushTokenAsync()).data;
                console.log('Expo Push Token:', token);
            } catch (e) {
                console.error('Error fetching push token', e);
            }

        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    },

    async sendTokenToBackend(token: string) {
        try {
            await api.post(`/save-push-token`, { token });
            console.log('Push token sent to backend');
        } catch (error) {
            console.error("Error sending push token to backend", error);
        }
    },

    async removeTokenFromBackend(token: string) {
        try {
            await api.post(`/remove-push-token`, { token });
            console.log('Push token removed from backend');
        } catch (error) {
            console.error("Error removing push token from backend", error);
        }
    },

    setupNotificationListeners(navigate: (screen: string, params?: any) => void) {
        // Background/Foreground interaction listener
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data && data.screen) {
                // Navigate to screen
                navigate(data.screen as string, data);
            }
        });

        // Foreground listener (optional, to handle incoming when open)
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            // handle foreground notification if needed
            console.log('Notification received in foreground:', notification);
        });

        return () => {
            responseListener.remove();
            notificationListener.remove();
        };
    }
};
