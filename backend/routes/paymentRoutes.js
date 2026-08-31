const express = require("express");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const db = require("../config/db");

const router = express.Router();


// =====================================================
// STUDENT SUBMITS OFFLINE PAYMENT
// POST /api/payments/submit
// =====================================================

router.post(
    "/submit",
    authenticateToken,
    async (req, res) => {

        try {

            // -------------------------------------------------
            // STUDENT ONLY
            // -------------------------------------------------

            if (req.user.role !== "student") {

                return res.status(403).json({
                    success: false,
                    message: "Only students can submit payment"
                });

            }


            const studentId = req.user.id;


            const {
                allotment_id,
                amount
            } = req.body;


            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (!allotment_id || !amount) {

                return res.status(400).json({
                    success: false,
                    message: "allotment_id and amount are required"
                });

            }


            // -------------------------------------------------
            // CHECK ALLOTMENT
            // -------------------------------------------------

            const [allotments] = await db.execute(
                `
                SELECT
                    id,
                    student_id,
                    department_id,
                    status,
                    student_decision
                FROM allotments
                WHERE id = ?
                AND student_id = ?
                LIMIT 1
                `,
                [
                    allotment_id,
                    studentId
                ]
            );


            if (allotments.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Allotment not found"
                });

            }


            const allotment = allotments[0];


            // -------------------------------------------------
            // CHECK ACCEPTED
            // -------------------------------------------------

            if (
                allotment.student_decision !== "accepted"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Student must accept the allotment before payment"
                });

            }


            // -------------------------------------------------
            // CHECK PAYMENT STATUS
            // -------------------------------------------------

            const [existingPayments] = await db.execute(
                `
                SELECT
                    id,
                    payment_status,
                    receipt_number
                FROM payments
                WHERE allotment_id = ?
                ORDER BY id DESC
                LIMIT 1
                `,
                [
                    allotment_id
                ]
            );


            if (
                existingPayments.length > 0 &&
                existingPayments[0].payment_status === "paid"
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Payment has already been completed",
                    payment_id:
                        existingPayments[0].id,
                    receipt_number:
                        existingPayments[0].receipt_number
                });

            }


            // -------------------------------------------------
            // GENERATE PAYMENT RECORD
            // -------------------------------------------------

            const [result] = await db.execute(
                `
                INSERT INTO payments
                (
                    student_id,
                    allotment_id,
                    amount,
                    payment_status,
                    payment_mode
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    'pending',
                    'offline'
                )
                `,
                [
                    studentId,
                    allotment_id,
                    amount
                ]
            );


            // -------------------------------------------------
            // UPDATE ALLOTMENT
            // -------------------------------------------------

            await db.execute(
                `
                UPDATE allotments
                SET status = 'payment_pending'
                WHERE id = ?
                `,
                [
                    allotment_id
                ]
            );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(201).json({

                success: true,

                message:
                    "Offline payment submitted for verification",

                payment_id:
                    result.insertId,

                allotment_id:
                    allotment_id,

                amount:
                    amount,

                payment_status:
                    "pending",

                payment_mode:
                    "offline"

            });

        }


        catch (error) {

            console.error(
                "PAYMENT SUBMIT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to submit payment",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// STUDENT VIEW PAYMENT
// GET /api/payments/my
// =====================================================

router.get(
    "/my",
    authenticateToken,
    async (req, res) => {

        try {

            if (req.user.role !== "student") {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only students can view their payments"
                });

            }


            const studentId =
                req.user.id;


            const [payments] =
                await db.execute(
                    `
                    SELECT
                        p.id,
                        p.allotment_id,
                        p.amount,
                        p.payment_status,
                        p.payment_mode,
                        p.receipt_number,
                        p.payment_date,
                        p.verified_at,

                        a.department_id,
                        a.seat_number,
                        a.status AS allotment_status,

                        d.code AS department_code,
                        d.name AS department_name

                    FROM payments p

                    JOIN allotments a
                        ON p.allotment_id = a.id

                    JOIN departments d
                        ON a.department_id = d.id

                    WHERE p.student_id = ?

                    ORDER BY p.id DESC
                    `,
                    [
                        studentId
                    ]
                );


            return res.json({

                success: true,

                count:
                    payments.length,

                payments

            });

        }


        catch (error) {

            console.error(
                "GET MY PAYMENTS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch payments",

                error:
                    error.message

            });

        }

    }
);


module.exports = router;