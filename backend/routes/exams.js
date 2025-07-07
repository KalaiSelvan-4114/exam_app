const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Booking = require('../models/Booking');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const StaffPreferences = require('../src/models/StaffPreferences');

// Create a new exam
router.post('/', authenticateToken, async (req, res) => {
    try {
        console.log('POST /api/exams called');
        if (req.user.role !== 'exam_coordinator') {
            console.log('Unauthorized user tried to create exam:', req.user);
            return res.status(403).json({ message: 'Only exam coordinators can create exams' });
        }

        console.log('Received exam creation payload:', req.body);
        console.log('User from auth middleware:', req.user);

        if (!req.user || !req.user._id) {
            console.error('No user ID found in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const {
            title,
            courseCode,
            department,
            date,
            timeSlot,
            totalStudents
        } = req.body;

        // Validate time slot
        if (!['AN', 'FN'].includes(timeSlot)) {
            console.log('Invalid time slot received:', timeSlot);
            return res.status(400).json({ message: 'Invalid time slot. Must be AN or FN' });
        }

        const examData = {
            title,
            courseCode,
            department,
            date,
            timeSlot,
            totalStudents,
            createdBy: req.user._id
        };

        console.log('Creating exam with data:', examData);

        const exam = new Exam(examData);

        try {
            await exam.save();
            console.log('Exam created successfully:', exam);
            res.status(201).json(exam);
        } catch (saveError) {
            // Check if error is due to duplicate key
            if (saveError.code === 11000) {
                console.log('Duplicate exam detected:', saveError);
                return res.status(409).json({ 
                    message: 'An exam with this department, course code, and time slot already exists' 
                });
            }
            throw saveError; // Re-throw if it's not a duplicate key error
        }
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ message: 'Error creating exam', error: error.message });
    }
});

// Get all exams
router.get('/', authenticateToken, async (req, res) => {
    try {
        console.log('GET /api/exams called');
        const exams = await Exam.find();
        console.log('Exams fetched:', exams.length);
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
});

// Get staff's assigned halls
router.get('/my-halls', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'staff') {
            return res.status(403).json({ message: 'Only staff can view their assigned halls' });
        }

        const exams = await Exam.find({
            'halls.assignedStaff': req.user._id
        });

        // Flatten and filter only halls assigned to this staff
        const myHalls = [];
        exams.forEach(exam => {
            if (exam.halls && Array.isArray(exam.halls)) {
                exam.halls.forEach(hall => {
                    if (hall.assignedStaff && hall.assignedStaff.toString() === req.user._id.toString()) {
                        myHalls.push({
                            examId: exam._id,
                            examTitle: exam.title,
                            examDate: exam.date,
                            examTimeSlot: exam.timeSlot,
                            examCourseCode: exam.courseCode,
                            examDepartment: exam.department,
                            hallNumber: hall.hallNumber,
                            capacity: hall.capacity,
                            status: hall.status,
                        });
                    }
                });
            }
        });

        res.json(myHalls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get department assignments (Department Coordinator)
router.get('/department-assignments', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'department_coordinator') {
            return res.status(403).json({ message: 'Only department coordinators can view assignments' });
        }
        const department = req.query.department || req.user.department;
        // Find all exams for this department
        const exams = await Exam.find({ department })
            .populate('halls.assignedStaff', 'name email role')
            .sort({ date: 1 });
        // Format assignments for frontend
        const assignments = exams.map(exam => ({
            _id: exam._id,
            exam: {
                title: exam.title,
                date: exam.date,
                timeSlot: exam.timeSlot
            },
            halls: (exam.halls || []).map(hall => ({
                _id: hall._id,
                hallNumber: hall.hallNumber,
                capacity: hall.capacity
            })),
            staff: (exam.halls || [])
                .filter(hall => hall.assignedStaff)
                .map(hall => ({
                    _id: hall.assignedStaff._id,
                    name: hall.assignedStaff.name,
                    role: hall.assignedStaff.role
                })),
            notes: exam.notes || ''
        }));
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching department assignments:', error);
        res.status(500).json({ message: 'Error fetching department assignments', error: error.message });
    }
});

// Get exam by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        console.log('GET /api/exams/:id called with id:', req.params.id);
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            console.log('Exam not found for id:', req.params.id);
            return res.status(404).json({ message: 'Exam not found' });
        }
        console.log('Exam fetched:', exam);
        res.json(exam);
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ message: 'Error fetching exam', error: error.message });
    }
});

