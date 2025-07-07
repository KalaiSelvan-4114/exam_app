const express = require('express');
const router = express.Router();
const preferencesController = require('../src/controllers/preferencesController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get exam preferences
router.get(
  '/exam-preferences',
  authenticateToken,
  authorizeRoles(['exam_coordinator']),
  preferencesController.getExamPreferences
);

// Update exam preferences
router.put(
  '/exam-preferences',
  authenticateToken,
  authorizeRoles(['exam_coordinator']),
  preferencesController.updateExamPreferences
);

// Get staff preferences
router.get(
  '/staff-preferences',
  authenticateToken,
  authorizeRoles(['staff']),
  preferencesController.getStaffPreferences
);

// Submit staff preferences
router.post(
  '/staff-preferences',
  authenticateToken,
  authorizeRoles(['staff']),
  preferencesController.submitStaffPreferences
);

module.exports = router; 