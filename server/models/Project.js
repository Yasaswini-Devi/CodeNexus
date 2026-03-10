const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        default: 'Untitled Project',
    },
    language: {
        type: String,
        enum: ['javascript', 'python', 'html'],
        required: true,
    },
    code: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
