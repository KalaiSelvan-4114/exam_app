import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Surface, Text, Button } from 'react-native-paper';
import { examAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const ManageExamsScreen = ({ navigation }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await examAPI.getExams();
        setExams(data);
      } catch (err) {
        setError('Failed to fetch exams');
        console.error('Failed to fetch exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleAddExam = () => {
    navigation.navigate('CreateExam');
  };

  return (
    <LinearGradient
      colors={['#1976D2', '#43cea2', '#185a9d']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Manage Examinations</Text>
        </View>
        <Surface style={styles.card}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Exam</Text>
            <Text style={styles.headerText}>Date</Text>
            <Text style={styles.headerText}>Time Slot</Text>
            <Text style={styles.headerText}>Status</Text>
            <Text style={styles.headerText}>Actions</Text>
          </View>
          <ScrollView style={{ maxHeight: 320 }}>
            {exams.map((exam, idx) => (
              <TouchableOpacity
                key={exam._id}
                style={[
                  styles.tableRow,
                  idx % 2 === 0 ? styles.rowEven : styles.rowOdd,
                ]}
                activeOpacity={0.95}
                onPress={() => {}}
              >
                <Text style={styles.cellText}>{exam.title}</Text>
                <Text style={styles.cellText}>
                  {exam.date ? new Date(exam.date).toLocaleDateString() : ''}
                </Text>
                <Text style={styles.cellText}>{exam.timeSlot}</Text>
                <Text style={styles.cellText}>{exam.status || 'Scheduled'}</Text>
                <Text style={styles.cellText}>...</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button
            mode="contained"
            icon="plus"
            style={styles.addButton}
            contentStyle={styles.addButtonContent}
            labelStyle={styles.addButtonLabel}
            onPress={handleAddExam}
          >
            Add New Exam
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
  container: { flex: 1, backgroundColor: 'transparent', padding: 16 },
  header: { alignItems: 'center', marginBottom: 16 },
  logo: { width: 60, height: 60, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1976D2' },
  card: {
    borderRadius: 24,
    padding: 0,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1976D2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerText: { flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 16 },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  rowEven: { backgroundColor: '#f5faff' },
  rowOdd: { backgroundColor: '#e3f2fd' },
  cellText: { flex: 1, color: '#333', fontSize: 15 },
  addButton: {
    margin: 20,
    borderRadius: 16,
    backgroundColor: '#1976D2',
    elevation: 2,
  },
  addButtonContent: { paddingVertical: 10 },
  addButtonLabel: { fontSize: 18, fontWeight: 'bold' },
});

export default ManageExamsScreen; 