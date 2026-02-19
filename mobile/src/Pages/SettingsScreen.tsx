import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import { Header } from '../components/Header'; // Assuming this exists as imported before
import { Card } from '../components/Card'; // Assuming this exists
import { Bell, Shield, Moon, Globe, ChevronRight, Type, User, Mail, Building } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export const SettingsScreen = ({ navigation }: any) => {
    const { theme, isDark, toggleTheme, fontSize, setFontSize } = useTheme();
    const { user } = useAuth();
    const { i18n } = useTranslation();

    // Local state for toggles (mocking functionality for some)
    const [notifications, setNotifications] = useState(true);

    // Profile Details state
    const [name, setName] = useState(user?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [hostelName, setHostelName] = useState(user?.hostel_name || '');

    const SettingRow = ({ icon, label, value, type = 'chevron', onPress, rightElement }: any) => (
        <TouchableOpacity
            style={styles.row}
            onPress={onPress}
            disabled={type === 'switch' && !onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.lightBg }]}>
                {icon}
            </View>
            <Text style={[styles.label, { fontSize: fontSize }]}>{label}</Text>

            {type === 'chevron' && (
                <View style={styles.rightSide}>
                    {value && <Text style={[styles.value, { fontSize: fontSize - 1 }]}>{value}</Text>}
                    <ChevronRight size={20} color="#CBD5E1" />
                </View>
            )}

            {type === 'switch' && (
                <Switch
                    value={value}
                    onValueChange={onPress}
                    trackColor={{ false: '#E2E8F0', true: theme.primary + '80' }}
                    thumbColor={value ? theme.primary : '#F8FAFC'}
                />
            )}

            {type === 'custom' && rightElement}
        </TouchableOpacity>
    );

    const handleSaveProfile = () => {
        // Here you would call an API update
        Alert.alert('Success', 'Profile details updated locally (API integration pending).');
    };

    return (
        <View style={styles.container}>
            <Header title="Settings" />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* ── PROFILE DETAILS SECTION ── */}
                <Text style={styles.sectionTitle}>Profile Details</Text>
                <Card style={styles.card}>
                    <View style={styles.inputRow}>
                        <View style={styles.inputIcon}><User size={18} color="#64748B" /></View>
                        <TextInput
                            style={[styles.input, { fontSize }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Full Name"
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.inputRow}>
                        <View style={styles.inputIcon}><Mail size={18} color="#64748B" /></View>
                        <TextInput
                            style={[styles.input, { fontSize }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email Address"
                            editable={false} // usually email is not editable easily
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.inputRow}>
                        <View style={styles.inputIcon}><Building size={18} color="#64748B" /></View>
                        <TextInput
                            style={[styles.input, { fontSize }]}
                            value={hostelName}
                            onChangeText={setHostelName}
                            placeholder="Hostel Name"
                            editable={false}
                        />
                    </View>
                    <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSaveProfile}>
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    </TouchableOpacity>
                </Card>

                {/* ── APPEARANCE SECTION ── */}
                <Text style={styles.sectionTitle}>Appearance</Text>
                <Card style={styles.card}>
                    <SettingRow
                        icon={<Type size={20} color={theme.primary} />}
                        label="Font Size"
                        type="custom"
                        rightElement={
                            <View style={styles.fontControls}>
                                <TouchableOpacity
                                    style={styles.fontBtn}
                                    onPress={() => setFontSize(Math.max(10, fontSize - 1))}
                                >
                                    <Text style={styles.fontBtnText}>A-</Text>
                                </TouchableOpacity>
                                <Text style={styles.fontValue}>{fontSize}</Text>
                                <TouchableOpacity
                                    style={styles.fontBtn}
                                    onPress={() => setFontSize(Math.min(24, fontSize + 1))}
                                >
                                    <Text style={styles.fontBtnText}>A+</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Moon size={20} color={theme.primary} />}
                        label="Dark Mode"
                        // Note: We are not fully implementing dark mode logic across the app yet, but the toggle is here
                        type="switch"
                        value={isDark}
                        onPress={toggleTheme}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Globe size={20} color={theme.primary} />}
                        label="Language"
                        value={i18n.language?.toUpperCase() || 'EN'}
                        onPress={() => {
                            // Could open the language modal from here too, or just link back to Profile
                            Alert.alert('Language', 'Please use the Profile screen to change language.');
                        }}
                    />
                </Card>

                {/* ── PREFERENCES SECTION ── */}
                <Text style={styles.sectionTitle}>App Preferences</Text>
                <Card style={styles.card}>
                    <SettingRow
                        icon={<Bell size={20} color={theme.primary} />}
                        label="Push Notifications"
                        type="switch"
                        value={notifications}
                        onPress={() => setNotifications(!notifications)}
                    />
                </Card>

                {/* ── SECURITY SECTION ── */}
                <Text style={styles.sectionTitle}>Security & Updates</Text>
                <Card style={styles.card}>
                    <SettingRow
                        icon={<Shield size={20} color={theme.primary} />}
                        label="Privacy Policy"
                    />
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.lightBg }]}>
                            <Bell size={20} color={theme.primary} />
                        </View>
                        <Text style={[styles.label, { fontSize: fontSize }]}>Check for Updates</Text>
                        <Text style={styles.version}>v1.0.0</Text>
                    </TouchableOpacity>
                </Card>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 10 },
    card: { padding: 0, marginBottom: 24, overflow: 'hidden', backgroundColor: '#FFF', borderRadius: 16, elevation: 2 },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    iconContainer: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    label: { fontWeight: '600', color: '#1E293B', flex: 1 },
    rightSide: { flexDirection: 'row', alignItems: 'center' },
    value: { color: '#94A3B8', marginRight: 8 },
    version: { fontSize: 12, color: '#94A3B8' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 64 },
    bottomSpacing: { height: 40 },

    // Font Controls
    fontControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, padding: 2 },
    fontBtn: { paddingHorizontal: 10, paddingVertical: 4 },
    fontBtnText: { fontWeight: '700', color: '#64748B' },
    fontValue: { paddingHorizontal: 8, fontWeight: '600', color: '#1E293B' },

    // Input Styles
    inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    inputIcon: { width: 30, alignItems: 'center' },
    input: { flex: 1, marginLeft: 10, color: '#1E293B', fontWeight: '500' },
    saveBtn: { margin: 16, padding: 12, borderRadius: 12, alignItems: 'center' },
    saveBtnText: { color: '#FFF', fontWeight: '700' },
});

export default SettingsScreen;
