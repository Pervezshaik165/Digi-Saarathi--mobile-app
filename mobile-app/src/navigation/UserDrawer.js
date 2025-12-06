import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AppContext } from '../context/AppContext';
import UserDashboardScreen from '../screens/UserDashboardScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import JobsScreen from '../screens/JobsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import UserQRScreen from '../screens/UserQRScreen';
import SchemesScreen from '../screens/SchemesScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }) => {
    const { logout } = useContext(AppContext);

    const menuItems = [
        { name: 'UserDashboard', label: '🏠 Dashboard', icon: '🏠' },
        { name: 'Documents', label: '📄 Documents', icon: '📄' },
        { name: 'Jobs', label: '💼 Jobs', icon: '💼' },
        { name: 'UserQR', label: '📱 QR Certificates', icon: '📱' },
        { name: 'Schemes', label: '📋 Schemes', icon: '📋' },
        { name: 'UserProfile', label: '👤 Profile', icon: '👤' },
    ];

    return (
        <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
                <Image source={require('../../assets/logo.png')} style={styles.logo} />
                <Text style={styles.appName}>Digi Saarthi</Text>
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

export const UserDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: { backgroundColor: '#4f46e5' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                drawerStyle: { width: 280 },
            }}
        >
            <Drawer.Screen name="UserDashboard" component={UserDashboardScreen} options={{ title: 'Dashboard' }} />
            <Drawer.Screen name="Documents" component={DocumentsScreen} />
            <Drawer.Screen name="Jobs" component={JobsScreen} />
            <Drawer.Screen name="UserQR" component={UserQRScreen} options={{ title: 'QR Certificates' }} />
            <Drawer.Screen name="Schemes" component={SchemesScreen} />
            <Drawer.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profile' }} />
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    drawerHeader: {
        backgroundColor: '#4f46e5',
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
