import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.40.185:5000/api'; // Your computer's IP address

// Helper function to get auth token
const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('token');
    console.log('API Service: Retrieved token:', token ? 'Token exists' : 'No token found');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        if (response.status === 401) {
            await AsyncStorage.removeItem('token');
        }
        const error = new Error(data.message || 'API Error');
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
};

// Auth API
export const authAPI = {
    login: async (email, password) => {
        console.log('Making login API call for:', email);
        try {
            console.log('Sending request to:', `${API_URL}/auth/login`);
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            console.log('Received response:', res.status, res.statusText);
            const data = await handleResponse(res);
            console.log('Login API response:', data);
            return data;
        } catch (err) {
            console.error('Login API fetch error:', err);
            console.error('Error details:', {
                message: err.message,
                status: err.status,
                data: err.data
            });
            throw err;
        }
    },
    register: async (userData) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return handleResponse(res);
    },
    getProfile: async () => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/auth/profile`, {
            headers: { ...headers, 'Content-Type': 'application/json' },
        });
        return handleResponse(res);
    },
};

// Exam API
export const examAPI = {
    getExams: async () => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams`, { headers });
        return handleResponse(res);
    },
    getAllBookedSessions: async () => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/session-bookings/all`, { headers });
        return handleResponse(res);
    },
    assignExamToSession: async (bookingId, examId, hallId) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/session-bookings/${bookingId}/assign-exam`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ examId, hallId }),
        });
        return handleResponse(res);
    },
    getExamById: async (id) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams/${id}`, { headers });
        return handleResponse(res);
    },
    createExam: async (examData) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(examData),
        });
        return handleResponse(res);
    },
    updateExam: async (id, examData) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams/${id}`, {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(examData),
        });
        return handleResponse(res);
    },
    deleteExam: async (id) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams/${id}`, {
            method: 'DELETE',
            headers,
        });
        return handleResponse(res);
    },
    getReports: async (filters) => {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams({
            department: filters.department || '',
            startDate: filters.startDate,
            endDate: filters.endDate,
        }).toString();
        const res = await fetch(`${API_URL}/exams/reports/summary?${queryParams}`, {
            headers,
        });
        return handleResponse(res);
    },
    bookHall: async (examId, hallId) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams/${examId}/book-hall`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ hallId }),
        });
        return handleResponse(res);
    },
    cancelBooking: async (examId, hallId) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams/${examId}/cancel-booking`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ hallId }),
        });
        return handleResponse(res);
    },
    assignStaff: async (examId) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams/${examId}/assign-staff`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
        });
        return handleResponse(res);
    },
    getMyHalls: async () => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams/my-halls`, { headers });
        return handleResponse(res);
    },
    getDepartmentAssignments: async (department) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams/department-assignments?department=${department}`, { headers });
        return handleResponse(res);
    },
    allocateHalls: async (examId, halls) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams/${examId}/allocate-halls`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ halls }),
        });
        return handleResponse(res);
    },
    getPreferredStaff: async (examId) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams/${examId}/preferred-staff`, { headers });
        return handleResponse(res);
    },
};

// Hall API
export const hallAPI = {
    getHalls: async () => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/halls`, { headers });
        return handleResponse(res);
    },
    getHallById: async (id) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/halls/${id}`, { headers });
        return handleResponse(res);
    },
    createHall: async (hallData) => {
        const headers = await getAuthHeaders();
        console.log('Create Hall Headers:', headers); // Debug log
        console.log('Create Hall Data:', hallData); // Debug log
        const res = await fetch(`${API_URL}/halls`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(hallData),
        });
        return handleResponse(res);
    },
    updateHall: async (id, hallData) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/halls/${id}`, {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(hallData),
        });
        return handleResponse(res);
    },
    deleteHall: async (id) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/halls/${id}`, {
            method: 'DELETE',
            headers,
        });
        return handleResponse(res);
    },
    getMyBookings: async () => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/halls/my-bookings`, { headers });
        return handleResponse(res);
    },
    bookHall: async (examId, hallId) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams/${examId}/halls/${hallId}/book`, {
            method: 'POST',
            headers,
        });
        return handleResponse(res);
    },
    cancelBooking: async (examId, hallId) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/exams/${examId}/halls/${hallId}/cancel`, {
            method: 'POST',
            headers,
        });
        return handleResponse(res);
    },
    unbookHall: async (examId, hallId) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/halls/${hallId}/unbook`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ examId }),
        });
        return handleResponse(res);
    },
};

export const userAPI = {
    addUser: async (userData) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/users/add`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return handleResponse(res);
    },
};

export const staffAPI = {
    submitPreferences: async (preferences) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/preferences/staff-preferences`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferences }),
        });
        return handleResponse(res);
    },
    getAvailableSessions: async () => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/session-bookings/available`, { headers });
        return handleResponse(res);
    },
    bookSession: async (date, timeSlot) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/session-bookings/book`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, timeSlot }),
        });
        return handleResponse(res);
    },
    getMyBookedSessions: async () => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/session-bookings/my-bookings`, { headers });
        return handleResponse(res);
    },
    cancelSession: async (bookingId) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/session-bookings/${bookingId}`, {
            method: 'DELETE',
            headers,
        });
        return handleResponse(res);
    },
}; 