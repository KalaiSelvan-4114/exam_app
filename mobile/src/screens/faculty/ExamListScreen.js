import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Alert,
} from 'react-native';
import {
    Card,
    Text,
    Button,
    Chip,
    Portal,
    Modal,
    useTheme,
    List,
    ActivityIndicator,
} from 'react-native-paper';
import { examAPI, hallAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ExamListScreen = ({ navigation }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const { user } = useAuth();
    const theme = useTheme();

    const loadExams = async () => {
        try {
            setLoading(true);
            const exams = await examAPI.getExams();
            // Filter only scheduled exams
            const scheduledExams = exams.filter(exam => exam.status === 'scheduled');
            setExams(scheduledExams);
        } catch (error) {
            console.error('Error loading exams:', error);
            setExams([]); // Set empty array on error
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadExams();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadExams();
    }, []);

    const handleBookHall = async (examId, hallId) => {
        try {
            setBookingLoading(true);
            console.log('Booking hall:', { examId, hallId }); // Debug log
            const response = await hallAPI.bookHall(examId, hallId);
            console.log('Booking response:', response); // Debug log
            setShowModal(false);
            loadExams();
        } catch (error) {
            console.error('Booking error:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to book hall. Please try again.'
            );
        } finally {
            setBookingLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {exams.map((exam) => (
                    <Card key={exam._id} style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.title}>
                                {exam.title}
                            </Text>

                            <Text variant="bodyMedium" style={styles.department}>
                                {exam.department}
                            </Text>

                            <View style={styles.detailsRow}>
                                <Text variant="bodyMedium">
                                    {formatDate(exam.date)}
                                </Text>
                                <Text variant="bodyMedium">
                                    {exam.startTime} - {exam.endTime}
                                </Text>
                            </View>

                            <Button
                                mode="contained"
                                onPress={() => {
                                    setSelectedExam(exam);
                                    setShowModal(true);
                                }}
                                style={styles.bookButton}
                            >
                                View Available Halls
                            </Button>
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>

            <Portal>
                <Modal
                    visible={showModal}
                    onDismiss={() => {
                        setShowModal(false);
                        setSelectedExam(null);
                    }}
                    contentContainerStyle={styles.modal}
                >
                    <Text variant="titleLarge" style={styles.modalTitle}>
                        Available Halls
                    </Text>
                    {selectedExam && (
                        <View>
                            <Text variant="bodyLarge" style={styles.modalExamTitle}>
                                {selectedExam.title}
                            </Text>
                            <List.Section>
                                {selectedExam.halls
                                    .filter(hall => hall.status === 'available')
                                    .map((hall, index) => (
                                        <List.Item
                                            key={index}
                                            title={`Hall ${hall.hallNumber}`}
                                            description={`Capacity: ${hall.capacity} students`}
                                            right={() => (
                                                <Button
                                                    mode="contained-tonal"
                                                    onPress={() => handleBookHall(selectedExam._id, hall._id)}
                                                    disabled={hall.bookedBy || bookingLoading}
                                                >
                                                    {hall.bookedBy ? 'Booked' : 'Book Hall'}
                                                </Button>
                                            )}
                                            style={styles.hallItem}
                                        />
                                    ))}
                            </List.Section>
                        </View>
                    )}
                </Modal>
            </Portal>
        </View>
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
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    department: {
        color: '#666',
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    bookButton: {
        marginTop: 8,
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxHeight: '80%',
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: 'bold',
    },
    modalExamTitle: {
        marginBottom: 16,
    },
    hallItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ExamListScreen; 