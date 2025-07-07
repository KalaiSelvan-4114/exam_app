const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
  autoAssignStaff: {
    type: Boolean,
    default: false,
  },
  notifyOnChanges: {
    type: Boolean,
    default: true,
  },
  allowOverlap: {
    type: Boolean,
    default: false,
  },
  requireApproval: {
    type: Boolean,
    default: true,
  },
  defaultDuration: {
    type: Number,
    default: 120,
    min: 30,
    max: 240,
  },
  maxStudentsPerHall: {
    type: Number,
    default: 50,
    min: 10,
    max: 200,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Preferences', preferencesSchema); 