
const express = require("express");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const db = require("../config/db");

const router = express.Router();


// =====================================
// RUN AUTOMATIC SEAT ALLOTMENT
// =====================================

router.post("/run", authenticateToken, async (req, res) => {
    let connection;

    try {
        // ---------------------------------
        // ONLY ADMIN CAN RUN ALLOTMENT
        // ---------------------------------

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only admin can run seat allotment"
            });
        }

        const { round_id } = req.body;

        if (!round_id) {
            return res.status(400).json({
                success: false,
                message: "round_id is required"
            });
        }

        // ---------------------------------
        // CHECK ROUND
        // ---------------------------------

        const [rounds] = await db.execute(
            `SELECT *
             FROM counselling_rounds
             WHERE id = ?`,
            [round_id]
        );

        if (rounds.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Counselling round not found"
            });
        }

        const round = rounds[0];

        // ---------------------------------
        // GET STUDENTS WITH RANKS
        // ---------------------------------

        const [students] = await db.execute(
            `SELECT
                s.id AS student_id,
                s.rank_number
             FROM students s
             WHERE s.rank_number IS NOT NULL
             AND EXISTS (
                 SELECT 1
                 FROM applications a
                 WHERE a.student_id = s.id
             )
             ORDER BY s.rank_number ASC`
        );

        let allottedCount = 0;
        let skippedCount = 0;
        let notAllottedCount = 0;

        const allotmentResults = [];

        // ---------------------------------
        // PROCESS STUDENTS BY RANK
        // ---------------------------------

        for (const student of students) {

            connection = await db.getConnection();

            try {
                await connection.beginTransaction();

                const studentId = student.student_id;

                // ---------------------------------
                // CHECK EXISTING ACTIVE ALLOTMENT
                // ---------------------------------

                const [existingAllotment] = await connection.execute(
                    `SELECT id, department_id, seat_number, status
                     FROM allotments
                     WHERE student_id = ?
                     AND round_id = ?
                     AND status IN (
                         'allotted',
                         'payment_pending',
                         'confirmed',
                         'upward_requested',
                         'upgraded'
                     )
                     LIMIT 1`,
                    [studentId, round_id]
                );

                if (existingAllotment.length > 0) {
                    skippedCount++;

                    await connection.rollback();

                    allotmentResults.push({
                        student_id: studentId,
                        rank: student.rank_number,
                        status: "already_allotted",
                        department_id: existingAllotment[0].department_id,
                        seat_number: existingAllotment[0].seat_number
                    });

                    continue;
                }

                // ---------------------------------
                // GET LOCKED PREFERENCES
                // ---------------------------------

                const [preferences] = await connection.execute(
                    `SELECT
                        p.department_id,
                        p.priority,
                        d.code,
                        d.name,
                        d.available_seats
                     FROM preferences p
                     JOIN departments d
                        ON p.department_id = d.id
                     WHERE p.student_id = ?
                     AND p.round_id = ?
                     AND p.is_locked = 1
                     ORDER BY p.priority ASC`,
                    [studentId, round_id]
                );

                if (preferences.length === 0) {
                    notAllottedCount++;

                    await connection.rollback();

                    allotmentResults.push({
                        student_id: studentId,
                        rank: student.rank_number,
                        status: "no_locked_preferences"
                    });

                    continue;
                }

                let allotted = false;

                // ---------------------------------
                // CHECK EACH PREFERENCE
                // ---------------------------------

                for (const preference of preferences) {

                    // No seat available
                    if (preference.available_seats <= 0) {
                        continue;
                    }

                    // ---------------------------------
                    // LOCK DEPARTMENT ROW
                    // ---------------------------------

                    const [departmentRows] = await connection.execute(
                        `SELECT
                            id,
                            code,
                            name,
                            available_seats
                         FROM departments
                         WHERE id = ?
                         FOR UPDATE`,
                        [preference.department_id]
                    );

                    if (
                        departmentRows.length === 0 ||
                        departmentRows[0].available_seats <= 0
                    ) {
                        continue;
                    }

                    const department = departmentRows[0];

                    // ---------------------------------
                    // FIND NEXT SEAT NUMBER
                    // ---------------------------------

                    const [seatRows] = await connection.execute(
                        `SELECT seat_number
                         FROM allotments
                         WHERE department_id = ?
                         ORDER BY id DESC
                         LIMIT 1`,
                        [department.id]
                    );

                    let nextSeatNumber = 1;

                    if (seatRows.length > 0 && seatRows[0].seat_number) {
                        const lastSeat = seatRows[0].seat_number;

                        const match = lastSeat.match(/(\d+)$/);

                        if (match) {
                            nextSeatNumber = parseInt(match[1], 10) + 1;
                        }
                    }

                    const seatNumber =
                        `${department.code.replace(/\s+/g, "")}-${String(nextSeatNumber).padStart(3, "0")}`;

                    // ---------------------------------
                    // CREATE ALLOTMENT
                    // ---------------------------------

                    await connection.execute(
                        `INSERT INTO allotments
                        (
                            student_id,
                            department_id,
                            seat_number,
                            status,
                            round_id,
                            student_decision
                        )
                        VALUES (?, ?, ?, 'allotted', ?, 'pending')`,
                        [
                            studentId,
                            department.id,
                            seatNumber,
                            round_id
                        ]
                    );

                    // ---------------------------------
                    // REDUCE AVAILABLE SEATS
                    // ---------------------------------

                    await connection.execute(
                        `UPDATE departments
                         SET available_seats = available_seats - 1
                         WHERE id = ?
                         AND available_seats > 0`,
                        [department.id]
                    );

                    allotted = true;
                    allottedCount++;

                    allotmentResults.push({
                        student_id: studentId,
                        rank: student.rank_number,
                        status: "allotted",
                        department_id: department.id,
                        department: department.code,
                        priority: preference.priority,
                        seat_number: seatNumber
                    });

                    break;
                }

                // ---------------------------------
                // NO SEAT AVAILABLE
                // ---------------------------------

                if (!allotted) {
                    notAllottedCount++;

                    allotmentResults.push({
                        student_id: studentId,
                        rank: student.rank_number,
                        status: "not_allotted"
                    });
                }

                await connection.commit();

            } catch (studentError) {

                if (connection) {
                    await connection.rollback();
                }

                console.error(
                    `ALLOTMENT ERROR FOR STUDENT ${student.student_id}:`,
                    studentError
                );

                notAllottedCount++;

                allotmentResults.push({
                    student_id: student.student_id,
                    rank: student.rank_number,
                    status: "error",
                    error: studentError.message
                });

            } finally {

                if (connection) {
                    connection.release();
                    connection = null;
                }
            }
        }

        // ---------------------------------
        // FINAL RESPONSE
        // ---------------------------------

        res.json({
            success: true,
            message: "Automatic seat allotment completed",
            round_id: round_id,
            round_number: round.round_number,
            total_students: students.length,
            allotted: allottedCount,
            skipped: skippedCount,
            not_allotted: notAllottedCount,
            results: allotmentResults
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
            connection.release();
        }

        console.error("AUTOMATIC ALLOTMENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Automatic seat allotment failed",
            error: error.message
        });
    }
});


