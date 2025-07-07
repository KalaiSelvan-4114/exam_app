import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Avatar, useTheme, Surface } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const theme = useTheme();
    const navigation = useNavigation();

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    if (!user) return null;

    return (
        <LinearGradient
            colors={['#1976D2', '#43cea2', '#185a9d']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Surface style={styles.card} elevation={8}>
                    <View style={styles.avatarWrap}>
                        <Avatar.Text
                            size={80}
                            label={getInitials(user?.name || '')}
                            style={styles.avatar}
                        />
                    </View>
                    <Text style={styles.name}>{user?.name}</Text>
                    <Text style={styles.role}>
                        {user?.role === 'exam_coordinator'
                            ? 'Exam Coordinator'
                            : user?.role === 'department_coordinator'
                            ? 'Department Coordinator'
                            : user?.role === 'faculty'
                            ? 'Faculty Member'
                            : user?.role === 'staff'
                            ? 'Staff'
                            : user?.role}
                    </Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Department</Text>
                        <Text style={styles.infoValue}>{user?.department}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                    {user?.phone && (
                        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}> 
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{user.phone}</Text>
                        </View>
                    )}

                    {/* Navigation Buttons for Exam Pages */}
                    {user?.role === 'faculty' || user?.role === 'staff' ? (
                        <>
                            
                        </>
                    ) : null}
                    {user?.role === 'exam_coordinator' && (
                        <>
                            <Button
                                mode="outlined"
                                style={styles.button}
                                labelStyle={styles.buttonLabel}
                                onPress={() => navigation.navigate('CreateExam')}
                            >
                                Create Exam
                            </Button>
                            <Button
                                mode="outlined"
                                style={styles.button}
                                labelStyle={styles.buttonLabel}
                                onPress={() => navigation.navigate('ManageExams')}
                            >
                                Manage Exams
                            </Button>
                        </>
                    )}
                    {/* Add more role-based navigation as needed */}

                    <Button
                        mode="contained"
                        onPress={handleLogout}
                        style={[styles.button, styles.logoutButton]}
                        labelStyle={styles.buttonLabel}
                    >
                        Logout
                    </Button>
                </Surface>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        // justifyContent: 'center',
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        marginTop: 32,
        marginBottom: 32,
        alignItems: 'center',
    },
    avatarWrap: {
        marginBottom: 16,
        elevation: 4,
    },
    avatar: {
        backgroundColor: '#6C47FF',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 4,
        textAlign: 'center',
    },
    role: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoLabel: {
        color: '#888',
        fontSize: 15,
    },
    infoValue: {
        color: '#222',
        fontSize: 15,
        fontWeight: 'bold',
    },
    button: {
        width: '100%',
        borderRadius: 16,
        marginTop: 16,
        paddingVertical: 12,
    },
    logoutButton: {
        backgroundColor: '#6C47FF',
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen; 