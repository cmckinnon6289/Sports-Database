const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    homeTeam: {
        type: Object,
        required: true
    },
    awayTeam: {
        type: Object,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    notes: String
})

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;