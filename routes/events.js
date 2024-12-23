const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const secret = process.env.JWT_SECRET;

// /api/events/add
router.post("/add", async (req, res) => {
    console.log("Received POST request to /api/events/add");
    console.log("Request body:", req.body);

    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, secret); // Use the same secret as in auth.js
    const userEmail = decodedToken.email;

    let imagePath = null;
    if (req.files && req.files.eventImage) {
        const eventImage = req.files.eventImage;
        const timestamp = Date.now();
        const ext = path.extname(eventImage.name);
        const newFilename = `${timestamp}${ext}`;
        const uploadPath = path.join(__dirname, '../uploads/', newFilename);
        eventImage.mv(uploadPath, (err) => {
            if (err) {
                console.error("Error uploading file:", err);
                return res.status(500).send("Error uploading file.");
            }
        });
        imagePath = `/uploads/${newFilename}`;
    }

    const newEvent = new Event({
        title: req.body.title,
        date: req.body.date,
        time: req.body.time,
        description: req.body.description,
        eventLink: req.body.eventLink,
        location: req.body.location,
        userEmail: userEmail,
        imagePath: imagePath
    });

    try {
        await newEvent.save();
        res.status(200).send("Event added successfully.");
    } catch (err) {
        console.error("Error saving event:", err);
        res.status(500).send("Error saving event.");
    }
});

// /api/events/:id
router.put("/:id", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, secret); // Use the same secret as in auth.js
    const userEmail = decodedToken.email;

    console.log("Updating event with ID:", req.params.id);
    console.log("User email from token:", userEmail);

    try {
        const eventId = new mongoose.Types.ObjectId(req.params.id);
        const event = await Event.findOne({
            _id: eventId,
            userEmail: userEmail,
        });
        if (!event) {
            console.log("Event not found");
            return res.status(404).send("Event not found.");
        }

        event.title = req.body.title;
        event.date = req.body.date;
        event.time = req.body.time;
        event.description = req.body.description;
        event.eventLink = req.body.eventLink;
        event.location = req.body.location;
        if (req.files && req.files.eventImage) {
            const eventImage = req.files.eventImage;
            const timestamp = Date.now();
            const ext = path.extname(eventImage.name);
            const newFilename = `${timestamp}${ext}`;
            const uploadPath = path.join(__dirname, '../uploads/', newFilename);
            eventImage.mv(uploadPath, (err) => {
                if (err) {
                    console.error("Error uploading file:", err);
                    return res.status(500).send("Error uploading file.");
                }
            });
            event.imagePath = `/uploads/${newFilename}`;
        }

        await event.save();
        res.status(200).send("Event updated successfully.");
    } catch (err) {
        console.error("Error updating event:", err);
        res.status(500).send("Error updating event.");
    }
});

// /api/events/user-events
router.get("/user-events", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, secret); 
    const userEmail = decodedToken.email;
    // mmaaz990ahmad@gmail.com

    try {
        const events = await Event.find({ userEmail: userEmail });
        res.status(200).json(events);
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).send("Error fetching events.");
    }
});

router.get("/all-events", async (req, res) => {
    try {
        const events = await Event.find({});
        res.status(200).json(events);
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).send("Error fetching events.");
    }
});

router.delete("/:id", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, secret);
    const userEmail = decodedToken.email;

    console.log("Deleting event with ID:", req.params.id);
    console.log("User email from token:", userEmail);

    try {
        const eventId = new mongoose.Types.ObjectId(req.params.id);
        const event = await Event.findOneAndDelete({
            _id: eventId,
            userEmail: userEmail,
        });
        if (!event) {
            console.log("Event not found");
            return res.status(404).send("Event not found.");
        }

        res.status(200).send("Event deleted successfully.");
    } catch (err) {
        console.error("Error deleting event:", err);
        res.status(500).send("Error deleting event.");
    }
});

module.exports = router;