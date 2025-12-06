import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { AppContext } from "../context/AppContext";
import * as ImagePicker from "expo-image-picker";
import { Picker } from '@react-native-picker/picker';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "../api/config";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir",
    "Ladakh", "Puducherry", "Chandigarh", "Andaman & Nicobar", "Dadra & Nagar Haveli",
    "Daman & Diu", "Lakshadweep"
];

const UserProfileScreen = () => {
    const { t } = useTranslation();
    const { userProfile, setUserProfile, api, userToken, loadUserProfile } = useContext(AppContext);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [skillsInput, setSkillsInput] = useState("");

    // Local state for editing
    const [formData, setFormData] = useState({});

    const startEditing = () => {
        setFormData({ ...userProfile });
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setFormData({});
    };

    const pickImage = async () => {
        if (!isEditing) return;

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setFormData({ ...formData, image: result.assets[0].uri });
        }
    };

    const uploadImageToCloudinary = async (uri) => {
        const data = new FormData();
        data.append("file", {
            uri: uri,
            type: "image/jpeg",
            name: "profile.jpg",
        });
        data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        data.append("folder", "digisaarathi/profiles");

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
                { method: "POST", body: data }
            );
            const json = await res.json();
            return json.secure_url;
        } catch (error) {
            console.log("Cloudinary upload error:", error);
            return null;
        }
    };

    const saveProfile = async () => {
        setUploading(true);
        try {
            let imageUrl = formData.image;

            // If image is a local URI, upload it
            if (imageUrl && imageUrl.startsWith("file")) {
                const uploadedUrl = await uploadImageToCloudinary(imageUrl);
                if (uploadedUrl) imageUrl = uploadedUrl;
                else {
                    Alert.alert(t('common.error'), t('profile.updateFailed'));
                    setUploading(false);
                    return;
                }
            }

            const payload = {
                ...formData,
                image: imageUrl,
                skills: formData.skills || [],
            };

            const { data } = await api.put(
                "/api/user/update-profile",
                payload,
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (data.success) {
                Alert.alert(t('common.success'), t('profile.updated'));
                loadUserProfile();
                setIsEditing(false);
            } else {
                Alert.alert(t('common.error'), data.message);
            }
        } catch (err) {
            Alert.alert(t('common.error'), t('profile.updateFailed'));
        } finally {
            setUploading(false);
        }
    };

    const addSkill = () => {
        if (!skillsInput.trim()) return;
        setFormData((prev) => ({
            ...prev,
            skills: [...(prev.skills || []), skillsInput.trim()],
        }));
        setSkillsInput("");
    };

    const removeSkill = (index) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index),
        }));
    };

    const displayData = isEditing ? formData : userProfile;

    if (!userProfile) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('profile.title')}</Text>
                    {!isEditing ? (
                        <TouchableOpacity onPress={startEditing} style={styles.editButton}>
                            <Text style={styles.editButtonText}>{t('profile.edit')}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity onPress={cancelEditing} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={saveProfile} style={styles.saveButton} disabled={uploading}>
                                {uploading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.saveButtonText}>{t('profile.save')}</Text>}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={pickImage} disabled={!isEditing}>
                        <Image
                            source={{ uri: displayData?.image || "https://via.placeholder.com/150" }}
                            style={styles.avatar}
                        />
                        {isEditing && <View style={styles.cameraIcon}><Text style={{ color: 'white' }}>📷</Text></View>}
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>{t('profile.fullName')}</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.disabledInput]}
                        value={displayData?.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        editable={isEditing}
                    />

                    <Text style={styles.label}>{t('profile.phone')}</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.disabledInput]}
                        value={displayData?.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        editable={isEditing}
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>{t('profile.email')}</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={displayData?.email}
                        editable={false}
                    />

                    <Text style={styles.label}>{t('profile.dob')}</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.disabledInput]}
                        value={displayData?.dob}
                        onChangeText={(text) => setFormData({ ...formData, dob: text })}
                        editable={isEditing}
                        placeholder="YYYY-MM-DD"
                    />

                    <Text style={styles.label}>{t('profile.gender')}</Text>
                    {isEditing ? (
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={displayData?.gender}
                                onValueChange={(itemValue) => setFormData({ ...formData, gender: itemValue })}
                            >
                                <Picker.Item label={t('profile.notSelected')} value="" />
                                <Picker.Item label={t('profile.male')} value="Male" />
                                <Picker.Item label={t('profile.female')} value="Female" />
                                <Picker.Item label={t('profile.other')} value="Other" />
                            </Picker>
                        </View>
                    ) : (
                        <TextInput style={[styles.input, styles.disabledInput]} value={displayData?.gender} editable={false} />
                    )}

                    <Text style={styles.label}>{t('profile.currentState')}</Text>
                    {isEditing ? (
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={displayData?.currentState}
                                onValueChange={(itemValue) => setFormData({ ...formData, currentState: itemValue })}
                            >
                                <Picker.Item label={t('profile.notSelected')} value="" />
                                {indianStates.map(s => <Picker.Item key={s} label={s} value={s} />)}
                            </Picker>
                        </View>
                    ) : (
                        <TextInput style={[styles.input, styles.disabledInput]} value={displayData?.currentState} editable={false} />
                    )}

                    <Text style={styles.label}>{t('profile.experience')}</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.disabledInput]}
                        value={displayData?.experience}
                        onChangeText={(text) => setFormData({ ...formData, experience: text })}
                        editable={isEditing}
                        placeholder={t('profile.experiencePlaceholder')}
                    />

                    <Text style={styles.label}>{t('profile.address')}</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.disabledInput, { height: 80 }]}
                        value={displayData?.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                        editable={isEditing}
                        multiline
                    />

                    <Text style={styles.label}>{t('profile.skills')}</Text>
                    {isEditing && (
                        <View style={styles.addSkillContainer}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                value={skillsInput}
                                onChangeText={setSkillsInput}
                                placeholder={t('profile.addSkill')}
                            />
                            <TouchableOpacity style={styles.addSkillButton} onPress={addSkill}>
                                <Text style={styles.addSkillButtonText}>{t('profile.add')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.skillsContainer}>
                        {displayData?.skills?.map((skill, index) => (
                            <View key={index} style={styles.skillTag}>
                                <Text style={styles.skillText}>{skill}</Text>
                                {isEditing && (
                                    <TouchableOpacity onPress={() => removeSkill(index)}>
                                        <Text style={styles.removeSkillText}>×</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>

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
    avatarContainer: { alignItems: "center", marginBottom: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: "#e5e7eb" },
    cameraIcon: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#4f46e5", padding: 6, borderRadius: 15 },
    form: { backgroundColor: "white", padding: 16, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 4, marginTop: 12 },
    input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10, fontSize: 16, color: "#1f2937", marginBottom: 4 },
    disabledInput: { backgroundColor: "#f9fafb", color: "#6b7280" },
    pickerContainer: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, marginBottom: 4 },
    addSkillContainer: { flexDirection: "row", gap: 8, marginBottom: 10 },
    addSkillButton: { backgroundColor: "#4f46e5", paddingHorizontal: 16, justifyContent: "center", borderRadius: 8 },
    addSkillButtonText: { color: "white", fontWeight: "600" },
    skillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
    skillTag: { backgroundColor: "#e0e7ff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 6 },
    skillText: { color: "#3730a3", fontSize: 14 },
    removeSkillText: { color: "#dc2626", fontWeight: "bold", fontSize: 18 },
});

export default UserProfileScreen;
