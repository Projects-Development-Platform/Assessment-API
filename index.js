const express = require("express");
const mongoose = require("mongoose");
const errorHandler = require("./error.middleware");
const dotenv = require("dotenv");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

dotenv.config();

const app = express();
const port = 3000;

const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

app.post("/users", async (req, res, next) => {
    try {
        const user = await new User(req.body).save();
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
});


app.get("/users", async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: users,
        });
    } catch (error) {
        next(error);
    }
});


app.get("/users/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
});

app.put("/users/:id", async (req, res, next) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
});

app.delete("/users/:id", async (req, res, next) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: deletedUser,
        });
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

app.use((req, res, next) => {
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