// =====================================
// GET ALL ALLOTMENTS
// =====================================

router.get("/", authenticateToken, async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only admin can view all allotments"
            });
        }

        const [allotments] = await db.execute(
            `SELECT
                a.id,
                a.student_id,
                s.rank_number,
                u.name AS student_name,
                u.email,
                a.department_id,
                d.code AS department_code,
                d.name AS department_name,
                a.seat_number,
                a.status,
                a.round_id,
                a.student_decision,
                a.allotted_at,
                a.decision_at
             FROM allotments a
             JOIN students s
                ON a.student_id = s.id
             JOIN users u
                ON s.user_id = u.id
             JOIN departments d
                ON a.department_id = d.id
             ORDER BY s.rank_number ASC`
        );

        res.json({
            success: true,
            count: allotments.length,
            allotments
        });

    } catch (error) {

        console.error("GET ALLOTMENTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch allotments",
            error: error.message
        });
    }
});
// =====================================
// GET MY ALLOTMENT - STUDENT
// =====================================

router.get("/my", authenticateToken, async (req, res) => {
    try {
        // Only students can view their own allotment
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can view their allotment"
            });
        }

        const studentId = req.user.id;

        const [allotments] = await db.execute(
            `SELECT
                a.id,
                a.student_id,
                s.rank_number,
                d.id AS department_id,
                d.code AS department_code,
                d.name AS department_name,
                a.seat_number,
                a.status,
                a.round_id,
                a.student_decision,
                a.allotted_at,
                a.decision_at
             FROM allotments a
             JOIN students s
                ON a.student_id = s.id
             JOIN departments d
                ON a.department_id = d.id
             WHERE a.student_id = ?
             ORDER BY a.id DESC`,
            [studentId]
        );

        if (allotments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No allotment found"
            });
        }

        res.json({
            success: true,
            allotment: allotments[0]
        });

    } catch (error) {
        console.error("GET MY ALLOTMENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch allotment",
            error: error.message
        });
    }
});
// =====================================
// STUDENT DECISION ON ALLOTMENT
// =====================================

