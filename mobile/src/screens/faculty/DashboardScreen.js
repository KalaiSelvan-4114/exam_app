import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, IconButton, useTheme, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { examAPI, hallAPI } from '../../services/api';

const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const theme = useTheme();
    const [stats, setStats] = useState({
        totalExams: 0,
        upcomingExams: 0,
        completedExams: 0,
        bookedHalls: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalTitle, setModalTitle] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const calculateStats = (exams) => {
        const now = new Date();
        return {
            totalExams: exams.length,
            upcomingExams: exams.filter(exam => new Date(exam.date) > now).length,
            completedExams: exams.filter(exam => new Date(exam.date) < now).length
        };
    };

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const exams = await examAPI.getExams();
            const calculatedStats = calculateStats(exams);
            setStats(calculatedStats);
            setModalData(exams);
        } catch (error) {
            console.error('Error loading stats:', error);
            setError('Failed to load dashboard statistics');
            setStats({
                totalExams: 0,
                upcomingExams: 0,
                completedExams: 0,
                bookedHalls: 0
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
    };

    const handleCardPress = (type) => {
        let title = '';
        let filteredData = [];
        const now = new Date();

        switch (type) {
            case 'total':
                title = 'All Exams';
                filteredData = modalData.filter(exam => {
                    const examEndDateTime = new Date(`${exam.date}T${exam.endTime}`);
                    return examEndDateTime > now;
                });
                break;
            case 'upcoming':
                title = 'Upcoming Exams';
                filteredData = modalData.filter(exam => {
                    const examStartDateTime = new Date(`${exam.date}T${exam.startTime}`);
                    return examStartDateTime > now;
                });
                break;
            case 'completed':
                title = 'Completed Exams';
                filteredData = modalData.filter(exam => {
                    const examEndDateTime = new Date(`${exam.date}T${exam.endTime}`);
                    return examEndDateTime <= now;
                });
                break;
        }

        setModalTitle(title);
        setModalData(filteredData);
        setModalVisible(true);
    };

    const canUnbookHall = (examDate) => {
        const examDateTime = new Date(examDate);
        const now = new Date();
        const hoursDifference = (examDateTime - now) / (1000 * 60 * 60);
        return hoursDifference >= 16;
    };

    const handleUnbookHall = async (examId, hallId) => {
        try {
            const response = await hallAPI.unbookHall(examId, hallId);
            if (response.success) {
                // Refresh the data after successful unbooking
                await loadStats();
                Alert.alert('Success', 'Hall unbooked successfully');
            } else {
                Alert.alert('Error', response.message || 'Failed to unbook hall');
            }
        } catch (error) {
            console.error('Error unbooking hall:', error);
            Alert.alert('Error', error.message || 'Failed to unbook hall');
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

        return modalData.map((exam) => {
            const bookedHall = exam.halls?.find(hall => hall.bookedBy === user._id);
            const canUnbook = bookedHall && canUnbookHall(exam.date);

            return (
                <Card key={exam._id} style={styles.modalCard}>
                    <Card.Content>
                        <Text variant="titleMedium">{exam.title}</Text>
                        <Text variant="bodyMedium">Department: {exam.department}</Text>
                        <Text variant="bodyMedium">Date: {new Date(exam.date).toLocaleDateString()}</Text>
                        <Text variant="bodyMedium">Time: {exam.startTime} - {exam.endTime}</Text>
                        <Text variant="bodyMedium">Status: {exam.status}</Text>
                        {modalTitle === 'Completed Exams' && (
                            <View style={styles.completedExamInfo}>
                                <Text variant="bodyMedium">
                                    Total Halls: {exam.halls?.length || 0}
                                </Text>
                                <Text variant="bodyMedium">
                                    Booked Halls: {exam.halls?.filter(hall => hall.status === 'booked').length || 0}
                                </Text>
                                <Text variant="bodyMedium">
                                    Available Halls: {exam.halls?.filter(hall => hall.status === 'available').length || 0}
                                </Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>
            );
        });
    };

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
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.welcomeText}>
                    Welcome, {user?.name}
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                    Department: {user?.department}
                </Text>
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <View style={styles.statsGrid}>
                <Card 
                    style={styles.statsCard}
                    onPress={() => handleCardPress('total')}
                >
                    <Card.Content style={styles.statCardContent}>
                        <Icon name="file-document" size={32} color="#6200ee" style={styles.statIcon} />
                        <Text variant="titleLarge">{stats.totalExams}</Text>
                        <Text variant="bodyMedium">Total Exams</Text>
                    </Card.Content>
                </Card>

                <Card 
                    style={styles.statsCard}
                    onPress={() => handleCardPress('upcoming')}
                >
                    <Card.Content style={styles.statCardContent}>
                        <Icon name="calendar-clock" size={32} color="#FF9800" style={styles.statIcon} />
                        <Text variant="titleLarge">{stats.upcomingExams}</Text>
                        <Text variant="bodyMedium">Upcoming Exams</Text>
                    </Card.Content>
                </Card>

                <Card 
                    style={styles.statsCard}
                    onPress={() => handleCardPress('completed')}
                >
                    <Card.Content style={styles.statCardContent}>
                        <Icon name="check-circle" size={32} color="#4CAF50" style={styles.statIcon} />
                        <Text variant="titleLarge">{stats.completedExams}</Text>
                        <Text variant="bodyMedium">Completed Exams</Text>
                    </Card.Content>
                </Card>
            </View>

            <View style={styles.actions}>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('ExamList')}
                    style={styles.actionButton}
                    icon="file-document"
                    contentStyle={styles.buttonContent}
                >
                    View Exam List
                </Button>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('MyHalls')}
                    style={styles.actionButton}
                    icon="office-building"
                    contentStyle={styles.buttonContent}
                >
                    My Booked Halls
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    errorContainer: {
        padding: 16,
        backgroundColor: '#ffebee',
        margin: 16,
        borderRadius: 8,
    },
    errorText: {
        color: '#c62828',
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        gap: 10,
    },
    statsCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#fff',
        elevation: 4,
    },
    statCardContent: {
        alignItems: 'center',
        padding: 16,
    },
    statIcon: {
        marginBottom: 8,
    },
    actions: {
        padding: 20,
        gap: 16,
    },
    actionButton: {
        marginBottom: 8,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
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
    unbookButton: {
        marginTop: 8,
        backgroundColor: '#ffebee',
    },
    warningText: {
        color: '#c62828',
        marginTop: 8,
        fontStyle: 'italic',
    },
    completedExamInfo: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    bookedHallInfo: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
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