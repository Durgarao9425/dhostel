import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Platform } from 'react-native';
import { User, LogOut, Palette, ChevronRight, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, themes, ThemeId } from '../../contexts/ThemeContext';

export const ProfileMenu = () => {
    const navigation = useNavigation<any>();
    const { user, signOut } = useAuth();
    const { theme, themeId, setThemeId } = useTheme();
    const [menuVisible, setMenuVisible] = useState(false);
    const [showThemes, setShowThemes] = useState(false);

    const handleLogout = async () => {
        setMenuVisible(false);
        await signOut();
    };

    const toggleTheme = (id: ThemeId) => {
        setThemeId(id);
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                style={styles.profileButton}
                activeOpacity={0.8}
            >
                <View style={[styles.avatarMini, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.avatarText, { color: theme.primary }]}>
                        {user?.full_name?.charAt(0) || 'A'}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Modal commented out as we navigate directly to Profile
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.menuContainer, { backgroundColor: theme.cardBg }]}>
                                
                                <View style={[styles.menuArrow, { borderBottomColor: theme.cardBg }]} />

                                
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
                                    <Text style={styles.userRole}>{user?.role || 'Student'}</Text>
                                </View>
                                <View style={styles.divider} />

                                {!showThemes ? (
                                    <>
                                        
                                        <TouchableOpacity
                                            style={styles.menuItem}
                                            onPress={() => { setMenuVisible(false); navigation.navigate('Profile'); }}
                                        >
                                            <User size={18} color="#475569" />
                                            <Text style={styles.menuText}>My Profile</Text>
                                        </TouchableOpacity>

                                        
                                        <TouchableOpacity
                                            style={styles.menuItem}
                                            onPress={() => setShowThemes(true)}
                                        >
                                            <Palette size={18} color="#475569" />
                                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={styles.menuText}>Color Theme</Text>
                                                <ChevronRight size={14} color="#94A3B8" />
                                            </View>
                                        </TouchableOpacity>

                                        <View style={styles.divider} />

                                        
                                        <TouchableOpacity
                                            style={[styles.menuItem]}
                                            onPress={handleLogout}
                                        >
                                            <LogOut size={18} color="#EF4444" />
                                            <Text style={[styles.menuText, { color: '#EF4444' }]}>Logout</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        
                                        <TouchableOpacity
                                            style={[styles.menuItem, { paddingVertical: 10 }]}
                                            onPress={() => setShowThemes(false)}
                                        >
                                            <ChevronRight size={16} color="#475569" style={{ transform: [{ rotate: '180deg' }] }} />
                                            <Text style={[styles.menuText, { marginLeft: 4 }]}>Back</Text>
                                        </TouchableOpacity>
                                        <View style={styles.divider} />

                                       
                                        {Object.values(themes).map((t) => (
                                            <TouchableOpacity
                                                key={t.id}
                                                style={styles.menuItem}
                                                onPress={() => toggleTheme(t.id as ThemeId)}
                                            >
                                                <View style={[styles.colorDot, { backgroundColor: t.primary }]} />
                                                <Text style={[styles.menuText, { flex: 1 }]}>{t.name}</Text>
                                                {themeId === t.id && <Check size={16} color="#10B981" />}
                                            </TouchableOpacity>
                                        ))}
                                    </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            */}
        </>
    );
};


const styles = StyleSheet.create({
    profileButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
    },
    avatarMini: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 18, fontWeight: '800' }, // Increased font slightly
    modalOverlay: {
        flex: 1, backgroundColor: 'transparent',
        justifyContent: 'flex-start', alignItems: 'flex-end',
    },
    menuContainer: {
        marginTop: Platform.OS === 'ios' ? 60 : 60,
        marginRight: 20,
        borderRadius: 16,
        paddingVertical: 12,
        width: 200,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    },
    menuArrow: {
        position: 'absolute', top: -8, right: 12,
        width: 0, height: 0,
        borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 8,
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
    },
    userInfo: { paddingHorizontal: 16, paddingBottom: 8 },
    userName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    userRole: { fontSize: 11, color: '#94A3B8' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, gap: 10 },
    menuText: { fontSize: 13, fontWeight: '600', color: '#334155' },
    colorDot: { width: 12, height: 12, borderRadius: 6 },
});
