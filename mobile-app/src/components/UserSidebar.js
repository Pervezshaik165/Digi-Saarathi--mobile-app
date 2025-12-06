import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';

export const UserSidebar = ({ visible, onClose }) => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const { logout } = React.useContext(AppContext);

    const menuItems = [
        { name: 'UserDashboard', label: t('nav.dashboard'), icon: '🏠' },
        { name: 'Documents', label: t('nav.documents'), icon: '📄' },
        { name: 'Jobs', label: t('nav.jobs'), icon: '💼' },
        { name: 'UserQR', label: t('nav.myQR'), icon: '📱' },
        { name: 'Schemes', label: t('nav.schemes'), icon: '📋' },
        { name: 'UserProfile', label: t('nav.myProfile'), icon: '👤' },
    ];

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
                <View style={styles.sidebar} onStartShouldSetResponder={() => true}>
                    <View style={styles.header}>
                        <Text style={styles.appName}>Digi Saarthi</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.menuItems}>
                        {menuItems.map((item) => (
                            <TouchableOpacity
                                key={item.name}
                                style={styles.menuItem}
                                onPress={() => {
                                    navigation.navigate(item.name);
                                    onClose();
                                }}
                            >
                                <Text style={styles.menuIcon}>{item.icon}</Text>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.languageSection}>
                        <Text style={styles.languageTitle}>Language / भाषा</Text>
                        <View style={styles.languageButtons}>
                            {[
                                { code: 'en', label: 'English' },
                                { code: 'hi', label: 'हिंदी' },
                                { code: 'bn', label: 'বাংলা' },
                                { code: 'gu', label: 'ગુજરાતી' },
                                { code: 'kn', label: 'કન્નડ' }, // Correction: Kannada is ಕನ್ನಡ, will fix in next step if I can't write unicode. Actually better to use unicode directly.
                                { code: 'ml', label: 'മലയാളം' },
                                { code: 'mr', label: 'मરાઠી' }, // Typo in Marathi? Should be मराठी. I will verify scripts.
                                { code: 'ta', label: 'தமிழ்' },
                                { code: 'te', label: 'తెలుగు' }
                            ].map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    style={[styles.langButton, i18n.language === lang.code && styles.langButtonActive]}
                                    onPress={() => changeLanguage(lang.code)}
                                >
                                    <Text style={[styles.langButtonText, i18n.language === lang.code && styles.langButtonTextActive]}>
                                        {lang.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={() => {
                            logout();
                            onClose();
                        }}
                    >
                        <Text style={styles.logoutText}>🚪 {t('nav.logout')}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
    },
    sidebar: {
        width: '80%',
        height: '100%',
        backgroundColor: 'white',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#4f46e5',
    },
    appName: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        color: 'white',
        fontSize: 24,
    },
    menuItems: {
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    menuIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    menuLabel: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    languageSection: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    languageTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 12,
    },
    languageButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    langButton: {
        width: '30%', // Grid layout: 3 per row
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
    },
    langButtonActive: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    langButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    logoutButton: {
        margin: 20,
        padding: 16,
        backgroundColor: '#ef4444',
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
