const express = require("express");

const {
    authenticateToken,
    requireRole
} = require("../middleware/authMiddleware");

const db = require("../config/db");
const bcrypt = require("bcrypt");

const {
    sendStudentCredentials
} = require("../services/emailService");

const router = express.Router();


// =====================================================
// ADMIN ROUTES LOADED
// =====================================================

console.log("✅ ADMIN ROUTES FILE LOADED");


// =====================================================
// ADMIN DASHBOARD ACCESS
// GET /api/admin/dashboard
// =====================================================

router.get(
    "/dashboard",
    authenticateToken,
    requireRole("admin"),
    (req, res) => {

        res.json({

            success: true,

            message:
                "Admin dashboard access granted",

            user:
                req.user

        });

    }
);


// =====================================================
// CREATE NEW STUDENT ACCOUNT
// POST /api/admin/create-student
// ADMIN ONLY
// =====================================================

router.post(
    "/create-student",
    authenticateToken,
    requireRole("admin"),

    async (req, res) => {

        let connection = null;

        try {

            console.log("====================================");
            console.log("📝 CREATE STUDENT REQUEST");
            console.log("====================================");

            // -------------------------------------------------
            // GET DATA FROM ADMIN PORTAL
            // -------------------------------------------------

            const {
                name,
                email,
                phone,
                date_of_birth,
                gender,
                community,
                address,
                cutoff_mark,
                rank_number,
                application_number
            } = req.body;


            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (
                !name ||
                !email ||
                !date_of_birth ||
                !application_number
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "name, email, date_of_birth and application_number are required"

                });

            }


            // -------------------------------------------------
            // CLEAN DATA
            // -------------------------------------------------

            const studentName =
                String(name).trim();

            const studentEmail =
                String(email).trim().toLowerCase();

            const applicationNumber =
                String(application_number).trim();

            const dob =
                String(date_of_birth).trim();


            if (!studentName) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Student name cannot be empty"

                });

            }


            // -------------------------------------------------
            // VALIDATE EMAIL
            // -------------------------------------------------

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailRegex.test(studentEmail)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid email address"

                });

            }


            // -------------------------------------------------
            // VALIDATE DOB
            //
            // Accepts:
            // YYYY-MM-DD
            // DD-MM-YYYY
            // DD/MM/YYYY
            // -------------------------------------------------

            let dobForDatabase = null;

            let dobForPassword = null;


            if (
                /^\d{4}-\d{2}-\d{2}$/.test(dob)
            ) {

                // YYYY-MM-DD

                const [year, month, day] =
                    dob.split("-");

                dobForDatabase =
                    `${year}-${month}-${day}`;

                dobForPassword =
                    `${day}${month}${year}`;

            }


            else if (
                /^\d{2}-\d{2}-\d{4}$/.test(dob)
            ) {

                // DD-MM-YYYY

                const [day, month, year] =
                    dob.split("-");

                dobForDatabase =
                    `${year}-${month}-${day}`;

                dobForPassword =
                    `${day}${month}${year}`;

            }


            else if (
                /^\d{2}\/\d{2}\/\d{4}$/.test(dob)
            ) {

                // DD/MM/YYYY

                const [day, month, year] =
                    dob.split("/");

                dobForDatabase =
                    `${year}-${month}-${day}`;

                dobForPassword =
                    `${day}${month}${year}`;

            }


            else {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid date of birth. Use YYYY-MM-DD or DD/MM/YYYY"

                });

            }


            // -------------------------------------------------
            // PASSWORD
            //
            // Example:
            // Poovija@16062008
            // -------------------------------------------------

            const temporaryPassword =
                `${studentName}@${dobForPassword}`;


            // -------------------------------------------------
            // CHECK DUPLICATE EMAIL
            // -------------------------------------------------

            const [existingEmail] =
                await db.execute(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [
                        studentEmail
                    ]
                );


            if (existingEmail.length > 0) {

                return res.status(409).json({

                    success: false,

                    message:
                        "A user with this email already exists"

                });

            }


            // -------------------------------------------------
            // CHECK DUPLICATE APPLICATION NUMBER
            // -------------------------------------------------

            const [existingApplication] =
                await db.execute(
                    `
                    SELECT id
                    FROM applications
                    WHERE application_number = ?
                    LIMIT 1
                    `,
                    [
                        applicationNumber
                    ]
                );


            if (
                existingApplication.length > 0
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This application number already exists"

                });

            }


            // -------------------------------------------------
            // VALIDATE RANK
            // -------------------------------------------------

            let rank = null;


            if (
                rank_number !== undefined &&
                rank_number !== null &&
                rank_number !== ""
            ) {

                rank =
                    Number(rank_number);


                if (
                    !Number.isInteger(rank) ||
                    rank <= 0
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Rank number must be a positive integer"

                    });

                }

            }


            // -------------------------------------------------
            // VALIDATE CUTOFF
            // -------------------------------------------------

            let cutoff = null;


            if (
                cutoff_mark !== undefined &&
                cutoff_mark !== null &&
                cutoff_mark !== ""
            ) {

                cutoff =
                    Number(cutoff_mark);


                if (
                    Number.isNaN(cutoff)
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Cutoff mark must be a valid number"

                    });

                }

            }


            // =================================================
            // HASH PASSWORD
            // =================================================

            const hashedPassword =
                await bcrypt.hash(
                    temporaryPassword,
                    10
                );


            // =================================================
            // DATABASE TRANSACTION
            // =================================================

            connection =
                await db.getConnection();


            await connection.beginTransaction();


            // -------------------------------------------------
            // CREATE USER
            // -------------------------------------------------

            const [userResult] =
                await connection.execute(
                    `
                    INSERT INTO users
                    (
                        name,
                        email,
                        password,
                        role
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        'student'
                    )
                    `,
                    [
                        studentName,
                        studentEmail,
                        hashedPassword
                    ]
                );


            const userId =
                userResult.insertId;


            // -------------------------------------------------
            // CREATE STUDENT
            // -------------------------------------------------

            const [studentResult] =
                await connection.execute(
                    `
                    INSERT INTO students
                    (
                        user_id,
                        phone,
                        date_of_birth,
                        gender,
                        community,
                        address,
                        cutoff_mark,
                        rank_number
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                    `,
                    [
                        userId,
                        phone || null,
                        dobForDatabase,
                        gender || null,
                        community || null,
                        address || null,
                        cutoff,
                        rank
                    ]
                );


            const studentId =
                studentResult.insertId;


            // -------------------------------------------------
            // CREATE APPLICATION
            // -------------------------------------------------

            await connection.execute(
                `
                INSERT INTO applications
                (
                    student_id,
                    application_number,
                    status
                )
                VALUES
                (
                    ?,
                    ?,
                    'pending'
                )
                `,
                [
                    studentId,
                    applicationNumber
                ]
            );


            // -------------------------------------------------
            // COMMIT DATABASE
            // -------------------------------------------------

            await connection.commit();


            // Connection no longer needs transaction rollback
            connection.release();
            connection = null;


            // =================================================
            // SEND LOGIN CREDENTIALS EMAIL
            // =================================================

            try {

                await sendStudentCredentials(
                    studentEmail,
                    studentName,
                    studentEmail,
                    temporaryPassword
                );

            }

            catch (emailError) {

                console.error(
                    "❌ STUDENT EMAIL ERROR:",
                    emailError
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Student account was created, but the login email could not be sent. Please check the email configuration and try again.",

                    student_id:
                        studentId,

                    user_id:
                        userId,

                    email:
                        studentEmail

                });

            }


            // =================================================
            // FINAL SUCCESS RESPONSE
            // =================================================

            console.log(
                "✅ STUDENT CREATED SUCCESSFULLY"
            );

            console.log(
                "Student ID:",
                studentId
            );

            console.log(
                "Email:",
                studentEmail
            );


            return res.status(201).json({

                success: true,

                message:
                    "Student account created and login credentials sent to email",

                student_id:
                    studentId,

                user_id:
                    userId,

                name:
                    studentName,

                email:
                    studentEmail,

                application_number:
                    applicationNumber,

                rank_number:
                    rank,

                email_sent:
                    true

            });

        }


        catch (error) {

            // -------------------------------------------------
            // ROLLBACK
            // -------------------------------------------------

            if (connection) {

                try {

                    await connection.rollback();

                }

                catch (rollbackError) {

                    console.error(
                        "ROLLBACK ERROR:",
                        rollbackError
                    );

                }

                connection.release();

            }


            console.error(
                "❌ CREATE STUDENT ERROR:",
                error
            );


            // -------------------------------------------------
            // DUPLICATE DATABASE ERROR
            // -------------------------------------------------

            if (error.code === "ER_DUP_ENTRY") {

                return res.status(409).json({

                    success: false,

                    message:
                        "Student email, rank, or application number already exists",

                    error:
                        error.message

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Failed to create student account"

            });

        }

    }
);


