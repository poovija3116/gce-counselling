const express = require("express");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const db = require("../config/db");

const router = express.Router();

// =====================================
// SAVE STUDENT PREFERENCES
// =====================================

router.post("/", authenticateToken, async (req, res) => {
    try {
        // Only students can submit preferences
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can submit preferences"
            });
        }

        const studentId = req.user.id;

        const { preferences, round_id } = req.body;

        // Validate preferences
        if (!Array.isArray(preferences) || preferences.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Preferences must be a non-empty array"
            });
        }

        // Check for duplicate departments
        const uniquePreferences = new Set(preferences);

        if (uniquePreferences.size !== preferences.length) {
            return res.status(400).json({
                success: false,
                message: "A department cannot be selected more than once"
            });
        }

        // Check whether preferences are already locked
        const [lockedPreferences] = await db.execute(
            `SELECT id
             FROM preferences
             WHERE student_id = ?
             AND is_locked = 1
             LIMIT 1`,
            [studentId]
        );

        if (lockedPreferences.length > 0) {
            return res.status(403).json({
                success: false,
                message: "Preferences are already locked"
            });
        }

        // Check that all departments exist
        const placeholders = preferences.map(() => "?").join(",");

        const [departments] = await db.execute(
            `SELECT id
             FROM departments
             WHERE id IN (${placeholders})`,
            preferences
        );

        if (departments.length !== preferences.length) {
            return res.status(400).json({
                success: false,
                message: "One or more department IDs are invalid"
            });
        }

        // Delete previous unlocked preferences
        await db.execute(
            `DELETE FROM preferences
             WHERE student_id = ?
             AND is_locked = 0`,
            [studentId]
        );

        // Insert new preferences
        for (let i = 0; i < preferences.length; i++) {
            const departmentId = preferences[i];
            const priority = i + 1;

            await db.execute(
                `INSERT INTO preferences
                (
                    student_id,
                    department_id,
                    priority,
                    round_id,
                    is_locked
                )
                VALUES (?, ?, ?, ?, 0)`,
                [
                    studentId,
                    departmentId,
                    priority,
                    round_id || null
                ]
            );
        }

        res.status(201).json({
            success: true,
            message: "Preferences saved successfully",
            studentId: studentId,
            preferences: preferences.map((departmentId, index) => ({
                department_id: departmentId,
                priority: index + 1
            }))
        });

    } catch (error) {
        console.error("PREFERENCES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save preferences",
            error: error.message
        });
    }
});


// =====================================
// LOCK STUDENT PREFERENCES
// =====================================

router.post("/lock", authenticateToken, async (req, res) => {
    try {
        // Only students can lock preferences
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can lock preferences"
            });
        }

        const studentId = req.user.id;

        // Check whether the student has preferences
        const [preferences] = await db.execute(
            `SELECT id, is_locked
             FROM preferences
             WHERE student_id = ?`,
            [studentId]
        );

        // No preferences found
        if (preferences.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No preferences found"
            });
        }

        // Check if already locked
        const alreadyLocked = preferences.some(
            preference => preference.is_locked === 1
        );

        if (alreadyLocked) {
            return res.status(400).json({
                success: false,
                message: "Preferences are already locked"
            });
        }

        // Lock all preferences
        await db.execute(
            `UPDATE preferences
             SET is_locked = 1,
                 locked_at = NOW()
             WHERE student_id = ?`,
            [studentId]
        );

        res.json({
            success: true,
            message: "Preferences locked successfully",
            studentId: studentId
        });

    } catch (error) {
        console.error("LOCK PREFERENCES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to lock preferences",
            error: error.message
        });
    }
});


// =====================================
// GET STUDENT PREFERENCES
// =====================================

router.get("/", authenticateToken, async (req, res) => {
    try {
        // Only students can view preferences
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can view preferences"
            });
        }

        const studentId = req.user.id;

        const [preferences] = await db.execute(
            `SELECT
                p.id,
                p.department_id,
                d.code,
                d.name,
                p.priority,
                p.round_id,
                p.is_locked,
                p.locked_at
             FROM preferences p
             JOIN departments d
                ON p.department_id = d.id
             WHERE p.student_id = ?
             ORDER BY p.priority ASC`,
            [studentId]
        );

        res.json({
            success: true,
            count: preferences.length,
            preferences
        });

    } catch (error) {
        console.error("GET PREFERENCES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch preferences",
            error: error.message
        });
    }
});


module.exports = router;