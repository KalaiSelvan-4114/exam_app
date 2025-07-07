import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, RadioButton, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from '../../services/api';

// Replace with your backend IP

const AddUserScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    phone: '',
    role: 'staff',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    // Validate form
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (!form.department) newErrors.department = 'Department is required';
    if (!form.phone) newErrors.phone = 'Phone is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await userAPI.addUser(form);
      alert('User added successfully!');
      navigation.goBack();
    } catch (err) {
      alert('Error: ' + err.message);
    }
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
          <Text style={styles.title}>Add New User</Text>
          <TextInput
            label="Full Name"
            value={form.name}
            onChangeText={text => handleChange('name', text)}
            style={styles.input}
            mode="outlined"
            error={!!errors.name}
          />
          {errors.name && <HelperText type="error">{errors.name}</HelperText>}
          <TextInput
            label="Email"
            value={form.email}
            onChangeText={text => handleChange('email', text)}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
          />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}
          <TextInput
            label="Password"
            value={form.password}
            onChangeText={text => handleChange('password', text)}
            style={styles.input}
            mode="outlined"
            secureTextEntry
            error={!!errors.password}
          />
          {errors.password && <HelperText type="error">{errors.password}</HelperText>}
          <TextInput
            label="Department"
            value={form.department}
            onChangeText={text => handleChange('department', text)}
            style={styles.input}
            mode="outlined"
            error={!!errors.department}
          />
          {errors.department && <HelperText type="error">{errors.department}</HelperText>}
          <TextInput
            label="Phone"
            value={form.phone}
            onChangeText={text => handleChange('phone', text)}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
            error={!!errors.phone}
          />
          {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}
          <Text style={styles.sectionLabel}>Role</Text>
          <RadioButton.Group
            onValueChange={value => handleChange('role', value)}
            value={form.role}
          >
            <View style={styles.radioGroup}>
              <RadioButton.Item label="Staff" value="staff" labelStyle={styles.radioLabel} />
              <RadioButton.Item label="Department Coordinator" value="department_coordinator" labelStyle={styles.radioLabel} />
            </View>
          </RadioButton.Group>
          <Button
            mode="contained"
            style={styles.addButton}
            labelStyle={styles.addButtonLabel}
            onPress={handleSubmit}
          >
            Add User
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5faff',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 8,
    fontSize: 16,
    height: 48,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  radioGroup: {
    flexDirection: 'column',
    marginVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: '#6C47FF',
    elevation: 2,
    paddingVertical: 12,
  },
  addButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AddUserScreen; 