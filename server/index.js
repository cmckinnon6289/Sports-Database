const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const authRoutes = require('./routes/auth');
const generateSalt = require('./saltGenerator');

const Event = require('./models/Event');
const Team = require('./models/Team');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 621;

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: `${generateSalt()}`, // Replace 'secret' with your session secret
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);
require('./db');

const isAuthenticated = (req, res, next) => {
    // Passport adds 'req.user' property if user is authenticated
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

const hasPermission = (requiredRole) => {
    return (req, res, next) => {
      // Check if user has the required role/permission
        if (req.user && req.user.role === requiredRole) {
        // User has the required role/permission, proceed to the next middleware
            return next();
        }
    res.status(403).send('Forbidden'); // Send 403 Forbidden status
    };
};

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})

app.get('/api/internal/test-api', async(req, res) => {
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

app.get('/api/events/by-id/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: `could not find event with ID ${req.params.id}` })
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/events/all-between', async (req,res) => {
    try {
        const allEvents = await Event.find({});
        let events = [];
        for (eventObj in allEvents) {
            const eventDate = new Date(eventObj.date)
            if (eventDate > new Date(req.body.startDate) && eventDate < new Date(req.body.endDate))
                events.push(eventObj);
        };
        if (events.length === 0) return res.status(404).json({ error: `could not find any events between the dates ${req.body.startDate} and ${req.body.endDate}.` });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/events/today', async (req,res) => {
    try {
        const allEvents = await Event.find({});
        let events = [];
        for (eventObj in allEvents) {
            const date = new Date()
            const eventDate = new Date(eventObj.date);
            if (eventDate.getFullYear() === date.getFullYear() && eventDate.getMonth() === date.getMonth() && eventDate.getDate() === date.getDate()) {
                events.push(eventObj);
            }
        }
        if (events.length === 0) return res.status(404).json({ error: `could not find any events on ${date}.` })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.patch('api/events/id/:id', async(req, res) => {
    try {
        const event = await Event.findById(req.body.id);
        if (!event) return res.status(404).json({ error: `could not find any event with id ${req.body.id}.` })
        event[req.body.change] = req.body.value;
        await event.save();
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