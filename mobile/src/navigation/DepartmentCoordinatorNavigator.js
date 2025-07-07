import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import ManageHallsScreen from '../screens/department_coordinator/ManageHallsScreen';
import ViewAssignmentsScreen from '../screens/department_coordinator/ViewAssignmentsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import AllocateHallsScreen from '../screens/department_coordinator/AllocateHallsScreen';

const Tab = createBottomTabNavigator();

export default function DepartmentCoordinatorNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#6200ee',
                tabBarInactiveTintColor: 'gray',
                headerShown: true
            }}
        >
            <Tab.Screen
                name="ManageHalls"
                component={ManageHallsScreen}
                options={{
                    title: 'Manage Halls',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="office-building" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="ViewAssignments"
                component={ViewAssignmentsScreen}
                options={{
                    title: 'Assignments',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />
                    )
                }}
            />
           
            <Tab.Screen
                name="AllocateHalls"
                component={AllocateHallsScreen}
                options={{
                    title: 'Allocate Halls',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="office-building" size={size} color={color} />
                    )
                }}
            />
             <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" size={size} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    );
} 