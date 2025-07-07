import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import DashboardScreen from '../screens/exam_coordinator/DashboardScreen';
import ProfileScreen from '../screens/common/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Profile"
        screenOptions={{
            tabBarActiveTintColor: '#1976D2',
            tabBarInactiveTintColor: 'gray',
        }}
    >
        <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
                tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
                ),
            }}
        />
        <Tab.Screen
            name="Dashboard"
        component={DashboardScreen}
            options={{
                tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />
                ),
            }}
        />
    </Tab.Navigator>
);
} 