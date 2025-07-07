import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Surface, ActivityIndicator, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { examAPI } from '../../services/api';

const ViewHallScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hallId } = route.params;

  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHallDetails();
  }, [hallId]);

  const fetchHallDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await examAPI.getHallById(hallId);
      setHall(data);
    } catch (err) {
      setError('Failed to fetch hall details. Please try again.');
      console.error('Error fetching hall details:', err);
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
          <Button mode="contained" onPress={fetchHallDetails} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </LinearGradient>
    );
  }

  if (!hall) {
    return (
      <LinearGradient
        colors={['#1976D2', '#43cea2', '#185a9d']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.centered}>
          <Text style={styles.errorText}>Hall not found</Text>
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
          <Text style={styles.title}>Hall Details</Text>
        </View>

        <Surface style={styles.contentContainer} elevation={8}>
          <Card style={styles.infoCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>{hall.name}</Title>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Department</Text>
                  <Text style={styles.infoValue}>{hall.department}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Capacity</Text>
                  <Text style={styles.infoValue}>{hall.capacity}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Chip
                    mode="outlined"
                    style={[
                      styles.statusChip,
                      { backgroundColor: hall.status === 'Available' ? '#e8f5e9' : '#ffebee' }
                    ]}
                    textStyle={[
                      styles.statusText,
                      { color: hall.status === 'Available' ? '#2e7d32' : '#c62828' }
                    ]}
                  >
                    {hall.status}
                  </Chip>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{hall.location}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.assignmentsCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Current Assignments</Title>
              {hall.assignments && hall.assignments.length > 0 ? (
                hall.assignments.map((assignment) => (
                  <View key={assignment.id} style={styles.assignmentItem}>
                    <Text style={styles.assignmentTitle}>{assignment.examName}</Text>
                    <Text style={styles.assignmentDate}>
                      {new Date(assignment.date).toLocaleDateString()} - {assignment.timeSlot}
                    </Text>
                    <Text style={styles.assignmentStaff}>
                      Staff: {assignment.assignedStaff.join(', ')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noAssignments}>No current assignments</Text>
              )}
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EditHall', { hallId: hall.id })}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="pencil"
            >
              Edit Hall
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AssignStaff', { hallId: hall.id })}
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
  statusChip: {
    marginTop: 4,
  },
  statusText: {
    fontWeight: 'bold',
  },
  assignmentsCard: {
    marginBottom: 24,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  assignmentItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  assignmentDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  assignmentStaff: {
    fontSize: 14,
    color: '#666',
  },
  noAssignments: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
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

export default ViewHallScreen; 