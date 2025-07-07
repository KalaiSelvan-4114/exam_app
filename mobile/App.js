import * as React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import MainNavigator from './src/navigation/MainNavigator';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export default function App() {
    // Callback to redirect to Login on auth failure
    const handleAuthFail = () => {
        if (navigationRef.isReady()) {
            navigationRef.navigate('Login');
        }
    };

    return (
        <PaperProvider>
            <AuthProvider onAuthFail={handleAuthFail}>
                <NavigationContainer ref={navigationRef}>
                <MainNavigator />
                </NavigationContainer>
            </AuthProvider>
        </PaperProvider>
    );
}