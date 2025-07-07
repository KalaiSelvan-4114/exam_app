const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
    hallNumber: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    department: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'allocated', 'maintenance'],
        default: 'available'
    },
    currentExam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        default: null
    },
    allocatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    allocationDate: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModifiedAt: {
        type: Date
    }
});

// Add validation middleware
hallSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.lastModifiedAt = new Date();
    }
    console.log('Saving hall:', { 
        hallId: this._id, 
        hallNumber: this.hallNumber,
        status: this.status,
        currentExam: this.currentExam
    });
    next();
});

// Add cleanup middleware when hall is deleted
hallSchema.pre('remove', async function(next) {
    if (this.currentExam) {
        try {
            const Exam = mongoose.model('Exam');
            await Exam.findByIdAndUpdate(this.currentExam, {
                $pull: { halls: { hallNumber: this.hallNumber } }
            });
        } catch (error) {
            console.error('Error cleaning up hall references:', error);
        }
    }
    next();
});

const Hall = mongoose.model('Hall', hallSchema);

module.exports = Hall; 