const mongoose = require('mongoose');
const Team = require('./Team');

const eventSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    homeTeam: {
        type: Team,
        required: true
    },
    awayTeam: {
        type: Team,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    notes: String
}, { collection: 'events' })

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;