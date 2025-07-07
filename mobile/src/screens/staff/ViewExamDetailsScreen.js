import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ViewExamDetailsScreen = ({ route }) => {
  const { exam } = route.params; // Retrieve the exam details passed via navigation

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exam Details</Text>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Title:</Text>
        <Text style={styles.value}>{exam.title || 'N/A'}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Course Code:</Text>
        <Text style={styles.value}>{exam.courseCode || 'N/A'}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Department:</Text>
        <Text style={styles.value}>{exam.department || 'N/A'}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>
          {new Date(exam.date).toLocaleDateString() || 'N/A'}
        </Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Time Slot:</Text>
        <Text style={styles.value}>{exam.timeSlot || 'N/A'}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Total Students:</Text>
        <Text style={styles.value}>{exam.totalStudents || 'N/A'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200ee',
  },
  detailContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    width: 120, // Fixed width for alignment
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
});

export default ViewExamDetailsScreen;