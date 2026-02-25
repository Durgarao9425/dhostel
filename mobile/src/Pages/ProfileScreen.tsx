import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Modal,
    LayoutAnimation,
    Platform,
    UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    User,
    Settings,
    Wallet,
    TrendingUp,
    FileText,
    ChevronRight,
    LogOut,
    Globe,
    Bell,
    BedDouble,
    Palette,
    ChevronLeft,
    ShieldCheck,
    Briefcase,
    Settings2,
    Wrench,
    Trash2
} from 'lucide-react-native';

import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, themes, ThemeId } from '../../contexts/ThemeContext';
import { HeaderNotification } from '../components/HeaderNotification';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
];

const T = {
    en: {
        superAdmin: 'Super Admin',
        hostelManager: 'Hostel Manager',
        income: 'Total Income',
        expenses: 'Expenses',
        occupancy: 'Occupancy',
        reports: 'Reports',
        personalInfo: 'Personal Info',
        notifications: 'Notifications',
        language: 'Language',
        signOut: 'Sign Out',
        version: 'Version 1.0.0'
    },
    hi: {
        superAdmin: 'सुपर व्यवस्थापक',
        hostelManager: 'बॉयज हॉस्टल मैनेजर',
        income: 'कुल आय',
        expenses: 'खर्चे',
        occupancy: 'कब्ज़ा',
        reports: 'रिपोर्ट',
        personalInfo: 'व्यक्तिगत जानकारी',
        notifications: 'सूचनाएं',
        language: 'भाषा',
        signOut: 'साइन आउट',
        version: 'संस्करण 1.0.0'
    },
    te: {
        superAdmin: 'సూపర్ అడ్మిన్',
        hostelManager: 'హాస్టల్ మేనేజర్',
        income: 'మొత్తం ఆదాయం',
        expenses: 'ఖర్చులు',
        occupancy: 'సామర్థ్యం',
        reports: 'నివేదికలు',
        personalInfo: 'వ్యక్తిగత సమాచారం',
        notifications: 'నోటిఫికేషన్లు',
        language: 'భాష',
        signOut: 'బయటకు వెళ్ళు',
        version: 'వెర్షన్ 1.0.0'
    }
};

