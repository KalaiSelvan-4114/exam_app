const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
    hallNumber: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    assignedStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['available', 'allocated', 'staff_assigned'],
        default: 'available'
    },
    allocatedAt: {
        type: Date
    },
    allocatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    courseCode: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        enum: ['AN', 'FN'],
        required: true
    },
    totalStudents: {
        type: Number,
        required: true,
        min: 1
    },
    halls: [hallSchema],
    status: {
        type: String,
        enum: [
            'draft',
            'scheduled',
            'halls_pending',
            'halls_allocated',
            'staff_preferences_pending',
            'staff_preferences_submitted',
            'staff_assigned',
            'published',
            'completed',
            'cancelled'
        ],
        default: 'draft'
    },
    totalCapacity: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hallsAllocatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        },
    hallsAllocationDate: {
        type: Date
        },
    staffAssignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    staffAssignmentDate: {
        type: Date
    },
    publishedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    publishedDate: {
        type: Date
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModifiedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Add compound index for unique department, courseCode, and timeSlot combination
examSchema.index({ department: 1, courseCode: 1, timeSlot: 1 }, { unique: true });

// Calculate total capacity when halls are modified
examSchema.pre('save', function(next) {
    if (this.isModified('halls')) {
        this.totalCapacity = this.halls.reduce((total, hall) => total + hall.capacity, 0);
    }
    if (this.isModified()) {
        this.lastModifiedAt = new Date();
    }
    next();
});

// Validate total capacity against total students
examSchema.pre('save', function(next) {
    if (this.status === 'halls_allocated' && this.totalCapacity < this.totalStudents) {
        next(new Error('Total hall capacity must be greater than or equal to total students'));
    }
    next();
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam; 