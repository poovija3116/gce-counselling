const express = require("express");

const {
    authenticateToken,
    requireRole
} = require("../middleware/authMiddleware");

const db = require("../config/db");

const router = express.Router();


// ==================================================
// STUDENT ROUTES LOADED
// ==================================================

console.log("✅ STUDENT ROUTES FILE LOADED");


// ==================================================
// TEST ROUTE
// ==================================================

router.get("/test", (req, res) => {

    console.log("✅ STUDENT TEST ROUTE HIT");

    res.json({
        success: true,
        message: "Student route is working"
    });

});


// ==================================================
// GET STUDENT PROFILE
// ==================================================

router.get(
    "/profile",
    authenticateToken,
    requireRole("student"),

    async (req, res) => {

        try {

            console.log(
                "📡 STUDENT PROFILE REQUEST"
            );

            console.log(
                "USER FROM TOKEN:",
                req.user
            );


            const userId = req.user.id;


            // ==========================================
            // GET STUDENT DATA
            // ==========================================

            const [rows] = await db.execute(
                `
                SELECT

                    u.id AS user_id,
                    u.name,
                    u.email,
                    u.role,

                    s.id AS student_id,
                    s.phone,
                    s.date_of_birth,
                    s.gender,
                    s.community,
                    s.address,
                    s.cutoff_mark,
                    s.rank_number,

                    a.application_number,
                    a.status AS application_status

                FROM users u

                INNER JOIN students s
                    ON s.user_id = u.id

                LEFT JOIN applications a
                    ON a.student_id = s.id

                WHERE u.id = ?

                LIMIT 1
                `,
                [userId]
            );


            console.log(
                "📊 PROFILE DATABASE RESULT:",
                rows
            );


            // ==========================================
            // STUDENT NOT FOUND
            // ==========================================

            if (rows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student profile not found"

                });

            }


            const student = rows[0];


            // ==========================================
            // SEND STUDENT DATA
            // ==========================================

            res.status(200).json({

                success: true,

                student: {

                    id:
                        student.student_id,

                    user_id:
                        student.user_id,

                    name:
                        student.name,

                    email:
                        student.email,

                    phone:
                        student.phone,

                    date_of_birth:
                        student.date_of_birth,

                    gender:
                        student.gender,

                    community:
                        student.community,

                    address:
                        student.address,

                    cutoff_mark:
                        student.cutoff_mark,

                    rank_number:
                        student.rank_number,

                    application_number:
                        student.application_number,

                    application_status:
                        student.application_status

                }

            });

        }

        catch (error) {

            console.error(
                "❌ GET STUDENT PROFILE ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch student profile",

                error:
                    error.message

            });

        }

    }
);


// ==================================================
// EXPORT
// ==================================================

module.exports = router;