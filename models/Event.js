const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: String,
    date: String,
    time: String,
    description: String,
    eventLink: String,
    location: String,
    userEmail: String,
    imagePath: String,
});

module.exports = mongoose.model('Event', eventSchema);