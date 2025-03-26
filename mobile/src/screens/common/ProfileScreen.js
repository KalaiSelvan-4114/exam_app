import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar, Card, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const theme = useTheme();

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

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                    <Avatar.Text
                        size={80}
                        label={getInitials(user?.name || '')}
                        style={styles.avatar}
                    />
                    <Text variant="headlineSmall" style={styles.name}>
                        {user?.name}
                    </Text>
                    <Text variant="titleMedium" style={styles.role}>
                        {user?.role === 'coordinator' ? 'Exam Coordinator' : 'Faculty Member'}
                    </Text>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Text variant="bodyLarge" style={styles.label}>
                                Department
                            </Text>
                            <Text variant="bodyLarge" style={styles.value}>
                                {user?.department}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text variant="bodyLarge" style={styles.label}>
                                Email
                            </Text>
                            <Text variant="bodyLarge" style={styles.value}>
                                {user?.email}
                            </Text>
                        </View>

                        {user?.phone && (
                            <View style={styles.infoRow}>
                                <Text variant="bodyLarge" style={styles.label}>
                                    Phone
                                </Text>
                                <Text variant="bodyLarge" style={styles.value}>
                                    {user.phone}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleLogout}
                        style={styles.logoutButton}
                    >
                        Logout
                    </Button>
                </Card.Content>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    card: {
        elevation: 4,
    },
    cardContent: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatar: {
        marginBottom: 16,
    },
    name: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    role: {
        color: '#666',
        marginBottom: 24,
    },
    infoContainer: {
        width: '100%',
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    label: {
        color: '#666',
    },
    value: {
        fontWeight: '500',
    },
    logoutButton: {
        width: '100%',
        marginTop: 8,
    },
});

export default ProfileScreen; 