import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../screens/LoginScreen";
import UserDashboardScreen from "../screens/UserDashboardScreen";
import DocumentsScreen from "../screens/DocumentsScreen";
import JobsScreen from "../screens/JobsScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import UserQRScreen from "../screens/UserQRScreen";
import SchemesScreen from "../screens/SchemesScreen";
import EmployerDashboardScreen from "../screens/EmployerDashboardScreen";
import EmployerDocumentsScreen from "../screens/EmployerDocumentsScreen";
import EmployerProfileScreen from "../screens/EmployerProfileScreen";
import PostJobScreen from "../screens/PostJobScreen";
import MyJobsScreen from "../screens/MyJobsScreen";
import EmployerUserDocumentsScreen from "../screens/EmployerUserDocumentsScreen";
import CreateVerificationScreen from "../screens/CreateVerificationScreen";
import VerificationsGivenScreen from "../screens/VerificationsGivenScreen";
import { AppContext } from "../context/AppContext";
import { View, ActivityIndicator } from "react-native";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isLoading, userToken, employerToken } = useContext(AppContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {userToken ? (
                    <>
                        <Stack.Screen name="UserDashboard" component={UserDashboardScreen} options={{ title: "Dashboard" }} />
                        <Stack.Screen name="Documents" component={DocumentsScreen} />
                        <Stack.Screen name="Jobs" component={JobsScreen} />
                        <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: "Profile" }} />
                        <Stack.Screen name="UserQR" component={UserQRScreen} options={{ title: "QR Certificates" }} />
                        <Stack.Screen name="Schemes" component={SchemesScreen} />
                    </>
                ) : employerToken ? (
                    <>
                        <Stack.Screen name="EmployerDashboard" component={EmployerDashboardScreen} options={{ title: "Dashboard" }} />
                        <Stack.Screen name="EmployerDocuments" component={EmployerDocumentsScreen} options={{ title: "Documents" }} />
                        <Stack.Screen name="EmployerProfile" component={EmployerProfileScreen} options={{ title: "Profile" }} />
                        <Stack.Screen name="PostJob" component={PostJobScreen} />
                        <Stack.Screen name="MyJobs" component={MyJobsScreen} options={{ title: "My Jobs" }} />
                        <Stack.Screen name="EmployerUserDocuments" component={EmployerUserDocumentsScreen} options={{ title: "User Documents" }} />
                        <Stack.Screen name="CreateVerification" component={CreateVerificationScreen} options={{ title: "Create Verification" }} />
                        <Stack.Screen name="VerificationsGiven" component={VerificationsGivenScreen} options={{ title: "Verifications" }} />
                    </>
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
