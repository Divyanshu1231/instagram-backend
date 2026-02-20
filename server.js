const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = "secretkey123";

// ===== MongoDB connection =====
mongoose.connect("mongodb+srv://divyanshu:Rishu%40123@cluster0.qgixlqn.mongodb.net/instagram?retryWrites=true&w=majority")

.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// ===== User schema =====
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

// ===== Test route =====
app.get("/", (req, res) => {
    res.send("Instagram Clone Backend Running");
});

// ===== Signup =====
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ===== Post schema =====
const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    username: String,
    imageUrl: String,
    caption: String,
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model("Post", postSchema);
// ===== Create Post =====
app.post("/create-post", async (req, res) => {
    const { userId, username, imageUrl, caption } = req.body;

    try {
        const newPost = new Post({
            userId,
            username,
            imageUrl,
            caption
        });

        await newPost.save();

        res.json(newPost);

    } catch (err) {
        res.status(500).json({ message: "Error creating post" });
    }
});// ===== Get All Posts =====
app.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching posts" });
    }
});
// ===== Login =====
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ===== Start server =====
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
