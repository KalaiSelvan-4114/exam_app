import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Icon, Modal, Portal } from '@rneui/base';

const FacultyDashboardScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');

    const handleCardPress = (type) => {
        // Implement the logic to handle card press
    };

    const renderModalContent = () => {
        // Implement the logic to render modal content
        return null;
    };

    return (
        <View style={styles.container}>
            <View style={styles.statsGrid}>
                <Card 
                    style={styles.statCard}
                    onPress={() => handleCardPress('upcoming')}
                >
                    <Card.Content style={styles.statCardContent}>
                        <Icon name="calendar-clock" size={32} color="#FF9800" style={styles.statIcon} />
                        <Text variant="titleLarge">{stats.upcomingExams}</Text>
                        <Text variant="bodyLarge">Upcoming Exams</Text>
                    </Card.Content>
                </Card>

                <Card 
                    style={styles.statCard}
                    onPress={() => handleCardPress('booked')}
                >
                    <Card.Content style={styles.statCardContent}>
                        <Icon name="bookmark" size={32} color="#2196F3" style={styles.statIcon} />
                        <Text variant="titleLarge">{stats.bookedHalls}</Text>
                        <Text variant="bodyLarge">Booked Halls</Text>
                    </Card.Content>
                </Card>

                <Card 
                    style={styles.statCard}
                    onPress={() => handleCardPress('completed')}
                >
                    <Card.Content style={styles.statCardContent}>
                        <Icon name="check-circle" size={32} color="#4CAF50" style={styles.statIcon} />
                        <Text variant="titleLarge">{stats.completedExams}</Text>
                        <Text variant="bodyLarge">Completed</Text>
                    </Card.Content>
                </Card>

                <Card 
                    style={styles.statCard}
                    onPress={() => handleCardPress('available')}
                >
                    <Card.Content style={styles.statCardContent}>
                        <Icon name="home" size={32} color="#9C27B0" style={styles.statIcon} />
                        <Text variant="titleLarge">{stats.availableHalls}</Text>
                        <Text variant="bodyLarge">Available Halls</Text>
                    </Card.Content>
                </Card>
            </View>

            <View style={styles.actions}>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('BookHall')}
                    style={styles.actionButton}
                    icon="plus"
                    contentStyle={styles.buttonContent}
                >
                    Book a Hall
                </Button>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('MyBookings')}
                    style={styles.actionButton}
                    icon="format-list-bulleted"
                    contentStyle={styles.buttonContent}
                >
                    My Bookings
                </Button>
            </View>

            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    <Text variant="titleLarge" style={styles.modalTitle}>
                        {modalTitle}
                    </Text>
                    <ScrollView>
                        {renderModalContent()}
                    </ScrollView>
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        marginRight: 8,
    },
    statCardContent: {
        alignItems: 'center',
        padding: 16,
    },
    statIcon: {
        marginBottom: 8,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    modalContent: {
        padding: 16,
    },
    modalTitle: {
        marginBottom: 16,
    },
});

export default FacultyDashboardScreen; 