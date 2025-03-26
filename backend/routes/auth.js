const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    console.log('Register request received:', { email: req.body.email, role: req.body.role });
    try {
        const { name, email, password, role, department, phone } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('Registration failed: User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user object
        const userData = {
            name,
            email,
            password,
            role,
            phone
        };

        // Add department only for faculty
        if (role === 'faculty') {
            if (!department) {
                console.log('Registration failed: Department required for faculty');
                return res.status(400).json({ message: 'Department is required for faculty members' });
            }
            userData.department = department;
        }

        // Create user
        user = new User(userData);
        await user.save();
        console.log('User registered successfully:', { userId: user._id, role: user.role });

        // Create token payload
        const tokenPayload = {
            userId: user._id,
            role: user.role
        };
        console.log('Creating token with payload:', tokenPayload);

        // Create token
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({ 
            token, 
            user: { 
                id: user._id, 
                name, 
                email, 
                role,
                department: user.department,
                phone: user.phone
            } 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log('Login request received:', { email: req.body.email });
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login failed: User not found');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Login failed: Invalid password');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token payload
        const tokenPayload = {
            userId: user._id,
            role: user.role
        };
        console.log('Creating token with payload:', tokenPayload);

        // Create token
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

        console.log('User logged in successfully:', { userId: user._id, role: user.role });
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email, 
                role: user.role,
                department: user.department,
                phone: user.phone
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
    console.log('Profile request received:', { userId: req.user.userId });
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            console.log('Profile fetch failed: User not found');
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('Profile fetched successfully:', { userId: user._id, role: user.role });
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router; 