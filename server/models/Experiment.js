const mongoose = require('mongoose');

const experimentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    organism: {
        type: String,
        required: true,
        enum: ['Human', 'Mouse', 'Arabidopsis', 'Drosophila', 'E. coli', 'Zebrafish', 'Tomato', 'Rice', 'Other']
    },
    organismCategory: {
        type: String,
        required: true,
        enum: ['Plant', 'Mammal', 'Insect', 'Microbe', 'Fish', 'Other']
    },
    mission: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true,
        min: 1960,
        max: 2025
    },
    keyFindings: {
        type: String,
        required: true
    },
    keywords: [{
        type: String,
        trim: true
    }],
    dataLink: {
        type: String,
        required: true
    },
    principalInvestigator: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in days
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

experimentSchema.index({ title: 'text', description: 'text', keyFindings: 'text', keywords: 'text' });

module.exports = mongoose.model('Experiment', experimentSchema);