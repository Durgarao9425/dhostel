import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { X, Check, Globe } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { availableLanguages, changeLanguage, getCurrentLanguage } from '../i18n';

export const LanguageSelector = () => {
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

    const handleLanguageChange = async (languageCode: string) => {
        await changeLanguage(languageCode);
        setCurrentLang(languageCode);
        setModalVisible(false);
    };

    const getCurrentLanguageName = () => {
        const lang = availableLanguages.find(l => l.code === currentLang);
        return lang ? lang.nativeName : 'English';
    };

    return (
        <>
            <TouchableOpacity
                style={styles.languageButton}
                onPress={() => setModalVisible(true)}
            >
                <Globe color="#667eea" size={20} />
                <Text style={styles.languageButtonText}>{getCurrentLanguageName()}</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('profile.selectLanguage')}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X color="#666" size={24} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={availableLanguages}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.languageItem,
                                        currentLang === item.code && styles.activeLanguageItem,
                                    ]}
                                    onPress={() => handleLanguageChange(item.code)}
                                >
                                    <View>
                                        <Text style={styles.languageName}>{item.nativeName}</Text>
                                        <Text style={styles.languageSubtext}>{item.name}</Text>
                                    </View>
                                    {currentLang === item.code && (
                                        <Check color="#667eea" size={24} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    languageButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
    },
    languageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#F8FAFC',
    },
    activeLanguageItem: {
        backgroundColor: '#EEF2FF',
        borderWidth: 2,
        borderColor: '#667eea',
    },
    languageName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    languageSubtext: {
        fontSize: 13,
        color: '#64748B',
    },
});
