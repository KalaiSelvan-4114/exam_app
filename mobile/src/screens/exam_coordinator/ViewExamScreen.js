import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Surface, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { examAPI } from '../../services/api';

const ViewExamScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { examId } = route.params;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await examAPI.getExamById(examId);
      setExam(data);
    } catch (err) {
      setError('Failed to fetch exam details. Please try again.');
      console.error('Error fetching exam details:', err);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <LinearGradient
        colors={['#1976D2', '#43cea2', '#185a9d']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={fetchExamDetails} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </LinearGradient>
    );
  }

  if (!exam) {
    return (
      <LinearGradient
        colors={['#1976D2', '#43cea2', '#185a9d']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.centered}>
          <Text style={styles.errorText}>Exam not found</Text>
          <Button mode="contained" onPress={() => navigation.goBack()} style={styles.retryButton}>
            Go Back
          </Button>
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
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Exam Details</Text>
        </View>

        <Surface style={styles.contentContainer} elevation={8}>
          <Card style={styles.infoCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>{exam.title}</Title>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Course Code</Text>
                  <Text style={styles.infoValue}>{exam.courseCode}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Department</Text>
                  <Text style={styles.infoValue}>{exam.department}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{new Date(exam.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Session</Text>
                  <Text style={styles.infoValue}>{exam.timeSlot}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Total Students</Text>
                  <Text style={styles.infoValue}>{exam.totalStudents}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EditExam', { examId: exam.id })}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="pencil"
            >
              Edit Exam
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('HallAllocation', { examId: exam.id })}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="office-building"
            >
              Manage Halls
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AssignStaff', { examId: exam.id })}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="account-group"
            >
              Assign Staff
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#fff',
    letterSpacing: 1,
  },
  contentContainer: {
    margin: 16,
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  infoCard: {
    marginBottom: 24,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    backgroundColor: '#1976D2',
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#fff',
  },
});

export default ViewExamScreen; 