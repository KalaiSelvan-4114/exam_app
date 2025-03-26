import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                // Verify token by getting user profile
                const userData = await authAPI.getProfile();
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // Only remove token if there's an auth error
            await AsyncStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const { token, user } = await authAPI.login(email, password);
            await AsyncStorage.setItem('token', token);
            setUser(user);
            return user;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const { token, user } = await authAPI.register(userData);
            await AsyncStorage.setItem('token', token);
            setUser(user);
            return user;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 