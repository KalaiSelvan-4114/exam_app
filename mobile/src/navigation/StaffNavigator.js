import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import StaffDashboard from '../screens/staff/DashboardScreen';
import ExamListScreen from '../screens/staff/ExamListScreen';
import MyHallsScreen from '../screens/staff/MyHallsScreen';
import SessionBookingScreen from '../screens/staff/SessionBookingScreen';
import ExamPreferencesScreen from '../screens/staff/ExamPreferencesScreen';
import StaffReportsScreen from '../screens/staff/StaffReportsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function StaffNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={StaffDashboard}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="All Exams"
        component={ExamListScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="clipboard-list" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Book Sessions"
        component={SessionBookingScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar-plus" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="My Halls"
        component={MyHallsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="office-building" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
} 