// Update exam
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        console.log('PUT /api/exams/:id called with id:', req.params.id);
        if (req.user.role !== 'exam_coordinator') {
            console.log('Unauthorized user tried to update exam:', req.user);
            return res.status(403).json({ message: 'Only exam coordinators can update exams' });
        }

        const {
            title,
            courseCode,
            department,
            date,
            timeSlot,
            totalStudents
        } = req.body;

        // Validate time slot
        if (!['AN', 'FN'].includes(timeSlot)) {
            console.log('Invalid time slot received:', timeSlot);
            return res.status(400).json({ message: 'Invalid time slot. Must be AN or FN' });
        }

        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            {
                title,
                courseCode,
                department,
                date,
                timeSlot,
                totalStudents
            },
            { new: true }
        );

        if (!exam) {
            console.log('Exam not found for update, id:', req.params.id);
            return res.status(404).json({ message: 'Exam not found' });
        }

        console.log('Exam updated successfully:', exam);
        res.json(exam);
    } catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({ message: 'Error updating exam', error: error.message });
    }
});

// Update exam status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        console.log('PATCH /api/exams/:id/status called with id:', req.params.id, 'and body:', req.body);
        const { status } = req.body;
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            console.log('Exam not found for status update, id:', req.params.id);
            return res.status(404).json({ message: 'Exam not found' });
        }
        exam.status = status;
        await exam.save();
        console.log('Exam status updated:', exam);
        res.json(exam);
    } catch (error) {
        console.error('Error updating exam status:', error);
        res.status(500).json({ message: 'Error updating exam status', error: error.message });
    }
});

// Delete exam
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        console.log('DELETE /api/exams/:id called with id:', req.params.id);
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            console.log('Exam not found for delete, id:', req.params.id);
            return res.status(404).json({ message: 'Exam not found' });
        }
        await exam.remove();
        console.log('Exam deleted successfully, id:', req.params.id);
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({ message: 'Error deleting exam', error: error.message });
    }
});

