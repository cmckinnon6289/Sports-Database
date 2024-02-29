const mongoose = require('mongoose');

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
    location: {
        type: String,
        required: true
    },
    notes: String
}, { collection: 'events' })

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;