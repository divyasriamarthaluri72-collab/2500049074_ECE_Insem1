require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./auth");

const app = express();

app.use(cors());
app.use(express.json());

// Authentication Routes
app.use("/api", authRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("MongoDB Connected Successfully");
})
.catch((err) => {
    console.log("Database Error:", err.message);
});

// Server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});