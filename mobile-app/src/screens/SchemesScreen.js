import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, TextInput, ActivityIndicator, Linking, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';

const indiaStates = [
    { code: 'AN', name: 'Andaman and Nicobar Islands' },
    { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'AS', name: 'Assam' },
    { code: 'BR', name: 'Bihar' },
    { code: 'CH', name: 'Chandigarh' },
    { code: 'CT', name: 'Chhattisgarh' },
    { code: 'DL', name: 'Delhi' },
    { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu' },
    { code: 'GA', name: 'Goa' },
    { code: 'GJ', name: 'Gujarat' },
    { code: 'HR', name: 'Haryana' },
    { code: 'HP', name: 'Himachal Pradesh' },
    { code: 'JK', name: 'Jammu and Kashmir' },
    { code: 'JH', name: 'Jharkhand' },
    { code: 'KA', name: 'Karnataka' },
    { code: 'KL', name: 'Kerala' },
    { code: 'LA', name: 'Ladakh' },
    { code: 'LD', name: 'Lakshadweep' },
    { code: 'MH', name: 'Maharashtra' },
    { code: 'ML', name: 'Meghalaya' },
    { code: 'MN', name: 'Manipur' },
    { code: 'MP', name: 'Madhya Pradesh' },
    { code: 'MZ', name: 'Mizoram' },
    { code: 'NL', name: 'Nagaland' },
    { code: 'OR', name: 'Odisha' },
    { code: 'PB', name: 'Punjab' },
    { code: 'PY', name: 'Puducherry' },
    { code: 'RJ', name: 'Rajasthan' },
    { code: 'SK', name: 'Sikkim' },
    { code: 'TG', name: 'Telangana' },
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'TR', name: 'Tripura' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'UT', name: 'Uttarakhand' },
    { code: 'WB', name: 'West Bengal' },
];

