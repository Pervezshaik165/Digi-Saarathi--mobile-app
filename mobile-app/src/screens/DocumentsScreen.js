import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ActivityIndicator, Linking } from "react-native";
import { AppContext } from "../context/AppContext";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from '@react-native-picker/picker';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "../api/config";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const DocumentsScreen = () => {
    const { t } = useTranslation();
    const { api, userToken, refreshDocs, setRefreshDocs } = useContext(AppContext);
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const documentTypes = [
        "aadhar",
        "pan",
        "voterId",
        "skill",
        "resume",
        "others",
    ];

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/api/user/documents", {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            if (data.success) {
                setDocs(data.documents);
            }
        } catch (error) {
            console.log("Fetch docs error:", error);
            Alert.alert(t('common.error'), t('documents.errors.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, [refreshDocs]);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                setSelectedFile(result.assets[0]);
            }
        } catch (err) {
            console.log("Pick document error:", err);
        }
    };

    const uploadToCloudinary = async (file) => {
        const data = new FormData();
        data.append("file", {
            uri: file.uri,
            type: file.mimeType || "application/pdf",
            name: file.name,
        });
        data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        data.append("folder", "digi-saarathi");

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
                {
                    method: "POST",
                    body: data,
                }
            );
            const cloud = await res.json();
            return cloud.secure_url;
        } catch (error) {
            console.log("Cloudinary error:", error);
            return null;
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return Alert.alert(t('common.error'), t('documents.errors.selectFile'));
        if (!selectedType) return Alert.alert(t('common.error'), t('documents.errors.selectType'));

        // Check if type already exists
        if (docs.some(d => d.type === selectedType)) {
            return Alert.alert(t('common.warning'), t('documents.warnings.alreadyUploaded', { type: selectedType }));
        }

        setUploading(true);
        const url = await uploadToCloudinary(selectedFile);

        if (!url) {
            setUploading(false);
            return Alert.alert(t('common.error'), t('documents.errors.cloudFail'));
        }

        try {
            const { data } = await api.post(
                "/api/user/documents",
                { fileUrl: url, type: selectedType },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (data.success) {
                Alert.alert(t('common.success'), t('documents.success.uploaded'));
                setRefreshDocs((prev) => !prev);
                setModalVisible(false);
                setSelectedFile(null);
                setSelectedType("");
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('documents.errors.uploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    const deleteDoc = async (id) => {
        try {
            const { data } = await api.delete(`/api/user/documents/${id}`, {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            if (data.success) {
                Alert.alert(t('common.success'), t('documents.success.deleted'));
                setDocs((prev) => prev.filter((doc) => doc._id !== id));
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('documents.errors.deleteFailed'));
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.docType}>{item.type.toUpperCase()}</Text>
                <Text style={[styles.status,
                item.status === 'verified' ? styles.verified :
                    item.status === 'rejected' ? styles.rejected : styles.pending
                ]}>
                    {t(`documents.status.${item.status}`)}
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
                    <Text style={styles.link}>{t('documents.view')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteDoc(item._id)}>
                    <Text style={styles.delete}>{t('documents.delete')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('documents.title')}</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addButtonText}>+ {t('documents.upload')}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4f46e5" />
            ) : (
                <FlatList
                    data={docs}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={styles.empty}>{t('documents.noUploaded')}</Text>
                            <TouchableOpacity style={styles.emptyUploadButton} onPress={() => setModalVisible(true)}>
                                <Text style={styles.emptyUploadButtonText}>{t('documents.upload')}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('documents.uploadTitle')}</Text>

                        <Text style={styles.label}>{t('documents.selectTypeLabel')}</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedType}
                                onValueChange={(itemValue) => setSelectedType(itemValue)}
                            >
                                <Picker.Item label={t('documents.chooseType')} value="" />
                                {documentTypes.map((dt) => (
                                    <Picker.Item key={dt} label={dt.toUpperCase()} value={dt} />
                                ))}
                            </Picker>
                        </View>

                        <TouchableOpacity style={styles.fileButton} onPress={pickDocument}>
                            <Text style={styles.fileButtonText}>
                                {selectedFile ? selectedFile.name : t('documents.errors.selectFile')}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.uploadButton]}
                                onPress={handleUpload}
                                disabled={uploading}
                            >
                                {uploading ? <ActivityIndicator color="white" /> : <Text style={styles.uploadButtonText}>{t('documents.upload')}</Text>}
                            </TouchableOpacity>
                        </View>
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
    cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    docType: { fontSize: 16, fontWeight: "bold", color: "#374151" },
    status: { fontSize: 12, fontWeight: "bold" },
    verified: { color: "#059669" },
    rejected: { color: "#dc2626" },
    pending: { color: "#6b7280" },
    actions: { flexDirection: "row", justifyContent: "flex-end", gap: 16 },
    link: { color: "#2563eb", fontWeight: "600" },
    delete: { color: "#dc2626", fontWeight: "600" },
    empty: { textAlign: "center", color: "#6b7280", marginTop: 20 },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { width: "90%", backgroundColor: "white", padding: 20, borderRadius: 12, elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 5, color: "#374151" },
    pickerContainer: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, marginBottom: 15 },
    fileButton: { backgroundColor: "#e5e7eb", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 20 },
    fileButtonText: { color: "#374151", fontWeight: "500" },
    modalActions: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
    modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
    cancelButton: { backgroundColor: "#d1d5db" },
    cancelButtonText: { color: "#374151", fontWeight: "bold" },
    uploadButton: { backgroundColor: "#4f46e5" },
    uploadButtonText: { color: "white", fontWeight: "bold" },
    emptyUploadButton: { backgroundColor: "#4f46e5", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 15 },
    emptyUploadButtonText: { color: "white", fontWeight: "bold" },
});

export default DocumentsScreen;
