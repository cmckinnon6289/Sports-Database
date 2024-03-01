const mongoose = require('mongoose');

const connectionString = `mongodb+srv://neville:fVc5KhmOtLw8HqKt@$sports-database.adsptvs.mongodb.net/event-db?retryWrites=true&w=majority&appName=sports-database`;

mongoose.connect(connectionString, {}).then(() => console.log('Connected to MongoDB.')).catch((err) => console.log(err));