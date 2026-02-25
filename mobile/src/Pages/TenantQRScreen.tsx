import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../services/api';

export default function TenantQRScreen({ navigation }: any) {
    const { user } = useAuth();
    const { theme } = useTheme();

    // Construct the public URL using the configured backend host
    const baseURL = (api.defaults.baseURL || 'http://192.168.1.4:5000/api').replace(/\/api\/?$/, '');
    const formUrl = `${baseURL}/api/public/register/${user?.hostel_id || 1}`;

    // Use an online API to generate QR code from URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(formUrl)}`;

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Public Registration Form</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.title}>Scan to Register</Text>
                    <Text style={styles.subtitle}>
                        Show this QR code to new tenants. They can scan it to fill out the registration form.
                    </Text>

                    <View style={styles.qrContainer}>
                        <Image source={{ uri: qrUrl }} style={styles.qrImage} />
                    </View>

                    <Text style={styles.linkText} selectable>{formUrl}</Text>

                    <Text style={styles.instruction}>
                        Submitted records will appear in your Students list under the "Inactive" tab.
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
    content: { flex: 1, padding: 20, justifyContent: 'center' },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10
    },
    title: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
    subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    qrContainer: {
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        marginBottom: 20
    },
    qrImage: { width: 220, height: 220 },
    linkText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 20 },
    instruction: { fontSize: 13, color: '#3B82F6', textAlign: 'center', fontWeight: '600', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12 }
});
