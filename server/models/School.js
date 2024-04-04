const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    teamIDs: [],
    notes: String
}, { collection: 'schools' });

const School = mongoose.model('School', schoolSchema);

module.exports = School;