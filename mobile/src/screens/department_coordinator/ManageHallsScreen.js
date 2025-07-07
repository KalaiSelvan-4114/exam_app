import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal, List } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { examAPI } from '../../services/api';
import { hallAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function ManageHallsScreen({ navigation }) {
    const { user } = useAuth();
    if (!user) return null;
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [newHall, setNewHall] = useState({
        hallNumber: '',
        capacity: ''
    });

    useEffect(() => {
        fetchHalls();
    }, []);

    const fetchHalls = async () => {
        try {
            const response = await hallAPI.getHalls();
            // Filter halls by user's department
            const departmentHalls = response.filter(hall => hall.department === user.department);
            setHalls(departmentHalls);
        } catch (error) {
            console.error('Error fetching halls:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddHall = async () => {
        try {
            await hallAPI.createHall({
                hallNumber: newHall.hallNumber,
                capacity: newHall.capacity,
                department: user.department
            });
            setVisible(false);
            setNewHall({ hallNumber: '', capacity: '' });
            fetchHalls();
        } catch (error) {
            console.error('Error adding hall:', error);
        }
    };

    const renderHallCard = (hall) => (
        <Card key={hall._id} style={styles.card}>
            <Card.Content>
                <Text style={styles.hallName}>{hall.hallNumber}</Text>
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
                <View style={styles.header}>
                    <Text style={styles.title}>Department: {user.department}</Text>
                    <Button mode="contained" onPress={() => setVisible(true)} style={styles.addButton} labelStyle={styles.addButtonLabel}>
                        Add Hall
                    </Button>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContent} style={{ width: '100%' }}>
                    {halls.map(renderHallCard)}
                </ScrollView>
                <Portal>
                    <Modal
                        visible={visible}
                        onDismiss={() => setVisible(false)}
                        contentContainerStyle={styles.modal}
                    >
                        <Text style={styles.modalTitle}>Add Hall</Text>
                        <TextInput
                            label="Hall Number"
                            value={newHall.hallNumber}
                            onChangeText={(text) => setNewHall({ ...newHall, hallNumber: text })}
                            style={styles.input}
                        />
                        <TextInput
                            label="Total Students"
                            value={newHall.capacity}
                            onChangeText={(text) => setNewHall({ ...newHall, capacity: text })}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <Button mode="contained" onPress={handleAddHall} style={styles.modalButton} labelStyle={styles.modalButtonLabel}>
                            Add Hall
                        </Button>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        elevation: 2,
        padding: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1976D2',
    },
    addButton: {
        borderRadius: 20,
        backgroundColor: '#7c4dff',
        elevation: 2,
        paddingHorizontal: 16,
        paddingVertical: 2,
    },
    addButtonLabel: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#fff',
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 32,
        width: '100%',
        paddingTop: 8,
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
    hallName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#5e35b1',
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
    input: {
        marginBottom: 12,
        width: 220,
    },
    modalButton: {
        marginTop: 16,
        borderRadius: 20,
        backgroundColor: '#7c4dff',
        width: 160,
        alignSelf: 'center',
    },
    modalButtonLabel: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#fff',
    },
}); 