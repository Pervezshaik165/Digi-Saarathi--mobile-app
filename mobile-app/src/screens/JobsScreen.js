import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const JobsScreen = () => {
    const { t } = useTranslation();
    const { api, userToken, userProfile } = useContext(AppContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/api/public/jobs');
            if (res.data.success) setJobs(res.data.jobs || []);
        } catch (err) {
            Alert.alert(t('common.error'), t('jobs.errors.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    const applyToJob = async (jobId) => {
        if (!userToken) {
            Alert.alert(t('common.info'), t('jobs.errors.loginToApply'));
            return;
        }
        try {
            const res = await api.post(`/api/public/jobs/${jobId}/apply`, {}, { headers: { token: userToken } });
            if (res.data.success) {
                Alert.alert(t('jobs.success.applied'));
                await fetchJobs();
                setModalVisible(false);
                setSelectedJob(null);
            }
        } catch (err) {
            Alert.alert(t('common.error'), err.response?.data?.message || t('jobs.errors.applyFailed'));
        }
    };

    const renderJobItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <Text style={styles.company}>{item.employer?.company} • {item.location}</Text>
                </View>
                <View style={styles.badgeContainer}>
                    <Text style={[styles.badge, item.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.tags}>
                <Text style={styles.tag}>{item.jobType}</Text>
                {item.salaryRange?.min && item.salaryRange?.max && (
                    <Text style={styles.tag}>₹{item.salaryRange.min} - ₹{item.salaryRange.max}</Text>
                )}
            </View>

            <TouchableOpacity
                style={styles.viewButton}
                onPress={() => {
                    setSelectedJob(item);
                    setModalVisible(true);
                }}
            >
                <Text style={styles.viewButtonText}>{t('jobs.view')}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderModalContent = () => {
        if (!selectedJob) return null;

        const myApplication = (selectedJob.applicants || []).find(a => String(a.worker) === String(userProfile?._id));

        return (
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedJob.title}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeButton}>{t('jobs.close')}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                    <Text style={styles.modalCompany}>{selectedJob.employer?.company} • {selectedJob.location}</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('jobs.description')}</Text>
                        <Text style={styles.sectionText}>{selectedJob.description || t('jobs.noDescription')}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('jobs.requiredSkills')}</Text>
                        <View style={styles.tags}>
                            {selectedJob.requiredSkills?.map((s, i) => (
                                <Text key={i} style={styles.tag}>{s}</Text>
                            )) || <Text style={styles.sectionText}>{t('jobs.noSkills')}</Text>}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('jobs.details')}</Text>
                        <Text style={styles.sectionText}>{t('jobs.type')}: {selectedJob.jobType}</Text>
                        <Text style={styles.sectionText}>{t('jobs.experience')}: {selectedJob.experience}</Text>
                        <Text style={styles.sectionText}>{t('jobs.posted')}: {new Date(selectedJob.createdAt).toLocaleDateString()}</Text>
                    </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                    {(() => {
                        if (!myApplication) {
                            return (
                                <TouchableOpacity style={styles.applyButton} onPress={() => applyToJob(selectedJob._id)}>
                                    <Text style={styles.applyButtonText}>{t('jobs.apply')}</Text>
                                </TouchableOpacity>
                            );
                        }
                        if (myApplication.status === 'applied') {
                            return <Text style={styles.statusText}>{t('jobs.applied')}</Text>;
                        }
                        if (myApplication.status === 'accepted') {
                            return <Text style={[styles.statusText, { color: 'green' }]}>{t('jobs.accepted')}</Text>;
                        }
                        if (myApplication.status === 'rejected') {
                            return (
                                <View>
                                    <Text style={[styles.statusText, { color: 'red' }]}>{t('jobs.rejected')}</Text>
                                    <TouchableOpacity style={[styles.applyButton, { marginTop: 5 }]} onPress={() => applyToJob(selectedJob._id)}>
                                        <Text style={styles.applyButtonText}>Re-Apply</Text> {/* Key might be missing for Re-Apply, using valid English for now or I add a key */}
                                    </TouchableOpacity>
                                </View>
                            );
                        }
                    })()}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>{t('jobs.title')}</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#4f46e5" />
            ) : (
                <FlatList
                    data={jobs}
                    renderItem={renderJobItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={<Text style={styles.empty}>{t('jobs.noJobs')}</Text>}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    {renderModalContent()}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6', padding: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' },
    card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    jobTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    company: { fontSize: 14, color: '#6b7280', marginTop: 2 },
    badgeContainer: { marginLeft: 8 },
    badge: { fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
    activeBadge: { backgroundColor: '#dcfce7', color: '#166534' },
    inactiveBadge: { backgroundColor: '#f3f4f6', color: '#374151' },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    tag: { backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, overflow: 'hidden' },
    viewButton: { backgroundColor: '#4f46e5', padding: 10, borderRadius: 8, alignItems: 'center' },
    viewButtonText: { color: 'white', fontWeight: '600' },
    empty: { textAlign: 'center', color: '#6b7280', marginTop: 20 },

    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 12, maxHeight: '80%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', flex: 1 },
    closeButton: { color: '#6b7280', fontWeight: '600' },
    modalBody: { padding: 16 },
    modalCompany: { fontSize: 16, color: '#4b5563', marginBottom: 16 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1f2937' },
    sectionText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
    modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', alignItems: 'center' },
    applyButton: { backgroundColor: '#4f46e5', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, width: '100%', alignItems: 'center' },
    applyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    statusText: { fontSize: 16, fontWeight: 'bold', color: '#6b7280' }
});

export default JobsScreen;
