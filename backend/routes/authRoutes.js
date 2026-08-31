const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/db");

const router = express.Router();


// ============================================================
// GCE ERODE - AUTHENTICATION ROUTES
// ============================================================


// ============================================================
// LOGIN
// ============================================================

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;


        // ----------------------------------------------------
        // VALIDATE INPUT
        // ----------------------------------------------------

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }


        // ----------------------------------------------------
        // FIND USER
        // ----------------------------------------------------

        const [users] = await pool.execute(
            `
            SELECT
                id,
                name,
                email,
                password,
                role
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [email.trim()]
        );


        if (users.length === 0) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        const user = users[0];


        // ----------------------------------------------------
        // CHECK PASSWORD
        // ----------------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // ----------------------------------------------------
        // NORMALIZE ROLE
        //
        // Example:
        // "Counsellor" -> "counsellor"
        // "COUNSELLOR" -> "counsellor"
        // ----------------------------------------------------

        const normalizedRole =
            String(
                user.role || ""
            )
            .trim()
            .toLowerCase();


        // ----------------------------------------------------
        // CHECK ROLE
        // ----------------------------------------------------

        const allowedRoles = [
            "student",
            "counsellor",
            "admin"
        ];


        if (
            !allowedRoles.includes(
                normalizedRole
            )
        ) {

            console.error(
                "❌ INVALID USER ROLE:",
                user.role
            );


            return res.status(403).json({

                success: false,

                message:
                    "Invalid user role configured in database",

                role:
                    user.role

            });

        }


        // ----------------------------------------------------
        // CHECK JWT SECRET
        // ----------------------------------------------------

        if (!process.env.JWT_SECRET) {

            console.error(
                "❌ JWT_SECRET is missing"
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server authentication configuration error"

            });

        }


        // ----------------------------------------------------
        // CREATE JWT
        // ----------------------------------------------------

        const token =
            jwt.sign(

                {
                    id: user.id,

                    role:
                        normalizedRole,

                    email:
                        user.email

                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "1d"
                }

            );


        // ----------------------------------------------------
        // LOG LOGIN INFORMATION
        // ----------------------------------------------------

        console.log(
            "✅ LOGIN SUCCESS:",
            {
                id: user.id,
                email: user.email,
                role: normalizedRole
            }
        );


        // ----------------------------------------------------
        // SEND RESPONSE
        // ----------------------------------------------------

        return res.json({

            success: true,

            message:
                "Login successful",

            token,

            user: {

                id:
                    user.id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    normalizedRole

            }

        });

    }

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Login failed",

            error:
                error.message

        });

    }

});



// ============================================================
// REGISTER
// ============================================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // ----------------------------------------------------
        // VALIDATE INPUT
        // ----------------------------------------------------

        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email and password are required"

            });

        }


        // ----------------------------------------------------
        // CHECK EMAIL
        // ----------------------------------------------------

        const [existingUsers] =
            await pool.execute(
                `
                SELECT id
                FROM users
                WHERE email = ?
                LIMIT 1
                `,
                [email.trim()]
            );


        if (
            existingUsers.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Email already registered"

            });

        }


        // ----------------------------------------------------
        // HASH PASSWORD
        // ----------------------------------------------------

        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );


        // ----------------------------------------------------
        // CREATE STUDENT
        // ----------------------------------------------------

        const [result] =
            await pool.execute(
                `
                INSERT INTO users
                (
                    name,
                    email,
                    password,
                    role
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    name.trim(),
                    email.trim(),
                    passwordHash,
                    "student"
                ]
            );


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Registration successful",

            userId:
                result.insertId

        });

    }

    catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Registration failed",

            error:
                error.message

        });

    }

});



// ============================================================
// TEST AUTH ROUTE
// ============================================================

router.get("/test", (req, res) => {

    res.json({

        success: true,

        message:
            "Auth route is working"

    });

});



// ============================================================
// EXPORT
// ============================================================

module.exports = router;