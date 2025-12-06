import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from "../api/config";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const backendUrl = BACKEND_URL;

    // AUTH STATES
    const [userToken, setUserToken] = useState("");
    const [employerToken, setEmployerToken] = useState("");
    const [userName, setUserName] = useState("");
    // DOCUMENT REFRESH TRIGGER
    const [refreshDocs, setRefreshDocs] = useState(false);
    // USER PROFILE
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // AXIOS INSTANCE
    const api = axios.create({
        baseURL: backendUrl,
        headers: { "Content-Type": "application/json" },
    });

    // Load initial state from storage
    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const storedUserToken = await AsyncStorage.getItem("userToken");
                const storedEmployerToken = await AsyncStorage.getItem("employerToken");
                const storedUserName = await AsyncStorage.getItem("userName");

                if (storedUserToken) setUserToken(storedUserToken);
                if (storedEmployerToken) setEmployerToken(storedEmployerToken);
                if (storedUserName) setUserName(storedUserName);
            } catch (e) {
                console.error("Failed to load storage data", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStorageData();
    }, []);

    // Update storage when states change
    useEffect(() => {
        if (userToken) AsyncStorage.setItem("userToken", userToken);
        else AsyncStorage.removeItem("userToken");
    }, [userToken]);

    useEffect(() => {
        if (employerToken) AsyncStorage.setItem("employerToken", employerToken);
        else AsyncStorage.removeItem("employerToken");
    }, [employerToken]);

    useEffect(() => {
        if (userName) AsyncStorage.setItem("userName", userName);
        else AsyncStorage.removeItem("userName");
    }, [userName]);


    // LOAD USER PROFILE
    const loadUserProfile = async () => {
        if (!userToken) return;
        try {
            const { data } = await api.get("/api/user/profile", {
                headers: { Authorization: `Bearer ${userToken}` },
            });

            if (data.success) {
                const user = data.user || {};
                // Normalize dob to YYYY-MM-DD
                if (user.dob) {
                    try {
                        const s = typeof user.dob === "string" ? user.dob : new Date(user.dob).toISOString();
                        user.dob = s.split("T")[0];
                    } catch (e) {
                        // fallback
                    }
                }

                setUserProfile(user);
            }
        } catch (err) {
            console.log("Profile load failed:", err.message);
        }
    };

    // AUTO LOAD USER PROFILE ON TOKEN CHANGE
    useEffect(() => {
        if (userToken) {
            loadUserProfile();
        }
    }, [userToken]);

    // LOGOUT FUNCTION
    const logout = async () => {
        try {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("employerToken");
            await AsyncStorage.removeItem("userName");
            setUserToken("");
            setEmployerToken("");
            setUserName("");
            setUserProfile(null);
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    return (
        <AppContext.Provider
            value={{
                backendUrl,
                api,

                userToken,
                setUserToken,

                userName,
                setUserName,

                employerToken,
                setEmployerToken,

                refreshDocs,
                setRefreshDocs,

                userProfile,
                setUserProfile,
                loadUserProfile,
                isLoading,
                logout
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;