const SchemesScreen = () => {
    const { t } = useTranslation();
    const { api } = useContext(AppContext);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStateCode, setSelectedStateCode] = useState('');

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            const res = await api.get('/api/schemes?limit=10000');
            const items = res.data?.data || [];
            setSchemes(items);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredSchemes = schemes.filter(s => {
        // Search Filter
        const q = searchQuery.toLowerCase();
        const matchesSearch = (s.name && s.name.toLowerCase().includes(q)) ||
            (s.short_description && s.short_description.toLowerCase().includes(q));

        // State Filter
        let matchesState = true;
        if (selectedStateCode) {
            const state = indiaStates.find(st => st.code === selectedStateCode);
            const stateName = state ? state.name.toLowerCase() : '';
            const schemeStateName = s.state?.name?.toLowerCase() || '';
            const schemeScope = s.scope || 'user'; // default

            // Logic: Show if Central scope OR matches state name
            matchesState = schemeScope === 'central' || schemeStateName === stateName;
        }

        return matchesSearch && matchesState;
    });

    const openLink = (url) => {
        Linking.openURL(url).catch(err => Alert.alert(t('common.error'), "Could not open link"));
    };

    const handleGoogleSearch = (type) => {
        if (!selectedStateCode) {
            Alert.alert(t('schemes.selectState'), "Please select a state first");
            return;
        }
        const state = indiaStates.find(s => s.code === selectedStateCode);
        const query = `${state.name} ${type} certificate apply`;
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        openLink(url);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.schemeName}>{item.name}</Text>
                <Text style={styles.schemeScope}>{item.scope}{item.state?.name ? ` • ${item.state.name}` : ''}</Text>
            </View>
            <Text style={styles.description} numberOfLines={2}>
                {item.short_description || item.eligibility_text || t('schemes.noDescription')}
            </Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => {
                        setSelectedScheme(item);
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.detailsButtonText}>{t('schemes.details')}</Text>
                </TouchableOpacity>
                {item.apply_url && (
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={() => openLink(item.apply_url)}
                    >
                        <Text style={styles.applyButtonText}>{t('schemes.apply')}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>{t('schemes.title')}</Text>

            <View style={styles.controls}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('schemes.searchPlaceholder')}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedStateCode}
                        onValueChange={(itemValue) => setSelectedStateCode(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label={t('schemes.allStates')} value="" />
                        {indiaStates.map((s) => (
                            <Picker.Item key={s.code} label={s.name} value={s.code} />
                        ))}
                    </Picker>
                </View>

                {/* Service Buttons */}
                <View style={styles.serviceButtons}>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.serviceButton, { backgroundColor: '#eab308' }]} onPress={() => openLink('https://uidai.gov.in')}>
                            <Text style={styles.serviceButtonText}>{t('schemes.updateAadhaar')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.serviceButton, { backgroundColor: '#2563eb' }]} onPress={() => openLink('https://www.nvsp.in/')}>
                            <Text style={styles.serviceButtonText}>{t('schemes.updateVoter')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.serviceButton, { backgroundColor: selectedStateCode ? '#16a34a' : '#9ca3af' }]}
                            onPress={() => handleGoogleSearch('caste')}
                            disabled={!selectedStateCode}
                        >
                            <Text style={styles.serviceButtonText}>{t('schemes.applyCaste')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.serviceButton, { backgroundColor: selectedStateCode ? '#16a34a' : '#9ca3af' }]}
                            onPress={() => handleGoogleSearch('income')}
                            disabled={!selectedStateCode}
                        >
                            <Text style={styles.serviceButtonText}>{t('schemes.applyIncome')}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.tipText}>{t('schemes.tip')}</Text>
                </View>
            </View>

            <View style={{ flex: 1 }}> {/* List Container */}
                {loading ? (
                    <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={filteredSchemes}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={<Text style={styles.empty}>{t('schemes.noFound')}</Text>}
                    />
                )}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedScheme?.name}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButton}>{t('schemes.close')}</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalScope}>{selectedScheme?.scope}{selectedScheme?.state?.name ? ` • ${selectedScheme.state.name}` : ''}</Text>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{t('schemes.about')}</Text>
                                <Text style={styles.sectionText}>{selectedScheme?.full_description || selectedScheme?.short_description || t('schemes.noDetailed')}</Text>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{t('schemes.eligibility')}</Text>
                                <Text style={styles.sectionText}>{selectedScheme?.eligibility_text || t('schemes.notSpecified')}</Text>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{t('schemes.documentsRequired')}</Text>
                                {selectedScheme?.documents_required && selectedScheme.documents_required.length > 0 ? (
                                    selectedScheme.documents_required.map((d, i) => (
                                        <Text key={i} style={styles.bulletPoint}>• {d}</Text>
                                    ))
                                ) : (
                                    <Text style={styles.sectionText}>{t('schemes.notSpecified')}</Text>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6', padding: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1f2937' },
    controls: { marginBottom: 16 },
    searchInput: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#d1d5db' },
    pickerContainer: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: 'white', marginBottom: 12 },
    picker: { height: 50 },
    serviceButtons: { marginTop: 4 },
    buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    serviceButton: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    serviceButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
    tipText: { fontSize: 10, color: '#6b7280', fontStyle: 'italic', textAlign: 'center' },

    card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    cardHeader: { marginBottom: 8 },
    schemeName: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    schemeScope: { fontSize: 14, color: '#6b7280', marginTop: 2 },
    description: { fontSize: 14, color: '#4b5563', marginBottom: 12, lineHeight: 20 },
    actions: { flexDirection: 'row', gap: 10 },
    detailsButton: { backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
    detailsButtonText: { color: 'white', fontWeight: '600' },
    applyButton: { backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
    applyButtonText: { color: 'white', fontWeight: '600' },
    empty: { textAlign: 'center', color: '#6b7280', marginTop: 20 },

    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 12, maxHeight: '80%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', flex: 1 },
    closeButton: { color: '#6b7280', fontWeight: '600' },
    modalBody: { padding: 16 },
    modalScope: { fontSize: 16, color: '#4b5563', marginBottom: 16 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1f2937' },
    sectionText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
    bulletPoint: { fontSize: 14, color: '#4b5563', marginLeft: 8, marginBottom: 4 },
});

export default SchemesScreen;
