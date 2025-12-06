import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, ScrollView } from "react-native";
import { AppContext } from "../context/AppContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from 'expo-clipboard';
import { FRONTEND_URL } from "../api/config";
import { useTranslation } from "react-i18next";

const VerificationsGivenScreen = () => {
    const { t } = useTranslation();
    const { api, employerToken } = useContext(AppContext);
    const navigation = useNavigation();
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVerification, setSelectedVerification] = useState(null);

    useEffect(() => {
        fetchVerifications();
    }, []);

    const fetchVerifications = async () => {
        try {
            const response = await api.get("/api/employer/verifications", {
                headers: { token: employerToken },
            });
            if (response.data.success) {
                setVerifications(response.data.verifications || []);
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('documents.errors.fetchFailed') || "Failed to load verifications");
        } finally {
            setLoading(false);
        }
    };

    const copyVerificationLink = async (qrToken) => {
        const link = `${FRONTEND_URL}/verify/${qrToken}`;
        await Clipboard.setStringAsync(link);
        Alert.alert(t('common.success'), t('verificationsGiven.linkCopied'));
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.workerName}>{item.worker?.name || item.employeeName}</Text>
                <View style={{ flexDirection: 'row' }}>
                    {[...Array(5)].map((_, i) => (
                        <Text key={i} style={{ color: i < item.rating ? '#fbbf24' : '#d1d5db', fontSize: 16 }}>★</Text>
                    ))}
                </View>
            </View>
            <Text style={styles.jobRole}>{item.jobRole}</Text>
            <Text style={styles.dates}>
                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
            </Text>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => setSelectedVerification(item)}>
                    <Text style={styles.viewButton}>{t('verificationsGiven.viewDetails')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => copyVerificationLink(item.qrToken)}>
                    <Text style={styles.copyButton}>{t('createVerification.copy') || "Copy Link"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('verificationsGiven.title')}</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("CreateVerification")}>
                    <Text style={styles.addButtonText}>+ {t('verificationsGiven.createNew')}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4f46e5" />
            ) : (
                <FlatList
                    data={verifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={<Text style={styles.empty}>{t('verificationsGiven.noVerifications')}</Text>}
                />
            )}

            {/* Details Modal */}
            <Modal
                visible={!!selectedVerification}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedVerification(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('verificationsGiven.verificationDetails')}</Text>
                            <TouchableOpacity onPress={() => setSelectedVerification(null)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            {selectedVerification && (
                                <>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{t('verificationsGiven.workerName')}</Text>
                                        <Text style={styles.detailValue}>{selectedVerification.worker?.name || selectedVerification.employeeName}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{t('verificationsGiven.phoneNumber')}</Text>
                                        <Text style={styles.detailValue}>{selectedVerification.phoneNumber || "N/A"}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{t('verificationsGiven.jobRole') || "Job Role"}</Text>
                                        <Text style={styles.detailValue}>{selectedVerification.jobRole}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{t('verificationsGiven.typeOfWork')}</Text>
                                        <Text style={styles.detailValue}>{selectedVerification.typeOfWork || "N/A"}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{t('verificationsGiven.experience')}</Text>
                                        <Text style={styles.detailValue}>{selectedVerification.experience || "N/A"}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{t('verificationsGiven.employmentPeriod')}</Text>
                                        <Text style={styles.detailValue}>
                                            {new Date(selectedVerification.startDate).toLocaleDateString()} - {new Date(selectedVerification.endDate).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{t('verificationsGiven.rating')}</Text>
                                        <View style={{ flexDirection: 'row' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Text key={i} style={{ color: i < selectedVerification.rating ? '#fbbf24' : '#d1d5db', fontSize: 20 }}>★</Text>
                                            ))}
                                        </View>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{t('verificationsGiven.recommended')}</Text>
                                        <Text style={styles.detailValue}>{selectedVerification.recommended || "N/A"}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{t('verificationsGiven.feedback')}</Text>
                                        <Text style={styles.detailValue}>{selectedVerification.feedback || "N/A"}</Text>
                                    </View>
                                </>
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
    workerName: { fontSize: 18, fontWeight: "bold", color: "#1f2937", flex: 1 },
    jobRole: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
    dates: { fontSize: 12, color: "#9ca3af", marginBottom: 8 },
    actions: { flexDirection: "row", gap: 16 },
    viewButton: { color: "#2563eb", fontWeight: "600" },
    copyButton: { color: "#059669", fontWeight: "600" },
    empty: { textAlign: "center", color: "#6b7280", marginTop: 20 },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { width: "90%", maxHeight: "80%", backgroundColor: "white", borderRadius: 12, elevation: 5 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
    modalTitle: { fontSize: 20, fontWeight: "bold" },
    closeButton: { fontSize: 24, color: "#6b7280" },
    modalScroll: { padding: 20 },
    detailRow: { marginBottom: 16 },
    detailLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
    detailValue: { fontSize: 16, color: "#1f2937" },
});

export default VerificationsGivenScreen;
