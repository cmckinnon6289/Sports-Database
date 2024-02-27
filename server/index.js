const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const Event = require('./models/Event');

const app = express();
const PORT = process.env.PORT || 621;

app.use(cors());
app.use(bodyParser.json());

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})

require('./db');

app.get('/api/internal/test', async(req, res) => {
    try {
        res.json({ message: "hi! the API is working. have a great day :)" });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/assets/all-events', async(req, res) => {
    try {
        const events = await Event.find({});
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/api/new-event', async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});