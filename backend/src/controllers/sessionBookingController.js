const SessionBooking = require('../../models/SessionBooking');
const User = require('../../models/User');
const Exam = require('../../models/Exam');
const Hall = require('../../models/Hall');

// Get available sessions for staff to book
exports.getAvailableSessions = async (req, res) => {
  try {
    // Get all exams
    const exams = await Exam.find();

    // Build a set of unique (date, timeSlot) pairs
    const sessionSet = new Set();
    exams.forEach(exam => {
      const sessionDate = new Date(exam.date);
      const dateStr = sessionDate.toISOString().split('T')[0];
      sessionSet.add(`${dateStr}|${exam.timeSlot}`);
    });

    // Get all session bookings (to count staff per session)
    const allBookings = await SessionBooking.find();

    // Group bookings by date and timeSlot
    const bookingCountMap = {};
    allBookings.forEach(booking => {
      const dateStr = new Date(booking.date).toISOString().split('T')[0];
      const key = `${dateStr}|${booking.timeSlot}`;
      bookingCountMap[key] = (bookingCountMap[key] || 0) + 1;
    });

    // For each session, count number of halls (from all exams on that date/session)
    const hallsMap = {};
    exams.forEach(exam => {
      const dateStr = new Date(exam.date).toISOString().split('T')[0];
      const key = `${dateStr}|${exam.timeSlot}`;
      hallsMap[key] = (hallsMap[key] || 0) + (exam.halls ? exam.halls.length : 0);
    });

    // Get staff's existing bookings
    const existingBookings = await SessionBooking.find({ staffId: req.user._id });
    const bookedSessions = existingBookings.map(booking => ({
      date: booking.date.toISOString().split('T')[0],
      timeSlot: booking.timeSlot
    }));

    // Build available sessions array
    const availableSessions = Array.from(sessionSet).map(key => {
      const [dateStr, timeSlot] = key.split('|');
      const sessionDate = new Date(dateStr);
      const isBooked = bookedSessions.some(booked =>
        booked.date === dateStr && booked.timeSlot === timeSlot
      );
      const staffCount = bookingCountMap[key] || 0;
      const hallCount = hallsMap[key] || 0;
      const isFull = staffCount >= hallCount && hallCount > 0;
      return {
        date: sessionDate,
        timeSlot,
        displayDate: sessionDate.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        displayTime: timeSlot === 'FN' ? 'Morning (FN)' : 'Afternoon (AN)',
        isBooked,
        status: isBooked ? 'booked' : isFull ? 'full' : 'available',
        staffCount,
        hallCount
      };
    }).filter(session => !session.isBooked && session.status !== 'full');

    res.json(availableSessions);
  } catch (error) {
    console.error('Error fetching available sessions:', error);
    res.status(500).json({ message: 'Error fetching available sessions' });
  }
};

// Book a session
exports.bookSession = async (req, res) => {
  try {
    const { date, timeSlot } = req.body;

    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'Date and timeSlot are required' });
    }

    if (!['FN', 'AN'].includes(timeSlot)) {
      return res.status(400).json({ message: 'Invalid timeSlot. Must be FN or AN' });
    }

    // Check if session is already booked
    const existingBooking = await SessionBooking.findOne({
      staffId: req.user._id,
      date: new Date(date),
      timeSlot
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Session already booked' });
    }

    // Create new booking
    const booking = new SessionBooking({
      staffId: req.user._id,
      date: new Date(date),
      timeSlot,
      status: 'booked'
    });

    await booking.save();

    res.json({ 
      message: 'Session booked successfully', 
      booking 
    });
  } catch (error) {
    console.error('Error booking session:', error);
    res.status(500).json({ message: 'Error booking session' });
  }
};

