import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://169.254.251.0:5000/api'; // Your computer's IP address

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add authorization token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        } catch (error) {
            console.error('Error adding token to request:', error);
            return config;
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,  // Return the full response instead of just data
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            AsyncStorage.removeItem('token');
            // You might want to redirect to login here
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },
};

// Exam API
export const examAPI = {
    getExams: async () => {
        const response = await api.get('/exams');
        return response.data;
    },
    getExamById: async (id) => {
        const response = await api.get(`/exams/${id}`);
        return response.data;
    },
    createExam: async (examData) => {
        const response = await api.post('/exams', examData);
        return response.data;
    },
    updateExam: async (id, examData) => {
        const response = await api.put(`/exams/${id}`, examData);
        return response.data;
    },
    deleteExam: async (id) => {
        const response = await api.delete(`/exams/${id}`);
        return response.data;
    },
    bookHall: async (examId, hallId) => {
        const response = await api.post(`/exams/${examId}/book-hall`, { hallId });
        return response.data;
    },
    cancelBooking: async (examId, hallId) => {
        const response = await api.post(`/exams/${examId}/cancel-booking`, { hallId });
        return response.data;
    }
};

// Hall API
export const hallAPI = {
    getHalls: async () => {
        const response = await api.get('/halls');
        return response.data;
    },
    getHallById: async (id) => {
        const response = await api.get(`/halls/${id}`);
        return response.data;
    },
    createHall: async (hallData) => {
        const response = await api.post('/halls', hallData);
        return response.data;
    },
    updateHall: async (id, hallData) => {
        const response = await api.put(`/halls/${id}`, hallData);
        return response.data;
    },
    deleteHall: async (id) => {
        const response = await api.delete(`/halls/${id}`);
        return response.data;
    },
    getMyBookings: async () => {
        const response = await api.get('/halls/my-bookings');
        return response.data;
    },
    bookHall: async (examId, hallId) => {
        const response = await api.post(`/exams/${examId}/halls/${hallId}/book`);
        return response.data;
    },
    cancelBooking: async (examId, hallId) => {
        const response = await api.post(`/exams/${examId}/halls/${hallId}/cancel`);
        return response.data;
    },
    unbookHall: async (examId, hallId) => {
        const response = await api.post(`/halls/${hallId}/unbook`, { examId });
        return response.data;
    }
};

export default api; 