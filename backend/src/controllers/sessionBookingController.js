const SessionBooking = require('../../models/SessionBooking');
const User = require('../../models/User');
const Exam = require('../../models/Exam');

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
        status: isBooked ? 'booked' : 'available',
      };
    });

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