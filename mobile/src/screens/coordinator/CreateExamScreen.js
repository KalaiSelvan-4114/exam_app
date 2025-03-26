import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { examAPI } from '../../services/api';

const CreateExamScreen = ({ navigation }) => {
    const theme = useTheme();
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [duration, setDuration] = useState('');
    const [numberOfHalls, setNumberOfHalls] = useState('');
    const [timeSlot, setTimeSlot] = useState('AN');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCreateExam = async () => {
        try {
            setLoading(true);

            if (!title || !department || !date || !startTime || !endTime || !duration || !numberOfHalls || !timeSlot) {
                Alert.alert('Error', 'Please fill in all fields');
                return;
            }

            const examData = {
                title,
                department,
                date: date.toISOString().split('T')[0],
                startTime,
                endTime,
                duration: parseInt(duration),
                numberOfHalls: parseInt(numberOfHalls),
                timeSlot
            };

            const response = await examAPI.createExam(examData);
            Alert.alert('Success', 'Exam created successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error creating exam:', error);
            Alert.alert('Error', error.message || 'Failed to create exam');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <TextInput
                label="Exam Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
            />
            <TextInput
                label="Department"
                value={department}
                onChangeText={setDepartment}
                style={styles.input}
            />
            <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.input}
            >
                {date.toLocaleDateString()}
            </Button>
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                            setDate(selectedDate);
                        }
                    }}
                />
            )}
            <TextInput
                label="Start Time (HH:MM)"
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                style={styles.input}
            />
            <TextInput
                label="End Time (HH:MM)"
                value={endTime}
                onChangeText={setEndTime}
                placeholder="12:00"
                style={styles.input}
            />
            <TextInput
                label="Duration (minutes)"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                style={styles.input}
            />
            <TextInput
                label="Number of Halls Required"
                value={numberOfHalls}
                onChangeText={setNumberOfHalls}
                keyboardType="numeric"
                style={styles.input}
            />
            <View style={styles.timeSlotContainer}>
                <Text>Time Slot:</Text>
                <Button
                    mode={timeSlot === 'AN' ? 'contained' : 'outlined'}
                    onPress={() => setTimeSlot('AN')}
                    style={styles.timeSlotButton}
                >
                    AN
                </Button>
                <Button
                    mode={timeSlot === 'FN' ? 'contained' : 'outlined'}
                    onPress={() => setTimeSlot('FN')}
                    style={styles.timeSlotButton}
                >
                    FN
                </Button>
            </View>
            <Button
                mode="contained"
                onPress={handleCreateExam}
                loading={loading}
                style={styles.submitButton}
            >
                Create Exam
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    input: {
        marginBottom: 16,
    },
    timeSlotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    timeSlotButton: {
        marginLeft: 8,
    },
    submitButton: {
        marginTop: 16,
        marginBottom: 32,
    },
});

export default CreateExamScreen; 