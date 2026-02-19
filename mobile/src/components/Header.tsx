import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TouchableWithoutFeedback, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, User, LogOut, Settings, Palette } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

import { HeaderNotification } from './HeaderNotification';

interface HeaderProps {
    title: string;
    showBack?: boolean;
    showNotification?: boolean;
    rightElement?: React.ReactNode;
}

export const Header = ({ title, showBack = true, showNotification = false, rightElement }: HeaderProps) => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();
    const { theme } = useTheme();
    const [menuVisible, setMenuVisible] = useState(false);

    const handleLogout = async () => {
        setMenuVisible(false);
        await signOut();
    };

    return (
        <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={styles.header}>
            <View style={styles.container}>
                <View style={styles.left}>
                    {showBack && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <ChevronLeft color="#FFF" size={24} />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <View style={styles.right}>
                    {rightElement}

                    {showNotification && (
                        <HeaderNotification navigation={navigation} />
                    )}

                    <TouchableOpacity
                        onPress={() => setMenuVisible(true)}
                        style={styles.profileButton}
                        activeOpacity={0.8}
                    >
                        <View style={styles.avatarMini}>
                            <Text style={styles.avatarText}>{user?.full_name?.charAt(0) || 'A'}</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Dropdown Menu Modal */}
                    <Modal
                        visible={menuVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setMenuVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                            <View style={styles.modalOverlay}>
                                <View style={styles.menuContainer}>
                                    <View style={styles.menuArrow} />

                                    {/* Themes Option */}
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={() => { setMenuVisible(false); (navigation as any).navigate('Themes'); }}
                                    >
                                        <Palette size={20} color="#475569" />
                                        <Text style={styles.menuText}>Themes</Text>
                                    </TouchableOpacity>

                                    {/* Settings Option */}
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={() => { setMenuVisible(false); (navigation as any).navigate('Settings'); }}
                                    >
                                        <Settings size={20} color="#475569" />
                                        <Text style={styles.menuText}>Settings</Text>
                                    </TouchableOpacity>

                                    <View style={styles.divider} />

                                    {/* Logout Option */}
                                    <TouchableOpacity
                                        style={[styles.menuItem, styles.logoutItem]}
                                        onPress={handleLogout}
                                    >
                                        <LogOut size={20} color="#EF4444" />
                                        <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 55,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 1000,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    left: {
        width: 40,
        alignItems: 'flex-start',
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        minWidth: 40,
        zIndex: 2000,
    },
    backButton: {
        padding: 4,
        marginLeft: -8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)'
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        flex: 1,
        textAlign: 'center',
    },
    profileButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    avatarMini: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '700',
    },
    // Menu Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    menuContainer: {
        marginTop: Platform.OS === 'ios' ? 100 : 90,
        marginRight: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 8,
        width: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    menuArrow: {
        position: 'absolute',
        top: -8,
        right: 18,
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#FFFFFF',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 12,
    },
    menuText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 4,
    },
    logoutItem: {
        marginTop: 2,
    },
    logoutText: {
        color: '#EF4444',
    },
});
