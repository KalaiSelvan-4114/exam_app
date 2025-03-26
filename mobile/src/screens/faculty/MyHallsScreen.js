import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Alert,
} from 'react-native';
import {
    Card,
    Text,
    Button,
    useTheme,
    Divider,
    Chip,
    ActivityIndicator,
} from 'react-native-paper';
import { hallAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MyHallsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme();

    const loadBookings = async () => {
        try {
            setLoading(true);
            const bookings = await hallAPI.getMyBookings();
            setBookings(bookings);
        } catch (error) {
            console.error('Error loading bookings:', error);
            setBookings([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadBookings();
    }, []);

    const handleCancelBooking = async (examId, hallId) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this hall booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await hallAPI.cancelBooking(examId, hallId);
                            loadBookings();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel booking');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isUpcoming = (dateString) => {
        return new Date(dateString) > new Date();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {bookings.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Text variant="bodyLarge" style={styles.emptyText}>
                                You haven't booked any halls yet.
                            </Text>
                        </Card.Content>
                    </Card>
                ) : (
                    bookings.map((exam) => {
                        const bookedHall = exam.halls.find(hall => hall.bookedBy === user._id);
                        if (!bookedHall) return null;
                        
                        return (
                            <Card key={exam._id} style={styles.bookingCard}>
                                <Card.Content>
                                    <Text variant="titleLarge" style={styles.examTitle}>
                                        {exam.title}
                                    </Text>
                                    <Text variant="bodyLarge" style={styles.bookingInfo}>
                                        Department: {exam.department}
                                    </Text>
                                    <Text variant="bodyLarge" style={styles.bookingInfo}>
                                        Date: {formatDate(exam.date)}
                                    </Text>
                                    <Text variant="bodyLarge" style={styles.bookingInfo}>
                                        Time: {exam.startTime} - {exam.endTime}
                                    </Text>
                                    <Text variant="bodyLarge" style={styles.bookingInfo}>
                                        Hall: {bookedHall.hallNumber}
                                    </Text>
                                    <Text variant="bodyLarge" style={styles.bookingInfo}>
                                        Capacity: {bookedHall.capacity}
                                    </Text>
                                </Card.Content>
                                <Card.Actions>
                                    {isUpcoming(exam.date) && (
                                        <Button
                                            mode="contained-tonal"
                                            onPress={() => handleCancelBooking(exam._id, bookedHall._id)}
                                            style={styles.cancelButton}
                                        >
                                            Cancel Booking
                                        </Button>
                                    )}
                                </Card.Actions>
                            </Card>
                        );
                    }).filter(Boolean)
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 16,
    },
    emptyCard: {
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
    },
    bookingCard: {
        marginBottom: 16,
        elevation: 4,
    },
    examTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    bookingInfo: {
        marginBottom: 4,
        color: '#666',
    },
    cancelButton: {
        marginTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MyHallsScreen; 