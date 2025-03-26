import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Coordinator Screens
import CoordinatorDashboard from '../screens/coordinator/DashboardScreen';
import CreateExamScreen from '../screens/coordinator/CreateExamScreen';
import ManageExamsScreen from '../screens/coordinator/ManageExamsScreen';

// Faculty Screens
import FacultyDashboard from '../screens/faculty/DashboardScreen';
import ExamListScreen from '../screens/faculty/ExamListScreen';
import MyHallsScreen from '../screens/faculty/MyHallsScreen';

// Common Screens
import ProfileScreen from '../screens/common/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CoordinatorTabs = () => (
    <Tab.Navigator
        screenOptions={{
            tabBarActiveTintColor: '#1976D2',
            tabBarInactiveTintColor: 'gray',
        }}
    >
        <Tab.Screen
            name="Dashboard"
            component={CoordinatorDashboard}
            options={{
                tabBarIcon: ({ color }) => (
                    <Icon name="view-dashboard" size={24} color={color} />
                ),
            }}
        />
        <Tab.Screen
            name="Create Exam"
            component={CreateExamScreen}
            options={{
                tabBarIcon: ({ color }) => (
                    <Icon name="plus-circle" size={24} color={color} />
                ),
            }}
        />
        <Tab.Screen
            name="Manage Exams"
            component={ManageExamsScreen}
            options={{
                tabBarIcon: ({ color }) => (
                    <Icon name="calendar-clock" size={24} color={color} />
                ),
            }}
        />
        <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
                tabBarIcon: ({ color }) => (
                    <Icon name="account" size={24} color={color} />
                ),
            }}
        />
    </Tab.Navigator>
);

const FacultyTabs = () => (
    <Tab.Navigator
        screenOptions={{
            tabBarActiveTintColor: '#1976D2',
            tabBarInactiveTintColor: 'gray',
        }}
    >
        <Tab.Screen
            name="Dashboard"
            component={FacultyDashboard}
            options={{
                tabBarIcon: ({ color }) => (
                    <Icon name="view-dashboard" size={24} color={color} />
                ),
            }}
        />
        <Tab.Screen
            name="Exams"
            component={ExamListScreen}
            options={{
                tabBarIcon: ({ color }) => (
                    <Icon name="calendar" size={24} color={color} />
                ),
            }}
        />
        <Tab.Screen
            name="My Halls"
            component={MyHallsScreen}
            options={{
                tabBarIcon: ({ color }) => (
                    <Icon name="door" size={24} color={color} />
                ),
            }}
        />
        <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
                tabBarIcon: ({ color }) => (
                    <Icon name="account" size={24} color={color} />
                ),
            }}
        />
    </Tab.Navigator>
);

const AppNavigator = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    // App Stack based on user role
                    <>
                        {user?.role === 'coordinator' ? (
                            <Stack.Screen name="CoordinatorTabs" component={CoordinatorTabs} />
                        ) : (
                            <Stack.Screen name="FacultyTabs" component={FacultyTabs} />
                        )}
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator; 