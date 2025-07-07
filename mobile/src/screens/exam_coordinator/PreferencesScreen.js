import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Card, Title, Button, Text, Surface, ActivityIndicator, Switch, List } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { examAPI } from '../../services/api';

const PreferencesScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState({
    autoAssignStaff: false,
    notifyOnChanges: true,
    allowOverlap: false,
    requireApproval: true,
    defaultDuration: 120,
    maxStudentsPerHall: 50,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await examAPI.getExamPreferences();
      setPreferences(data);
    } catch (err) {
      setError('Failed to fetch preferences. Please try again.');
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await examAPI.updateExamPreferences(preferences);
      navigation.goBack();
    } catch (err) {
      setError('Failed to save preferences. Please try again.');
      console.error('Error saving preferences:', err);
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
          <Button mode="contained" onPress={fetchPreferences} style={styles.retryButton}>
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
          <Text style={styles.title}>Exam Preferences</Text>
        </View>

        <Surface style={styles.contentContainer} elevation={8}>
          <Card style={styles.preferencesCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>General Settings</Title>
              <List.Section>
                <List.Item
                  title="Auto-assign Staff"
                  description="Automatically assign staff to exam halls"
                  right={() => (
                    <Switch
                      value={preferences.autoAssignStaff}
                      onValueChange={() => handleToggle('autoAssignStaff')}
                      color="#1976D2"
                    />
                  )}
                />
                <List.Item
                  title="Notify on Changes"
                  description="Send notifications when exam details change"
                  right={() => (
                    <Switch
                      value={preferences.notifyOnChanges}
                      onValueChange={() => handleToggle('notifyOnChanges')}
                      color="#1976D2"
                    />
                  )}
                />
                <List.Item
                  title="Allow Hall Overlap"
                  description="Allow exams to be scheduled in the same hall"
                  right={() => (
                    <Switch
                      value={preferences.allowOverlap}
                      onValueChange={() => handleToggle('allowOverlap')}
                      color="#1976D2"
                    />
                  )}
                />
                <List.Item
                  title="Require Approval"
                  description="Require approval for exam schedule changes"
                  right={() => (
                    <Switch
                      value={preferences.requireApproval}
                      onValueChange={() => handleToggle('requireApproval')}
                      color="#1976D2"
                    />
                  )}
                />
              </List.Section>
            </Card.Content>
          </Card>

          <Card style={styles.preferencesCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Default Values</Title>
              <List.Section>
                <List.Item
                  title="Default Exam Duration"
                  description={`${preferences.defaultDuration} minutes`}
                  right={() => (
                    <Text style={styles.valueText}>{preferences.defaultDuration} min</Text>
                  )}
                />
                <List.Item
                  title="Maximum Students per Hall"
                  description="Maximum number of students allowed in a hall"
                  right={() => (
                    <Text style={styles.valueText}>{preferences.maxStudentsPerHall}</Text>
                  )}
                />
              </List.Section>
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="content-save"
            >
              Save Preferences
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
  preferencesCard: {
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
  valueText: {
    fontSize: 16,
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

export default PreferencesScreen; 