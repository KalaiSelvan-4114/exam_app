const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const auth = require('../middleware/auth');
const Hall = require('../models/Hall');

// Book a hall (Faculty only)
router.post('/:examId/book/:hallId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'faculty') {
            return res.status(403).json({ message: 'Access denied. Faculty only.' });
        }

        const exam = await Exam.findById(req.params.examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const hall = exam.halls.id(req.params.hallId);
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        if (hall.status === 'booked') {
            return res.status(400).json({ message: 'Hall already booked' });
        }

        hall.status = 'booked';
        hall.bookedBy = req.user.userId;
        await exam.save();

        res.json(hall);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Cancel hall booking (Faculty only)
router.post('/:examId/cancel/:hallId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'faculty') {
            return res.status(403).json({ message: 'Access denied. Faculty only.' });
        }

        const exam = await Exam.findById(req.params.examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const hall = exam.halls.id(req.params.hallId);
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        if (hall.status !== 'booked' || hall.bookedBy.toString() !== req.user.userId) {
            return res.status(400).json({ message: 'Not authorized to cancel this booking' });
        }

        hall.status = 'available';
        hall.bookedBy = null;
        await exam.save();

        res.json(hall);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get my booked halls (Faculty only)
router.get('/my-bookings', auth, async (req, res) => {
    try {
        if (req.user.role !== 'faculty') {
            return res.status(403).json({ message: 'Access denied. Faculty only.' });
        }

        const exams = await Exam.find({
            'halls.bookedBy': req.user.userId
        })
        .populate('coordinator', 'name email')
        .populate('halls.bookedBy', 'name email');

        const bookings = exams.map(exam => ({
            _id: exam._id,
            title: exam.title,
            department: exam.department,
            date: exam.date,
            startTime: exam.startTime,
            endTime: exam.endTime,
            halls: exam.halls.filter(hall => 
                hall.bookedBy && hall.bookedBy._id.toString() === req.user.userId
            ).map(hall => ({
                _id: hall._id,
                hallNumber: hall.hallNumber,
                capacity: hall.capacity,
                bookedBy: hall.bookedBy._id
            }))
        }));

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all halls
router.get('/', auth, async (req, res) => {
    console.log('Get all halls request received');
    try {
        const halls = await Hall.find();
        console.log(`Retrieved ${halls.length} halls successfully`);
        res.json(halls);
    } catch (error) {
        console.error('Error fetching halls:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create hall (Coordinator only)
router.post('/', auth, async (req, res) => {
    console.log('Create hall request received:', { name: req.body.name });
    try {
        if (req.user.role !== 'coordinator') {
            console.log('Create hall failed: Unauthorized access');
            return res.status(403).json({ message: 'Not authorized' });
        }

        const hall = new Hall(req.body);
        await hall.save();
        console.log('Hall created successfully:', { hallId: hall._id });
        res.status(201).json(hall);
    } catch (error) {
        console.error('Error creating hall:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update hall (Coordinator only)
router.put('/:id', auth, async (req, res) => {
    console.log('Update hall request received:', { hallId: req.params.id });
    try {
        if (req.user.role !== 'coordinator') {
            console.log('Update hall failed: Unauthorized access');
            return res.status(403).json({ message: 'Not authorized' });
        }

        const hall = await Hall.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!hall) {
            console.log('Update failed: Hall not found');
            return res.status(404).json({ message: 'Hall not found' });
        }
        console.log('Hall updated successfully:', { hallId: hall._id });
        res.json(hall);
    } catch (error) {
        console.error('Error updating hall:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete hall (Coordinator only)
router.delete('/:id', auth, async (req, res) => {
    console.log('Delete hall request received:', { hallId: req.params.id });
    try {
        if (req.user.role !== 'coordinator') {
            console.log('Delete hall failed: Unauthorized access');
            return res.status(403).json({ message: 'Not authorized' });
        }

        const hall = await Hall.findByIdAndDelete(req.params.id);
        if (!hall) {
            console.log('Delete failed: Hall not found');
            return res.status(404).json({ message: 'Hall not found' });
        }
        console.log('Hall deleted successfully:', { hallId: hall._id });
        res.json({ message: 'Hall deleted' });
    } catch (error) {
        console.error('Error deleting hall:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Unbook a hall (Faculty only)
router.post('/:hallId/unbook', auth, async (req, res) => {
    try {
        const { examId } = req.body;
        const { hallId } = req.params;

        // Find the exam
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Find the hall in the exam
        const hall = exam.halls.find(h => h._id.toString() === hallId);
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found in exam' });
        }

        // Check if the user is the one who booked the hall
        if (hall.bookedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only unbook halls that you have booked' });
        }

        // Check if the exam is within 16 hours
        const examDate = new Date(exam.date);
        const now = new Date();
        const hoursDifference = (examDate - now) / (1000 * 60 * 60);
        if (hoursDifference < 16) {
            return res.status(400).json({ message: 'Cannot unbook hall within 16 hours of exam start' });
        }

        // Update the hall status
        hall.status = 'available';
        hall.bookedBy = null;

        await exam.save();

        res.json({
            success: true,
            message: 'Hall unbooked successfully',
            hall: {
                _id: hall._id,
                hallNumber: hall.hallNumber,
                status: hall.status,
                bookedBy: hall.bookedBy
            }
        });
    } catch (error) {
        console.error('Error unbooking hall:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unbook hall',
            error: error.message
        });
    }
});

module.exports = router; 