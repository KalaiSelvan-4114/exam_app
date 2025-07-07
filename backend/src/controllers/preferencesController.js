const Preferences = require('../models/Preferences');
const User = require('../../models/User');
const { validatePreferences } = require('../utils/validators');

// Get exam preferences
exports.getExamPreferences = async (req, res) => {
  try {
    let preferences = await Preferences.findOne();
    
    if (!preferences) {
      // Create default preferences if none exist
      preferences = await Preferences.create({
        autoAssignStaff: false,
        notifyOnChanges: true,
        allowOverlap: false,
        requireApproval: true,
        defaultDuration: 120,
        maxStudentsPerHall: 50,
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching exam preferences:', error);
    res.status(500).json({ message: 'Error fetching exam preferences' });
  }
};

// Update exam preferences
exports.updateExamPreferences = async (req, res) => {
  try {
    const { error } = validatePreferences(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const preferences = await Preferences.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );

    res.json(preferences);
  } catch (error) {
    console.error('Error updating exam preferences:', error);
    res.status(500).json({ message: 'Error updating exam preferences' });
  }
};

// Get staff preferences
exports.getStaffPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    res.json(user ? user.preferences : []);
  } catch (error) {
    console.error('Error fetching staff preferences:', error);
    res.status(500).json({ message: 'Error fetching staff preferences' });
  }
};

// Submit staff preferences
exports.submitStaffPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    // Validate preferences
    if (!Array.isArray(preferences) || preferences.length === 0) {
      return res.status(400).json({ message: 'Invalid preferences format' });
    }

    if (preferences.length > 4) {
      return res.status(400).json({ message: 'Maximum 4 preferences allowed' });
    }

    // Check for duplicate dates
    const dates = preferences.map(p => p.date);
    const uniqueDates = new Set(dates);
    if (dates.length !== uniqueDates.size) {
      return res.status(400).json({ message: 'Cannot select multiple sessions on the same date' });
    }

    // Update preferences in User model
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true }
    );

    res.json(user.preferences);
  } catch (error) {
    console.error('Error submitting staff preferences:', error);
    res.status(500).json({ message: 'Error submitting staff preferences' });
  }
}; 