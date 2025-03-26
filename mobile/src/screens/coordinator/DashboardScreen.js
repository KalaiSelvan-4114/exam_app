import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, useTheme, Surface, IconButton, Portal, Modal, List, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { examAPI, hallAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DashboardScreen = ({ navigation }) => {
    const [stats, setStats] = useState({
        totalExams: 0,
        completedExams: 0,
        upcomingExams: 0,
        totalBookings: 0,
        notBookedHalls: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [exams, setExams] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const { user } = useAuth();
    const theme = useTheme();

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const examsData = await examAPI.getExams();
            const exams = examsData || [];

            // Calculate statistics
            const now = new Date();
            const totalExams = exams.length;
            const completedExams = exams.filter(exam => exam.status === 'completed').length;
            const upcomingExams = exams.filter(exam => new Date(exam.date) > now).length;
            
            // Count booked and not booked halls from all exams
            const totalBookings = exams.reduce((count, exam) => 
                count + exam.halls.filter(hall => hall.status === 'booked').length, 0);
            
            const notBookedHalls = exams.reduce((count, exam) => 
                count + exam.halls.filter(hall => hall.status === 'available').length, 0);

            setStats({
                totalExams,
                completedExams,
                upcomingExams,
                totalBookings,
                notBookedHalls,
            });

            setExams(exams);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Alert.alert('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <IconButton
                    icon="account"
                    size={24}
                    onPress={() => navigation.navigate('Profile')}
                    iconColor="#fff"
                />
            ),
        });
    }, [navigation]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadDashboardData();
    }, []);

    const handleCardPress = async (type) => {
        try {
            let data = [];
            let title = '';

            // Get fresh data for all cases
            const freshExamsData = await examAPI.getExams();
            const now = new Date();

            switch (type) {
                case 'exams':
                    data = freshExamsData;
                    title = 'All Exams';
                    break;
                case 'completed':
                    data = freshExamsData.filter(exam => exam.status === 'completed');
                    title = 'Completed Exams';
                    break;
                case 'upcoming':
                    data = freshExamsData.filter(exam => new Date(exam.date) > now);
                    title = 'Upcoming Exams';
                    break;
                case 'bookings':
                    const bookings = freshExamsData.reduce((acc, exam) => {
                        const bookedHalls = exam.halls
                            .filter(hall => hall.status === 'booked')
                            .map(hall => ({
                                _id: `${exam._id}-${hall.hallNumber}`,
                                exam: {
                                    _id: exam._id,
                                    title: exam.title,
                                    date: exam.date,
                                    department: exam.department
                                },
                                hallNumber: hall.hallNumber,
                                capacity: hall.capacity,
                                status: hall.status,
                                bookedBy: hall.bookedBy ? {
                                    _id: hall.bookedBy._id,
                                    name: hall.bookedBy.name,
                                    email: hall.bookedBy.email
                                } : null
                            }));
                        return [...acc, ...bookedHalls];
                    }, []);
                    data = bookings;
                    title = 'All Bookings';
                    break;
                case 'notBooked':
                    const notBooked = freshExamsData.reduce((acc, exam) => {
                        const availableHalls = exam.halls
                            .filter(hall => hall.status === 'available')
                            .map(hall => ({
                                _id: `${exam._id}-${hall.hallNumber}`,
                                exam: {
                                    _id: exam._id,
                                    title: exam.title,
                                    date: exam.date,
                                    department: exam.department
                                },
                                hallNumber: hall.hallNumber,
                                capacity: hall.capacity,
                                status: hall.status
                            }));
                        return [...acc, ...availableHalls];
                    }, []);
                    data = notBooked;
                    title = 'Available Halls';
                    break;
            }

            setModalTitle(title);
            setModalData(data || []);
            setModalVisible(true);
        } catch (error) {
            console.error(`Error loading ${type} data:`, error);
            Alert.alert('Error', `Failed to load ${type} data`);
        }
    };

    const renderModalContent = () => {
        if (modalData.length === 0) {
            return (
                <View style={styles.noDataContainer}>
                    <Icon name="information" size={48} color="#666" />
                    <Text variant="bodyLarge" style={styles.noDataText}>
                        No Data Available
                    </Text>
                </View>
            );
        }

        switch (modalTitle) {
            case 'All Exams':
                return modalData.map((exam) => (
                    <Card key={exam._id} style={styles.modalCard}>
                        <Card.Content>
                            <Text variant="titleMedium">{exam.title}</Text>
                            <Text variant="bodyMedium">Department: {exam.department}</Text>
                            <Text variant="bodyMedium">Date: {new Date(exam.date).toLocaleDateString()}</Text>
                            <Text variant="bodyMedium">Status: {exam.status}</Text>
                        </Card.Content>
                    </Card>
                ));
            case 'Completed Exams':
                return modalData.map((exam) => (
                    <Card key={exam._id} style={styles.modalCard}>
                        <Card.Content>
                            <Text variant="titleMedium">{exam.title}</Text>
                            <Text variant="bodyMedium">Department: {exam.department}</Text>
                            <Text variant="bodyMedium">Date: {new Date(exam.date).toLocaleDateString()}</Text>
                            <Text variant="bodyMedium">Status: {exam.status}</Text>
                        </Card.Content>
                    </Card>
                ));
            case 'Upcoming Exams':
                return modalData.map((exam) => (
                    <Card key={exam._id} style={styles.modalCard}>
                        <Card.Content>
                            <Text variant="titleMedium">{exam.title}</Text>
                            <Text variant="bodyMedium">Department: {exam.department}</Text>
                            <Text variant="bodyMedium">Date: {new Date(exam.date).toLocaleDateString()}</Text>
                            <Text variant="bodyMedium">Status: {exam.status}</Text>
                        </Card.Content>
                    </Card>
                ));
            case 'All Bookings':
                return modalData.map((booking) => (
                    <Card key={booking._id} style={styles.modalCard}>
                        <Card.Content>
                            <Text variant="titleMedium">Hall {booking.hallNumber}</Text>
                            <Text variant="bodyMedium">Exam: {booking.exam?.title || 'N/A'}</Text>
                            <Text variant="bodyMedium">Department: {booking.exam?.department || 'N/A'}</Text>
                            <Text variant="bodyMedium">Date: {new Date(booking.exam?.date).toLocaleDateString() || 'N/A'}</Text>
                            <Text variant="bodyMedium">Capacity: {booking.capacity} students</Text>
                            <Text variant="bodyMedium">Status: {booking.status}</Text>
                            {booking.bookedBy && (
                                <Text variant="bodyMedium">Booked by: {booking.bookedBy.name}</Text>
                            )}
                        </Card.Content>
                    </Card>
                ));
            case 'Available Halls':
                return modalData.map((hall) => (
                    <Card key={hall._id} style={styles.modalCard}>
                        <Card.Content>
                            <Text variant="titleMedium">Hall {hall.hallNumber}</Text>
                            <Text variant="bodyMedium">Exam: {hall.exam?.title || 'N/A'}</Text>
                            <Text variant="bodyMedium">Department: {hall.exam?.department || 'N/A'}</Text>
                            <Text variant="bodyMedium">Date: {new Date(hall.exam?.date).toLocaleDateString() || 'N/A'}</Text>
                            <Text variant="bodyMedium">Capacity: {hall.capacity} students</Text>
                            <Text variant="bodyMedium">Status: {hall.status}</Text>
                        </Card.Content>
                    </Card>
                ));
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.welcomeText}>
                    Welcome, {user?.name}
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                    Exam Coordinator
                </Text>
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>
                Dashboard Overview
            </Text>

            <View style={styles.statsGrid}>
                <Card 
                    style={styles.statCard}
                    onPress={() => handleCardPress('exams')}
                >
                    <Card.Content style={styles.statCardContent}>
                        <Icon name="file-document" size={32} color="#6200ee" style={styles.statIcon} />
                        <Text variant="titleLarge">{stats.totalExams}</Text>
                        <Text variant="bodyLarge">Total Exams</Text>
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
                    onPress={() => handleCardPress('upcoming')}
                >
                    <Card.Content style={styles.statCardContent}>
                        <Icon name="calendar-clock" size={32} color="#FF9800" style={styles.statIcon} />
                        <Text variant="titleLarge">{stats.upcomingExams}</Text>
                        <Text variant="bodyLarge">Upcoming</Text>
                    </Card.Content>
                </Card>

                <Card 
                    style={styles.statCard}
                    onPress={() => handleCardPress('bookings')}
                >
                    <Card.Content style={styles.statCardContent}>
                        <Icon name="bookmark" size={32} color="#2196F3" style={styles.statIcon} />
                        <Text variant="titleLarge">{stats.totalBookings}</Text>
                        <Text variant="bodyLarge">Booked Halls</Text>
                    </Card.Content>
                </Card>

                <Card 
                    style={styles.statCard}
                    onPress={() => handleCardPress('notBooked')}
                >
                    <Card.Content style={styles.statCardContent}>
                        <Icon name="home" size={32} color="#9C27B0" style={styles.statIcon} />
                        <Text variant="titleLarge">{stats.notBookedHalls}</Text>
                        <Text variant="bodyLarge">Available Halls</Text>
                    </Card.Content>
                </Card>
            </View>

            <View style={styles.actions}>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('CreateExam')}
                    style={styles.actionButton}
                    icon="plus"
                >
                    Create New Exam
                </Button>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('ManageExams')}
                    style={styles.actionButton}
                    icon="format-list-bulleted"
                >
                    Manage Exams
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 16,
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    welcomeText: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#666',
    },
    sectionTitle: {
        marginBottom: 16,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        elevation: 4,
    },
    actions: {
        padding: 20,
        gap: 16,
    },
    actionButton: {
        marginBottom: 8,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxHeight: '80%',
    },
    modalTitle: {
        marginBottom: 16,
        fontWeight: 'bold',
    },
    modalCard: {
        marginBottom: 8,
        elevation: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statCardContent: {
        alignItems: 'center',
        padding: 16,
    },
    statIcon: {
        marginBottom: 8,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noDataText: {
        marginTop: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default DashboardScreen; 