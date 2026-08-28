const express = require("express");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const db = require("../config/db");

const router = express.Router();


// ============================================================
// GCE ERODE - STUDENT PREFERENCES
// COUNSELLOR CONTROLS THE CHOICE-FILLING WINDOW
// ============================================================


// ============================================================
// HELPER - GET ACTIVE COUNSELLING ROUND
// ============================================================

async function getActiveRound() {

    const [rounds] = await db.execute(`
        SELECT
            id,
            round_number,
            min_rank,
            max_rank,
            preference_start,
            preference_end,
            allotment_at,
            payment_deadline,
            status
        FROM counselling_rounds
        WHERE status IN (
            'not_started',
            'preference_open',
            'preferences_locked',
            'allotment_completed',
            'payment_period'
        )
        ORDER BY round_number ASC
        LIMIT 1
    `);

    return rounds.length > 0
        ? rounds[0]
        : null;
}


// ============================================================
// CHECK WHETHER CHOICE FILLING IS OPEN
// ============================================================

async function checkChoiceFillingOpen() {

    const round = await getActiveRound();

    if (!round) {

        return {
            allowed: false,
            message: "No counselling round is currently available"
        };

    }

    if (round.status !== "preference_open") {

        if (round.status === "not_started") {

            return {
                allowed: false,
                message: "Choice filling has not started yet",
                round
            };

        }

        if (round.status === "preferences_locked") {

            return {
                allowed: false,
                message: "Choice filling has been closed by the counsellor",
                round
            };

        }

        if (round.status === "allotment_completed") {

            return {
                allowed: false,
                message: "Choice filling is closed. Allotment has been completed",
                round
            };

        }

        if (round.status === "payment_period") {

            return {
                allowed: false,
                message: "Choice filling is closed. Payment period is active",
                round
            };

        }

        return {
            allowed: false,
            message: "Choice filling is currently unavailable",
            round
        };

    }

    return {
        allowed: true,
        round
    };
}


// ============================================================
// SAVE STUDENT PREFERENCES
// POST /api/preferences
// ============================================================