// =====================================================
// STUDENT ALLOTMENT MONITORING
// GET /api/admin/students
// ADMIN ONLY
// =====================================================

router.get(
    "/students",
    authenticateToken,
    requireRole("admin"),

    async (req, res) => {

        try {

            const {
                rank,
                name,
                email,
                application_number,
                department,
                status
            } = req.query;


            // -------------------------------------------------
            // BASE QUERY
            // -------------------------------------------------

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


            // -------------------------------------------------
            // FILTER RANK
            // -------------------------------------------------

            if (rank) {

                query += `
                    AND s.rank_number = ?
                `;

                params.push(rank);

            }


            // -------------------------------------------------
            // FILTER NAME
            // -------------------------------------------------

            if (name) {

                query += `
                    AND u.name LIKE ?
                `;

                params.push(
                    `%${name}%`
                );

            }


            // -------------------------------------------------
            // FILTER EMAIL
            // -------------------------------------------------

            if (email) {

                query += `
                    AND u.email LIKE ?
                `;

                params.push(
                    `%${email}%`
                );

            }


            // -------------------------------------------------
            // FILTER APPLICATION
            // -------------------------------------------------

            if (application_number) {

                query += `
                    AND app.application_number LIKE ?
                `;

                params.push(
                    `%${application_number}%`
                );

            }


            // -------------------------------------------------
            // FILTER DEPARTMENT
            // -------------------------------------------------

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


            // -------------------------------------------------
            // FILTER STATUS
            // -------------------------------------------------

            if (status) {

                if (
                    status === "not_allotted"
                ) {

                    query += `
                        AND a.id IS NULL
                    `;

                }

                else if (
                    status === "confirmed"
                ) {

                    query += `
                        AND a.status = 'confirmed'
                    `;

                }

                else if (
                    status === "allotted"
                ) {

                    query += `
                        AND a.status IN (
                            'allotted',
                            'payment_pending'
                        )
                    `;

                }

                else {

                    query += `
                        AND a.status = ?
                    `;

                    params.push(status);

                }

            }


            // -------------------------------------------------
            // ORDER
            // -------------------------------------------------

            query += `
                ORDER BY
                    s.rank_number ASC,
                    a.id DESC
            `;


            // -------------------------------------------------
            // EXECUTE
            // -------------------------------------------------

            const [students] =
                await db.execute(
                    query,
                    params
                );


            // -------------------------------------------------
            // FORMAT
            // -------------------------------------------------

            const formattedStudents =
                students.map(student => {

                    let overallStatus =
                        "not_allotted";


                    if (
                        student.allotment_status ===
                        "confirmed"
                    ) {

                        overallStatus =
                            "confirmed";

                    }

                    else if (
                        student.allotment_status ===
                        "allotted" ||

                        student.allotment_status ===
                        "payment_pending"
                    ) {

                        overallStatus =
                            "allotted";

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


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.json({

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

        }


        catch (error) {

            console.error(
                "ADMIN STUDENT FILTER ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch student monitoring data",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;