// Get staff's booked sessions
exports.getMyBookedSessions = async (req, res) => {
  try {
    const bookings = await SessionBooking.find({ staffId: req.user._id })
      .populate('assignedExamId', 'title courseCode department')
      .populate('assignedHallId', 'hallNumber capacity')
      .sort({ date: 1, timeSlot: 1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching booked sessions:', error);
    res.status(500).json({ message: 'Error fetching booked sessions' });
  }
};

// Cancel a session booking
exports.cancelSession = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await SessionBooking.findOne({
      _id: bookingId,
      staffId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'assigned') {
      return res.status(400).json({ message: 'Cannot cancel assigned session' });
    }

    await SessionBooking.findByIdAndDelete(bookingId);

    res.json({ message: 'Session booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling session:', error);
    res.status(500).json({ message: 'Error cancelling session' });
  }
};

// Get all booked sessions (for exam coordinator)
exports.getAllBookedSessions = async (req, res) => {
  try {
    if (req.user.role !== 'exam_coordinator') {
      return res.status(403).json({ message: 'Only exam coordinators can view all bookings' });
    }

    const bookings = await SessionBooking.find({})
      .populate('staffId', 'name email department')
      .populate('assignedExamId', 'title courseCode department')
      .populate('assignedHallId', 'hallNumber capacity')
      .sort({ date: 1, timeSlot: 1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all booked sessions:', error);
    res.status(500).json({ message: 'Error fetching booked sessions' });
  }
};

// Assign exam to booked session (for exam coordinator)
exports.assignExamToSession = async (req, res) => {
  try {
    if (req.user.role !== 'exam_coordinator') {
      return res.status(403).json({ message: 'Only exam coordinators can assign exams' });
    }

    const { bookingId } = req.params;
    const { examId, hallId } = req.body;

    const booking = await SessionBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.assignedExamId = examId;
    booking.assignedHallId = hallId;
    booking.status = 'assigned';
    await booking.save();

    res.json({ 
      message: 'Exam assigned to session successfully', 
      booking 
    });
  } catch (error) {
    console.error('Error assigning exam to session:', error);
    res.status(500).json({ message: 'Error assigning exam to session' });
  }
};

// Auto-assign staff to halls and exams for a session
exports.autoAssignSession = async (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'Date and timeSlot are required' });
    }

    // Use date range for the whole day
    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(date);
    end.setHours(23,59,59,999);

    // Find all unassigned bookings for this session
    const unassignedBookings = await SessionBooking.find({
      date: { $gte: start, $lte: end },
      timeSlot,
      status: 'booked',
      assignedExamId: null,
      assignedHallId: null
    });
    console.log('Unassigned bookings:', unassignedBookings.length, unassignedBookings.map(b => b._id));

    if (unassignedBookings.length === 0) {
      console.log('No unassigned bookings for this session.');
      return res.json({ message: 'No unassigned bookings for this session.' });
    }

    // Find all exams for this date/session
    const exams = await Exam.find({ date: { $gte: start, $lte: end }, timeSlot });
    console.log('Exams found:', exams.length, exams.map(e => e._id));
    // Build a list of all halls for these exams
    let halls = [];
    exams.forEach(exam => {
      if (exam.halls && exam.halls.length > 0) {
        exam.halls.forEach(hall => {
          halls.push({
            examId: exam._id,
            hallId: hall._id,
            hallNumber: hall.hallNumber
          });
        });
      }
    });
    console.log('Total halls found:', halls.length, halls.map(h => h.hallId));

    // Find already assigned halls for this session
    const assignedBookings = await SessionBooking.find({
      date: { $gte: start, $lte: end },
      timeSlot,
      assignedHallId: { $ne: null }
    });
    const assignedHallIds = assignedBookings.map(b => String(b.assignedHallId));
    console.log('Already assigned hall IDs:', assignedHallIds);
    // Filter out already assigned halls
    const availableHalls = halls.filter(h => !assignedHallIds.includes(String(h.hallId)));
    console.log('Available halls for assignment:', availableHalls.length, availableHalls.map(h => h.hallId));

    // Round-robin assign staff to available halls/exams
    let updatedCount = 0;
    for (let i = 0; i < unassignedBookings.length && i < availableHalls.length; i++) {
      const booking = unassignedBookings[i];
      const hall = availableHalls[i];
      booking.assignedExamId = hall.examId;
      booking.assignedHallId = hall.hallId;
      booking.status = 'assigned';
      await booking.save();
      updatedCount++;
      console.log(`Assigned booking ${booking._id} to exam ${hall.examId}, hall ${hall.hallId}`);
    }

    res.json({ message: `Auto-assigned ${updatedCount} staff to halls/exams for this session.` });
  } catch (error) {
    console.error('Error in auto-assign:', error);
    res.status(500).json({ message: 'Error auto-assigning staff to session.' });
  }
}; 