const mongoose = require('mongoose');

const adminContentSchema = new mongoose.Schema({
    keyword: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['biology', 'mission', 'organism', 'technology', 'general'],
        default: 'general'
    },
    createdBy: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

adminContentSchema.index({ keyword: 'text', title: 'text', content: 'text' });

module.exports = mongoose.model('AdminContent', adminContentSchema);