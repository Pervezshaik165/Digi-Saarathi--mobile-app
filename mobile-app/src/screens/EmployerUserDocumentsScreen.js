import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Linking } from "react-native";
import { AppContext } from "../context/AppContext";
import { SafeAreaView } from "react-native-safe-area-context";

const EmployerUserDocumentsScreen = ({ route }) => {
    const { api, employerToken } = useContext(AppContext);
    const userId = route?.params?.userId;
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchUserDocuments();
        }
    }, [userId]);

    const fetchUserDocuments = async () => {
        try {
            const response = await api.get(`/api/employer/user/${userId}/documents`, {
                headers: { token: employerToken },
            });
            if (response.data.success) {
                setDocuments(response.data.documents || []);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to load user documents");
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.docType}>{item.type}</Text>
            <Text style={[styles.status,
            item.status === 'verified' ? styles.verified :
                item.status === 'rejected' ? styles.rejected : styles.pending
            ]}>
                {item.status.toUpperCase()}
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
                <Text style={styles.link}>View Document</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>User Documents</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#4f46e5" />
            ) : (
                <FlatList
                    data={documents}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={<Text style={styles.empty}>No documents found</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6", padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#1f2937" },
    card: { backgroundColor: "white", padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    docType: { fontSize: 16, fontWeight: "bold", color: "#1f2937", marginBottom: 8 },
    status: { fontSize: 12, fontWeight: "bold", marginBottom: 8 },
    verified: { color: "#059669" },
    rejected: { color: "#dc2626" },
    pending: { color: "#6b7280" },
    link: { color: "#2563eb", fontWeight: "600" },
    empty: { textAlign: "center", color: "#6b7280", marginTop: 20 },
});

export default EmployerUserDocumentsScreen;
