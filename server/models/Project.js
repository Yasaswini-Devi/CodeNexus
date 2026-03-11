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
        enum: ['javascript', 'python', 'html', 'ide'],
        required: true,
    },
    code: {
        type: String,
        default: '',
    },
    tree: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
    },
    activeFileId: {
        type: String,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
