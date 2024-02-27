const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 621;

app.use(cors());
app.use(bodyParser.json());

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})