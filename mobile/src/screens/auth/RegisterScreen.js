import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
    ScrollView,
    Alert,
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
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: '',
        phone: '',
        role: 'staff'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        try {
            setLoading(true);
            setError('');

            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }

            // Validate department for all roles
            if (!formData.department) {
                setError('Department is required');
                setLoading(false);
                return;
            }

            const user = await register(formData);
            Alert.alert('Success', 'Registration successful!');
            
            // Navigate based on user role
            switch (user.role) {
                case 'exam_coordinator':
                    navigation.replace('Dashboard');
                    break;
                case 'department_coordinator':
                    navigation.replace('DepartmentCoordinatorDashboard');
                    break;
                case 'staff':
                    navigation.replace('FacultyTabs');
                    break;
                default:
                    navigation.replace('Login');
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
        <LinearGradient
            colors={['#3ec6e0', '#1976D2']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.centered} keyboardShouldPersistTaps="handled">
                    <Surface style={styles.surface} elevation={8}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../../assets/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.title}>Create Account</Text>

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
                            left={<TextInput.Icon icon="account" />}
                        />

                        <TextInput
                            label="Email"
                            value={formData.email}
                            onChangeText={(value) => updateFormData('email', value)}
                            mode="outlined"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.input}
                            left={<TextInput.Icon icon="email" />}
                        />

                        <TextInput
                            label="Password"
                            value={formData.password}
                            onChangeText={(value) => updateFormData('password', value)}
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

                        <TextInput
                            label="Confirm Password"
                            value={formData.confirmPassword}
                            onChangeText={(value) => updateFormData('confirmPassword', value)}
                            mode="outlined"
                            secureTextEntry={!showConfirmPassword}
                            style={styles.input}
                            left={<TextInput.Icon icon="lock" />}
                            right={props => (
                                <TextInput.Icon
                                    {...props}
                                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                />
                            )}
                        />

                        <TextInput
                            label="Department"
                            value={formData.department}
                            onChangeText={(value) => updateFormData('department', value)}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="domain" />}
                        />

                        <TextInput
                            label="Phone Number"
                            value={formData.phone}
                            onChangeText={(value) => updateFormData('phone', value)}
                            mode="outlined"
                            keyboardType="phone-pad"
                            style={styles.input}
                            left={<TextInput.Icon icon="phone" />}
                        />

                        <Text style={styles.roleLabel}>Select Role</Text>
                        <SegmentedButtons
                            value={formData.role}
                            onValueChange={(value) => updateFormData('role', value)}
                            buttons={[
                                { value: 'staff', label: 'Staff' },
                                { value: 'department_coordinator', label: 'Dept. Coordinator' },
                                { value: 'exam_coordinator', label: 'Exam Coordinator' }
                            ]}
                            style={styles.roleButtons}
                        />

                        <Button
                            mode="contained"
                            onPress={handleRegister}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                            contentStyle={{ paddingVertical: 10 }}
                            labelStyle={{ fontWeight: 'bold', fontSize: 18 }}
                        >
                            Register
                        </Button>
                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('Login')}
                            style={styles.linkButton}
                            labelStyle={{ color: '#1976D2', fontWeight: 'bold' }}
                        >
                            Already have an account? Login
                        </Button>
                    </Surface>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1 },
    centered: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32 },
    surface: {
        width: '100%',
        maxWidth: 400,
        padding: 28,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.95)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        alignItems: 'stretch',
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
        fontSize: 28,
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
    },
    roleLabel: {
        marginBottom: 8,
        fontWeight: 'bold',
        color: '#1976D2',
        textAlign: 'center',
    },
    roleButtons: {
        marginBottom: 16,
        alignSelf: 'center',
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

export default RegisterScreen; 