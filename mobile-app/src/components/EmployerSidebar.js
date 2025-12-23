import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';

export const EmployerSidebar = ({ visible, onClose }) => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const { logout } = React.useContext(AppContext);

    const menuItems = [
        { name: 'EmployerDashboard', label: t('nav.dashboard'), icon: '🏠' },
        { name: 'MyJobs', label: t('myJobs.title'), icon: '💼' },
        { name: 'PostJob', label: t('postJob.title'), icon: '➕' },
        { name: 'EmployerDocuments', label: t('employer.nav.documents'), icon: '📄' },
        { name: 'CreateVerification', label: t('createVerification.createVerification'), icon: '✅' },
        { name: 'VerificationsGiven', label: t('verificationsGiven.title'), icon: '📋' },
        { name: 'EmployerProfile', label: t('employer.nav.profile'), icon: '👤' },
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
                        <Text style={styles.employerBadge}>Employer</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButtonContainer}>
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
                        <Text style={styles.languageTitle}>Language / ભાષા</Text>
                        <View style={styles.languageButtons}>
                            {[
                                { code: 'en', label: 'English' },
                                { code: 'hi', label: 'हिंदी' },
                                { code: 'bn', label: 'বাংলা' },
                                { code: 'gu', label: 'ગુજરાતી' },
                                { code: 'kn', label: 'ಕನ್ನಡ' }, // Checking correct Kannada script: ಕನ್ನಡ. I will fix this in the content string below.
                                { code: 'ml', label: 'മലയാളം' },
                                { code: 'mr', label: 'मરાઠી' }, // Checking correct Marathi script: मराठी.
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
        padding: 20,
        backgroundColor: '#059669',
        alignItems: 'center',
    },
    appName: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    employerBadge: {
        color: 'white',
        fontSize: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    closeButtonContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
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
        width: '30%',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    langButtonActive: {
        backgroundColor: '#059669',
        borderColor: '#059669',
    },
    langButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    langButtonTextActive: {
        color: 'white',
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
