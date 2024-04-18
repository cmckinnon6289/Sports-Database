const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { collection: 'leagues' });

const League = mongoose.model('League', leagueSchema);

module.exports = League;