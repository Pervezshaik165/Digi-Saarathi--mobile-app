import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AppContext } from '../context/AppContext';
import EmployerDashboardScreen from '../screens/EmployerDashboardScreen';
import EmployerDocumentsScreen from '../screens/EmployerDocumentsScreen';
import EmployerProfileScreen from '../screens/EmployerProfileScreen';
import PostJobScreen from '../screens/PostJobScreen';
import MyJobsScreen from '../screens/MyJobsScreen';
import EmployerUserDocumentsScreen from '../screens/EmployerUserDocumentsScreen';
import CreateVerificationScreen from '../screens/CreateVerificationScreen';
import VerificationsGivenScreen from '../screens/VerificationsGivenScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }) => {
    const { logout } = useContext(AppContext);

    const menuItems = [
        { name: 'EmployerDashboard', label: '🏠 Dashboard', icon: '🏠' },
        { name: 'MyJobs', label: '💼 My Jobs', icon: '💼' },
        { name: 'PostJob', label: '➕ Post Job', icon: '➕' },
        { name: 'EmployerDocuments', label: '📄 Documents', icon: '📄' },
        { name: 'CreateVerification', label: '✅ Create Verification', icon: '✅' },
        { name: 'VerificationsGiven', label: '📋 Verifications', icon: '📋' },
        { name: 'EmployerProfile', label: '👤 Profile', icon: '👤' },
    ];

    return (
        <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
                <Image source={require('../../assets/logo.png')} style={styles.logo} />
                <Text style={styles.appName}>Digi Saarthi</Text>
                <Text style={styles.employerBadge}>Employer</Text>
            </View>

            <View style={styles.menuItems}>
                {menuItems.map((item) => (
                    <TouchableOpacity
                        key={item.name}
                        style={styles.menuItem}
                        onPress={() => navigation.navigate(item.name)}
                    >
                        <Text style={styles.menuIcon}>{item.icon}</Text>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={async () => {
                    await logout();
                    navigation.replace('Login');
                }}
            >
                <Text style={styles.logoutText}>🚪 Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

export const EmployerDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: { backgroundColor: '#059669' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                drawerStyle: { width: 280 },
            }}
        >
            <Drawer.Screen name="EmployerDashboard" component={EmployerDashboardScreen} options={{ title: 'Dashboard' }} />
            <Drawer.Screen name="MyJobs" component={MyJobsScreen} options={{ title: 'My Jobs' }} />
            <Drawer.Screen name="PostJob" component={PostJobScreen} options={{ title: 'Post Job' }} />
            <Drawer.Screen name="EmployerDocuments" component={EmployerDocumentsScreen} options={{ title: 'Documents' }} />
            <Drawer.Screen name="CreateVerification" component={CreateVerificationScreen} options={{ title: 'Create Verification' }} />
            <Drawer.Screen name="VerificationsGiven" component={VerificationsGivenScreen} options={{ title: 'Verifications' }} />
            <Drawer.Screen name="EmployerProfile" component={EmployerProfileScreen} options={{ title: 'Profile' }} />
            <Drawer.Screen name="EmployerUserDocuments" component={EmployerUserDocumentsScreen} options={{ title: 'User Documents' }} />
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    drawerHeader: {
        backgroundColor: '#059669',
        padding: 20,
        alignItems: 'center',
        paddingTop: 50,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    appName: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    employerBadge: {
        color: 'white',
        fontSize: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    menuItems: {
        flex: 1,
        paddingTop: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    menuIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    menuLabel: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    logoutButton: {
        margin: 20,
        padding: 16,
        backgroundColor: '#ef4444',
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
