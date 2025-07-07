import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Checkbox, Button, Text, ActivityIndicator, Portal, Modal } from 'react-native-paper';
import { examAPI, staffAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const MAX_PREFERENCES = 4;

const ExamPreferencesScreen = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const allExams = await examAPI.getExams();
      const now = new Date();
      const upcoming = allExams.filter(exam => new Date(exam.date) >= now);
      setExams(upcoming);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (examId, date, timeSlot) => {
    const exists = selectedPreferences.some(
      p => p.examId === examId && p.date === date && p.timeSlot === timeSlot
    );
    if (exists) {
      setSelectedPreferences(selectedPreferences.filter(
        p => !(p.examId === examId && p.date === date && p.timeSlot === timeSlot)
      ));
    } else {
      if (selectedPreferences.length >= MAX_PREFERENCES) {
        Alert.alert('Limit', `You must select exactly ${MAX_PREFERENCES} preferences.`);
        return;
      }
      setSelectedPreferences([...selectedPreferences, { examId, date, timeSlot }]);
    }
  };

  const submitPreferences = async () => {
    if (selectedPreferences.length !== MAX_PREFERENCES) {
      Alert.alert('Error', `Please select exactly ${MAX_PREFERENCES} preferences before submitting.`);
      return;
    }
    setSubmitting(true);
    try {
      await staffAPI.submitPreferences(selectedPreferences);
      setModalVisible(true);
      setSelectedPreferences([]);
    } catch (err) {
      Alert.alert('Error', 'Failed to submit preferences');
    } finally {
      setSubmitting(false);
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

  return (
    <LinearGradient
      colors={['#1976D2', '#43cea2', '#185a9d']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} style={{ width: '100%' }}>
        <Card style={styles.card}>
          <Card.Title title="Select Exam Preferences" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Text style={styles.instructionText}>
              You must select exactly {MAX_PREFERENCES} exam slots where you can invigilate.
            </Text>
            <Text style={[
              styles.selectedCount,
              selectedPreferences.length === MAX_PREFERENCES ? styles.selectedCountComplete : styles.selectedCountIncomplete
            ]}>
              Selected: {selectedPreferences.length}/{MAX_PREFERENCES}
            </Text>
            {selectedPreferences.length !== MAX_PREFERENCES && (
              <Text style={styles.requirementText}>
                Please select {MAX_PREFERENCES - selectedPreferences.length} more preference{MAX_PREFERENCES - selectedPreferences.length !== 1 ? 's' : ''}
              </Text>
            )}
          </Card.Content>
        </Card>
        {exams.map(exam => (
          <Card key={exam._id} style={styles.examCard}>
            <Card.Content>
              <Text style={styles.examTitle}>{exam.title}</Text>
              <Text>Date: {new Date(exam.date).toLocaleDateString()}</Text>
              <Text>Session: {exam.timeSlot}</Text>
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={
                    selectedPreferences.some(
                      p => p.examId === exam._id && p.date === exam.date && p.timeSlot === exam.timeSlot
                    )
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() => togglePreference(exam._id, exam.date, exam.timeSlot)}
                />
                <Text>
                  {exam.timeSlot === 'AN' ? 'Morning (AN)' : 'Afternoon (FN)'}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
        <Button
          mode="contained"
          onPress={submitPreferences}
          loading={submitting}
          disabled={submitting || selectedPreferences.length !== MAX_PREFERENCES}
          style={[
            styles.submitButton,
            selectedPreferences.length === MAX_PREFERENCES && styles.submitButtonEnabled
          ]}
          labelStyle={styles.submitButtonLabel}
        >
          Submit Preferences
        </Button>
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={styles.modal}
          >
            <Text style={styles.modalTitle}>Preferences Submitted</Text>
            <Text>Your preferences have been submitted successfully.</Text>
            <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.modalButton}>
              OK
            </Button>
          </Modal>
        </Portal>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 32,
    width: '100%',
    paddingTop: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '95%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    marginBottom: 18,
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  selectedCount: {
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  selectedCountComplete: {
    color: '#4CAF50',
  },
  selectedCountIncomplete: {
    color: '#FFA000',
  },
  requirementText: {
    color: '#FFA000',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  examCard: {
    width: '95%',
    maxWidth: 500,
    backgroundColor: '#fafaff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    marginBottom: 14,
    alignSelf: 'center',
  },
  examTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#185a9d',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButton: {
    marginVertical: 20,
    marginHorizontal: 10,
    borderRadius: 24,
    backgroundColor: '#BDBDBD',
    alignSelf: 'center',
    width: 220,
    elevation: 2,
  },
  submitButtonEnabled: {
    backgroundColor: '#1976D2',
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1976D2',
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: '#1976D2',
  },
});

export default ExamPreferencesScreen;