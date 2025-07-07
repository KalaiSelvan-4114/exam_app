import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Role-based Navigators
import ExamCoordinatorNavigator from './ExamCoordinatorNavigator';
import DepartmentCoordinatorNavigator from './DepartmentCoordinatorNavigator';
import StaffNavigator from './StaffNavigator';

const Stack = createStackNavigator();

export default function MainNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // Or a loading screen
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                // Auth Stack
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            ) : (
                // Role-based Navigation
                <>
                    {user.role === 'exam_coordinator' && (
                        <Stack.Screen name="ExamCoordinatorNavigator" component={ExamCoordinatorNavigator} />
                    )}
                    {user.role === 'department_coordinator' && (
                        <Stack.Screen name="DepartmentCoordinatorNavigator" component={DepartmentCoordinatorNavigator} />
                    )}
                    {user.role === 'staff' && (
                        <Stack.Screen name="StaffNavigator" component={StaffNavigator} />
                    )}
                </>
            )}
        </Stack.Navigator>
    );
} 