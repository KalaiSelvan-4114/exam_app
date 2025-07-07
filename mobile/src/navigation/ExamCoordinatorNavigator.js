import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import CreateExamScreen from '../screens/exam_coordinator/CreateExamScreen';
import ManageExamsScreen from '../screens/exam_coordinator/ManageExamsScreen';
import AddUserScreen from '../screens/exam_coordinator/AddUserScreen';
import ReportsScreen from '../screens/exam_coordinator/ReportsScreen';
import HallAllocationScreen from '../screens/exam_coordinator/HallAllocationScreen';
import SessionAssignmentScreen from '../screens/exam_coordinator/SessionAssignmentScreen';
import ProfileScreen from '../screens/common/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for exam management
function ExamManagementStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ManageExams" component={ManageExamsScreen} />
      <Stack.Screen name="CreateExam" component={CreateExamScreen} />
    </Stack.Navigator>
  );
}

export default function ExamCoordinatorNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Manage Exams"
      screenOptions={{
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name="Manage Exams"
        component={ExamManagementStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="clipboard-list" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Hall Allocation"
        component={HallAllocationScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="office-building" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Session Assignment"
        component={SessionAssignmentScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar-check" size={24} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="file-chart" size={24} color={color} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="Add User"
        component={AddUserScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-plus" size={24} color={color} />
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