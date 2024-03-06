const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    permissions: {
        type: Number,
        required: true
    }
}, { collection: 'users' });

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;