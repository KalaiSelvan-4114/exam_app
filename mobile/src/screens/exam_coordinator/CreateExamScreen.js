import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image,Alert } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { examAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CreateExamScreen = () => {
    const navigation = useNavigation();
    const [examName, setExamName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [department, setDepartment] = useState('');
    const [date, setDate] = useState(new Date());
    const [session, setSession] = useState('AN');
    const [totalStudents, setTotalStudents] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { user } = useAuth();

    const handleCreateExam = async () => {
        try {
            const examData = {
                title: examName,
                courseCode,
                department,
                date,
                timeSlot: session,
                totalStudents: parseInt(totalStudents),
            };
            console.log('Exam Data:', examData);
            await examAPI.createExam(examData);
            Alert.alert('Success', 'Exam created successfully!');
            setExamName('');
            setCourseCode('');
            setDepartment('');
            setDate(new Date());
            setSession('AN');
            setTotalStudents('');
            navigation.navigate('Manage Exams');
        } catch (error) {
            console.error('Error creating exam:', error);
        }
    };

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
                    <Text style={styles.title}>Create New Exam</Text>
                </View>

                <Surface style={styles.formContainer} elevation={8}>
                    <TextInput
                        label="Exam Name"
                        value={examName}
                        onChangeText={setExamName}
                        mode="outlined"
                        style={styles.input}
                        left={<TextInput.Icon icon="pencil" />}
                    />

                    <TextInput
                        label="Course Code"
                        value={courseCode}
                        onChangeText={setCourseCode}
                        mode="outlined"
                        style={styles.input}
                        left={<TextInput.Icon icon="book" />}
                    />

                    <TextInput
                        label="Department"
                        value={department}
                        onChangeText={setDepartment}
                        mode="outlined"
                        style={styles.input}
                        left={<TextInput.Icon icon="domain" />}
                    />

                    <Button
                        mode="outlined"
                        onPress={() => setShowDatePicker(true)}
                        style={styles.input}
                        icon="calendar"
                    >
                        Select Date
                    </Button>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setDate(selectedDate);
                                }
                            }}
                        />
                    )}

                    <Text style={styles.label}>Session:</Text>
                    <View style={styles.sessionContainer}>
                        <Button
                            mode={session === 'AN' ? 'contained' : 'outlined'}
                            onPress={() => setSession('AN')}
                            style={styles.sessionButton}
                        >
                            AN
                        </Button>
                        <Button
                            mode={session === 'FN' ? 'contained' : 'outlined'}
                            onPress={() => setSession('FN')}
                            style={styles.sessionButton}
                        >
                            FN
                        </Button>
                    </View>

                    <TextInput
                        label="Total Students"
                        value={totalStudents}
                        onChangeText={setTotalStudents}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                        left={<TextInput.Icon icon="account-group" />}
                    />

                    <Button
                        mode="contained"
                        onPress={handleCreateExam}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Create Exam
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
    formContainer: {
        margin: 16,
        padding: 24,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.95)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 12,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#666',
    },
    sessionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    sessionButton: {
        flex: 1,
        marginHorizontal: 8,
        borderRadius: 12,
    },
    button: {
        marginTop: 16,
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
});

export default CreateExamScreen; 