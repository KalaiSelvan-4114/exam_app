const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Add a new user (Exam Coordinator only)
router.post('/add', authenticateToken, async (req, res) => {
  try {
    console.log('Add User request body:', req.body);
    if (req.user.role !== 'exam_coordinator') {
      return res.status(403).json({ message: 'Only exam coordinators can add users' });
    }

    const { name, email, password, role, department, phone } = req.body;
    if (!name || !email || !password || !role || !department || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      department,
      phone
    });

    await user.save();
    console.log('User created successfully:', { name, email, role, department, phone });
    res.status(201).json({ message: 'User created successfully', user: { name, email, role, department, phone } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

module.exports = router; 