import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import { Title, DataTable, Chip, Surface } from 'react-native-paper';
import { examAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const ExamListScreen = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const allExams = await examAPI.getExams();
      const now = new Date();
      // Filter for upcoming and current exams (date >= today)
      const filtered = allExams.filter(exam => {
        const examDate = new Date(exam.date);
        // If exam is today or in the future
        return examDate >= new Date(now.toDateString());
      });
      // Sort by date ascending
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      setExams(filtered);
    } catch (err) {
      setError('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.date);
    if (examDate > now) return 'Upcoming';
    if (examDate.toDateString() === now.toDateString()) return 'In Progress';
    return 'Completed';
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
        <Surface style={styles.card} elevation={8}>
          
          <ScrollView style={styles.tableScroll}>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Exam Name</DataTable.Title>
                <DataTable.Title>Date</DataTable.Title>
                <DataTable.Title>Time</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
              </DataTable.Header>

              {exams.length === 0 && (
                <DataTable.Row>
                  <DataTable.Cell>No upcoming or current exams</DataTable.Cell>
                </DataTable.Row>
              )}

              {exams.map((exam) => {
                const status = getStatus(exam);
                return (
                  <DataTable.Row key={exam._id}>
                    <DataTable.Cell>{exam.title}</DataTable.Cell>
                    <DataTable.Cell>{new Date(exam.date).toLocaleDateString()}</DataTable.Cell>
                    <DataTable.Cell>{exam.timeSlot}</DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        mode="outlined"
                        style={[styles.statusChip, { backgroundColor: getStatusColor(status) }]}
                      >
                        {status}
                      </Chip>
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              })}
            </DataTable>
          </ScrollView>
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
    // justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    alignItems: 'stretch',
    marginTop: 32,
    marginBottom: 32,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
  },
  tableScroll: {
    maxHeight: 400,
  },
  statusChip: {
    marginVertical: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExamListScreen; 