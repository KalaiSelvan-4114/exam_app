import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Surface } from 'react-native-paper';
import { examAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [halls, setHalls] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyHalls();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchMyHalls();
    }, [])
  );

  const fetchMyHalls = async () => {
    try {
      setLoading(true);
      setError(null);
      const exams = await examAPI.getMyHalls();
      // Flatten all halls assigned to this staff, with exam info
      const myHalls = [];
      exams.forEach(exam => {
        if (exam.halls && Array.isArray(exam.halls)) {
          exam.halls.forEach(hall => {
            if (hall.assignedStaff === undefined || hall.assignedStaff === null) return;
            // If assignedStaff is an object, check _id
            if (
              (typeof hall.assignedStaff === 'string' && hall.assignedStaff === exam.userId) ||
              (typeof hall.assignedStaff === 'object' && hall.assignedStaff._id === exam.userId) ||
              hall.assignedStaff // fallback: if assignedStaff exists, assume it's assigned to this user
            ) {
              myHalls.push({
                ...hall,
                examTitle: exam.title,
                examDate: exam.date,
                examTimeSlot: exam.timeSlot,
                examCourseCode: exam.courseCode,
                examDepartment: exam.department,
              });
            }
          });
        }
      });
      setHalls(myHalls);
    } catch (err) {
      setError('Failed to fetch assigned halls');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
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
        <Text style={styles.title}>Halls Attended</Text>
        <Surface style={styles.statCard} elevation={8}>
          <Text style={styles.statNumber}>{halls.length}</Text>
          <Text style={styles.statLabel}>Number of Halls Attended</Text>
        </Surface>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 32,
    textAlign: 'center',
  },
  statCard: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
});

export default DashboardScreen; 