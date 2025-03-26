const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hallId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    timeSlot: {
        type: String,
        enum: ['AN', 'FN'],
        required: true
    },
    numberOfHallsBooked: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema); 