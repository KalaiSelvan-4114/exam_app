const mongoose = require('mongoose');

const sessionBookingSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    enum: ['FN', 'AN'],
    required: true,
  },
  status: {
    type: String,
    enum: ['booked', 'assigned', 'completed'],
    default: 'booked',
  },
  assignedExamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    default: null,
  },
  assignedHallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    default: null,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate bookings for same staff, date, and timeSlot
sessionBookingSchema.index({ staffId: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('SessionBooking', sessionBookingSchema); 