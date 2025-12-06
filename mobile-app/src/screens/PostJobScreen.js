// PostJobScreen for mobile with edit support
import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { AppContext } from "../context/AppContext";
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const PostJobScreen = ({ route }) => {
    const { t } = useTranslation();
    const { api, employerToken } = useContext(AppContext);
    const navigation = useNavigation();
    const editingJob = route?.params?.job;

    const [formData, setFormData] = useState({
        title: editingJob?.title || "",
        location: editingJob?.location || "",
        salaryMin: editingJob?.salaryRange?.min?.toString() || "",
        salaryMax: editingJob?.salaryRange?.max?.toString() || "",
        experience: editingJob?.experience || "",
        jobType: editingJob?.jobType || "Full-time",
        description: editingJob?.description || "",
    });

    const handleSubmit = async () => {
        if (!formData.title || !formData.location) {
            Alert.alert(t('common.error'), t('postJob.errors.fillRequired'));
            return;
        }

        try {
            const payload = {
                title: formData.title,
                location: formData.location,
                salaryRange: {
                    min: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
                    max: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
                },
                experience: formData.experience,
                jobType: formData.jobType,
                description: formData.description,
            };

            let response;
            if (editingJob) {
                response = await api.put(`/api/employer/job/${editingJob._id}`, payload, {
                    headers: { token: employerToken },
                });
            } else {
                response = await api.post("/api/employer/job", payload, {
                    headers: { token: employerToken },
                });
            }

            if (response.data.success) {
                Alert.alert(t('common.success'), editingJob ? t('postJob.success.updated') : t('postJob.success.posted'));
                navigation.goBack();
            }
        } catch (error) {
            Alert.alert(t('common.error'), error.response?.data?.message || t('postJob.errors.postFailed'));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>{editingJob ? t('postJob.editTitle') : t('postJob.title')}</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>{t('postJob.fields.title')}</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                        placeholder={t('postJob.placeholders.title')}
                    />

                    <Text style={styles.label}>{t('postJob.fields.location')}</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.location}
                        onChangeText={(text) => setFormData({ ...formData, location: text })}
                        placeholder={t('postJob.placeholders.location')}
                    />

                    <Text style={styles.label}>{t('jobs.salaryRange') || "Salary Range"}</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            value={formData.salaryMin}
                            onChangeText={(text) => setFormData({ ...formData, salaryMin: text })}
                            placeholder={t('postJob.fields.salaryMin')}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            value={formData.salaryMax}
                            onChangeText={(text) => setFormData({ ...formData, salaryMax: text })}
                            placeholder={t('postJob.fields.salaryMax')}
                            keyboardType="numeric"
                        />
                    </View>

                    <Text style={styles.label}>{t('postJob.fields.jobType')}</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.jobType}
                            onValueChange={(itemValue) => setFormData({ ...formData, jobType: itemValue })}
                        >
                            <Picker.Item label={t('postJob.jobTypes.fulltime')} value="Full-time" />
                            <Picker.Item label={t('postJob.jobTypes.parttime')} value="Part-time" />
                            <Picker.Item label={t('postJob.jobTypes.contract')} value="Contract" />
                            <Picker.Item label={t('postJob.jobTypes.internship')} value="Internship" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>{t('postJob.fields.experience')}</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.experience}
                        onChangeText={(text) => setFormData({ ...formData, experience: text })}
                        placeholder={t('postJob.placeholders.experience')}
                    />

                    <Text style={styles.label}>{t('postJob.fields.description')}</Text>
                    <TextInput
                        style={[styles.input, { height: 100 }]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder={t('postJob.placeholders.description')}
                        multiline
                    />

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>{editingJob ? t('postJob.labels.update') : t('postJob.labels.post')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    scrollContent: { padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#1f2937" },
    form: { backgroundColor: "white", padding: 16, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 4, marginTop: 12 },
    input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 4 },
    pickerContainer: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, marginBottom: 4 },
    submitButton: { backgroundColor: "#4f46e5", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 20 },
    submitButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default PostJobScreen;
