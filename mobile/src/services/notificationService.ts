export const notificationService = {
    async registerForPushNotificationsAsync() {
        console.log('Push notifications disabled by user request');
        return null;
    },
    async sendTokenToBackend(token: string) {
        // Disabled
    },
    async removeTokenFromBackend(token: string) {
        // Disabled
    },
    setupNotificationListeners(navigate: (screen: string, params?: any) => void) {
        console.log('Notification listeners disabled');
        return () => { };
    }
};
