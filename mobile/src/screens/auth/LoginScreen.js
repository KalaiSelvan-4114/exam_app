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
    HelperText,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const theme = useTheme();

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError('');
            const user = await login(formData.email, formData.password);
            
            // Navigate based on user role
            if (user.role === 'coordinator') {
                navigation.replace('CoordinatorDashboard');
            } else {
                navigation.replace('FacultyDashboard');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.surface}>
                    <Text variant="headlineMedium" style={styles.title}>
                        Welcome Back
                    </Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        Sign in to continue
                    </Text>

                    <View style={styles.form}>
                        <TextInput
                            label="Email"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            mode="outlined"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.input}
                        />

                        <TextInput
                            label="Password"
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            mode="outlined"
                            secureTextEntry
                            style={styles.input}
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
                        >
                            Login
                        </Button>

                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('Register')}
                            style={styles.linkButton}
                        >
                            Don't have an account? Register
                        </Button>
                    </View>
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
    form: {
        gap: 16,
    },
    input: {
        backgroundColor: 'white',
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

export default LoginScreen; 