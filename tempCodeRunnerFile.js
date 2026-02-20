const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Temporary in-memory users list
let users = [];

// Test route
app.get("/", (req, res) => {
    res.send("Instagram Clone Backend Running");
});

// SIGNUP
app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const newUser = { username, email, password };
    users.push(newUser);

    res.json(newUser);
});

// LOGIN
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const user = users.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json(user);
});

app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port 5000");
});
