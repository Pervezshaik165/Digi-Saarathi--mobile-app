import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { AppContext } from "../context/AppContext";
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const CreateVerificationScreen = () => {
    const { t } = useTranslation();
    const { api, employerToken } = useContext(AppContext);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        employeeName: "",
        phoneNumber: "",
        jobRole: "",
        typeOfWork: "Full-time",
        experience: "",
        startDate: "",
        endDate: "",
        rating: 5,
        recommended: "Highly Recommend",
        feedback: "",
    });

    const handleSubmit = async () => {
        if (!formData.employeeName || !formData.phoneNumber || !formData.jobRole) {
            Alert.alert(t('common.error'), t('postJob.errors.fillRequired'));
            return;
        }

        setLoading(true);
        try {
            const response = await api.post(
                "/api/employer/verification",
                formData,
                { headers: { token: employerToken } }
            );
            if (response.data.success) {
                Alert.alert(t('common.success'), t('createVerification.createdSuccess'));
                navigation.goBack();
            }
        } catch (error) {
            Alert.alert(t('common.error'), error.response?.data?.message || t('createVerification.failedCreate'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>{t('createVerification.createVerification')}</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>{t('createVerification.employeeFullName')}</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.employeeName}
                        onChangeText={(text) => setFormData({ ...formData, employeeName: text })}
                        placeholder={t('login.fullName') || "Full Name"}
                    />

                    <Text style={styles.label}>{t('createVerification.phoneNumber')}</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.phoneNumber}
                        onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                        placeholder={t('createVerification.phonePlaceholder')}
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>{t('createVerification.jobRole')}</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.jobRole}
                        onChangeText={(text) => setFormData({ ...formData, jobRole: text })}
                        placeholder={t('createVerification.placeholders.jobRoleExample')}
                    />

                    <Text style={styles.label}>{t('createVerification.typeOfWork')}</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.typeOfWork}
                            onValueChange={(itemValue) => setFormData({ ...formData, typeOfWork: itemValue })}
                        >
                            <Picker.Item label={t('createVerification.typeOptions.fulltime')} value="Full-time" />
                            <Picker.Item label={t('createVerification.typeOptions.parttime')} value="Part-time" />
                            <Picker.Item label={t('createVerification.typeOptions.contract')} value="Contract" />
                            <Picker.Item label={t('createVerification.typeOptions.internship')} value="Internship" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>{t('createVerification.experienceLabel')}</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.experience}
                        onChangeText={(text) => setFormData({ ...formData, experience: text })}
                        placeholder={t('createVerification.placeholders.experience')}
                    />

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{t('createVerification.startDate')}</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.startDate}
                                onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{t('createVerification.endDate')}</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.endDate}
                                onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>{t('createVerification.ratingLabel')}: {formData.rating} stars</Text>
                    <View style={{ flexDirection: 'row', gap: 5, marginBottom: 15 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setFormData({ ...formData, rating: star })}>
                                <Text style={{ fontSize: 30, color: star <= formData.rating ? '#fbbf24' : '#d1d5db' }}>★</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>{t('createVerification.recommendedLabel')}</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.recommended}
                            onValueChange={(itemValue) => setFormData({ ...formData, recommended: itemValue })}
                        >
                            <Picker.Item label={t('createVerification.recommendedOptions.highly')} value="Highly Recommend" />
                            <Picker.Item label={t('createVerification.recommendedOptions.recommend')} value="Recommend" />
                            <Picker.Item label={t('createVerification.recommendedOptions.neutral')} value="Neutral" />
                            <Picker.Item label={t('createVerification.recommendedOptions.not')} value="Not Recommend" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>{t('createVerification.feedbackLabel')}</Text>
                    <TextInput
                        style={[styles.input, { height: 100 }]}
                        value={formData.feedback}
                        onChangeText={(text) => setFormData({ ...formData, feedback: text })}
                        placeholder={t('createVerification.feedbackPlaceholder')}
                        multiline
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, loading && { opacity: 0.5 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>{loading ? t('createVerification.creating') : t('createVerification.createVerification')}</Text>
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

export default CreateVerificationScreen;
