const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['coordinator', 'faculty'],
        required: true
    },
    department: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Combined pre-save middleware
userSchema.pre('save', async function(next) {
    console.log('Saving user:', { 
        userId: this._id, 
        email: this.email, 
        role: this.role,
        department: this.department 
    });

    // Hash password if modified
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error);
        }
    }

    // Validate department for faculty
    if (this.role === 'faculty' && !this.department) {
        return next(new Error('Department is required for faculty members'));
    }

    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 