// Placeholder screens for remaining employer features
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const EmployerUserDocumentsScreen = () => (
    <SafeAreaView style={styles.container}>
        <Text style={styles.title}>User Documents</Text>
        <Text style={styles.subtitle}>This feature will display user documents for verification</Text>
    </SafeAreaView>
);

export const CreateVerificationScreen = () => (
    <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Create Verification</Text>
        <Text style={styles.subtitle}>This feature will allow employers to create employment verifications</Text>
    </SafeAreaView>
);

export const VerificationsGivenScreen = () => (
    <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Verifications Given</Text>
        <Text style={styles.subtitle}>This feature will display all verifications given by the employer</Text>
    </SafeAreaView>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6", padding: 20, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 24, fontWeight: "bold", color: "#1f2937", marginBottom: 10 },
    subtitle: { fontSize: 16, color: "#6b7280", textAlign: "center", paddingHorizontal: 20 },
});
