import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { AppContext } from "../context/AppContext";
import QRCode from 'react-native-qrcode-svg';
import { Picker } from '@react-native-picker/picker';
import * as Clipboard from 'expo-clipboard';
import { FRONTEND_URL } from "../api/config";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const UserQRScreen = () => {
    const { t } = useTranslation();
    const { api, userToken } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [verifications, setVerifications] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const fetchVerifications = async () => {
            if (!userToken) return;
            setLoading(true);
            try {
                const res = await api.get('/api/user/verifications', { headers: { Authorization: `Bearer ${userToken}` } });
                if (res.data.success) {
                    const items = (res.data.verifications || []).map((v) => ({
                        ...v,
                        verificationUrl: `${FRONTEND_URL}/verify/${v.qrToken}`,
                    }));
                    setVerifications(items);
                    setSelected(items[0] || null);
                }
            } catch (e) {
                Alert.alert(t('common.error'), t('documents.errors.fetchFailed')); // slightly generic
            } finally {
                setLoading(false);
            }
        };
        fetchVerifications();
    }, [userToken]);

    const copyLink = async (url) => {
        await Clipboard.setStringAsync(url);
        Alert.alert(t('common.success'), t('userQR.linkCopied'));
    };

    if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

    if (!verifications || verifications.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>{t('userQR.noCertificates')}</Text>
                    <Text style={styles.subtitle}>{t('userQR.noVerifications')}</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.title}>{t('userQR.title')}</Text>
                    <Text style={styles.label}>{t('userQR.selectCertificate')}</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selected?.id}
                            onValueChange={(itemValue) => setSelected(verifications.find(v => v.id === itemValue))}
                        >
                            {verifications.map((v) => (
                                <Picker.Item
                                    key={v.id}
                                    label={`${v.companyName} — ${v.jobRole}`}
                                    value={v.id}
                                />
                            ))}
                        </Picker>
                    </View>

                    {selected && (
                        <View style={styles.qrContainer}>
                            <View style={styles.qrWrapper}>
                                <QRCode value={selected.verificationUrl} size={200} />
                            </View>

                            <Text style={styles.label}>{t('userQR.verificationLink')}</Text>
                            <View style={styles.linkContainer}>
                                <TextInput
                                    style={styles.linkInput}
                                    value={selected.verificationUrl}
                                    editable={false}
                                />
                                <TouchableOpacity style={styles.copyButton} onPress={() => copyLink(selected.verificationUrl)}>
                                    <Text style={styles.copyButtonText}>{t('userQR.copy')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    scrollContent: { padding: 20, alignItems: "center" },
    card: { backgroundColor: "white", padding: 20, borderRadius: 12, width: "100%", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10, color: "#1f2937" },
    subtitle: { textAlign: "center", color: "#6b7280" },
    label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8, marginTop: 10 },
    pickerContainer: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, marginBottom: 20 },
    qrContainer: { alignItems: "center" },
    qrWrapper: { padding: 20, borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 12, marginBottom: 20 },
    linkContainer: { flexDirection: "row", gap: 10, width: "100%" },
    linkInput: { flex: 1, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10, backgroundColor: "#f9fafb", color: "#374151" },
    copyButton: { backgroundColor: "#2563eb", paddingHorizontal: 16, justifyContent: "center", borderRadius: 8 },
    copyButtonText: { color: "white", fontWeight: "600" },
});

export default UserQRScreen;
