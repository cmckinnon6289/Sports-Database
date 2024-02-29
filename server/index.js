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

app.get('/api/events/all-events', async(req, res) => {
    try {
        const events = await Event.find({});
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: `could not find event with ID ${req.params.id}` })
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/events/events-between', async (req,res) => {
    try {
        const allEvents = await Event.find({});
        const events = allEvents.filter((event) => (event.date > new Date(req.body.startDate)) && (event.date < new Date(req.body.endDate)));
        res.json(events);
        if (!events) return res.status(404).json({ error: `could not find any events between the dates ${req.body.startDate} and ${req.body.endDate}.` });
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