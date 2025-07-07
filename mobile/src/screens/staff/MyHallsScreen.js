import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import { Title, DataTable, Chip, Card } from 'react-native-paper';
import { examAPI, staffAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const MyHallsScreen = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyHalls();
  }, []);

  const fetchMyHalls = async () => {
    try {
      setLoading(true);
      setError(null);
      const bookings = await staffAPI.getMyBookedSessions();
      // Filter only assigned sessions (with exam and hall)
      const assignedHalls = bookings.filter(booking => 
        booking.status === 'assigned' && booking.assignedExamId && booking.assignedHallId
      );
      setHalls(assignedHalls);
    } catch (err) {
      setError('Failed to fetch assigned halls');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming':
        return '#e3f2fd';
      case 'In Progress':
        return '#fff8e1';
      case 'Completed':
        return '#e8f5e9';
      default:
        return '#f5f5f5';
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

  if (error) {
    return (
      <LinearGradient
        colors={['#1976D2', '#43cea2', '#185a9d']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.centered}>
          <Text style={{ color: 'red' }}>{error}</Text>
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
        <ScrollView contentContainerStyle={styles.scrollContent} style={{ width: '100%' }}>
          {halls.length === 0 && <Text style={styles.noHallsText}>Yet to be assigned</Text>}
          {halls.map((booking, idx) => (
            <Card key={idx} style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>{booking.assignedHallId?.hallNumber || 'Hall TBD'}</Title>
                <DataTable>
                  <DataTable.Row>
                    <DataTable.Cell>Capacity</DataTable.Cell>
                    <DataTable.Cell>{booking.assignedHallId?.capacity || 'TBD'} students</DataTable.Cell>
                  </DataTable.Row>
                  <DataTable.Row>
                    <DataTable.Cell>Exam</DataTable.Cell>
                    <DataTable.Cell>{booking.assignedExamId?.title || 'TBD'}</DataTable.Cell>
                  </DataTable.Row>
                  <DataTable.Row>
                    <DataTable.Cell>Course Code</DataTable.Cell>
                    <DataTable.Cell>{booking.assignedExamId?.courseCode || 'TBD'}</DataTable.Cell>
                  </DataTable.Row>
                  <DataTable.Row>
                    <DataTable.Cell>Date</DataTable.Cell>
                    <DataTable.Cell>{new Date(booking.date).toLocaleDateString()}</DataTable.Cell>
                  </DataTable.Row>
                  <DataTable.Row>
                    <DataTable.Cell>Time</DataTable.Cell>
                    <DataTable.Cell>{booking.timeSlot === 'FN' ? 'Morning (FN)' : 'Afternoon (AN)'}</DataTable.Cell>
                  </DataTable.Row>
                  <DataTable.Row>
                    <DataTable.Cell>Status</DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        mode="outlined"
                        style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) }]}
                      >
                        {booking.status === 'assigned' ? 'Assigned' : booking.status}
                      </Chip>
                    </DataTable.Cell>
                  </DataTable.Row>
                </DataTable>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 32,
    width: '100%',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 2,
    width: '100%',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
  },
  card: {
    width: '95%',
    maxWidth: 500,
    backgroundColor: '#fafaff',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    marginVertical: 12,
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#185a9d',
    marginBottom: 8,
  },
  statusChip: {
    marginVertical: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noHallsText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#444',
    fontSize: 16,
  },
});

export default MyHallsScreen; 