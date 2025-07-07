import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

console.log('AuthContext.js is loaded');

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children, onAuthFail }) => {
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
            if (onAuthFail) onAuthFail(); // Call the callback if provided
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('Login attempt for:', email);
            const response = await authAPI.login(email, password);
            console.log('Login response:', response);
            
            if (!response || !response.token || !response.user) {
                throw new Error('Invalid response from server');
            }

            await AsyncStorage.setItem('token', response.token);
            setUser(response.user);
            return response.user;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            if (!response || !response.token || !response.user) {
                throw new Error('Invalid response from server');
            }
            await AsyncStorage.setItem('token', response.token);
            setUser(response.user);
            return response.user;
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