// Enhanced MyJobsScreen with View Applicants and Edit Job
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, ScrollView } from "react-native";
import { AppContext } from "../context/AppContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const MyJobsScreen = () => {
    const { t } = useTranslation();
    const { api, employerToken } = useContext(AppContext);
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get("/api/employer/jobs", {
                headers: { token: employerToken },
            });
            if (response.data.success) {
                setJobs(response.data.jobs || []);
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('jobs.errors.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async (jobId) => {
        setLoadingApplicants(true);
        try {
            const response = await api.get(`/api/employer/job/${jobId}/applicants`, {
                headers: { token: employerToken },
            });
            if (response.data.success) {
                setApplicants(response.data.applicants || []);
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('jobs.errors.fetchApplicantsFailed') || "Failed to load applicants");
        } finally {
            setLoadingApplicants(false);
        }
    };

    const updateApplicantStatus = async (jobId, applicantId, status) => {
        try {
            const response = await api.put(
                `/api/employer/job/${jobId}/applicant/${applicantId}/status`,
                { status },
                { headers: { token: employerToken } }
            );
            if (response.data.success) {
                Alert.alert(t('common.success'), t('common.updated')); // Or generic success
                fetchApplicants(jobId);
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('jobs.errors.updateStatusFailed') || "Failed to update status");
        }
    };

    const handleViewApplicants = (job) => {
        setSelectedJob(job);
        fetchApplicants(job._id);
    };

    const handleEditJob = (job) => {
        navigation.navigate("PostJob", { job });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={[styles.status, item.status === 'active' ? styles.active : styles.inactive]}>
                    {item.status}
                </Text>
            </View>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.type}>{item.jobType}</Text>
            <Text style={styles.applicants}>{t('jobs.applicants')}: {item.applicants?.length || 0}</Text>

            <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleViewApplicants(item)} style={styles.actionButton}>
                    <Text style={styles.viewButton}>{t('myJobs.viewApplicants')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleEditJob(item)} style={styles.actionButton}>
                    <Text style={styles.editButton}>{t('myJobs.editJob')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('myJobs.title')}</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("PostJob")}>
                    <Text style={styles.addButtonText}>+ {t('myJobs.postNew')}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4f46e5" />
            ) : (
                <FlatList
                    data={jobs}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={<Text style={styles.empty}>{t('myJobs.noJobs')}</Text>}
                />
            )}

            {/* Applicants Modal */}
            <Modal
                visible={!!selectedJob}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedJob(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('myJobs.applicantsFor', { title: selectedJob?.title })}</Text>
                            <TouchableOpacity onPress={() => setSelectedJob(null)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            {loadingApplicants ? (
                                <ActivityIndicator size="large" color="#4f46e5" />
                            ) : applicants.length > 0 ? (
                                applicants.map((applicant, index) => (
                                    <View key={index} style={styles.applicantCard}>
                                        <Text style={styles.applicantName}>{applicant.worker?.name || t('myJobs.unknown')}</Text>
                                        <Text style={styles.applicantEmail}>{applicant.worker?.email}</Text>
                                        <Text style={styles.applicantPhone}>{applicant.worker?.phone}</Text>
                                        <Text style={styles.appliedDate}>{t('myJobs.appliedOn', { date: new Date(applicant.appliedAt).toLocaleDateString() })}</Text>

                                        {applicant.status === 'applied' && (
                                            <View style={styles.applicantActions}>
                                                <TouchableOpacity
                                                    onPress={() => updateApplicantStatus(selectedJob._id, applicant.worker?._id || applicant.worker, 'accepted')}
                                                    style={[styles.statusButton, styles.acceptButton]}
                                                >
                                                    <Text style={styles.statusButtonText}>{t('myJobs.accept')}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => updateApplicantStatus(selectedJob._id, applicant.worker?._id || applicant.worker, 'rejected')}
                                                    style={[styles.statusButton, styles.rejectButton]}
                                                >
                                                    <Text style={styles.statusButtonText}>{t('myJobs.reject')}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        {applicant.status === 'accepted' && <Text style={styles.acceptedText}>✓ {t('myJobs.accepted')}</Text>}
                                        {applicant.status === 'rejected' && <Text style={styles.rejectedText}>✗ {t('myJobs.rejected')}</Text>}
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.empty}>{t('common.noData') || "No applicants yet"}</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6", padding: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "bold", color: "#1f2937" },
    addButton: { backgroundColor: "#4f46e5", padding: 10, borderRadius: 8 },
    addButtonText: { color: "white", fontWeight: "bold" },
    card: { backgroundColor: "white", padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    jobTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937", flex: 1 },
    status: { fontSize: 12, fontWeight: "bold", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    active: { backgroundColor: "#dcfce7", color: "#166534" },
    inactive: { backgroundColor: "#f3f4f6", color: "#374151" },
    location: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
    type: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
    applicants: { fontSize: 14, color: "#4f46e5", fontWeight: "600", marginBottom: 8 },
    actions: { flexDirection: "row", gap: 12, marginTop: 8 },
    actionButton: { flex: 1 },
    viewButton: { color: "#2563eb", fontWeight: "600", textAlign: "center", padding: 8, backgroundColor: "#eff6ff", borderRadius: 6 },
    editButton: { color: "#d97706", fontWeight: "600", textAlign: "center", padding: 8, backgroundColor: "#fef3c7", borderRadius: 6 },
    empty: { textAlign: "center", color: "#6b7280", marginTop: 20 },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { width: "90%", maxHeight: "80%", backgroundColor: "white", borderRadius: 12, elevation: 5 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
    modalTitle: { fontSize: 18, fontWeight: "bold", flex: 1 },
    closeButton: { fontSize: 24, color: "#6b7280" },
    modalScroll: { padding: 20 },
    applicantCard: { backgroundColor: "#f9fafb", padding: 16, borderRadius: 8, marginBottom: 12 },
    applicantName: { fontSize: 16, fontWeight: "bold", color: "#1f2937", marginBottom: 4 },
    applicantEmail: { fontSize: 14, color: "#6b7280", marginBottom: 2 },
    applicantPhone: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
    appliedDate: { fontSize: 12, color: "#9ca3af", marginBottom: 8 },
    applicantActions: { flexDirection: "row", gap: 8, marginTop: 8 },
    statusButton: { flex: 1, padding: 10, borderRadius: 6, alignItems: "center" },
    acceptButton: { backgroundColor: "#059669" },
    rejectButton: { backgroundColor: "#dc2626" },
    statusButtonText: { color: "white", fontWeight: "bold" },
    acceptedText: { color: "#059669", fontWeight: "bold", marginTop: 8 },
    rejectedText: { color: "#dc2626", fontWeight: "bold", marginTop: 8 },
});

export default MyJobsScreen;