const ProfileScreen = ({ navigation }: any) => {
    const { signOut, user } = useAuth();
    const { i18n } = useTranslation();
    const { theme, themeId, setThemeId } = useTheme();
    const [showLangModal, setShowLangModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [stats, setStats] = useState<any>(null);

    // TAB STATE
    const [activeTab, setActiveTab] = useState<'Personal' | 'Business'>('Personal');

    const currentLang = (i18n.language || 'en').split('-')[0];
    const t = (T as any)[currentLang] || T['en'];

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard/owner-stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Profile fetch stats error:', error);
        }
    };

    useFocusEffect(React.useCallback(() => { fetchStats(); }, []));

    const handleLogout = async () => {
        await signOut();
        navigation.replace('Login');
    };

    const handleTabChange = (tab: 'Personal' | 'Business') => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveTab(tab);
    };

    // ── Components ─────────────────────────────────────────────────────

    const GridTool = ({ icon: Icon, title, value, color, bg, onPress }: any) => (
        <TouchableOpacity style={styles.toolCard} onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.toolIconWrap, { backgroundColor: bg }]}>
                <Icon color={color} size={24} />
            </View>
            <View style={styles.toolText}>
                <Text style={styles.toolLabel}>{title}</Text>
                <Text style={[styles.toolValue, { color }]}>{value}</Text>
            </View>
        </TouchableOpacity>
    );

    const MenuItem = ({ icon: Icon, title, subtitle, onPress, iconBg, titleColor, rightEl }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.menuIconContainer, { backgroundColor: iconBg || '#F8FAFC' }]}>
                <Icon color={titleColor || '#64748B'} size={20} />
            </View>
            <View style={styles.menuText}>
                <Text style={[styles.menuTitle, titleColor ? { color: titleColor } : {}]}>{title}</Text>
                {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
            </View>
            {rightEl !== undefined ? rightEl : <ChevronRight color="#CBD5E1" size={18} />}
        </TouchableOpacity>
    );

    const occupancyCount = stats ? `${stats.rooms.occupied_beds}/${stats.rooms.total_beds}` : '-/-';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ── POWER HEADER ── */}
            <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassBtn}>
                        <ChevronLeft color="#FFFFFF" size={24} />
                    </TouchableOpacity>
                    <HeaderNotification navigation={navigation} />
                </View>

                <View style={styles.profileBrief}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarMain}><User color={theme.primary} size={40} /></View>
                        <View style={styles.verifiedBadge}><ShieldCheck color="#FFF" size={12} /></View>
                    </View>
                    <View style={styles.nameHeader}>
                        <Text style={styles.ownerName}>{user?.full_name || t.superAdmin}</Text>
                        <Text style={styles.hostelSub}>{user?.hostel_name || t.hostelManager}</Text>
                    </View>
                </View>

                {/* ── SEGMENTED TABS ── */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Personal' && styles.activeTab]}
                        onPress={() => handleTabChange('Personal')}
                    >
                        <Settings2 color={activeTab === 'Personal' ? theme.primary : '#FFF'} size={18} />
                        <Text style={[styles.tabText, activeTab === 'Personal' ? { color: theme.primary } : { color: '#FFF' }]}>Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Business' && styles.activeTab]}
                        onPress={() => handleTabChange('Business')}
                    >
                        <Briefcase color={activeTab === 'Business' ? theme.primary : '#FFF'} size={18} />
                        <Text style={[styles.tabText, activeTab === 'Business' ? { color: theme.primary } : { color: '#FFF' }]}>Toolkit</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.mainScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {activeTab === 'Business' ? (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionLabel}>OPERATIONS & ANALYTICS</Text>
                        <View style={styles.toolGrid}>
                            <GridTool
                                icon={FileText} title={t.reports} value="Reports"
                                color="#8B5CF6" bg="#F5F3FF" onPress={() => navigation.navigate('Reports')}
                            />
                            <GridTool
                                icon={Wrench} title="Maintenance" value="Issues"
                                color="#EAB308" bg="#FEF9C3" onPress={() => navigation.navigate('Maintenance')}
                            />
                        </View>
                    </View>
                ) : (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionLabel}>ACCOUNT SETTINGS</Text>
                        <View style={styles.menuCard}>
                            <MenuItem icon={User} title={t.personalInfo} subtitle="Update your profile details" onPress={() => navigation.navigate('PersonalInfo')} />
                            <View style={styles.innerDivider} />
                            <MenuItem icon={Settings} title="Settings" subtitle="App configuration, Fonts" onPress={() => navigation.navigate('Settings')} />
                            <View style={styles.innerDivider} />
                            <MenuItem icon={Bell} title={t.notifications} subtitle="Manage alert preferences" onPress={() => navigation.navigate('Notifications')} />
                        </View>

                        <Text style={styles.sectionLabel}>APP CUSTOMIZATION</Text>
                        <View style={styles.menuCard}>
                            <MenuItem
                                icon={Globe} title={t.language} iconBg="#E0F2FE"
                                rightEl={<View style={styles.langPill}><Text style={styles.langPillText}>{currentLang.toUpperCase()}</Text></View>}
                                onPress={() => setShowLangModal(true)}
                            />
                            <View style={styles.innerDivider} />
                            <MenuItem
                                icon={Palette} title="App Theme" iconBg="#F3E5F5"
                                rightEl={<View style={[styles.themePill, { backgroundColor: theme.primary }]}></View>}
                                onPress={() => setShowThemeModal(true)}
                            />
                        </View>

                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <LogOut color="#EF4444" size={20} />
                            <Text style={styles.logoutText}>{t.signOut}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.footerVersion}>{t.version}</Text>
                <View style={styles.bottomSpace} />
            </ScrollView>

            <Modal
                visible={showLangModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLangModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Select Language</Text>
                        {LANGUAGES.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[styles.langOption, currentLang === lang.code && styles.activeLangOption]}
                                onPress={() => {
                                    i18n.changeLanguage(lang.code);
                                    setShowLangModal(false);
                                }}
                            >
                                <Text style={[styles.langText, currentLang === lang.code && styles.activeLangText]}>
                                    {lang.label}
                                </Text>
                                {currentLang === lang.code && <View style={styles.activeDot} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowLangModal(false)}>
                            <Text style={styles.closeBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showThemeModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowThemeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Choose Theme</Text>
                        <View style={styles.themeGrid}>
                            {Object.values(themes).map((tItem: any) => (
                                <TouchableOpacity
                                    key={tItem.id}
                                    style={[styles.themeItem, themeId === tItem.id && { borderColor: tItem.primary, borderWidth: 2 }]}
                                    onPress={() => {
                                        setThemeId(tItem.id);
                                        setShowThemeModal(false);
                                    }}
                                >
                                    <View style={[styles.themeCircle, { backgroundColor: tItem.primary }]} />
                                    <Text style={styles.themeName}>{tItem.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowThemeModal(false)}>
                            <Text style={styles.closeBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 50, paddingBottom: 25, paddingHorizontal: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    glassBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    profileBrief: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    avatarWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', padding: 4 },
    avatarMain: { flex: 1, borderRadius: 40, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
    verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#10B981', borderRadius: 12, padding: 4, borderWidth: 2, borderColor: '#FFF' },
    nameHeader: { marginLeft: 16 },
    ownerName: { fontSize: 20, fontWeight: '900', color: '#FFF' },
    hostelSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

    tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.1)', padding: 4, borderRadius: 16 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12, flexDirection: 'row', justifyContent: 'center', gap: 8 },
    activeTab: { backgroundColor: '#FFF' },
    tabText: { fontSize: 12, fontWeight: '800' },

    mainScroll: { flex: 1, marginTop: -15 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
    tabContent: {},
    sectionLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', marginBottom: 12, marginLeft: 4, letterSpacing: 1 },

    // Toolkit Grid
    toolGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    toolCard: { width: (width - 44) / 2, backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
    toolIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    toolText: { marginLeft: 12, flex: 1 },
    toolLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
    toolValue: { fontSize: 14, fontWeight: '900', marginTop: 2 },

    menuCard: { backgroundColor: '#FFF', borderRadius: 24, marginBottom: 20, paddingVertical: 4, elevation: 1 },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    menuIconContainer: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    menuText: { flex: 1 },
    menuTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    menuSubtitle: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    innerDivider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 65 },

    langPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    langPillText: { color: '#64748B', fontSize: 10, fontWeight: '900' },
    themePill: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#F1F5F9' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', padding: 16, borderRadius: 20, marginBottom: 20 },
    logoutText: { marginLeft: 10, color: '#EF4444', fontWeight: '800', fontSize: 15 },
    footerVersion: { textAlign: 'center', color: '#CBD5E1', fontSize: 11 },
    bottomSpace: { height: 120 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFF', width: '100%', borderRadius: 24, padding: 24, elevation: 5 },
    modalHeader: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 20, textAlign: 'center' },

    langOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, backgroundColor: '#F8FAFC', marginBottom: 8 },
    activeLangOption: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#3B82F6' },
    langText: { fontSize: 15, fontWeight: '600', color: '#475569', flex: 1 },
    activeLangText: { color: '#3B82F6', fontWeight: '800' },
    activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },

    themeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
    themeItem: { width: '47%', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
    themeCircle: { width: 40, height: 40, borderRadius: 20, marginBottom: 8 },
    themeName: { fontSize: 12, fontWeight: '600', color: '#475569' },

    closeBtn: { marginTop: 12, alignItems: 'center', padding: 12 },
    closeBtnText: { color: '#94A3B8', fontWeight: '700' },
});