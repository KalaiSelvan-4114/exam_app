const mongoose = require('mongoose');

const staffPreferencesSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
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
}, {
  timestamps: true,
});

// Compound index to prevent duplicate preferences
staffPreferencesSchema.index({ staffId: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('StaffPreferences', staffPreferencesSchema); 