import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Surface, Searchbar, Avatar, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { examAPI } from '../../services/api';

const AssignStaffScreen = ({ navigation, route }) => {
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { hallId, examId } = route.params;

  useEffect(() => {
    // Fetch staff data here
    setStaff([
      {
        id: 1,
        name: 'Dr. John Smith',
        department: 'Computer Science',
        specialization: 'Software Engineering',
        availability: 'Available',
      },
      {
        id: 2,
        name: 'Dr. Sarah Johnson',
        department: 'Computer Science',
        specialization: 'Database Systems',
        availability: 'Available',
      },
    ]);
    setLoading(false);
  }, []);

  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Text style={styles.title}>Assign Staff</Text>
        </View>

        <Surface style={styles.contentContainer} elevation={8}>
          <Searchbar
            placeholder="Search staff by name or department"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#1976D2"
          />

          {filteredStaff.map((member) => (
            <Card key={member.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Avatar.Text
                    size={40}
                    label={member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                    style={styles.avatar}
                  />
                  <View style={styles.cardTitleContainer}>
                    <Title style={styles.cardTitle}>{member.name}</Title>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.availabilityChip,
                        {
                          backgroundColor:
                            member.availability === 'Available'
                              ? '#e8f5e9'
                              : '#ffebee',
                        },
                      ]}
                    >
                      {member.availability}
                    </Chip>
                  </View>
                </View>
                <Paragraph style={styles.department}>
                  Department: {member.department}
                </Paragraph>
                <Paragraph style={styles.specialization}>
                  Specialization: {member.specialization}
                </Paragraph>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('ViewSchedule', { staffId: member.id })}
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonLabel}
                >
                  View Schedule
                </Button>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('AssignDuties', { staffId: member.id, hallId, examId })}
                  style={styles.assignButton}
                  labelStyle={styles.assignButtonLabel}
                >
                  Assign
                </Button>
              </Card.Actions>
            </Card>
          ))}
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
  searchBar: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    backgroundColor: '#1976D2',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  availabilityChip: {
    height: 24,
  },
  department: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 16,
    color: '#666',
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  actionButton: {
    marginRight: 8,
    borderColor: '#1976D2',
  },
  actionButtonLabel: {
    color: '#1976D2',
  },
  assignButton: {
    backgroundColor: '#1976D2',
  },
  assignButtonLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AssignStaffScreen; 