const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    notes: String
}, { collection: 'teams' });

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;