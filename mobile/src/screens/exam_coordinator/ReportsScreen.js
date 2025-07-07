import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Surface, DataTable, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { examAPI } from '../../services/api';

const ReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      // Replace with actual API call
      const data = await examAPI.getReports();
      setReports(data);
    } catch (err) {
      setError('Failed to fetch reports. Please try again.');
      console.error('Error fetching reports:', err);
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
          <Button mode="contained" onPress={fetchReports} style={styles.retryButton}>
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
          <Text style={styles.title}>Exam Reports</Text>
        </View>

        <Surface style={styles.contentContainer} elevation={8}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title style={styles.summaryTitle}>Summary</Title>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Exams</Text>
                  <Text style={styles.summaryValue}>24</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Active Exams</Text>
                  <Text style={styles.summaryValue}>8</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Completed</Text>
                  <Text style={styles.summaryValue}>16</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Staff</Text>
                  <Text style={styles.summaryValue}>45</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.reportsCard}>
            <Card.Content>
              <Title style={styles.reportsTitle}>Recent Reports</Title>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title style={styles.tableHeader}>Exam</DataTable.Title>
                  <DataTable.Title style={styles.tableHeader}>Date</DataTable.Title>
                  <DataTable.Title style={styles.tableHeader}>Status</DataTable.Title>
                  <DataTable.Title style={styles.tableHeader}>Actions</DataTable.Title>
                </DataTable.Header>

                {reports.map((report) => (
                  <DataTable.Row key={report.id} style={styles.tableRow}>
                    <DataTable.Cell style={styles.tableCell}>{report.examName}</DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      {new Date(report.date).toLocaleDateString()}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>{report.status}</DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Button
                        mode="contained"
                        onPress={() => {}}
                        style={styles.viewButton}
                        labelStyle={styles.viewButtonLabel}
                      >
                        View
                      </Button>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.exportButton}
            labelStyle={styles.exportButtonLabel}
            icon="download"
          >
            Export All Reports
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
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#fff',
  },
  summaryCard: {
    marginBottom: 24,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  reportsCard: {
    marginBottom: 24,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  reportsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
  },
  tableHeader: {
    backgroundColor: '#1976D2',
  },
  tableRow: {
    backgroundColor: '#fff',
  },
  tableCell: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  viewButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
  },
  viewButtonLabel: {
    fontSize: 12,
    color: '#fff',
  },
  exportButton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    elevation: 2,
  },
  exportButtonLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReportsScreen; 