import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
}

export const Button = ({ onPress, title, variant = 'primary', style, textStyle, disabled }: ButtonProps) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return { container: styles.secondary, text: styles.secondaryText };
            case 'outline':
                return { container: styles.outline, text: styles.outlineText };
            case 'ghost':
                return { container: styles.ghost, text: styles.ghostText };
            default:
                return { container: styles.primary, text: styles.primaryText };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[styles.button, variantStyles.container, style, disabled && styles.disabled]}
            activeOpacity={0.7}
        >
            <Text style={[styles.text, variantStyles.text, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    primary: {
        backgroundColor: '#FF6B6B',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondary: {
        backgroundColor: '#F1F5F9',
    },
    secondaryText: {
        color: '#1E293B',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
    outlineText: {
        color: '#FF6B6B',
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    ghostText: {
        color: '#FF6B6B',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
    disabled: {
        opacity: 0.5,
    },
});
