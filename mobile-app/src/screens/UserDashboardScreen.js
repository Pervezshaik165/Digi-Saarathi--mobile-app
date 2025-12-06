import React, { useContext, useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { AppContext } from "../context/AppContext";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserSidebar } from "../components/UserSidebar";
import { useTranslation } from "react-i18next";

const UserDashboardScreen = () => {
    const { t } = useTranslation();
    const { userName, userProfile, loadUserProfile, refreshDocs, api, userToken, logout } = useContext(AppContext);
    const navigation = useNavigation();

    const [userDocs, setUserDocs] = useState([]);
    const [publicJobs, setPublicJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const loadUserDocuments = async () => {
        if (!userToken) return;
        try {
            const { data } = await api.get("/api/user/documents", {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            if (data && data.success) {
                setUserDocs(Array.isArray(data.documents) ? data.documents : []);
            }
        } catch (e) {
            console.error("Failed to load user documents:", e.message || e);
        }
    };

    const loadPublicJobs = async () => {
        try {
            const { data } = await api.get("/api/public/jobs");
            if (data && data.success) {
                setPublicJobs(Array.isArray(data.jobs) ? data.jobs : []);
            }
        } catch (e) {
            console.error("Failed to load public jobs:", e.message || e);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadUserProfile(), loadUserDocuments(), loadPublicJobs()]);
        setRefreshing(false);
    };

    useEffect(() => {
        loadUserProfile();
        loadUserDocuments();
        loadPublicJobs();
    }, []);

    useEffect(() => {
        if (refreshDocs) {
            loadUserProfile();
            loadUserDocuments();
        }
    }, [refreshDocs]);

    const documents = userDocs || [];
    const verifications = documents.filter((d) => d.status === "verified");

    const appliedJobs = useMemo(() => {
        if (!userProfile?._id) return [];
        return publicJobs.filter((j) =>
            Array.isArray(j.applicants) && j.applicants.some((a) => String(a.worker) === String(userProfile._id))
        );
    }, [publicJobs, userProfile]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : (userName || "U").charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.welcomeText}>{t('dashboard.welcome', { name: userName || userProfile?.name || t('dashboard.userDefault') })}</Text>
                        <Text style={styles.subtitleText}>{t('dashboard.overview')}</Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <TouchableOpacity style={[styles.statCard, { backgroundColor: "#e0e7ff" }]} onPress={() => navigation.navigate("Documents")}>
                        <Text style={styles.statTitle}>{t('dashboard.documents')}</Text>
                        <Text style={styles.statValue}>{documents.length}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.statCard, { backgroundColor: "#fef3c7" }]} onPress={() => navigation.navigate("UserQR")}>
                        <Text style={styles.statTitle}>{t('dashboard.verifications')}</Text>
                        <Text style={styles.statValue}>{verifications.length}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.statCard, { backgroundColor: "#fee2e2" }]} onPress={() => navigation.navigate("Jobs")}>
                        <Text style={styles.statTitle}>{t('dashboard.appliedJobs')}</Text>
                        <Text style={styles.statValue}>{appliedJobs.length}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.statCard, { backgroundColor: "#d1fae5" }]} onPress={() => navigation.navigate("UserProfile")}>
                        <Text style={styles.statTitle}>{t('profile.title')}</Text>
                        <Text style={[styles.statValue, { fontSize: 18 }]}>View</Text>
                    </TouchableOpacity>
                </View>

                {/* Schemes Shortcut */}
                <TouchableOpacity style={styles.schemesBanner} onPress={() => navigation.navigate("Schemes")}>
                    <Text style={styles.schemesText}>📋 {t('schemes.title')}</Text>
                </TouchableOpacity>

                {/* Recent Documents */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('dashboard.recentDocuments')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Documents")}>
                            <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                        </TouchableOpacity>
                    </View>
                    {documents.length > 0 ? (
                        documents.slice(0, 3).map((doc, index) => (
                            <View key={index} style={styles.listItem}>
                                <Text style={styles.listTitle}>{doc.type || doc.title || `Document ${index + 1}`}</Text>
                                <Text style={styles.listSubtitle}>{doc.status || "Pending"}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>{t('dashboard.noDocs')}</Text>
                    )}
                </View>

                {/* Recent Verifications */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('dashboard.recentVerifications')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("UserQR")}>
                            <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                        </TouchableOpacity>
                    </View>
                    {verifications.length > 0 ? (
                        verifications.slice(0, 3).map((v, i) => (
                            <View key={i} style={styles.listItem}>
                                <Text style={styles.listTitle}>Verified Document</Text>
                                <Text style={styles.listSubtitle}>{v.type}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>{t('dashboard.noVerifications')}</Text>
                    )}
                </View>

                {/* Recent Jobs */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('dashboard.recentJobs')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Jobs")}>
                            <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                        </TouchableOpacity>
                    </View>
                    {appliedJobs.length > 0 ? (
                        appliedJobs.slice(0, 3).map((j, k) => (
                            <View key={k} style={styles.listItem}>
                                <Text style={styles.listTitle}>{j.title || `Job ${k + 1}`}</Text>
                                <Text style={styles.listSubtitle}>{j.employer?.company || j.company || ''}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>{t('dashboard.noRecentJobs')}</Text>
                    )}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={async () => {
                    await logout();
                    navigation.replace("Login");
                }}>
                    <Text style={styles.logoutText}>{t('nav.logout')}</Text>
                </TouchableOpacity>

            </ScrollView>
            <UserSidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    menuButton: {
        padding: 8,
        marginRight: 8,
    },
    menuIcon: {
        fontSize: 28,
        color: "#1f2937",
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#4f46e5",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    avatarText: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1f2937",
    },
    subtitleText: {
        fontSize: 14,
        color: "#6b7280",
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    statCard: {
        width: "48%",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    statTitle: {
        fontSize: 14,
        color: "#4b5563",
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1f2937",
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
    },
    seeAll: {
        color: "#4f46e5",
        fontWeight: "600",
    },
    schemesBanner: {
        backgroundColor: "#4f46e5",
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        alignItems: "center",
    },
    schemesText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    listItem: {
        backgroundColor: "white",
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1f2937",
    },
    listSubtitle: {
        fontSize: 14,
        color: "##6b7280",
        marginTop: 4,
    },
    emptyText: {
        color: "#9ca3af",
        fontStyle: "italic",
    },
    logoutButton: {
        marginTop: 20,
        backgroundColor: '#ef4444',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    logoutText: {
        color: 'white',
        fontWeight: 'bold'
    }
});

export default UserDashboardScreen;
