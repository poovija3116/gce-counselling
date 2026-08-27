const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/db");

const router = express.Router();

// ===============================
// LOGIN
// ===============================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const [users] = await pool.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
});

// ===============================
// REGISTER
// ===============================

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Check whether email already exists
        const [existingUsers] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create student account
        const [result] = await pool.execute(
            `INSERT INTO users
            (name, email, password, role)
            VALUES (?, ?, ?, ?)`,
            [name, email, passwordHash, "student"]
        );

        res.status(201).json({
            success: true,
            message: "Registration successful",
            userId: result.insertId
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message
        });
    }
});

// ===============================
// EXPORT ROUTER
// ===============================

module.exports = router;