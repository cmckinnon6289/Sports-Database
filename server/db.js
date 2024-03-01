const mongoose = require('mongoose');

const connectionString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${DB_CLUSTER}.adsptvs.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=sports-database`;

mongoose.connect(connectionString, {}).then(() => console.log('Connected to MongoDB.')).catch((err) => console.log(err));