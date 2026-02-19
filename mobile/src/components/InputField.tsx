import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';

interface InputFieldProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export const InputField = ({ label, error, containerStyle, ...props }: InputFieldProps) => {
    const renderLabel = () => {
        if (!label) return null;
        if (label.includes('*')) {
            const parts = label.split('*');
            return (
                <Text style={styles.label}>
                    {parts[0]}
                    <Text style={{ color: '#EF4444' }}>*</Text>
                    {parts[1]}
                </Text>
            );
        }
        return <Text style={styles.label}>{label}</Text>;
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {renderLabel()}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                <TextInput
                    style={[styles.input, { outlineStyle: 'none' } as any]}
                    placeholderTextColor="#94A3B8"
                    underlineColorAndroid="transparent"
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155', // Slightly darker for better visibility
        marginBottom: 8,
    },
    inputContainer: {
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    input: {
        fontSize: 16,
        color: '#0F172A', // Darker text color (slate-900)
        paddingVertical: 10,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        fontWeight: '500',
    },
});
