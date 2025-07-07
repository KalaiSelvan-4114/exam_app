const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const sessionBookingController = require('../src/controllers/sessionBookingController');

// Get available sessions for staff to book
router.get('/available', authenticateToken, sessionBookingController.getAvailableSessions);

// Book a session
router.post('/book', authenticateToken, sessionBookingController.bookSession);

// Get staff's booked sessions
router.get('/my-bookings', authenticateToken, sessionBookingController.getMyBookedSessions);

// Cancel a session booking
router.delete('/:bookingId', authenticateToken, sessionBookingController.cancelSession);

// Get all booked sessions (for exam coordinator)
router.get('/all', authenticateToken, sessionBookingController.getAllBookedSessions);

// Assign exam to booked session (for exam coordinator)
router.post('/:bookingId/assign-exam', authenticateToken, sessionBookingController.assignExamToSession);

module.exports = router; 