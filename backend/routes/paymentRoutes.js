
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");


// =====================================
// CREATE PAYMENT RECORD
// STUDENT
// =====================================

router.post("/create", authenticateToken, async (req, res) => {
    try {
        // Only students can create their own payment
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can create a payment"
            });
        }

        const studentId = req.user.id;

        const { allotment_id, amount } = req.body;

        if (!allotment_id || amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "allotment_id and amount are required"
            });
        }

        // ---------------------------------
        // CHECK ALLOTMENT
        // ---------------------------------

        const [allotments] = await db.execute(
            `SELECT
                id,
                student_id,
                department_id,
                seat_number,
                status,
                student_decision
             FROM allotments
             WHERE id = ?
             AND student_id = ?
             LIMIT 1`,
            [allotment_id, studentId]
        );

        if (allotments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Allotment not found"
            });
        }

        const allotment = allotments[0];

        // ---------------------------------
        // CHECK ACCEPTED STATUS
        // ---------------------------------

        if (
            allotment.student_decision !== "accepted" ||
            allotment.status !== "payment_pending"
        ) {
            return res.status(400).json({
                success: false,
                message: "This allotment is not ready for payment"
            });
        }

        // ---------------------------------
        // CHECK EXISTING PAYMENT
        // ---------------------------------

        const [existingPayments] = await db.execute(
            `SELECT
                id,
                payment_status,
                receipt_number
             FROM payments
             WHERE allotment_id = ?
             LIMIT 1`,
            [allotment_id]
        );

        if (existingPayments.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Payment record already exists",
                payment: existingPayments[0]
            });
        }

        // ---------------------------------
        // CREATE OFFLINE PAYMENT RECORD
        // ---------------------------------

        const [result] = await db.execute(
            `INSERT INTO payments
            (
                student_id,
                allotment_id,
                amount,
                payment_status,
                payment_mode
            )
            VALUES (?, ?, ?, 'pending', 'offline')`,
            [
                studentId,
                allotment_id,
                amount
            ]
        );

        res.json({
            success: true,
            message: "Payment record created successfully",
            payment_id: result.insertId,
            allotment_id,
            amount,
            payment_status: "pending",
            payment_mode: "offline"
        });

    } catch (error) {

        console.error("CREATE PAYMENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create payment record",
            error: error.message
        });
    }
});


// =====================================
// GET MY PAYMENT
// STUDENT
// =====================================

router.get("/my", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can view their payment"
            });
        }

        const studentId = req.user.id;

        const [payments] = await db.execute(
            `SELECT
                p.id,
                p.student_id,
                p.allotment_id,
                p.amount,
                p.payment_status,
                p.payment_mode,
                p.receipt_number,
                p.payment_date,
                p.verified_at,
                a.seat_number,
                d.code AS department_code,
                d.name AS department_name
             FROM payments p
             JOIN allotments a
                ON p.allotment_id = a.id
             JOIN departments d
                ON a.department_id = d.id
             WHERE p.student_id = ?
             ORDER BY p.id DESC`,
            [studentId]
        );

        res.json({
            success: true,
            count: payments.length,
            payments
        });

    } catch (error) {

        console.error("GET MY PAYMENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch payment",
            error: error.message
        });
    }
});


// =====================================
// ADMIN VERIFY OFFLINE PAYMENT
// =====================================

router.post("/verify", authenticateToken, async (req, res) => {
    let connection;

    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only admin can verify payments"
            });
        }

        const {
            payment_id,
            receipt_number
        } = req.body;

        if (!payment_id || !receipt_number) {
            return res.status(400).json({
                success: false,
                message: "payment_id and receipt_number are required"
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        // ---------------------------------
        // GET PAYMENT
        // ---------------------------------

        const [payments] = await connection.execute(
            `SELECT
                id,
                student_id,
                allotment_id,
                payment_status
             FROM payments
             WHERE id = ?
             FOR UPDATE`,
            [payment_id]
        );

        if (payments.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        const payment = payments[0];

        if (payment.payment_status === "paid") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Payment is already verified"
            });
        }

        // ---------------------------------
        // UPDATE PAYMENT
        // ---------------------------------

        await connection.execute(
            `UPDATE payments
             SET
                payment_status = 'paid',
                receipt_number = ?,
                payment_date = NOW(),
                verified_by = ?,
                verified_at = NOW()
             WHERE id = ?`,
            [
                receipt_number,
                req.user.id,
                payment_id
            ]
        );

        // ---------------------------------
        // CONFIRM ALLOTMENT
        // ---------------------------------

        await connection.execute(
            `UPDATE allotments
             SET status = 'confirmed'
             WHERE id = ?
             AND student_id = ?`,
            [
                payment.allotment_id,
                payment.student_id
            ]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Payment verified and allotment confirmed",
            payment_id,
            allotment_id: payment.allotment_id,
            payment_status: "paid",
            allotment_status: "confirmed"
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
            connection.release();
        }

        console.error("VERIFY PAYMENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to verify payment",
            error: error.message
        });
    }

    if (connection) {
        connection.release();
    }
});

// =====================================
// GET STUDENT PAYMENT + ADMISSION STATUS
// =====================================

router.get("/status", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can access this endpoint"
            });
        }

        const studentId = req.user.id;

        const [rows] = await db.execute(
            `SELECT
                a.id AS allotment_id,
                a.student_id,
                a.seat_number,
                a.status AS allotment_status,
                a.student_decision,

                d.id AS department_id,
                d.code AS department_code,
                d.name AS department_name,

                a.round_id,

                p.id AS payment_id,
                p.amount,
                p.payment_status,
                p.payment_mode,
                p.receipt_number,
                p.payment_date,
                p.verified_at,

                r.round_number,
                r.payment_deadline

             FROM allotments a

             JOIN departments d
                ON a.department_id = d.id

             LEFT JOIN payments p
                ON a.id = p.allotment_id

             LEFT JOIN counselling_rounds r
                ON a.round_id = r.id

             WHERE a.student_id = ?

             ORDER BY a.id DESC
             LIMIT 1`,
            [studentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No allotment found for this student"
            });
        }

        const data = rows[0];

        res.json({
            success: true,

            admission: {
                allotment_id: data.allotment_id,
                student_id: data.student_id,

                department: {
                    id: data.department_id,
                    code: data.department_code,
                    name: data.department_name
                },

                seat_number: data.seat_number,

                allotment_status: data.allotment_status,
                student_decision: data.student_decision,

                round_id: data.round_id,
                round_number: data.round_number,

                payment: {
                    payment_id: data.payment_id,
                    amount: data.amount,
                    status: data.payment_status,
                    mode: data.payment_mode,
                    receipt_number: data.receipt_number,
                    payment_date: data.payment_date,
                    verified_at: data.verified_at
                },

                payment_deadline: data.payment_deadline
            }
        });

    } catch (error) {

        console.error("GET STUDENT PAYMENT STATUS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch admission status",
            error: error.message
        });
    }
});



module.exports = router;

