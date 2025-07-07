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
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      let availableSessions = [];
      let myBookings = [];
      try {
        availableSessions = await staffAPI.getAvailableSessions();
      } catch (sessionErr) {
        setError('Failed to fetch available sessions.');
        setLoading(false);
        return;
      }
      try {
        myBookings = await staffAPI.getMyBookedSessions();
      } catch (bookingErr) {
        setError('Failed to fetch your bookings.');
        setLoading(false);
        return;
      }
      setSessions(availableSessions);
      setBookings(myBookings);
    } catch (err) {
      setError('Unknown error fetching sessions.');
      Alert.alert('Error', 'Unknown error fetching sessions.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (session) => {
    try {
      setBooking(true);
      await staffAPI.bookSession(session.date, session.timeSlot);
      Alert.alert('Success', 'Session booked successfully!');
      fetchData();
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

          {sessions.length === 0 && (
            <Text style={styles.errorText}>No available sessions to book.</Text>
          )}

          {sessions.map((session, idx) => (
            <Card key={idx} style={styles.dateCard}>
              <Card.Content>
                <Text style={styles.dateTitle}>{session.displayDate}</Text>
                <View style={styles.sessionContainer}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTime}>{session.displayTime}</Text>
                    <Chip
                      mode="outlined"
                      style={styles.statusChip}
                    >
                      {session.status === 'full' ? 'Full' : 'Available'}
                    </Chip>
                    <Text style={{fontSize:12, color:'#555'}}>Booked: {session.staffCount} / {session.hallCount}</Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={() => handleBookSession(session)}
                    disabled={session.status === 'full' || booking}
                    style={styles.bookButton}
                  >
                    Book Session
                  </Button>
                </View>
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
  statusChip: {
    backgroundColor: '#e8f5e8',
  },
  bookButton: {
    marginLeft: 12,
    borderRadius: 8,
  },
});

export default SessionBookingScreen; 