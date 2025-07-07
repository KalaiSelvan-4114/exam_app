import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { examAPI } from '../../services/api';

const EditExamScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { examId } = route.params;

  const [examData, setExamData] = useState({
    title: '',
    courseCode: '',
    department: '',
    date: new Date(),
    timeSlot: 'AN',
    totalStudents: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await examAPI.getExamById(examId);
      setExamData({
        title: data.title,
        courseCode: data.courseCode,
        department: data.department,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        totalStudents: data.totalStudents.toString(),
      });
    } catch (err) {
      setError('Failed to fetch exam details. Please try again.');
      console.error('Error fetching exam details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExam = async () => {
    try {
      setLoading(true);
      setError(null);
      await examAPI.updateExam(examId, {
        ...examData,
        totalStudents: parseInt(examData.totalStudents),
      });
      navigation.goBack();
    } catch (err) {
      setError('Failed to update exam. Please try again.');
      console.error('Error updating exam:', err);
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
          <Text style={styles.title}>Edit Exam</Text>
        </View>

        <Surface style={styles.formContainer} elevation={8}>
          <TextInput
            label="Exam Name"
            value={examData.title}
            onChangeText={(text) => setExamData({ ...examData, title: text })}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="pencil" />}
          />

          <TextInput
            label="Course Code"
            value={examData.courseCode}
            onChangeText={(text) => setExamData({ ...examData, courseCode: text })}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="book" />}
          />

          <TextInput
            label="Department"
            value={examData.department}
            onChangeText={(text) => setExamData({ ...examData, department: text })}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="domain" />}
          />

          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.input}
            icon="calendar"
          >
            Select Date: {examData.date.toLocaleDateString()}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={examData.date}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setExamData({ ...examData, date: selectedDate });
                }
              }}
            />
          )}

          <Text style={styles.label}>Session:</Text>
          <View style={styles.sessionContainer}>
            <Button
              mode={examData.timeSlot === 'AN' ? 'contained' : 'outlined'}
              onPress={() => setExamData({ ...examData, timeSlot: 'AN' })}
              style={styles.sessionButton}
            >
              AN
            </Button>
            <Button
              mode={examData.timeSlot === 'FN' ? 'contained' : 'outlined'}
              onPress={() => setExamData({ ...examData, timeSlot: 'FN' })}
              style={styles.sessionButton}
            >
              FN
            </Button>
          </View>

          <TextInput
            label="Total Students"
            value={examData.totalStudents}
            onChangeText={(text) => setExamData({ ...examData, totalStudents: text })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account-group" />}
          />

          <Button
            mode="contained"
            onPress={handleUpdateExam}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            loading={loading}
            disabled={loading}
          >
            Update Exam
          </Button>
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
  formContainer: {
    margin: 16,
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  sessionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  sessionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  button: {
    marginTop: 16,
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

export default EditExamScreen; 