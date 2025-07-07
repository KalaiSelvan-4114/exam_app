import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { examAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function ViewAssignmentsScreen() {
    const { user } = useAuth();
    if (!user) return null;
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await examAPI.getDepartmentAssignments(user.department);
            console.log('Assignments API response:', response);
            setAssignments(response);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setAssignments([]); // fallback to empty array on error
        } finally {
            setLoading(false);
        }
    };

    const renderAssignmentCard = (assignment) => (
        <Card key={assignment._id} style={styles.card}>
            <Card.Content>
                <Text style={styles.examTitle}>{assignment.exam.title}</Text>
                <Text style={styles.date}>
                    {new Date(assignment.exam.date).toLocaleDateString()}
                </Text>
                
                <Divider style={styles.divider} />
                
                <Text style={styles.sectionTitle}>Assigned Halls</Text>
                <View style={styles.hallsContainer}>
                    {assignment.halls.map((hall) => (
                        <Chip key={hall._id} style={styles.chip}>
                            {hall.name} ({hall.capacity} students)
                        </Chip>
                    ))}
                </View>

                <Divider style={styles.divider} />

                <Text style={styles.sectionTitle}>Assigned Staff</Text>
                <View style={styles.staffContainer}>
                    {assignment.staff.map((staff) => (
                        <View key={staff._id} style={styles.staffItem}>
                            <Text style={styles.staffName}>{staff.name}</Text>
                            <Text style={styles.staffRole}>{staff.role}</Text>
                        </View>
                    ))}
                </View>

                {assignment.notes && (
                    <>
                        <Divider style={styles.divider} />
                        <Text style={styles.sectionTitle}>Notes</Text>
                        <Text style={styles.notes}>{assignment.notes}</Text>
                    </>
                )}
            </Card.Content>
        </Card>
    );

    return (
        <LinearGradient
            colors={['#1976D2', '#43cea2', '#185a9d']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent} style={{ width: '100%' }}>
                    {Array.isArray(assignments) && assignments.length === 0 && (
                        <Text style={styles.noAssignmentsText}>No assignments found.</Text>
                    )}
                    {Array.isArray(assignments) && assignments.map(renderAssignmentCard)}
                </ScrollView>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1976D2',
        textAlign: 'center',
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#5e35b1',
        marginBottom: 2,
    },
    date: {
        color: '#666',
        marginTop: 4,
        marginBottom: 4,
    },
    divider: {
        marginVertical: 12
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1976D2',
    },
    hallsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    chip: {
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#ede7f6',
        borderColor: '#7c4dff',
        borderWidth: 1,
        color: '#5e35b1',
    },
    staffContainer: {
        gap: 8,
        marginBottom: 8,
    },
    staffItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4
    },
    staffName: {
        fontSize: 16,
        color: '#185a9d',
    },
    staffRole: {
        color: '#666'
    },
    notes: {
        fontStyle: 'italic',
        color: '#666'
    },
    noAssignmentsText: {
        textAlign: 'center',
        marginTop: 16,
        color: '#444',
        fontSize: 16,
    },
}); 