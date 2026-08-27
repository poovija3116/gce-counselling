const express = require("express");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const db = require("../config/db");

const router = express.Router();

// =====================================
// SUBMIT COUNSELLING APPLICATION
// =====================================

router.post("/", authenticateToken, async (req, res) => {
    try {
        // Only students can submit applications
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can submit applications"
            });
        }

        const studentId = req.user.id;

        // Check if application already exists
        const [existingApplications] = await db.execute(
            `SELECT id, application_number, status
             FROM applications
             WHERE student_id = ?`,
            [studentId]
        );

        if (existingApplications.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Application already submitted",
                application: existingApplications[0]
            });
        }

        // Generate unique application number
        const applicationNumber =
            "GCE" + Math.floor(10000000 + Math.random() * 90000000);

        // Insert application
        const [result] = await db.execute(
            `INSERT INTO applications
            (student_id, application_number, status, submitted_at)
            VALUES (?, ?, ?, NOW())`,
            [
                studentId,
                applicationNumber,
                "pending"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            applicationId: result.insertId,
            applicationNumber: applicationNumber,
            status: "pending"
        });

    } catch (error) {
        console.error("APPLICATION ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to submit application",
            error: error.message
        });
    }
});

module.exports = router;