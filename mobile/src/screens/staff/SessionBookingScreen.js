import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, Button, Text, Chip, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { examAPI, staffAPI } from '../../services/api';

const SessionBookingScreen = () => {
  const [exams, setExams] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all exams (like All Exams page)
      let allExams = [];
      let myBookings = [];
      try {
        allExams = await examAPI.getExams();
        console.log('Fetched exams:', allExams);
      } catch (examErr) {
        console.log('Error fetching exams:', examErr);
        setError('Failed to fetch exams.');
        setLoading(false);
        return;
      }
      try {
        myBookings = await staffAPI.getMyBookedSessions();
        console.log('Fetched bookings:', myBookings);
      } catch (bookingErr) {
        console.log('Error fetching bookings:', bookingErr);
        setError('Failed to fetch your bookings.');
        setLoading(false);
        return;
      }
      setExams(allExams);
      setBookings(myBookings);
    } catch (err) {
      setError('Unknown error fetching sessions.');
      console.log('Unknown fetch error:', err);
      Alert.alert('Error', 'Unknown error fetching sessions.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (exam) => {
    try {
      setBooking(true);
      await staffAPI.bookSession(exam.date, exam.timeSlot);
      Alert.alert('Success', 'Session booked successfully!');
      fetchData(); // Refresh the list
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to book session');
    } finally {
      setBooking(false);
    }
  };

  const handleCancelSession = async (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this session booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await staffAPI.cancelSession(bookingId);
              Alert.alert('Success', 'Session booking cancelled successfully!');
              fetchData(); // Refresh the list
            } catch (err) {
              Alert.alert('Error', 'Failed to cancel session booking');
            }
          },
        },
      ]
    );
  };

  // Helper: find booking for an exam session
  const findBooking = (exam) => {
    return bookings.find(
      b =>
        new Date(b.date).toISOString().split('T')[0] === new Date(exam.date).toISOString().split('T')[0] &&
        b.timeSlot === exam.timeSlot
    );
  };

  // Group exams by date for display
  const groupedExams = exams.reduce((acc, exam) => {
    const dateKey = new Date(exam.date).toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(exam);
    return acc;
  }, {});

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
            <Text style={styles.title}>Book Available Sessions</Text>
            <Text style={styles.subtitle}>
              Select sessions you want to work. Once booked, exam coordinators will assign exams to your sessions.
            </Text>
          </Surface>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {Object.entries(groupedExams).map(([date, examsOnDate]) => (
            <Card key={date} style={styles.dateCard}>
              <Card.Content>
                <Text style={styles.dateTitle}>
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                {examsOnDate.map((exam, index) => {
                  const booking = findBooking(exam);
                  return (
                    <View key={index} style={styles.sessionContainer}>
                      <View style={styles.sessionInfo}>
                        <Text style={styles.sessionTime}>{exam.timeSlot === 'FN' ? 'Morning (FN)' : 'Afternoon (AN)'}</Text>
                        <Text style={styles.examTitle}>{exam.title}</Text>
                        <Chip
                          mode="outlined"
                          style={[
                            styles.statusChip,
                            booking && styles.bookedChip
                          ]}
                        >
                          {booking ? 'Booked' : 'Available'}
                        </Chip>
                      </View>
                      {booking ? (
                        <Button
                          mode="outlined"
                          onPress={() => handleCancelSession(booking._id)}
                          style={styles.cancelButton}
                          textColor="#d32f2f"
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          mode="contained"
                          onPress={() => handleBookSession(exam)}
                          loading={booking}
                          disabled={booking}
                          style={styles.bookButton}
                        >
                          Book Session
                        </Button>
                      )}
                    </View>
                  );
                })}
              </Card.Content>
            </Card>
          ))}

          {exams.length === 0 && !loading && !error && (
            <Text style={styles.emptyText}>No available sessions found.</Text>
          )}
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
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  dateCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    elevation: 2,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
  },
  sessionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sessionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusChip: {
    backgroundColor: '#e8f5e8',
  },
  bookedChip: {
    backgroundColor: '#fff3e0',
  },
  bookButton: {
    marginLeft: 12,
    borderRadius: 8,
  },
  cancelButton: {
    marginLeft: 12,
    borderRadius: 8,
    borderColor: '#d32f2f',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default SessionBookingScreen; 