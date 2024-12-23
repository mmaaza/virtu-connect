const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const fileUpload = require("express-fileupload");

dotenv.config();

//initialize express
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the uploads directory
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/virtuconnect";
mongoose
    .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// Render EJS templates
app.get('/', (req, res) => res.render('index'));
app.get('/about', (req, res) => res.render('about'));
app.get('/addEvent', (req, res) => res.render('addEvent'));
app.get('/auth', (req, res) => res.render('auth'));
app.get('/events', (req, res) => res.render('events'));
app.get('/manage', (req, res) => res.render('manage'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = {};