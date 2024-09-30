const express = require("express");
const mongoose = require("mongoose");
const errorHandler = require("./error.middleware");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

if (!process.env.MONGO_URI) {
    console.error("MongoDB connection string not found in .env file");
    process.exit(1);
}

// Mongoose connection
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

// User model
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true,
        enum: ["HR", "Finance", "Marketing", "IT", "Operations"]
    },
    role: {
        type: String,
        required: true,
        enum: ["Employee", "Manager", "Department Head"]
    },
});

const User = mongoose.model("User", UserSchema);

// Create a new user
app.post("/users", async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        next(error);
    }
});

// Get all users
app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});

// Get a user by ID
app.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

// Update a user by ID
app.put("/users/:id", async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});

// Delete a user by ID
app.delete("/users/:id", async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

app.use((req, res) => {
    res
        .status(404)
        .json({
            success: false,
            message: `The route '${req.method} ${req.url}' doesn't exists on the API!`
        });
});




// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
