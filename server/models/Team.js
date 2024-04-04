const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    schoolID: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    notes: String
}, { collection: 'teams' });

const Team = mongoose.model('TeamRevised', teamSchema);

module.exports = Team;