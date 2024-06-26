const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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

const User = mongoose.model('User', userSchema);

module.exports = User;