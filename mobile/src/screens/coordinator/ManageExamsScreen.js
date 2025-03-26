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
    IconButton,
    Chip,
    Portal,
    Modal,
    TextInput,
    useTheme,
    ActivityIndicator,
    List,
} from 'react-native-paper';
import { examAPI } from '../../services/api';

const ManageExamsScreen = ({ navigation }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const theme = useTheme();

    const updateExamStatus = (exams) => {
        const now = new Date();
        return exams.map(exam => {
            const examEndDateTime = new Date(`${exam.date}T${exam.endTime}`);
            if (examEndDateTime <= now && exam.status !== 'completed') {
                // Update the status to completed
                exam.status = 'completed';
                // Optionally, send an update to the backend to persist this change
                // await examAPI.updateExamStatus(exam._id, 'completed');
            }
            return exam;
        });
    };

    const loadExams = async () => {
        try {
            setLoading(true);
            const examsData = await examAPI.getExams();
            const updatedExams = updateExamStatus(examsData || []);
            setExams(updatedExams);
        } catch (error) {
            console.error('Error loading exams:', error);
            setExams([]);
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

    const handleDelete = async (examId) => {
        Alert.alert(
            'Delete Exam',
            'Are you sure you want to delete this exam?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await examAPI.deleteExam(examId);
                            loadExams();
                        } catch (error) {
                            console.error('Error deleting exam:', error);
                            Alert.alert('Error', 'Failed to delete exam');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled':
                return '#4CAF50';
            case 'completed':
                return '#2196F3';
            case 'cancelled':
                return '#F44336';
            default:
                return '#757575';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {exams.map((exam) => (
                <Card 
                    key={exam._id} 
                    style={styles.examCard}
                    onPress={() => {
                        setSelectedExam(exam);
                        setDetailModalVisible(true);
                    }}
                >
                    <Card.Content>
                        <View style={styles.headerRow}>
                            <Text variant="titleLarge" style={styles.examTitle}>
                                {exam.title}
                            </Text>
                            <Chip
                                mode="outlined"
                                textStyle={{ color: getStatusColor(exam.status) }}
                                style={{ borderColor: getStatusColor(exam.status) }}
                            >
                                {exam.status}
                            </Chip>
                        </View>
                        <Text variant="bodyLarge" style={styles.examInfo}>
                            Department: {exam.department}
                        </Text>
                        <Text variant="bodyLarge" style={styles.examInfo}>
                            Date: {formatDate(exam.date)}
                        </Text>
                        <Text variant="bodyLarge" style={styles.examInfo}>
                            Time: {exam.startTime} - {exam.endTime}
                        </Text>
                        <Text variant="bodyLarge" style={styles.examInfo}>
                            Duration: {exam.duration} minutes
                        </Text>
                        <View style={styles.hallsContainer}>
                            <Text variant="bodyLarge" style={styles.examInfo}>
                                Halls:
                            </Text>
                            <View style={styles.hallsList}>
                                {exam.halls.map((hall, index) => (
                                    <Chip
                                        key={index}
                                        style={[
                                            styles.hallChip,
                                            { backgroundColor: hall.status === 'booked' ? '#FFE0B2' : '#E8F5E9' }
                                        ]}
                                        textStyle={{ fontSize: 12 }}
                                    >
                                        Hall {hall.hallNumber} ({hall.status})
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    </Card.Content>
                    <Card.Actions>
                        <Button
                            mode="contained"
                            onPress={() => {
                                setSelectedExam(exam);
                                setModalVisible(true);
                            }}
                        >
                            Edit Status
                        </Button>
                        <Button
                            mode="contained-tonal"
                            onPress={() => handleDelete(exam._id)}
                            textColor="#B00020"
                        >
                            Delete
                        </Button>
                    </Card.Actions>
                </Card>
            ))}

            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    <Text variant="titleLarge" style={styles.modalTitle}>
                        Update Exam Status
                    </Text>
                    <View style={styles.statusButtons}>
                        <Button
                            mode="contained"
                            onPress={() => {
                                examAPI.updateExam(selectedExam._id, { status: 'scheduled' });
                                setModalVisible(false);
                                loadExams();
                            }}
                            style={styles.statusButton}
                        >
                            Scheduled
                        </Button>
                        <Button
                            mode="contained"
                            onPress={() => {
                                examAPI.updateExam(selectedExam._id, { status: 'completed' });
                                setModalVisible(false);
                                loadExams();
                            }}
                            style={styles.statusButton}
                        >
                            Completed
                        </Button>
                        <Button
                            mode="contained"
                            onPress={() => {
                                examAPI.updateExam(selectedExam._id, { status: 'cancelled' });
                                setModalVisible(false);
                                loadExams();
                            }}
                            style={styles.statusButton}
                        >
                            Cancelled
                        </Button>
                    </View>
                </Modal>

                <Modal
                    visible={detailModalVisible}
                    onDismiss={() => setDetailModalVisible(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    {selectedExam && (
                        <ScrollView>
                            <Text variant="titleLarge" style={styles.modalTitle}>
                                Exam Details
                            </Text>
                            <Text variant="titleMedium" style={styles.detailTitle}>
                                {selectedExam.title}
                            </Text>
                            <Text variant="bodyLarge" style={styles.detailInfo}>
                                Department: {selectedExam.department}
                            </Text>
                            <Text variant="bodyLarge" style={styles.detailInfo}>
                                Date: {formatDate(selectedExam.date)}
                            </Text>
                            <Text variant="bodyLarge" style={styles.detailInfo}>
                                Time: {selectedExam.startTime} - {selectedExam.endTime}
                            </Text>
                            <Text variant="bodyLarge" style={styles.detailInfo}>
                                Duration: {selectedExam.duration} minutes
                            </Text>
                            <Text variant="bodyLarge" style={styles.detailInfo}>
                                Status: {selectedExam.status}
                            </Text>
                            
                            <Text variant="titleMedium" style={[styles.detailTitle, { marginTop: 16 }]}>
                                Hall Details
                            </Text>
                            {selectedExam.halls.map((hall, index) => (
                                <Card key={index} style={styles.hallCard}>
                                    <Card.Content>
                                        <Text variant="titleMedium">
                                            Hall {hall.hallNumber}
                                        </Text>
                                        <Text variant="bodyMedium">
                                            Capacity: {hall.capacity} students
                                        </Text>
                                        <Text variant="bodyMedium">
                                            Status: {hall.status}
                                        </Text>
                                        {hall.bookedBy && (
                                            <Text variant="bodyMedium">
                                                Booked by: {hall.bookedBy.name}
                                            </Text>
                                        )}
                                    </Card.Content>
                                </Card>
                            ))}
                        </ScrollView>
                    )}
                </Modal>
            </Portal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    examCard: {
        marginBottom: 16,
        elevation: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    examTitle: {
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    examInfo: {
        marginBottom: 4,
        color: '#666',
    },
    hallsContainer: {
        marginTop: 8,
    },
    hallsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    hallChip: {
        marginRight: 8,
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
    statusButtons: {
        gap: 12,
    },
    statusButton: {
        marginBottom: 8,
    },
    detailTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    detailInfo: {
        marginBottom: 8,
        color: '#666',
    },
    hallCard: {
        marginBottom: 8,
        elevation: 2,
    },
});

export default ManageExamsScreen; 