router.post(
    "/",
    authenticateToken,
    async (req, res) => {

        try {

            // ------------------------------------------------
            // ONLY STUDENTS
            // ------------------------------------------------

            if (req.user.role !== "student") {

                return res.status(403).json({
                    success: false,
                    message: "Only students can submit preferences"
                });

            }


            const studentId =
                req.user.id;


            // ------------------------------------------------
            // CHECK COUNSELLING ROUND
            // ------------------------------------------------

            const choiceStatus =
                await checkChoiceFillingOpen();


            if (!choiceStatus.allowed) {

                return res.status(403).json({

                    success: false,

                    message:
                        choiceStatus.message,

                    round:
                        choiceStatus.round || null

                });

            }


            const round =
                choiceStatus.round;


            // ------------------------------------------------
            // GET REQUEST DATA
            // ------------------------------------------------

            const {
                preferences
            } = req.body;


            // ------------------------------------------------
            // VALIDATE PREFERENCES
            // ------------------------------------------------

            if (
                !Array.isArray(preferences) ||
                preferences.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Preferences must be a non-empty array"

                });

            }


            // ------------------------------------------------
            // CONVERT IDs TO NUMBERS
            // ------------------------------------------------

            const departmentIds =
                preferences.map(
                    id => Number(id)
                );


            // ------------------------------------------------
            // CHECK INVALID IDs
            // ------------------------------------------------

            if (
                departmentIds.some(
                    id =>
                        !Number.isInteger(id) ||
                        id <= 0
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid department ID found"

                });

            }


            // ------------------------------------------------
            // CHECK DUPLICATES
            // ------------------------------------------------

            const uniquePreferences =
                new Set(departmentIds);


            if (
                uniquePreferences.size !==
                departmentIds.length
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "A department cannot be selected more than once"

                });

            }


            // ------------------------------------------------
            // CHECK DEPARTMENTS EXIST
            // ------------------------------------------------

            const placeholders =
                departmentIds
                    .map(() => "?")
                    .join(",");


            const [departments] =
                await db.execute(
                    `
                    SELECT id
                    FROM departments
                    WHERE id IN (${placeholders})
                    `,
                    departmentIds
                );


            if (
                departments.length !==
                departmentIds.length
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "One or more department IDs are invalid"

                });

            }


            // ------------------------------------------------
            // CHECK STUDENT'S EXISTING LOCK
            // ------------------------------------------------
            // This is an additional safety check.
            // Normally the round status controls locking.

            const [lockedPreferences] =
                await db.execute(
                    `
                    SELECT id
                    FROM preferences
                    WHERE student_id = ?
                    AND is_locked = 1
                    AND (
                        round_id = ?
                        OR round_id IS NULL
                    )
                    LIMIT 1
                    `,
                    [
                        studentId,
                        round.id
                    ]
                );


            if (
                lockedPreferences.length > 0
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Your preferences are already locked"

                });

            }


            // ------------------------------------------------
            // DELETE OLD PREFERENCES
            // FOR THIS ROUND
            // ------------------------------------------------

            await db.execute(
                `
                DELETE FROM preferences
                WHERE student_id = ?
                AND round_id = ?
                AND is_locked = 0
                `,
                [
                    studentId,
                    round.id
                ]
            );


            // ------------------------------------------------
            // INSERT NEW PREFERENCES
            // ------------------------------------------------

            for (
                let i = 0;
                i < departmentIds.length;
                i++
            ) {

                const departmentId =
                    departmentIds[i];

                const priority =
                    i + 1;


                await db.execute(
                    `
                    INSERT INTO preferences
                    (
                        student_id,
                        department_id,
                        priority,
                        round_id,
                        is_locked
                    )
                    VALUES (?, ?, ?, ?, 0)
                    `,
                    [
                        studentId,
                        departmentId,
                        priority,
                        round.id
                    ]
                );

            }


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            res.status(201).json({

                success: true,

                message:
                    "Preferences saved successfully",

                studentId:
                    studentId,

                round_id:
                    round.id,

                round_number:
                    round.round_number,

                preferences:
                    departmentIds.map(
                        (
                            departmentId,
                            index
                        ) => ({

                            department_id:
                                departmentId,

                            priority:
                                index + 1

                        })
                    )

            });

        }

        catch (error) {

            console.error(
                "SAVE PREFERENCES ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to save preferences",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// STUDENT LOCK ENDPOINT
// ============================================================
// IMPORTANT:
// The student should NOT control the counselling lock.
// Counsellor controls the round.
//
// This endpoint is intentionally disabled.
// ============================================================

router.post(
    "/lock",
    authenticateToken,
    async (req, res) => {

        return res.status(403).json({

            success: false,

            message:
                "Students cannot lock preferences. The counsellor controls the choice-filling window."

        });

    }
);


// ============================================================
// GET STUDENT PREFERENCES
// GET /api/preferences
// ============================================================

router.get(
    "/",
    authenticateToken,
    async (req, res) => {

        try {

            // ------------------------------------------------
            // ONLY STUDENTS
            // ------------------------------------------------

            if (req.user.role !== "student") {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only students can view preferences"

                });

            }


            const studentId =
                req.user.id;


            // ------------------------------------------------
            // GET ACTIVE ROUND
            // ------------------------------------------------

            const round =
                await getActiveRound();


            // ------------------------------------------------
            // NO ROUND
            // ------------------------------------------------

            if (!round) {

                return res.json({

                    success: true,

                    count: 0,

                    preferences: [],

                    round: null

                });

            }


            // ------------------------------------------------
            // GET PREFERENCES FOR ACTIVE ROUND
            // ------------------------------------------------

            const [preferences] =
                await db.execute(
                    `
                    SELECT

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
                    AND p.round_id = ?

                    ORDER BY p.priority ASC
                    `,
                    [
                        studentId,
                        round.id
                    ]
                );


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            res.json({

                success: true,

                count:
                    preferences.length,

                preferences,

                round: {

                    id:
                        round.id,

                    round_number:
                        round.round_number,

                    min_rank:
                        round.min_rank,

                    max_rank:
                        round.max_rank,

                    preference_start:
                        round.preference_start,

                    preference_end:
                        round.preference_end,

                    status:
                        round.status

                }

            });

        }

        catch (error) {

            console.error(
                "GET PREFERENCES ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch preferences",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// GET CURRENT CHOICE-FILLING STATUS
// GET /api/preferences/status
// ============================================================

router.get(
    "/status",
    authenticateToken,
    async (req, res) => {

        try {

            // ------------------------------------------------
            // ONLY STUDENTS
            // ------------------------------------------------

            if (req.user.role !== "student") {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only students can view choice-filling status"

                });

            }


            // ------------------------------------------------
            // GET ROUND
            // ------------------------------------------------

            const round =
                await getActiveRound();


            if (!round) {

                return res.json({

                    success: true,

                    choice_filling_open:
                        false,

                    message:
                        "No counselling round is currently available",

                    round:
                        null

                });

            }


            // ------------------------------------------------
            // RETURN STATUS
            // ------------------------------------------------

            res.json({

                success: true,

                choice_filling_open:
                    round.status === "preference_open",

                status:
                    round.status,

                round: {

                    id:
                        round.id,

                    round_number:
                        round.round_number,

                    min_rank:
                        round.min_rank,

                    max_rank:
                        round.max_rank,

                    preference_start:
                        round.preference_start,

                    preference_end:
                        round.preference_end,

                    allotment_at:
                        round.allotment_at,

                    payment_deadline:
                        round.payment_deadline,

                    status:
                        round.status

                }

            });

        }

        catch (error) {

            console.error(
                "GET CHOICE FILLING STATUS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch choice-filling status",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;