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
const School = require('./models/School');
const Team = require('./models/Team');
const User = require('./models/User');
const League = require('./models/League');

const app = express();
const PORT = process.env.PORT || 621;

app.use(cors());
app.set('view engine', 'ejs'); // Assuming you're using EJS for templating
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: `${generateSalt()}`, // Replace 'secret' with your session secret
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);

require('./passport');
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
        if (req.user && req.user.role === requiredRole) {
            return next();
        }
        res.status(403).send('Forbidden');
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

app.get('/api/events/today-and-beyond', async(req, res) => {
    try {
        const allEvents = await Event.find({});
        let events = [];
        allEvents.forEach((eventObj) => {
            const eventDate = new Date(eventObj.date)
            if (eventDate > new Date()) events.push(eventObj);
        })
        if (events.length === 0) return res.status(404).json({ error: `could not find any events that start on or after ${new Date()}.` });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/events/filters', async(req, res) => {
    try {
        let allEvents = await Event.find({});
        const filters = req.params;
        if (filters.league) {
            for (i=0; i < allEvents.length; i++) {
                if (allEvents[i].league != filters.league) allEvents.splice(i,1);
            }
        }
        if (filters.maxDate) {
            for (i=0; i < allEvents.length; i++) {
                if (allEvents[i].date > filters.maxDate) allEvents.splice(i,1);
            }
        }
        if (filters.minDate) {
            for (i=0; i < allEvents.length; i++) {
                if (allEvents[i].date < filters.minDate || allEvents[i].date < new Date()) allEvents.splice(i,1);
            }
        }
        if (allEvents.length < 0) {
            res.status(404).json({error: `no results with given filters`})
        } else res.json(allEvents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/events/today', async (req,res) => {
    try {
        const allEvents = await Event.find({});
        const todaysDate = new Date();
        let events = [];
        allEvents.forEach((eventObj) => {
            console.log(eventObj.date)
            if (eventObj.date.getFullYear() === todaysDate.getFullYear() && eventObj.date.getMonth() === todaysDate.getMonth() && eventObj.date.getDate() === todaysDate.getDate()) {
                console.log("pushed");
                events.push(eventObj);
            }
        })
        if (events.length === 0) return res.status(404).json({ error: `could not find any events on ${todaysDate}.` })
        return res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.patch('/api/events/id/:id', async(req, res) => {
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
        const events = Event.find({});
        let submission = req.body;
        let eventDraft = {
            id: 999,
            name: 'placeholder until computed',
            homeTeam: '',
            awayTeam: '',
            date: '',
            location: ''
        }
        if (isNaN(events.length)) eventDraft.id = 1;
        else eventDraft.id = events.length + 1;
        eventDraft.homeTeam = await findTeam(submission.homeTeam);
        eventDraft.awayTeam = await findTeam(submission.awayTeam);
        eventDraft.date = new Date(submission.date);
        if (!eventDraft.homeTeam || !eventDraft.awayTeam) return res.status(404).json({ error: `could not find a team object with either name ${req.body.homeTeam} or ${req.body.awayTeam}` }); 

        if(req.body.type === "home") eventDraft.location = eventDraft.homeTeam.location;
        else eventDraft.location = eventDraft.awayTeam.location;

        const event = new Event(eventDraft);
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/get-perms/:id', async(req, res) => { 
    try {
        console.log(req.params.id);
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({error: `could not find user with id ${req.body.id}.`});
        res.status(200).json(user.permissions);
        // :0
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/leagues', async(req, res) => {
    try {
        const leagues = await League.find({});
        res.status(200).json(leagues);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/api/leagues/new-league', async(req, res) => {
    try {
        console.log(req.body);
        const leagues = await League.find({});
        const league = new League(req.body);
        leagues.forEach((existingLeague) => {
            if (league.name === existingLeague.name) { return res.status(400).json({ error: `league with name ${league.name} already exists.` }) }
        })
        await league.save()
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/api/teams/new-team', async(req, res) => {
    try {
        const team = new Team(req.body);
        await team.save();
        res.status(201).json(team);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/api/schools/new-school', async(req,res) => {
    try {
        console.log(req.body);
        const school = new School(req.body);
        await school.save();
        res.status(201).json(school);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/schools/by-id/:id', async(req,res) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) return res.status(404).json({ error: `could not find school with ID ${req.params.id}` })
        res.json(school);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/schools', async(req,res) => {
    try {
        const schools = await School.find({});
        res.json(schools);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

/*

local functions

*/

async function findTeam(name) {
    const teams = await School.find({});
    const team = teams.filter((team) => team.name === String(name) ? team : null);
    if (Array.isArray(team)) return team[0];
    return team;
}