router.post("/decision", authenticateToken, async (req, res) => {
    try {
        // Only students can make a decision
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can make allotment decisions"
            });
        }

        const studentId = req.user.id;
        const { decision } = req.body;

        // ---------------------------------
        // VALIDATE DECISION
        // ---------------------------------

        const validDecisions = [
            "accepted",
            "rejected",
            "upward"
        ];

        if (!decision || !validDecisions.includes(decision)) {
            return res.status(400).json({
                success: false,
                message: "Decision must be accepted, rejected, or upward"
            });
        }

        // ---------------------------------
        // FIND CURRENT ALLOTMENT
        // ---------------------------------

        const [allotments] = await db.execute(
            `SELECT
                id,
                department_id,
                seat_number,
                status,
                student_decision,
                round_id
             FROM allotments
             WHERE student_id = ?
             AND status IN (
                 'allotted',
                 'payment_pending',
                 'confirmed',
                 'upward_requested',
                 'upgraded'
             )
             ORDER BY id DESC
             LIMIT 1`,
            [studentId]
        );

        if (allotments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active allotment found"
            });
        }

        const allotment = allotments[0];

        // ---------------------------------
        // PREVENT REPEATED DECISION
        // ---------------------------------

        if (allotment.student_decision !== "pending") {
            return res.status(400).json({
                success: false,
                message: "A decision has already been submitted",
                current_decision: allotment.student_decision
            });
        }

        // ---------------------------------
        // ACCEPT
        // ---------------------------------

        if (decision === "accepted") {

            await db.execute(
                `UPDATE allotments
                 SET
                    student_decision = 'accepted',
                    status = 'payment_pending',
                    decision_at = NOW()
                 WHERE id = ?`,
                [allotment.id]
            );

            return res.json({
                success: true,
                message: "Allotment accepted successfully",
                allotment_id: allotment.id,
                decision: "accepted",
                status: "payment_pending"
            });
        }

        // ---------------------------------
        // REJECT
        // ---------------------------------

        if (decision === "rejected") {

            await db.execute(
                `UPDATE allotments
                 SET
                    student_decision = 'rejected',
                    status = 'released',
                    decision_at = NOW()
                 WHERE id = ?`,
                [allotment.id]
            );

            // Return the released seat
            await db.execute(
                `UPDATE departments
                 SET available_seats = available_seats + 1
                 WHERE id = ?`,
                [allotment.department_id]
            );

            return res.json({
                success: true,
                message: "Allotment rejected and seat released",
                allotment_id: allotment.id,
                decision: "rejected",
                status: "released"
            });
        }

        // ---------------------------------
        // UPWARD REQUEST
        // ---------------------------------

        if (decision === "upward") {

            await db.execute(
                `UPDATE allotments
                 SET
                    student_decision = 'upward',
                    status = 'upward_requested',
                    decision_at = NOW()
                 WHERE id = ?`,
                [allotment.id]
            );

            return res.json({
                success: true,
                message: "Upward request submitted successfully",
                allotment_id: allotment.id,
                decision: "upward",
                status: "upward_requested"
            });
        }

    } catch (error) {

        console.error("ALLOTMENT DECISION ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to submit allotment decision",
            error: error.message
        });
    }
});



module.exports = router;