// Book halls for exam
router.post('/:examId/book', authenticateToken, async (req, res) => {
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
router.post('/:examId/halls/:hallId/cancel', authenticateToken, async (req, res) => {
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

// Allocate halls (Department Coordinator only)
router.post('/:examId/allocate-halls', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'department_coordinator') {
            return res.status(403).json({ message: 'Only department coordinators can allocate halls' });
        }

        const exam = await Exam.findById(req.params.examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        exam.halls = req.body.halls;
        exam.status = 'halls_allocated';
        await exam.save();

        res.json(exam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Random staff assignment by exam coordinator
router.post('/:examId/assign-staff', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'exam_coordinator') {
            return res.status(403).json({ message: 'Only exam coordinators can assign staff' });
        }

        const exam = await Exam.findById(req.params.examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        if (!exam.halls || exam.halls.length === 0) {
            return res.status(400).json({ message: 'No halls have been uploaded for this exam' });
        }

        // Fetch all staff
        const allStaff = await User.find({ role: 'staff' });
        // Find staff whose preferences match the exam date and timeSlot
        const matchingStaff = allStaff.filter(staff =>
            (staff.preferences || []).some(pref => {
                const prefDate = new Date(pref.date);
                const examDate = new Date(exam.date);
                return (
                    pref.timeSlot === exam.timeSlot &&
                    prefDate.getUTCFullYear() === examDate.getUTCFullYear() &&
                    prefDate.getUTCMonth() === examDate.getUTCMonth() &&
                    prefDate.getUTCDate() === examDate.getUTCDate()
                );
            })
        );

        if (!matchingStaff.length) {
            return res.status(400).json({ message: 'No staff preferences submitted. Cannot allocate staff.' });
        }

        // Randomly assign staff to halls
        const shuffled = matchingStaff.sort(() => Math.random() - 0.5);
        let staffIndex = 0;
        for (const hall of exam.halls) {
            if (hall.assignedStaff) continue;
            if (staffIndex < shuffled.length) {
                hall.assignedStaff = shuffled[staffIndex]._id;
                hall.status = 'staff_assigned';
                staffIndex++;
            }
        }

        exam.status = 'staff_assigned';
        exam.staffAssignedBy = req.user._id;
        exam.staffAssignmentDate = new Date();
        await exam.save();

        res.json({
            message: 'Staff assigned successfully',
            exam: {
                _id: exam._id,
                title: exam.title,
                date: exam.date,
                timeSlot: exam.timeSlot,
                halls: exam.halls.map(hall => ({
                    hallNumber: hall.hallNumber,
                    assignedStaff: hall.assignedStaff
                }))
            }
        });
    } catch (error) {
        console.error('Error assigning staff:', error);
        res.status(500).json({ message: 'Error assigning staff', error: error.message });
    }
});

// Get exam reports
router.get('/reports/summary', authenticateToken, async (req, res) => {
    try {
        console.log('GET /api/exams/reports/summary called');
        if (req.user.role !== 'exam_coordinator' && req.user.role !== 'department_coordinator') {
            return res.status(403).json({ message: 'Only coordinators can view reports' });
        }

        const { department, startDate, endDate } = req.query;
        
        // Build query based on role and filters
        let query = {};
        if (req.user.role === 'department_coordinator') {
            query.department = req.user.department;
        } else if (department) {
            query.department = department;
        }
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const exams = await Exam.find(query)
            .populate('halls.assignedStaff', 'name email')
            .sort({ date: 1 });

        // Generate summary statistics
        const summary = {
            totalExams: exams.length,
            totalStudents: exams.reduce((sum, exam) => sum + exam.totalStudents, 0),
            departments: {},
            timeSlots: {
                AN: 0,
                FN: 0
            },
            upcomingExams: exams.filter(exam => new Date(exam.date) > new Date()).length
        };

        // Calculate department-wise statistics
        exams.forEach(exam => {
            // Department stats
            if (!summary.departments[exam.department]) {
                summary.departments[exam.department] = {
                    count: 0,
                    students: 0
                };
            }
            summary.departments[exam.department].count++;
            summary.departments[exam.department].students += exam.totalStudents;

            // Time slot stats
            summary.timeSlots[exam.timeSlot]++;
        });

        res.json({
            summary,
            exams: exams.map(exam => ({
                _id: exam._id,
                title: exam.title,
                courseCode: exam.courseCode,
                department: exam.department,
                date: exam.date,
                timeSlot: exam.timeSlot,
                totalStudents: exam.totalStudents,
                halls: exam.halls.map(hall => ({
                    hallNumber: hall.hallNumber,
                    capacity: hall.capacity,
                    assignedStaff: hall.assignedStaff
                }))
            }))
        });
    } catch (error) {
        console.error('Error generating reports:', error);
        res.status(500).json({ message: 'Error generating reports', error: error.message });
    }
});

// Get staff with preferences for a given exam's date and timeSlot
router.get('/:examId/preferred-staff', authenticateToken, async (req, res) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  const examDateObj = new Date(exam.date);
  // Fetch all staff and filter in JS for robust date matching
  const allStaff = await User.find({ role: 'staff' }, 'name email department preferences');
  const matchingStaff = allStaff.filter(staff =>
    staff.preferences.some(pref => {
      const prefDate = new Date(pref.date);
      const isMatch =
        pref.timeSlot === exam.timeSlot &&
        prefDate.getUTCFullYear() === examDateObj.getUTCFullYear() &&
        prefDate.getUTCMonth() === examDateObj.getUTCMonth() &&
        prefDate.getUTCDate() === examDateObj.getUTCDate();
      console.log(
        `Staff: ${staff.email}, prefDate: ${prefDate.toISOString()}, examDate: ${examDateObj.toISOString()}, ` +
        `prefTimeSlot: [${pref.timeSlot}], examTimeSlot: [${exam.timeSlot}], match: ${isMatch}`
      );
      return isMatch;
    })
  );
  console.log('Returning matching staff:', matchingStaff.map(s => s.email));
  res.json(matchingStaff);
});

// Staff submit exam preferences
router.post('/preferences', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'staff') {
            return res.status(403).json({ message: 'Only staff can submit preferences' });
        }

        const { preferences } = req.body;
        if (!Array.isArray(preferences) || preferences.length === 0) {
            return res.status(400).json({ message: 'Preferences array is required' });
        }

        // Optionally validate each preference object
        for (const pref of preferences) {
            if (!pref.examId || !pref.date || !pref.timeSlot) {
                return res.status(400).json({ message: 'Each preference must have examId, date, and timeSlot' });
            }
        }

        // Save preferences to the staff user document
        const staff = await User.findById(req.user._id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff user not found' });
        }

        staff.preferences = preferences;
        await staff.save();

        res.json({ message: 'Preferences saved successfully', preferences: staff.preferences });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ message: 'Error saving preferences', error: error.message });
    }
});

module.exports = router; 