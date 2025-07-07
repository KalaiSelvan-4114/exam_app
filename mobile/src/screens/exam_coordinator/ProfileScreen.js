import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation }) => {
  // Example user data (replace with real user data)
  const user = {
    name: 'exam',
    role: 'Exam Coordinator',
    department: 'IT',
    email: 'exam@gmail.com',
    phone: '9087654321',
  };

  return (
    <LinearGradient
      colors={['#1976D2', '#43cea2', '#185a9d']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Surface style={styles.card} elevation={8}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.role}>{user.role}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{user.department}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}> 
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>

          <Button
            mode="outlined"
            style={styles.button}
            labelStyle={styles.buttonLabel}
            onPress={() => navigation.navigate('CreateExam')}
          >
            Create Exam
          </Button>
          <Button
            mode="outlined"
            style={styles.button}
            labelStyle={styles.buttonLabel}
            onPress={() => navigation.navigate('ManageExams')}
          >
            Manage Exams
          </Button>
          <Button
            mode="contained"
            style={[styles.button, styles.logoutButton]}
            labelStyle={styles.buttonLabel}
            onPress={() => {/* logout logic */}}
          >
            Logout
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    marginTop: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#6C47FF',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    textAlign: 'center',
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    color: '#888',
    fontSize: 15,
  },
  infoValue: {
    color: '#222',
    fontSize: 15,
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    borderRadius: 16,
    marginTop: 16,
    paddingVertical: 12,
  },
  logoutButton: {
    backgroundColor: '#6C47FF',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 