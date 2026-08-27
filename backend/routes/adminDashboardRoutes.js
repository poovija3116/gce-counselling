
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");


// =====================================
// ADMIN DASHBOARD SUMMARY
// =====================================

router.get("/summary", authenticateToken, async (req, res) => {
    try {

        // ---------------------------------
        // ADMIN ONLY
        // ---------------------------------

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only admin can access dashboard"
            });
        }

        // ---------------------------------
        // TOTAL STUDENTS
        // ---------------------------------

        const [studentRows] = await db.execute(
            `SELECT COUNT(*) AS total_students
             FROM students`
        );

        // ---------------------------------
        // TOTAL APPLICATIONS
        // ---------------------------------

        const [applicationRows] = await db.execute(
            `SELECT COUNT(*) AS total_applications
             FROM applications`
        );

        // ---------------------------------
        // TOTAL ALLOTMENTS
        // ---------------------------------

        const [allottedRows] = await db.execute(
            `SELECT COUNT(*) AS total_allotted
             FROM allotments
             WHERE status IN (
                 'allotted',
                 'payment_pending',
                 'confirmed',
                 'upward_requested',
                 'upgraded'
             )`
        );

        // ---------------------------------
        // TOTAL CONFIRMED
        // ---------------------------------

        const [confirmedRows] = await db.execute(
            `SELECT COUNT(*) AS total_confirmed
             FROM allotments
             WHERE status = 'confirmed'`
        );

        // ---------------------------------
        // PENDING PAYMENTS
        // ---------------------------------

        const [pendingPaymentRows] = await db.execute(
            `SELECT COUNT(*) AS pending_payments
             FROM payments
             WHERE payment_status = 'pending'`
        );

        // ---------------------------------
        // PAID PAYMENTS
        // ---------------------------------

        const [paidPaymentRows] = await db.execute(
            `SELECT COUNT(*) AS paid_payments
             FROM payments
             WHERE payment_status = 'paid'`
        );

        // ---------------------------------
        // TOTAL AVAILABLE SEATS
        // ---------------------------------

        const [seatRows] = await db.execute(
            `SELECT COALESCE(SUM(available_seats), 0) AS total_available_seats
             FROM departments`
        );

        // ---------------------------------
        // DEPARTMENT-WISE SEATS
        // ---------------------------------

        const [departments] = await db.execute(
            `SELECT
                id,
                code,
                name,
                total_seats,
                available_seats
             FROM departments
             ORDER BY id`
        );

        // ---------------------------------
        // CURRENT ROUND
        // ---------------------------------

        const [roundRows] = await db.execute(
            `SELECT
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
             ORDER BY round_number ASC`
        );

        // ---------------------------------
        // FINAL RESPONSE
        // ---------------------------------

        res.json({
            success: true,

            summary: {
                total_students: studentRows[0].total_students,
                total_applications: applicationRows[0].total_applications,
                total_allotted: allottedRows[0].total_allotted,
                total_confirmed: confirmedRows[0].total_confirmed,
                pending_payments: pendingPaymentRows[0].pending_payments,
                paid_payments: paidPaymentRows[0].paid_payments,
                total_available_seats: seatRows[0].total_available_seats
            },

            departments,

            rounds: roundRows
        });

    } catch (error) {

        console.error("ADMIN DASHBOARD ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load admin dashboard",
            error: error.message
        });
    }
});


module.exports = router;

