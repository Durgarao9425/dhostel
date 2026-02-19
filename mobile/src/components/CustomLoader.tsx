import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface CustomLoaderProps {
    visible: boolean;
    message?: string;
}

export const CustomLoader = ({ visible, message = 'Loading...' }: CustomLoaderProps) => {
    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#FF6B6B" />
                    {message && <Text style={styles.message}>{message}</Text>}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        minWidth: width * 0.4,
    },
    message: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
        color: '#555555',
    },
});
