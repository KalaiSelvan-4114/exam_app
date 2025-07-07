import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, Button, Text, Chip, Surface, DataTable, Portal, Modal, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { examAPI, hallAPI, sessionBookingAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SessionAssignmentScreen = () => {
  const [bookedSessions, setBookedSessions] = useState([]);
  const [exams, setExams] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedHall, setSelectedHall] = useState('');
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [selectedAutoAssignSession, setSelectedAutoAssignSession] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all booked sessions
      const sessionsData = await examAPI.getAllBookedSessions();
      setBookedSessions(sessionsData);

      // Fetch available exams
      const examsData = await examAPI.getExams();
      setExams(examsData);

      // Fetch available halls
      const hallsData = await hallAPI.getHalls();
      setHalls(hallsData);
    } catch (err) {
      setError('Failed to fetch data');
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignExam = async () => {
    if (!selectedExam || !selectedHall) {
      Alert.alert('Error', 'Please select both exam and hall');
      return;
    }

    try {
      setAssigning(true);
      
      await examAPI.assignExamToSession(selectedSession._id, selectedExam, selectedHall);
      
      Alert.alert('Success', 'Exam assigned successfully!');
      setModalVisible(false);
      setSelectedSession(null);
      setSelectedExam('');
      setSelectedHall('');
      fetchData(); // Refresh the list
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to assign exam');
    } finally {
      setAssigning(false);
    }
  };

  const openAssignmentModal = (session) => {
    setSelectedSession(session);
    setSelectedExam('');
    setSelectedHall('');
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return '#fff3e0';
      case 'assigned':
        return '#e8f5e9';
      case 'completed':
        return '#e3f2fd';
      default:
        return '#f5f5f5';
    }
  };

  // Helper to get unique sessions (date + timeSlot)
  const uniqueSessions = Array.from(
    new Set(bookedSessions.map(s => `${s.date}|${s.timeSlot}`))
  ).map(key => {
    const [date, timeSlot] = key.split('|');
    return { date, timeSlot };
  });

  const handleAutoAssign = async (date, timeSlot) => {
    try {
      console.log('Auto-assign payload:', { date, timeSlot });
      setAutoAssigning(true);
      await sessionBookingAPI.autoAssign(date, timeSlot);
      Alert.alert('Success', 'Auto-assignment completed!');
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to auto-assign');
    } finally {
      setAutoAssigning(false);
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
          <ActivityIndicator size="large" color="#fff" />
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Surface style={styles.header}>
            <Text style={styles.title}>Assign Exams to Sessions</Text>
            <Text style={styles.subtitle}>
              Assign exams and halls to staff's booked sessions
            </Text>
          </Surface>

          {error && (
            <Card style={styles.errorCard}>
              <Card.Content>
                <Text style={styles.errorText}>{error}</Text>
              </Card.Content>
            </Card>
          )}

          {bookedSessions.map((session, idx) => (
            <Card key={idx} style={styles.sessionCard}>
              <Card.Content>
                <View style={styles.sessionHeader}>
                  <Text style={styles.staffName}>{session.staffId?.name || 'Unknown Staff'}</Text>
                  <Chip
                    mode="outlined"
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(session.status) }
                    ]}
                  >
                    {session.status}
                  </Chip>
                </View>
                
                <DataTable>
                  <DataTable.Row>
                    <DataTable.Cell>Date</DataTable.Cell>
                    <DataTable.Cell>
                      {new Date(session.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </DataTable.Cell>
                  </DataTable.Row>
                  <DataTable.Row>
                    <DataTable.Cell>Time</DataTable.Cell>
                    <DataTable.Cell>
                      {session.timeSlot === 'FN' ? 'Morning (FN)' : 'Afternoon (AN)'}
                    </DataTable.Cell>
                  </DataTable.Row>
                  <DataTable.Row>
                    <DataTable.Cell>Department</DataTable.Cell>
                    <DataTable.Cell>{session.staffId?.department || 'N/A'}</DataTable.Cell>
                  </DataTable.Row>
                  {session.assignedExamId && (
                    <DataTable.Row>
                      <DataTable.Cell>Assigned Exam</DataTable.Cell>
                      <DataTable.Cell>{session.assignedExamId.title}</DataTable.Cell>
                    </DataTable.Row>
                  )}
                  {session.assignedHallId && (
                    <DataTable.Row>
                      <DataTable.Cell>Assigned Hall</DataTable.Cell>
                      <DataTable.Cell>{session.assignedHallId.hallNumber}</DataTable.Cell>
                    </DataTable.Row>
                  )}
                </DataTable>

                {session.status === 'booked' && (
                  <Button
                    mode="contained"
                    onPress={() => openAssignmentModal(session)}
                    style={styles.assignButton}
                  >
                    Assign Exam
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))}

          {bookedSessions.length === 0 && !loading && (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No booked sessions found.</Text>
              </Card.Content>
            </Card>
          )}

          {/* Auto-Assign buttons for each unique session */}
          {uniqueSessions.map((session, idx) => (
            <Button
              key={idx}
              mode="contained"
              style={{ marginVertical: 8, backgroundColor: '#1976D2' }}
              loading={autoAssigning && selectedAutoAssignSession === idx}
              disabled={autoAssigning}
              onPress={async () => {
                setSelectedAutoAssignSession(idx);
                await handleAutoAssign(session.date, session.timeSlot);
                setSelectedAutoAssignSession(null);
              }}
            >
              Auto-Assign for {new Date(session.date).toLocaleDateString()} ({session.timeSlot})
            </Button>
          ))}
        </ScrollView>

        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={styles.modal}
          >
            <Text style={styles.modalTitle}>Assign Exam to Session</Text>
            
            <Text style={styles.modalSubtitle}>
              Staff: {selectedSession?.staffId?.name}
            </Text>
            <Text style={styles.modalSubtitle}>
              Date: {selectedSession ? new Date(selectedSession.date).toLocaleDateString() : ''}
            </Text>
            <Text style={styles.modalSubtitle}>
              Time: {selectedSession?.timeSlot === 'FN' ? 'Morning (FN)' : 'Afternoon (AN)'}
            </Text>

            <TextInput
              label="Select Exam"
              value={selectedExam}
              onChangeText={setSelectedExam}
              mode="outlined"
              style={styles.modalInput}
              render={props => (
                <TextInput
                  {...props}
                  onPressIn={() => {
                    // Show exam picker
                    Alert.alert(
                      'Select Exam',
                      'Choose an exam to assign',
                      exams.map(exam => ({
                        text: `${exam.title} (${exam.courseCode})`,
                        onPress: () => setSelectedExam(exam._id),
                      }))
                    );
                  }}
                />
              )}
            />

            <TextInput
              label="Select Hall"
              value={selectedHall}
              onChangeText={setSelectedHall}
              mode="outlined"
              style={styles.modalInput}
              render={props => (
                <TextInput
                  {...props}
                  onPressIn={() => {
                    // Show hall picker
                    Alert.alert(
                      'Select Hall',
                      'Choose a hall to assign',
                      halls.map(hall => ({
                        text: `${hall.hallNumber} (${hall.capacity} students)`,
                        onPress: () => setSelectedHall(hall._id),
                      }))
                    );
                  }}
                />
              )}
            />

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAssignExam}
                loading={assigning}
                disabled={assigning || !selectedExam || !selectedHall}
                style={styles.modalButton}
              >
                Assign
              </Button>
            </View>
          </Modal>
        </Portal>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  sessionCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  staffName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statusChip: {
    marginVertical: 4,
  },
  assignButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default SessionAssignmentScreen; 