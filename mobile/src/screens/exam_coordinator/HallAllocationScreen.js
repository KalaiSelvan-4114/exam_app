import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, FlatList, Alert, TouchableOpacity, Image } from 'react-native';
import { examAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Surface } from 'react-native-paper';

const HallAllocationScreen = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState(null);
  const [error, setError] = useState(null);
  const [preferredStaff, setPreferredStaff] = useState([]);

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await examAPI.getExams();
      setExams(data);
    } catch (e) {
      setError('Failed to fetch exams. Please check your connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    const fetchPreferredStaff = async () => {
      if (selectedExam) {
        try {
          const staff = await examAPI.getPreferredStaff(selectedExam._id);
          console.log('Preferred staff for exam', selectedExam._id, staff);
          setPreferredStaff(staff);
        } catch {
          setPreferredStaff([]);
        }
      } else {
        setPreferredStaff([]);
      }
    };
    fetchPreferredStaff();
  }, [selectedExam]);

  const handleSelectExam = async (examId) => {
    setLoading(true);
    try {
      const latestExam = await examAPI.getExamById(examId);
      setSelectedExam(latestExam);
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch exam details');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAllocate = async () => {
    if (!selectedExam) return;
    setAllocating(true);
    setAssignmentResult(null);
    try {
      const res = await examAPI.assignStaff(selectedExam._id);
      setAssignmentResult(res.exam);
      Alert.alert('Success', 'Staff automatically allocated to halls!');
      const latestExam = await examAPI.getExamById(selectedExam._id);
      setSelectedExam(latestExam);
      const staff = await examAPI.getPreferredStaff(selectedExam._id);
      setPreferredStaff(staff);
    } catch (e) {
      const msg = e?.data?.message || e.message || 'Failed to allocate staff';
      Alert.alert('Error', msg);
    } finally {
      setAllocating(false);
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
          <Button title="Retry" onPress={fetchExams} color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  if (!selectedExam) {
    return (
      <LinearGradient
        colors={['#1976D2', '#43cea2', '#185a9d']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Select Exam for Hall Allocation</Text>
          </View>

          <Surface style={styles.contentContainer} elevation={8}>
            <FlatList
              data={exams}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.examButton}
                  onPress={() => handleSelectExam(item._id)}
                >
                  <Text style={styles.examButtonText}>
                    {item.title} ({item.courseCode}) - {new Date(item.date).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No exams available.</Text>}
            />
          </Surface>
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
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Hall Allocation</Text>
        </View>

        <Surface style={styles.contentContainer} elevation={8}>
          <Button
            title="Back to Exam List"
            onPress={() => { setSelectedExam(null); setAssignmentResult(null); }}
            color="#1976D2"
            style={styles.backButton}
          />

          <Text style={styles.subtitle}>Halls for Exam: {selectedExam.title}</Text>

          <FlatList
            data={selectedExam.halls || []}
            keyExtractor={item => item._id || item.hallNumber}
            renderItem={({ item }) => (
              <View style={styles.hallRow}>
                <Text style={styles.hallText}>Hall: {item.hallNumber}</Text>
                <Text style={styles.hallText}>Capacity: {item.capacity}</Text>
                <Text style={styles.hallText}>Status: {item.status}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No halls assigned to this exam. Department coordinator must assign halls first.
              </Text>
            }
          />

          <Button
            title={allocating ? 'Allocating...' : 'Allocate Staff Automatically'}
            onPress={handleAutoAllocate}
            disabled={allocating || !selectedExam.halls?.length || preferredStaff.length === 0}
            color="#1976D2"
            style={styles.allocateButton}
          />

          {selectedExam.halls?.length > 0 && preferredStaff.length === 0 && (
            <Text style={styles.warningText}>
              Staff must submit preferences before allocation.
            </Text>
          )}

          {assignmentResult && (
            <View style={styles.resultBlock}>
              <Text style={styles.resultTitle}>Assignment Result:</Text>
              {assignmentResult.halls.map(hall => (
                <Text key={hall.hallNumber} style={styles.hallText}>
                  Hall: {hall.hallNumber} - Staff: {hall.assignedStaff || 'Unassigned'}
                </Text>
              ))}
            </View>
          )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1976D2',
  },
  hallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  hallText: {
    fontSize: 16,
    color: '#333',
  },
  resultBlock: {
    marginTop: 20,
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
    color: '#1976D2',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  examButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  examButtonText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  warningText: {
    color: '#c62828',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  backButton: {
    marginBottom: 16,
  },
  allocateButton: {
    marginTop: 16,
  },
});

export default HallAllocationScreen; 