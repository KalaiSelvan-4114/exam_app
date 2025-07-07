import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Modal, Portal, Checkbox, ActivityIndicator, DataTable } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { examAPI, hallAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function AllocateHallsScreen() {
    const { user } = useAuth();
    if (!user) return null;
    const [exams, setExams] = useState([]);
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [selectedHalls, setSelectedHalls] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [examsData, hallsData] = await Promise.all([
                examAPI.getExams(),
                hallAPI.getHalls()
            ]);
            
            // Filter exams for this department that don't have halls assigned
            const deptExams = examsData.filter(e => 
                e.department === user.department && 
                (!e.halls || e.halls.length === 0)
            );
            setExams(deptExams);

            // Filter halls for this department and only those that are available
            const deptHalls = hallsData.filter(h => h.department === user.department && h.status === 'available');
            setHalls(deptHalls);
        } catch (err) {
            setError('Failed to load data. Please try again.');
            console.error('Error loading exams or halls:', err);
        } finally {
            setLoading(false);
        }
    };

    const openAssignModal = (exam) => {
        setSelectedExam(exam);
        setSelectedHalls([]);
        setModalVisible(true);
    };

    const toggleHall = (hallNumber) => {
        setSelectedHalls(prev =>
            prev.includes(hallNumber)
                ? prev.filter(h => h !== hallNumber)
                : [...prev, hallNumber]
        );
    };

    const validateAllocation = () => {
        if (selectedHalls.length === 0) {
            Alert.alert('Error', 'Please select at least one hall');
            return false;
        }

        // Calculate total capacity
        const totalCapacity = halls
            .filter(h => selectedHalls.includes(h.hallNumber))
            .reduce((sum, h) => sum + h.capacity, 0);

        if (totalCapacity < selectedExam.totalStudents) {
            Alert.alert(
                'Warning',
                `Total hall capacity (${totalCapacity}) is less than total students (${selectedExam.totalStudents}). Do you want to continue?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Continue', onPress: () => handleAssign() }
                ]
            );
            return false;
        }

        return true;
    };

    const handleAssign = async () => {
        if (!selectedExam) return;
        setSubmitting(true);
        try {
            const hallsToAssign = halls.filter(h => selectedHalls.includes(h.hallNumber));
            await examAPI.allocateHalls(selectedExam._id, hallsToAssign);
            setModalVisible(false);
            Alert.alert('Success', 'Halls allocated successfully!');
            await fetchData(); // Always await to ensure UI is up to date
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to allocate halls');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <LinearGradient
                colors={['#1976D2', '#43cea2', '#185a9d']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.centered}>
                    <ActivityIndicator size="large" />
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#1976D2', '#43cea2', '#185a9d']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.container}>
                {error && <Text style={styles.errorText}>{error}</Text>}
                <ScrollView contentContainerStyle={styles.scrollContent} style={{ width: '100%' }}>
                    {exams.length === 0 ? (
                        <Text style={styles.noExamsText}>No exams requiring hall allocation</Text>
                    ) : (
                        exams.map(exam => (
                            <Card key={exam._id} style={styles.card}>
                                <Card.Content>
                                    <Text style={styles.examTitle}>{exam.title}</Text>
                                    <DataTable>
                                        <DataTable.Row>
                                            <DataTable.Cell>Date</DataTable.Cell>
                                            <DataTable.Cell>{new Date(exam.date).toLocaleDateString()}</DataTable.Cell>
                                        </DataTable.Row>
                                        <DataTable.Row>
                                            <DataTable.Cell>Session</DataTable.Cell>
                                            <DataTable.Cell>{exam.timeSlot}</DataTable.Cell>
                                        </DataTable.Row>
                                        <DataTable.Row>
                                            <DataTable.Cell>Students</DataTable.Cell>
                                            <DataTable.Cell>{exam.totalStudents}</DataTable.Cell>
                                        </DataTable.Row>
                                    </DataTable>
                                    <Button 
                                        mode="contained" 
                                        onPress={() => openAssignModal(exam)} 
                                        style={styles.assignButton}
                                        labelStyle={styles.assignButtonLabel}
                                    >
                                        Assign Halls
                                    </Button>
                                </Card.Content>
                            </Card>
                        ))
                    )}
                </ScrollView>
                <Portal>
                    <Modal 
                        visible={modalVisible} 
                        onDismiss={() => setModalVisible(false)} 
                        contentContainerStyle={styles.modal}
                    >
                        <Text style={styles.modalTitle}>Select Halls for {selectedExam?.title}</Text>
                        <ScrollView style={styles.hallList}>
                            {halls.map(hall => (
                                <View key={hall._id} style={styles.hallRow}>
                                    <Checkbox
                                        status={selectedHalls.includes(hall.hallNumber) ? 'checked' : 'unchecked'}
                                        onPress={() => toggleHall(hall.hallNumber)}
                                    />
                                    <View style={styles.hallInfo}>
                                        <Text style={styles.hallLabel}>Hall {hall.hallNumber}</Text>
                                        <Text style={styles.hallCapacity}>Capacity: {hall.capacity} students</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={styles.modalButtons}>
                            <Button 
                                mode="outlined" 
                                onPress={() => setModalVisible(false)} 
                                style={styles.modalButton}
                                labelStyle={styles.modalButtonLabel}
                            >
                                Cancel
                            </Button>
                            <Button 
                                mode="contained" 
                                onPress={() => validateAllocation() && handleAssign()} 
                                loading={submitting}
                                disabled={submitting}
                                style={styles.modalButton}
                                labelStyle={styles.modalButtonLabel}
                            >
                                Assign
                            </Button>
                        </View>
                    </Modal>
                </Portal>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: { 
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16, 
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 32,
        width: '100%',
        paddingTop: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 16,
        color: '#1976D2',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 16
    },
    noExamsText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 20
    },
    card: { 
        width: '95%',
        maxWidth: 500,
        backgroundColor: '#f8f6ff',
        borderRadius: 16,
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.10,
        shadowRadius: 16,
        marginBottom: 16,
        alignSelf: 'center',
    },
    examTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 8,
        color: '#5e35b1',
    },
    assignButton: {
        marginTop: 16,
        borderRadius: 20,
        backgroundColor: '#7c4dff',
        elevation: 2,
        width: '100%',
        alignSelf: 'center',
    },
    assignButtonLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#fff',
    },
    modal: { 
        backgroundColor: 'white', 
        padding: 24, 
        margin: 20, 
        borderRadius: 16, 
        alignItems: 'center',
    },
    modalTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 16,
        color: '#7c4dff',
        textAlign: 'center',
    },
    hallList: {
        maxHeight: 300
    },
    hallRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 12 
    },
    hallInfo: {
        marginLeft: 8
    },
    hallLabel: { 
        fontSize: 16,
        color: '#185a9d',
    },
    hallCapacity: {
        fontSize: 14,
        color: '#666'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16
    },
    modalButton: {
        marginLeft: 8,
        borderRadius: 20,
        backgroundColor: '#7c4dff',
        minWidth: 100,
        alignSelf: 'center',
    },
    modalButtonLabel: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#fff',
    },
}); 