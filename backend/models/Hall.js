const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    facilities: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['available', 'booked', 'maintenance'],
        default: 'available'
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add logging middleware
hallSchema.pre('save', function(next) {
    console.log('Saving hall:', { hallId: this._id, name: this.name });
    next();
});

hallSchema.pre('remove', function(next) {
    console.log('Removing hall:', { hallId: this._id, name: this.name });
    next();
});

const Hall = mongoose.model('Hall', hallSchema);

module.exports = Hall; 