import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Font from 'expo-font';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Coordinator Screens
import CoordinatorDashboard from './src/screens/coordinator/DashboardScreen';
import CreateExamScreen from './src/screens/coordinator/CreateExamScreen';
import ManageExamsScreen from './src/screens/coordinator/ManageExamsScreen';

// Faculty Screens
import FacultyDashboard from './src/screens/faculty/DashboardScreen';
import ExamListScreen from './src/screens/faculty/ExamListScreen';
import MyHallsScreen from './src/screens/faculty/MyHallsScreen';

// Common Screens
import ProfileScreen from './src/screens/common/ProfileScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // Or a loading screen
    }

    return (
        <Stack.Navigator
            initialRouteName={user ? (user.role === 'coordinator' ? 'CoordinatorDashboard' : 'FacultyDashboard') : 'Login'}
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#6200ee',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            {/* Auth Stack */}
            {!user ? (
                <>
                    <Stack.Screen 
                        name="Login" 
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                        name="Register" 
                        component={RegisterScreen}
                        options={{ headerShown: false }}
                    />
                </>
            ) : (
                <>
                    {/* Coordinator Stack */}
                    {user.role === 'coordinator' ? (
                        <>
                            <Stack.Screen 
                                name="CoordinatorDashboard" 
                                component={CoordinatorDashboard}
                                options={{ title: 'Dashboard' }}
                            />
                            <Stack.Screen 
                                name="CreateExam" 
                                component={CreateExamScreen}
                                options={{ title: 'Create Exam' }}
                            />
                            <Stack.Screen 
                                name="ManageExams" 
                                component={ManageExamsScreen}
                                options={{ title: 'Manage Exams' }}
                            />
                        </>
                    ) : (
                        <>
                            <Stack.Screen 
                                name="FacultyDashboard" 
                                component={FacultyDashboard}
                                options={{ title: 'Dashboard' }}
                            />
                            <Stack.Screen 
                                name="ExamList" 
                                component={ExamListScreen}
                                options={{ title: 'Exam List' }}
                            />
                            <Stack.Screen 
                                name="MyHalls" 
                                component={MyHallsScreen}
                                options={{ title: 'My Halls' }}
                            />
                        </>
                    )}

                    {/* Common Screens */}
                    <Stack.Screen 
                        name="Profile" 
                        component={ProfileScreen}
                        options={{ title: 'Profile' }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadFonts() {
            await Font.loadAsync({
                MaterialCommunityIcons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
            });
            setFontsLoaded(true);
        }
        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return null; // Or a loading screen
    }

    return (
        <PaperProvider>
            <AuthProvider>
                <NavigationContainer>
                    <Navigation />
                </NavigationContainer>
            </AuthProvider>
        </PaperProvider>
    );
}