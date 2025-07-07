const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { authenticateToken } = require('../middleware/auth');
const Hall = require('../models/Hall');

// Add index for department and status for fast queries
Hall.collection.createIndex({ department: 1, status: 1 });

// Book a hall (Faculty only)
router.post('/:examId/book/:hallId', authenticateToken, async (req, res) => {
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
router.post('/:examId/cancel/:hallId', authenticateToken, async (req, res) => {
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
router.get('/my-bookings', authenticateToken, async (req, res) => {
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

// Get all halls, with optional filtering by department and status
router.get('/', authenticateToken, async (req, res) => {
    try {
        const filter = {};
        if (req.query.department) filter.department = req.query.department;
        if (req.query.status) filter.status = req.query.status;
        const halls = await Hall.find(filter)
            .populate('currentExam', 'title date timeSlot')
            .populate('allocatedBy', 'name')
            .populate('createdBy', 'name');
        res.json(halls);
    } catch (error) {
        console.error('Error fetching halls:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get halls by department
router.get('/department/:deptId', authenticateToken, async (req, res) => {
    try {
        const halls = await Hall.find({ department: req.params.deptId })
            .populate('currentExam', 'title date timeSlot')
            .populate('allocatedBy', 'name')
            .populate('createdBy', 'name');
        res.json(halls);
    } catch (error) {
        console.error('Error fetching department halls:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create hall (Department Coordinator only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'department_coordinator') {
            return res.status(403).json({ message: 'Access denied. Department Coordinator only.' });
        }

        // Log the department from req.user
        console.log('Creating hall. req.user.department:', req.user.department);

        let department = req.user.department;
        // If department is missing, fetch from DB
        if (!department) {
            const User = require('../models/User');
            const userDoc = await User.findById(req.user._id);
            department = userDoc?.department;
            console.log('Fetched department from DB:', department);
        }
        if (!department) {
            return res.status(400).json({ message: 'Department is required for hall creation.' });
        }

        const hall = new Hall({
            ...req.body,
            department,
            createdBy: req.user._id,
            lastModifiedBy: req.user._id
        });

        await hall.save();
        return res.status(201).json(hall);
    } catch (error) {
        console.error('Error creating hall:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Allocate halls to exam (Department Coordinator only)
router.post('/allocate/:examId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'department_coordinator') {
            return res.status(403).json({ message: 'Access denied. Department Coordinator only.' });
        }

        const { hallIds } = req.body;
        if (!hallIds || !Array.isArray(hallIds) || hallIds.length === 0) {
            return res.status(400).json({ message: 'Please provide hall IDs to allocate' });
        }

        const exam = await Exam.findById(req.params.examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (exam.department !== req.user.department) {
            return res.status(403).json({ message: 'You can only allocate halls for your department' });
        }

        // Check hall availability and capacity
        const halls = await Hall.find({ 
            _id: { $in: hallIds },
            department: req.user.department,
            status: 'available'
        });

        if (halls.length !== hallIds.length) {
            return res.status(400).json({ message: 'Some halls are not available or do not exist' });
        }

        const totalCapacity = halls.reduce((sum, hall) => sum + hall.capacity, 0);
        if (totalCapacity < exam.totalStudents) {
            return res.status(400).json({ 
                message: `Total hall capacity (${totalCapacity}) is less than required capacity (${exam.totalStudents})`
            });
        }

        // Update exam with allocated halls
        const hallData = halls.map(hall => ({
            hallNumber: hall.hallNumber,
            capacity: hall.capacity,
            status: 'allocated',
            allocatedAt: new Date(),
            allocatedBy: req.user._id
        }));

        exam.halls = hallData;
        exam.status = 'halls_allocated';
        exam.hallsAllocatedBy = req.user._id;
        exam.hallsAllocationDate = new Date();
        exam.lastModifiedBy = req.user._id;
        exam.lastModifiedAt = new Date();

        // Update hall status
        await Hall.updateMany(
            { _id: { $in: hallIds } },
            { 
                $set: { 
                    status: 'allocated',
                    currentExam: exam._id,
                    allocatedBy: req.user._id,
                    allocationDate: new Date(),
                    lastModifiedBy: req.user._id,
                    lastModifiedAt: new Date()
                }
            }
        );

        await exam.save();
        res.json({ message: 'Halls allocated successfully', exam });
    } catch (error) {
        console.error('Error allocating halls:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Deallocate halls from exam (Department Coordinator only)
router.post('/deallocate/:examId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'department_coordinator') {
            return res.status(403).json({ message: 'Access denied. Department Coordinator only.' });
        }

        const exam = await Exam.findById(req.params.examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (exam.department !== req.user.department) {
            return res.status(403).json({ message: 'You can only deallocate halls for your department' });
        }

        if (!exam.halls || exam.halls.length === 0) {
            return res.status(400).json({ message: 'No halls allocated to this exam' });
        }

        const hallNumbers = exam.halls.map(h => h.hallNumber);
        
        // Update halls status
        await Hall.updateMany(
            { hallNumber: { $in: hallNumbers }, department: req.user.department },
            { 
                $set: { 
                    status: 'available',
                    currentExam: null,
                    allocatedBy: null,
                    allocationDate: null,
                    lastModifiedBy: req.user._id,
                    lastModifiedAt: new Date()
                }
            }
        );

        // Update exam
        exam.halls = [];
        exam.status = 'halls_pending';
        exam.hallsAllocatedBy = null;
        exam.hallsAllocationDate = null;
        exam.lastModifiedBy = req.user._id;
        exam.lastModifiedAt = new Date();

        await exam.save();
        res.json({ message: 'Halls deallocated successfully', exam });
    } catch (error) {
        console.error('Error deallocating halls:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update hall (Department Coordinator only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'department_coordinator') {
            return res.status(403).json({ message: 'Access denied. Department Coordinator only.' });
        }

        const hall = await Hall.findOne({ 
            _id: req.params.id,
            department: req.user.department
        });

        if (!hall) {
            return res.status(404).json({ message: 'Hall not found or unauthorized' });
        }

        if (hall.status === 'allocated') {
            return res.status(400).json({ message: 'Cannot update allocated hall' });
        }

        Object.assign(hall, {
            ...req.body,
            lastModifiedBy: req.user._id,
            lastModifiedAt: new Date()
        });

        await hall.save();
        res.json(hall);
    } catch (error) {
        console.error('Error updating hall:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete hall (Department Coordinator only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'department_coordinator') {
            return res.status(403).json({ message: 'Access denied. Department Coordinator only.' });
        }

        const hall = await Hall.findOne({
            _id: req.params.id,
            department: req.user.department
        });

        if (!hall) {
            return res.status(404).json({ message: 'Hall not found or unauthorized' });
        }

        if (hall.status === 'allocated') {
            return res.status(400).json({ message: 'Cannot delete allocated hall' });
        }

        await hall.remove();
        res.json({ message: 'Hall deleted successfully' });
    } catch (error) {
        console.error('Error deleting hall:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Unbook a hall (Faculty only)
router.post('/:hallId/unbook', authenticateToken, async (req, res) => {
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