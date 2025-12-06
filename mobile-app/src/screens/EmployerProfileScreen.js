import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { AppContext } from "../context/AppContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const EmployerProfileScreen = () => {
    const { t } = useTranslation();
    const { api, employerToken } = useContext(AppContext);
    const [employer, setEmployer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        company: "",
        phone: "",
        address: "",
        industry: "",
        location: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get("/api/employer/profile", {
                headers: { token: employerToken },
            });
            if (response.data.success) {
                const emp = response.data.employer;
                setEmployer(emp);
                setFormData({
                    company: emp.company || "",
                    phone: emp.phone || "",
                    address: emp.address || "",
                    industry: emp.industry || "",
                    location: emp.location || "",
                });
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('employer.profile.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await api.put("/api/employer/profile", formData, {
                headers: { token: employerToken },
            });
            if (response.data.success) {
                setEmployer(response.data.employer);
                setEditing(false);
                Alert.alert(t('common.success'), t('employer.profile.updated'));
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('employer.profile.updateFailed'));
        }
    };

    if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('employer.profile.title')}</Text>
                    {!editing ? (
                        <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
                            <Text style={styles.editButtonText}>{t('employer.profile.editProfile')}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleUpdate} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>{t('employer.profile.saveChanges')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>{t('employer.profile.companyName')}</Text>
                    <TextInput
                        style={[styles.input, !editing && styles.disabledInput]}
                        value={editing ? formData.company : employer?.company}
                        onChangeText={(text) => setFormData({ ...formData, company: text })}
                        editable={editing}
                    />

                    <Text style={styles.label}>{t('login.email')}</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={employer?.email}
                        editable={false}
                    />

                    <Text style={styles.label}>{t('employer.profile.phone')}</Text>
                    <TextInput
                        style={[styles.input, !editing && styles.disabledInput]}
                        value={editing ? formData.phone : employer?.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        editable={editing}
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>{t('employer.profile.address')}</Text>
                    <TextInput
                        style={[styles.input, !editing && styles.disabledInput, { height: 80 }]}
                        value={editing ? formData.address : employer?.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                        editable={editing}
                        multiline
                    />

                    <Text style={styles.label}>{t('employer.profile.industry')}</Text>
                    <TextInput
                        style={[styles.input, !editing && styles.disabledInput]}
                        value={editing ? formData.industry : employer?.industry}
                        onChangeText={(text) => setFormData({ ...formData, industry: text })}
                        editable={editing}
                    />

                    <Text style={styles.label}>{t('employer.profile.location')}</Text>
                    <TextInput
                        style={[styles.input, !editing && styles.disabledInput]}
                        value={editing ? formData.location : employer?.location}
                        onChangeText={(text) => setFormData({ ...formData, location: text })}
                        editable={editing}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    scrollContent: { padding: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "bold", color: "#1f2937" },
    editButton: { backgroundColor: "#4f46e5", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
    editButtonText: { color: "white", fontWeight: "600" },
    saveButton: { backgroundColor: "#059669", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
    saveButtonText: { color: "white", fontWeight: "600" },
    cancelButton: { backgroundColor: "#9ca3af", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
    cancelButtonText: { color: "white", fontWeight: "600" },
    form: { backgroundColor: "white", padding: 16, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 4, marginTop: 12 },
    input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10, fontSize: 16, color: "#1f2937", marginBottom: 4 },
    disabledInput: { backgroundColor: "#f9fafb", color: "#6b7280" },
});

export default EmployerProfileScreen;
