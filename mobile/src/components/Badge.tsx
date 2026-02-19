import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
    label: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
    style?: ViewStyle;
}

export const Badge = ({ label, variant = 'default', style }: BadgeProps) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return { container: styles.success, text: styles.successText };
            case 'warning':
                return { container: styles.warning, text: styles.warningText };
            case 'error':
                return { container: styles.error, text: styles.errorText };
            case 'info':
                return { container: styles.info, text: styles.infoText };
            default:
                return { container: styles.default, text: styles.defaultText };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <View style={[styles.badge, variantStyles.container, style]}>
            <Text style={[styles.text, variantStyles.text]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
    },
    success: {
        backgroundColor: '#DCFCE7',
    },
    successText: {
        color: '#166534',
    },
    warning: {
        backgroundColor: '#FEF9C3',
    },
    warningText: {
        color: '#854D0E',
    },
    error: {
        backgroundColor: '#FEE2E2',
    },
    errorText: {
        color: '#991B1B',
    },
    info: {
        backgroundColor: '#DBEAFE',
    },
    infoText: {
        color: '#1E40AF',
    },
    default: {
        backgroundColor: '#F1F5F9',
    },
    defaultText: {
        color: '#475569',
    },
});
