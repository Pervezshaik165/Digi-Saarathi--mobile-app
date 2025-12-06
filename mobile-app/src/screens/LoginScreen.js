import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView } from "react-native";
import { AppContext } from "../context/AppContext";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const LoginScreen = () => {
    const { t } = useTranslation();
    const [mode, setMode] = useState("User Login");
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const {
        api,
        userToken,
        employerToken,
        setUserToken,
        setEmployerToken,
        setUserName
    } = useContext(AppContext);

    const navigate = useNavigation();

    const getModeKey = (currentMode) => {
        switch (currentMode) {
            case "User Login": return "user_login";
            case "User Sign Up": return "user_signup";
            case "Employer Login": return "employer_login";
            case "Employer Sign Up": return "employer_signup";
            default: return "user_login";
        }
    };

    const onSubmitHandler = async () => {
        const clearInputs = () => {
            setEmail("");
            setPassword("");
            setName("");
            setCompany("");
        };

        try {
            let endpoint = "";
            let payload = {};

            if (mode === "User Sign Up") {
                endpoint = "/api/user/register";
                payload = { name, email, password };
            } else if (mode === "User Login") {
                endpoint = "/api/user/login";
                payload = { email, password };
            } else if (mode === "Employer Sign Up") {
                endpoint = "/api/employer/register";
                payload = { company, email, password };
            } else if (mode === "Employer Login") {
                endpoint = "/api/employer/login";
                payload = { email, password };
            }

            const response = await api.post(endpoint, payload);
            const { data } = response;

            if (!data.success) {
                Alert.alert("Error", data.message || "Login failed");
                clearInputs();
                return;
            }

            // Using a generic success message or specific based on mode if keys exist
            Alert.alert(t('login.success', { mode: t(`login.${getModeKey(mode)}.label`) }));

            if (mode.includes("User")) {
                setUserToken(data.token);
                if (data.user && data.user.name) {
                    setUserName(data.user.name);
                }
            } else {
                setEmployerToken(data.token);
            }

            clearInputs();

        } catch (error) {
            console.log("Login Error:", error);
            if (error.response) {
                Alert.alert("Error", error.response.data?.message || "Server Error");
            } else if (error.request) {
                Alert.alert("Network Error", "Could not connect to server.");
            } else {
                Alert.alert("Error", error.message || "Something went wrong");
            }
            clearInputs();
        }
    };

    useEffect(() => {
        if (userToken) navigate.replace("UserDashboard");
        if (employerToken) navigate.replace("EmployerDashboard");
    }, [userToken, employerToken]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.card}>
                    <Text style={styles.title}>{t(`login.${getModeKey(mode)}.label`)}</Text>

                    {mode === "User Sign Up" && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('login.fullName')}</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder={t('login.fullName')}
                            />
                        </View>
                    )}

                    {mode === "Employer Sign Up" && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('login.companyName')}</Text>
                            <TextInput
                                style={styles.input}
                                value={company}
                                onChangeText={setCompany}
                                placeholder={t('login.companyName')}
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('login.email')}</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder={t('login.email')}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('login.password')}</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder={t('login.password')}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={onSubmitHandler}>
                        <Text style={styles.buttonText}>
                            {mode.includes("Sign Up") ? t('login.createAccount') : t('login.loginButton')}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.switchContainer}>
                        {mode === "User Login" && (
                            <>
                                <Text style={styles.switchText}>
                                    {t('login.newUser')}{" "}
                                    <Text style={styles.link} onPress={() => setMode("User Sign Up")}>
                                        {t('login.signUp')}
                                    </Text>
                                </Text>
                                <Text style={styles.switchText}>
                                    {t('login.employerQuestion')}{" "}
                                    <Text style={styles.link} onPress={() => setMode("Employer Login")}>
                                        {t('login.loginHere')}
                                    </Text>
                                </Text>
                            </>
                        )}

                        {mode === "Employer Login" && (
                            <>
                                <Text style={styles.switchText}>
                                    {t('login.needEmployer')}{" "}
                                    <Text style={styles.link} onPress={() => setMode("Employer Sign Up")}>
                                        {t('login.signUp')}
                                    </Text>
                                </Text>
                                <Text style={styles.switchText}>
                                    {t('login.userDefault') || "Are you a User?"}{" "}
                                    <Text style={styles.link} onPress={() => setMode("User Login")}>
                                        {t('login.loginHere')}
                                    </Text>
                                </Text>
                            </>
                        )}

                        {mode === "User Sign Up" && (
                            <Text style={styles.switchText}>
                                {t('login.alreadyHaveAccount')}{" "}
                                <Text style={styles.link} onPress={() => setMode("User Login")}>
                                    {t('login.loginButton')}
                                </Text>
                            </Text>
                        )}

                        {mode === "Employer Sign Up" && (
                            <Text style={styles.switchText}>
                                {t('login.alreadyHaveAccount')}{" "}
                                <Text style={styles.link} onPress={() => setMode("Employer Login")}>
                                    {t('login.loginButton')}
                                </Text>
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f4f6",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 24,
        color: "#1f2937",
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: "#4b5563",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#1f2937",
    },
    button: {
        backgroundColor: "#2563eb",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    switchContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    switchText: {
        fontSize: 14,
        color: "#4b5563",
        marginBottom: 8,
    },
    link: {
        color: "#2563eb",
        fontWeight: "600",
    },
});

export default LoginScreen;
