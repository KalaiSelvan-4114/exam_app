const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Create a new exam
router.post('/', auth, async (req, res) => {
    try {
        // Check if user is coordinator
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Only coordinators can create exams' });
        }

        const {
            title,
            department,
            date,
            startTime,
            endTime,
            duration,
            numberOfHalls,
            timeSlot
        } = req.body;

        // Validate time slot
        if (!['AN', 'FN'].includes(timeSlot)) {
            return res.status(400).json({ message: 'Invalid time slot. Must be AN or FN' });
        }

        // Create halls array based on numberOfHalls
        const halls = Array.from({ length: numberOfHalls }, (_, index) => ({
            hallNumber: `Hall ${index + 1}`,
            capacity: 50, // Default capacity
            status: 'available'
        }));

        const exam = new Exam({
            title,
            department,
            date,
            startTime,
            endTime,
            duration,
            coordinator: req.user._id,
            halls,
            numberOfHalls,
            timeSlot
        });

        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ message: 'Error creating exam', error: error.message });
    }
});

// Get all exams
router.get('/', auth, async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate('coordinator', 'name email')
            .populate('halls.bookedBy', 'name email');
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
});

// Get exam by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('coordinator', 'name email')
            .populate('halls.bookedBy', 'name email');
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        res.json(exam);
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ message: 'Error fetching exam', error: error.message });
    }
});

// Update exam status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const exam = await Exam.findById(req.params.id);
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Only coordinator can update status
        if (exam.coordinator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update exam status' });
        }

        exam.status = status;
        await exam.save();
        res.json(exam);
    } catch (error) {
        console.error('Error updating exam status:', error);
        res.status(500).json({ message: 'Error updating exam status', error: error.message });
    }
});

// Delete exam
router.delete('/:id', auth, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Only coordinator can delete exam
        if (exam.coordinator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete exam' });
        }

        await exam.remove();
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({ message: 'Error deleting exam', error: error.message });
    }
});

// Book halls for exam
router.post('/:examId/book', auth, async (req, res) => {
    try {
        const { hallIds, timeSlot } = req.body;
        const examId = req.params.examId;

        // Check if user is faculty
        if (req.user.role !== 'faculty') {
            return res.status(403).json({ message: 'Only faculty members can book halls' });
        }

        // Validate time slot
        if (!['AN', 'FN'].includes(timeSlot)) {
            return res.status(400).json({ message: 'Invalid time slot' });
        }

        // Check if faculty has already booked 4 halls
        const existingBookings = await Booking.find({
            userId: req.user._id,
            timeSlot: timeSlot
        });

        if (existingBookings.length + hallIds.length > 4) {
            return res.status(400).json({ 
                message: 'Faculty cannot book more than 4 halls in a time slot' 
            });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Check if the halls are available
        for (const hallId of hallIds) {
            const hall = exam.halls.id(hallId);
            if (!hall || hall.status === 'booked') {
                return res.status(400).json({ 
                    message: `Hall ${hall ? hall.hallNumber : hallId} is not available` 
                });
            }
        }

        // Book the halls
        for (const hallId of hallIds) {
            const hall = exam.halls.id(hallId);
            hall.status = 'booked';
            hall.bookedBy = req.user._id;

            // Create booking record
            await new Booking({
                examId: exam._id,
                userId: req.user._id,
                hallId: hallId,
                timeSlot: timeSlot
            }).save();
        }

        await exam.save();
        res.json(exam);
    } catch (error) {
        console.error('Error booking halls:', error);
        res.status(500).json({ message: 'Error booking halls', error: error.message });
    }
});

// Cancel hall booking
router.post('/:examId/halls/:hallId/cancel', auth, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const hall = exam.halls.id(req.params.hallId);
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        // Check if the user is the one who booked the hall
        if (hall.bookedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        hall.status = 'available';
        hall.bookedBy = null;

        // Remove booking record
        await Booking.findOneAndDelete({
            examId: exam._id,
            userId: req.user._id,
            hallId: req.params.hallId
        });

        await exam.save();
        res.json(exam);
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
});

module.exports = router; 