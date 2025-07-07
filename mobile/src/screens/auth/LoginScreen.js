import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }
      const user = await login(formData.email, formData.password);
      if (!user || !user.role) {
        setError('Login failed: Invalid user data');
        setLoading(false);
        return;
      }
      // Navigation logic here
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1976D2', '#43cea2', '#185a9d']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.centered}>
          <Surface style={styles.surface} elevation={8}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/logo.png')} // Replace with your logo or use a placeholder
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Welcome Back!</Text>
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={text => setFormData({ ...formData, email: text })}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email" />}
            />
            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={text => setFormData({ ...formData, password: text })}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={props => (
                <TextInput.Icon
                  {...props}
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              )}
            />
            {error ? (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            ) : null}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={{ paddingVertical: 10 }}
              labelStyle={{ fontWeight: 'bold', fontSize: 18 }}
            >
              Login
            </Button>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.linkButton}
              labelStyle={{ color: '#1976D2', fontWeight: 'bold' }}
            >
              Don't have an account? Register
            </Button>
          </Surface>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  surface: {
    width: '100%',
    maxWidth: 400,
    padding: 28,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    marginHorizontal: 8,
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
    color: '#1976D2',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#185a9d',
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    width: '100%',
    alignSelf: 'stretch',
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#1976D2',
    elevation: 2,
  },
  linkButton: {
    marginTop: 18,
    alignSelf: 'center',
  },
}); 