import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { AppContext } from "../context/AppContext";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmployerSidebar } from "../components/EmployerSidebar";
import { useTranslation } from "react-i18next";

const StatCard = ({ title, value, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { backgroundColor: color }]} onPress={onPress}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </TouchableOpacity>
);

const EmployerDashboardScreen = () => {
    const { t } = useTranslation();
    const { employerToken, api, logout } = useContext(AppContext);
    const navigation = useNavigation();

    const [stats, setStats] = useState({
        verificationsGiven: 0,
        jobsPosted: 0,
        documentsVerified: 0,
        documentsUploaded: 0,
    });
    const [recentVerifications, setRecentVerifications] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get("/api/employer/dashboard/stats", {
                headers: { token: employerToken },
            });
            if (response.data.success) {
                setStats(response.data.stats);
                setRecentVerifications(response.data.recentVerifications || []);
                setRecentJobs(response.data.recentJobs || []);
            }
        } catch (error) {
            console.log("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    useEffect(() => {
        if (!employerToken) {
            navigation.replace("Login");
            return;
        }
        fetchDashboardData();
    }, [employerToken]);

    const handlePostJobCheck = async () => {
        try {
            const response = await api.get('/api/employer/documents', { headers: { token: employerToken } });
            const docs = response.data.documents || [];
            const hasUploaded = docs.length > 0;
            const allVerified = hasUploaded && docs.every(d => (d.status || '').toString().toLowerCase() === 'verified');

            if (hasUploaded && allVerified) {
                navigation.navigate('PostJob');
            } else {
                Alert.alert(t('common.error'), t('employer.dashboard.quickActions.postJobWarning'));
                navigation.navigate('EmployerDocuments');
            }
        } catch (err) {
            Alert.alert(t('common.error'), "Failed to check documents.");
        }
    };

    const handleLogout = async () => {
        await logout();
        navigation.replace("Login");
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('employer.dashboard.title')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title={t('employer.dashboard.stats.verificationsGiven')}
                        value={stats.verificationsGiven}
                        color="#e0e7ff"
                        onPress={() => navigation.navigate("VerificationsGiven")}
                    />
                    <StatCard
                        title={t('employer.dashboard.stats.jobsPosted')}
                        value={stats.jobsPosted}
                        color="#dcfce7"
                        onPress={() => navigation.navigate("MyJobs")}
                    />
                    <StatCard
                        title={t('employer.dashboard.stats.documentsVerified')}
                        value={`${stats.documentsVerified}/${stats.documentsUploaded}`}
                        color="#f3e8ff"
                        onPress={() => navigation.navigate("EmployerDocuments")}
                    />
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('employer.dashboard.quickActions.title')}</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2563eb' }]} onPress={() => navigation.navigate("CreateVerification")}>
                            <Text style={styles.actionTitle}>{t('employer.dashboard.quickActions.createVerification')}</Text>
                            <Text style={styles.actionDesc}>{t('employer.dashboard.quickActions.createVerificationDesc')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#16a34a' }]} onPress={handlePostJobCheck}>
                            <Text style={styles.actionTitle}>{t('employer.dashboard.quickActions.postJob')}</Text>
                            <Text style={styles.actionDesc}>{t('employer.dashboard.quickActions.postJobDesc')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Verifications */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('employer.dashboard.recentVerifications.title')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("VerificationsGiven")}>
                            <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                        </TouchableOpacity>
                    </View>
                    {recentVerifications.length > 0 ? (
                        recentVerifications.map((v, i) => (
                            <View key={i} style={styles.listItem}>
                                <Text style={styles.listTitle}>{v.worker?.name || v.employeeName}</Text>
                                <Text style={styles.listSubtitle}>{v.jobRole} • {new Date(v.createdAt).toLocaleDateString()}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>{t('employer.dashboard.recentVerifications.none')}</Text>
                    )}
                </View>

                {/* Recent Jobs */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('employer.dashboard.recentJobs.title')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("MyJobs")}>
                            <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                        </TouchableOpacity>
                    </View>
                    {recentJobs.length > 0 ? (
                        recentJobs.map((j, i) => (
                            <View key={i} style={styles.listItem}>
                                <Text style={styles.listTitle}>{j.title}</Text>
                                <Text style={styles.listSubtitle}>{j.location} • {j.status}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>{t('employer.dashboard.recentJobs.none')}</Text>
                    )}
                </View>

            </ScrollView>
            <EmployerSidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9fafb" },
    scrollContent: { padding: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    menuButton: { padding: 8 },
    menuIcon: { fontSize: 28, color: "#1f2937" },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1f2937", flex: 1, textAlign: "center" },
    logoutText: { color: "#ef4444", fontWeight: "600" },
    statsGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
    statCard: { width: "31%", padding: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    statTitle: { fontSize: 12, color: "#4b5563", marginBottom: 4, textAlign: 'center' },
    statValue: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937", marginBottom: 12 },
    seeAll: { color: "#4f46e5", fontWeight: "600" },
    actionGrid: { flexDirection: "row", gap: 12 },
    actionButton: { flex: 1, padding: 16, borderRadius: 12, justifyContent: "center" },
    actionTitle: { color: "white", fontWeight: "bold", fontSize: 16, marginBottom: 4 },
    actionDesc: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
    listItem: { backgroundColor: "white", padding: 16, borderRadius: 8, marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    listTitle: { fontSize: 16, fontWeight: "500", color: "#1f2937" },
    listSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
    emptyText: { color: "#9ca3af", fontStyle: "italic" },
});

export default EmployerDashboardScreen;
