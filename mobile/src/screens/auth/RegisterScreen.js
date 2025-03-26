import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import {
    TextInput,
    Button,
    Text,
    Surface,
    useTheme,
    SegmentedButtons,
    HelperText,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: '',
        phone: '',
        role: 'faculty'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const theme = useTheme();

    const handleRegister = async () => {
        try {
            setLoading(true);
            setError('');

            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }

            // Validate department for faculty
            if (formData.role === 'faculty' && !formData.department) {
                setError('Department is required for faculty members');
                return;
            }

            const user = await register(formData);
            
            // Navigate based on user role
            if (user.role === 'coordinator') {
                navigation.replace('CoordinatorDashboard');
            } else {
                navigation.replace('FacultyDashboard');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.surface}>
                    <Text variant="headlineMedium" style={styles.title}>
                        Create Account
                    </Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        Sign up to get started
                    </Text>

                    {error ? (
                        <HelperText type="error" visible={!!error}>
                            {error}
                        </HelperText>
                    ) : null}

                    <TextInput
                        label="Full Name"
                        value={formData.name}
                        onChangeText={(value) => updateFormData('name', value)}
                        mode="outlined"
                        style={styles.input}
                    />

                    <TextInput
                        label="Email"
                        value={formData.email}
                        onChangeText={(value) => updateFormData('email', value)}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                    />

                    <TextInput
                        label="Password"
                        value={formData.password}
                        onChangeText={(value) => updateFormData('password', value)}
                        mode="outlined"
                        secureTextEntry
                        style={styles.input}
                    />

                    <TextInput
                        label="Confirm Password"
                        value={formData.confirmPassword}
                        onChangeText={(value) => updateFormData('confirmPassword', value)}
                        mode="outlined"
                        secureTextEntry
                        style={styles.input}
                    />

                    <TextInput
                        label="Department"
                        value={formData.department}
                        onChangeText={(value) => updateFormData('department', value)}
                        mode="outlined"
                        style={styles.input}
                        disabled={formData.role === 'coordinator'}
                    />

                    <TextInput
                        label="Phone Number"
                        value={formData.phone}
                        onChangeText={(value) => updateFormData('phone', value)}
                        mode="outlined"
                        keyboardType="phone-pad"
                        style={styles.input}
                    />

                    <Text variant="bodyMedium" style={styles.roleLabel}>
                        Select Role
                    </Text>
                    <SegmentedButtons
                        value={formData.role}
                        onValueChange={(value) => updateFormData('role', value)}
                        buttons={[
                            { value: 'faculty', label: 'Faculty' },
                            { value: 'coordinator', label: 'Coordinator' }
                        ]}
                        style={styles.roleButtons}
                    />

                    <Button
                        mode="contained"
                        onPress={handleRegister}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                    >
                        Register
                    </Button>

                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('Login')}
                        style={styles.linkButton}
                    >
                        Already have an account? Login
                    </Button>
                </Surface>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    surface: {
        padding: 20,
        borderRadius: 10,
        elevation: 4,
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    input: {
        marginBottom: 16,
    },
    roleLabel: {
        marginBottom: 8,
    },
    roleButtons: {
        marginBottom: 16,
    },
    button: {
        marginTop: 10,
        paddingVertical: 8,
    },
    linkButton: {
        marginTop: 16,
    },
    error: {
        color: '#B00020',
        textAlign: 'center',
        marginBottom: 16,
    },
});

export default RegisterScreen; 