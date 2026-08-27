
const express = require("express");

const {
    authenticateToken,
    requireRole
} = require("../middleware/authMiddleware");

const db = require("../config/db");

const router = express.Router();


// =====================================
// ADMIN DASHBOARD ACCESS
// =====================================

router.get(
    "/dashboard",
    authenticateToken,
    requireRole("admin"),
    (req, res) => {

        res.json({
            success: true,
            message: "Admin dashboard access granted",
            user: req.user
        });

    }
);


// =====================================
// STUDENT ALLOTMENT MONITORING
// WITH SEARCH + FILTERS
// =====================================

router.get(
    "/students",
    authenticateToken,
    requireRole("admin"),
    async (req, res) => {

        try {

            // =====================================
            // QUERY PARAMETERS
            // =====================================

            const {
                rank,
                name,
                email,
                application_number,
                department,
                status
            } = req.query;


            // =====================================
            // BASE QUERY
            // =====================================

            let query = `
                SELECT

                    s.id AS student_id,
                    s.rank_number,
                    s.cutoff_mark,

                    u.id AS user_id,
                    u.name AS student_name,
                    u.email,

                    app.application_number,
                    app.status AS application_status,

                    a.id AS allotment_id,
                    a.seat_number,
                    a.status AS allotment_status,
                    a.student_decision,
                    a.round_id,

                    d.id AS department_id,
                    d.code AS department_code,
                    d.name AS department_name,

                    p.id AS payment_id,
                    p.amount AS payment_amount,
                    p.payment_status,
                    p.receipt_number,

                    r.round_number

                FROM students s

                JOIN users u
                    ON s.user_id = u.id

                LEFT JOIN applications app
                    ON app.student_id = s.id

                LEFT JOIN allotments a
                    ON a.student_id = s.id

                LEFT JOIN departments d
                    ON a.department_id = d.id

                LEFT JOIN payments p
                    ON p.allotment_id = a.id

                LEFT JOIN counselling_rounds r
                    ON a.round_id = r.id

                WHERE 1 = 1
            `;


            const params = [];


            // =====================================
            // FILTER BY RANK
            // =====================================

            if (rank) {

                query += `
                    AND s.rank_number = ?
                `;

                params.push(rank);

            }


            // =====================================
            // SEARCH BY STUDENT NAME
            // =====================================

            if (name) {

                query += `
                    AND u.name LIKE ?
                `;

                params.push(`%${name}%`);

            }


            // =====================================
            // SEARCH BY EMAIL
            // =====================================

            if (email) {

                query += `
                    AND u.email LIKE ?
                `;

                params.push(`%${email}%`);

            }


            // =====================================
            // SEARCH BY APPLICATION NUMBER
            // =====================================

            if (application_number) {

                query += `
                    AND app.application_number LIKE ?
                `;

                params.push(`%${application_number}%`);

            }


            // =====================================
            // FILTER BY DEPARTMENT
            // =====================================

            if (department) {

                query += `
                    AND (
                        d.code = ?
                        OR d.name LIKE ?
                    )
                `;

                params.push(
                    department,
                    `%${department}%`
                );

            }


            // =====================================
            // FILTER BY STATUS
            // =====================================

            if (status) {

                if (status === "not_allotted") {

                    query += `
                        AND a.id IS NULL
                    `;

                } else if (status === "confirmed") {

                    query += `
                        AND a.status = 'confirmed'
                    `;

                } else if (status === "allotted") {

                    query += `
                        AND a.status IN (
                            'allotted',
                            'payment_pending'
                        )
                    `;

                } else {

                    query += `
                        AND a.status = ?
                    `;

                    params.push(status);

                }

            }


            // =====================================
            // ORDER
            // =====================================

            query += `
                ORDER BY
                    s.rank_number ASC,
                    a.id DESC
            `;


            // =====================================
            // EXECUTE QUERY
            // =====================================

            const [students] = await db.execute(
                query,
                params
            );


            // =====================================
            // FORMAT RESPONSE
            // =====================================

            const formattedStudents = students.map(student => {

                let overallStatus = "not_allotted";


                if (
                    student.allotment_status === "confirmed"
                ) {

                    overallStatus = "confirmed";

                }
                else if (
                    student.allotment_status === "allotted" ||
                    student.allotment_status === "payment_pending"
                ) {

                    overallStatus = "allotted";

                }
                else if (
                    student.allotment_status
                ) {

                    overallStatus =
                        student.allotment_status;

                }


                return {

                    student_id:
                        student.student_id,

                    rank:
                        student.rank_number,

                    cutoff_mark:
                        student.cutoff_mark,

                    student_name:
                        student.student_name,

                    email:
                        student.email,

                    application: {

                        number:
                            student.application_number,

                        status:
                            student.application_status

                    },

                    allotment: {

                        id:
                            student.allotment_id,

                        department_id:
                            student.department_id,

                        department_code:
                            student.department_code,

                        department_name:
                            student.department_name,

                        seat_number:
                            student.seat_number,

                        status:
                            student.allotment_status,

                        decision:
                            student.student_decision,

                        round_id:
                            student.round_id,

                        round_number:
                            student.round_number

                    },

                    payment: {

                        id:
                            student.payment_id,

                        amount:
                            student.payment_amount,

                        status:
                            student.payment_status,

                        receipt_number:
                            student.receipt_number

                    },

                    overall_status:
                        overallStatus

                };

            });


            // =====================================
            // RESPONSE
            // =====================================

            res.json({

                success: true,

                count:
                    formattedStudents.length,

                filters: {

                    rank:
                        rank || null,

                    name:
                        name || null,

                    email:
                        email || null,

                    application_number:
                        application_number || null,

                    department:
                        department || null,

                    status:
                        status || null

                },

                students:
                    formattedStudents

            });


        } catch (error) {

            console.error(
                "ADMIN STUDENT FILTER ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch student monitoring data",

                error:
                    error.message

            });

        }

    }
);


module.exports = router;

