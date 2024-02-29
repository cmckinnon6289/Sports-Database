const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const Event = require('./models/Event');
const Team = require('./models/Team');

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
        /*for (eventObj in allEvents) {
            if (eventObj.date > new Date(req.body.startDate) && eventObj.date < new Date(req.body.endDate))
                events.push(eventObj);
        };
        if (!events) return res.status(404).json({ error: `could not find any events between the dates ${req.body.startDate} and ${req.body.endDate}.` });*/
        res.json(allEvents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/api/events/new-event', async (req, res) => {
    try {
        let eventDraft = req.body;
        eventDraft.homeTeam = await findTeam(eventDraft.homeTeam);
        eventDraft.awayTeam = await findTeam(eventDraft.awayTeam);
        if (!eventDraft.homeTeam || !eventDraft.awayTeam) return res.status(404).json({ error: `could not find a team object with either id ${req.body.homeTeam} or ${req.body.awayTeam}` }); 

        eventDraft.awayTeam = await Team.findById(eventDraft.awayTeam);
        const event = new Event(eventDraft);
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/teams/new-team', async(req, res) => {
    try {
        const team = new Team(req.body);
        await team.save();
        res.json(team);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

/*

local functions

*/

async function findTeam(id) {
    const teams = await Team.find({});
    const team = teams.filter((team) => team.id === Number(id) ? team : null);
    if (Array.isArray(team)) return team[0];
    return team;
}