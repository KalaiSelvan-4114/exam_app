import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StaffReportsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff Reports</Text>
      <Text>This is a placeholder for the Staff Reports screen.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default StaffReportsScreen; 