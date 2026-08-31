const express = require("express");

const {
    authenticateToken,
    requireRole
} = require("../middleware/authMiddleware");

const db = require("../config/db");

const router = express.Router();

console.log("🔥 ROUND ROUTES FILE LOADED 🔥");
console.log("🔥 SCHEDULE + STATUS ROUTES VERSION: 2026 🔥");


// ============================================================
// TEST ROUTE
// NO LOGIN REQUIRED
// GET /api/rounds/test-route
// ============================================================

router.get("/test-route", (req, res) => {

    res.json({
        success: true,
        message: "ROUND ROUTES ARE WORKING"
    });

});


// ============================================================
// GET ALL ROUNDS
// COUNSELLOR ONLY
// GET /api/rounds/
// ============================================================

router.get(
    "/",
    authenticateToken,
    requireRole("counsellor"),
    async (req, res) => {

        try {

            const [rounds] = await db.execute(
                `
                SELECT
                    id,
                    round_number,
                    min_rank,
                    max_rank,
                    preference_start,
                    preference_end,
                    choice_open_at,
                    choice_close_at,
                    allotment_at,
                    allotment_published_at,
                    payment_deadline,
                    status,
                    created_at
                FROM counselling_rounds
                ORDER BY round_number ASC
                `
            );

            return res.json({

                success: true,

                count: rounds.length,

                rounds

            });

        }

        catch (error) {

            console.error(
                "GET ALL ROUNDS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch counselling rounds",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// GET CURRENT ROUND
// STUDENT / COUNSELLOR
// GET /api/rounds/current
// ============================================================

router.get(
    "/current",
    authenticateToken,
    async (req, res) => {

        try {

            const [rounds] = await db.execute(
                `
                SELECT
                    id,
                    round_number,
                    min_rank,
                    max_rank,
                    preference_start,
                    preference_end,
                    choice_open_at,
                    choice_close_at,
                    allotment_at,
                    allotment_published_at,
                    payment_deadline,
                    status,
                    created_at
                FROM counselling_rounds
                WHERE status != 'completed'
                ORDER BY round_number ASC
                LIMIT 1
                `
            );

            if (rounds.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No active counselling round found"

                });

            }

            return res.json({

                success: true,

                round:
                    rounds[0]

            });

        }

        catch (error) {

            console.error(
                "GET CURRENT ROUND ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch current round",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// CREATE ROUND
// COUNSELLOR ONLY
// POST /api/rounds/create
// ============================================================

router.post(
    "/create",
    authenticateToken,
    requireRole("counsellor"),
    async (req, res) => {

        try {

            const {
                round_number,
                min_rank,
                max_rank
            } = req.body;


            // ------------------------------------------------
            // VALIDATE INPUT
            // ------------------------------------------------

            if (
                round_number === undefined ||
                min_rank === undefined ||
                max_rank === undefined
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "round_number, min_rank and max_rank are required"

                });

            }


            const roundNumber =
                Number(round_number);

            const minRank =
                Number(min_rank);

            const maxRank =
                Number(max_rank);


            // ------------------------------------------------
            // VALIDATE NUMBERS
            // ------------------------------------------------

            if (
                !Number.isInteger(roundNumber) ||
                !Number.isInteger(minRank) ||
                !Number.isInteger(maxRank)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Round number and ranks must be integers"

                });

            }


            // ------------------------------------------------
            // VALIDATE POSITIVE VALUES
            // ------------------------------------------------

            if (
                roundNumber <= 0 ||
                minRank <= 0 ||
                maxRank <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Round number and ranks must be greater than 0"

                });

            }


            // ------------------------------------------------
            // VALIDATE RANK RANGE
            // ------------------------------------------------

            if (minRank > maxRank) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Minimum rank cannot be greater than maximum rank"

                });

            }


            // ------------------------------------------------
            // CHECK DUPLICATE ROUND
            // ------------------------------------------------

            const [existing] =
                await db.execute(
                    `
                    SELECT id
                    FROM counselling_rounds
                    WHERE round_number = ?
                    `,
                    [roundNumber]
                );


            if (existing.length > 0) {

                return res.status(409).json({

                    success: false,

                    message:
                        `Round ${roundNumber} already exists`

                });

            }


            // ------------------------------------------------
            // CREATE ROUND
            // ------------------------------------------------

            const [result] =
                await db.execute(
                    `
                    INSERT INTO counselling_rounds
                    (
                        round_number,
                        min_rank,
                        max_rank,
                        status
                    )
                    VALUES (?, ?, ?, 'not_started')
                    `,
                    [
                        roundNumber,
                        minRank,
                        maxRank
                    ]
                );


            return res.status(201).json({

                success: true,

                message:
                    "Counselling round created successfully",

                round_id:
                    result.insertId,

                round_number:
                    roundNumber,

                min_rank:
                    minRank,

                max_rank:
                    maxRank,

                status:
                    "not_started"

            });

        }

        catch (error) {

            console.error(
                "CREATE ROUND ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to create counselling round",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// UPDATE COUNSELLING SCHEDULE
// COUNSELLOR ONLY
//
// PUT /api/rounds/:id/schedule
//
// COUNSELLOR CONTROLS:
// - Choice filling opening
// - Choice filling closing
// - Allotment time
// - Allotment publication
// - Payment deadline
// ============================================================

router.put(
    "/:id/schedule",
    authenticateToken,
    requireRole("counsellor"),
    async (req, res) => {

        try {

            const roundId =
                Number(req.params.id);


            // ------------------------------------------------
            // VALIDATE ROUND ID
            // ------------------------------------------------

            if (
                !Number.isInteger(roundId) ||
                roundId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid round ID"

                });

            }


            // ------------------------------------------------
            // GET SCHEDULE DATA
            // ------------------------------------------------

            const {
                choice_open_at,
                choice_close_at,
                allotment_at,
                allotment_published_at,
                payment_deadline
            } = req.body;


            // ------------------------------------------------
            // REQUIRED FIELDS
            // ------------------------------------------------

            if (
                !choice_open_at ||
                !choice_close_at ||
                !allotment_at
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "choice_open_at, choice_close_at and allotment_at are required"

                });

            }


            // ------------------------------------------------
            // CHECK ROUND EXISTS
            // ------------------------------------------------

            const [rounds] =
                await db.execute(
                    `
                    SELECT
                        id,
                        round_number,
                        min_rank,
                        max_rank
                    FROM counselling_rounds
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [roundId]
                );


            if (rounds.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Round not found"

                });

            }


            // ------------------------------------------------
            // CONVERT DATES
            // ------------------------------------------------

            const choiceOpen =
                new Date(choice_open_at);

            const choiceClose =
                new Date(choice_close_at);

            const allotment =
                new Date(allotment_at);


            // ------------------------------------------------
            // CHECK DATE FORMAT
            // ------------------------------------------------

            if (
                isNaN(choiceOpen.getTime()) ||
                isNaN(choiceClose.getTime()) ||
                isNaN(allotment.getTime())
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid date/time format"

                });

            }


            // ------------------------------------------------
            // CHOICE OPEN < CHOICE CLOSE
            // ------------------------------------------------

            if (choiceOpen >= choiceClose) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Choice opening time must be before choice closing time"

                });

            }


            // ------------------------------------------------
            // CHOICE CLOSE < ALLOTMENT
            // ------------------------------------------------

            if (choiceClose >= allotment) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Choice closing time must be before allotment time"

                });

            }


            // ------------------------------------------------
            // ALLOTMENT PUBLICATION CHECK
            // ------------------------------------------------

            if (allotment_published_at) {

                const allotmentPublished =
                    new Date(
                        allotment_published_at
                    );


                if (
                    isNaN(
                        allotmentPublished.getTime()
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid allotment publication date/time"

                    });

                }


                if (
                    allotmentPublished < allotment
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Allotment publication time must be after allotment time"

                    });

                }

            }


            // ------------------------------------------------
            // PAYMENT DEADLINE CHECK
            // ------------------------------------------------

            if (payment_deadline) {

                const paymentDeadline =
                    new Date(
                        payment_deadline
                    );


                if (
                    isNaN(
                        paymentDeadline.getTime()
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid payment deadline"

                    });

                }


                if (
                    allotment_published_at &&
                    paymentDeadline <
                    new Date(
                        allotment_published_at
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Payment deadline must be after allotment publication"

                    });

                }

            }


            // ------------------------------------------------
            // UPDATE DATABASE
            // ------------------------------------------------

            await db.execute(
                `
                UPDATE counselling_rounds
                SET
                    choice_open_at = ?,
                    choice_close_at = ?,
                    allotment_at = ?,
                    allotment_published_at = ?,
                    payment_deadline = ?,
                    status = 'not_started'
                WHERE id = ?
                `,
                [
                    choice_open_at,
                    choice_close_at,
                    allotment_at,
                    allotment_published_at || null,
                    payment_deadline || null,
                    roundId
                ]
            );


            // ------------------------------------------------
            // FETCH UPDATED ROUND
            // ------------------------------------------------

            const [updatedRounds] =
                await db.execute(
                    `
                    SELECT
                        id,
                        round_number,
                        min_rank,
                        max_rank,
                        preference_start,
                        preference_end,
                        choice_open_at,
                        choice_close_at,
                        allotment_at,
                        allotment_published_at,
                        payment_deadline,
                        status,
                        created_at
                    FROM counselling_rounds
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [roundId]
                );


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            return res.json({

                success: true,

                message:
                    "Counselling schedule updated successfully",

                round:
                    updatedRounds[0]

            });

        }

        catch (error) {

            console.error(
                "UPDATE ROUND SCHEDULE ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to update counselling schedule",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// GET ROUND STATUS
// STUDENT / COUNSELLOR
//
// GET /api/rounds/1/status
//
// STATUS IS CALCULATED FROM THE COUNSELLOR'S SCHEDULE
// ============================================================

router.get(
    "/:id/status",
    authenticateToken,
    async (req, res) => {

        try {

            const roundId =
                Number(req.params.id);


            // ------------------------------------------------
            // VALIDATE ROUND ID
            // ------------------------------------------------

            if (
                !Number.isInteger(roundId) ||
                roundId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid round ID"

                });

            }


            // ------------------------------------------------
            // GET ROUND
            // ------------------------------------------------

            const [rounds] =
                await db.execute(
                    `
                    SELECT
                        id,
                        round_number,
                        min_rank,
                        max_rank,
                        preference_start,
                        preference_end,
                        choice_open_at,
                        choice_close_at,
                        allotment_at,
                        allotment_published_at,
                        payment_deadline,
                        status,
                        created_at
                    FROM counselling_rounds
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [roundId]
                );


            if (rounds.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Round not found"

                });

            }


            const round =
                rounds[0];


            // ------------------------------------------------
            // CURRENT SERVER TIME
            // ------------------------------------------------

            const now =
                new Date();


            let calculatedStatus =
                "not_started";


            let automaticLockAt =
                null;


            // =================================================
            // NO SCHEDULE
            // =================================================

            if (
                !round.choice_open_at ||
                !round.choice_close_at
            ) {

                return res.json({

                    success: true,

                    round_id:
                        round.id,

                    round_number:
                        round.round_number,

                    min_rank:
                        round.min_rank,

                    max_rank:
                        round.max_rank,

                    status:
                        "not_started",

                    database_status:
                        round.status,

                    server_time:
                        now.toISOString(),

                    choice_open_at:
                        round.choice_open_at,

                    choice_close_at:
                        round.choice_close_at,

                    automatic_lock_at:
                        null,

                    allotment_at:
                        round.allotment_at,

                    allotment_published_at:
                        round.allotment_published_at,

                    payment_deadline:
                        round.payment_deadline

                });

            }


            // =================================================
            // AUTOMATIC LOCK
            //
            // Lock 5 minutes before closing.
            // =================================================

            automaticLockAt =
                new Date(
                    new Date(
                        round.choice_close_at
                    ).getTime()
                    -
                    (5 * 60 * 1000)
                );


            // =================================================
            // BEFORE CHOICE FILLING
            // =================================================

            if (
                now <
                new Date(
                    round.choice_open_at
                )
            ) {

                calculatedStatus =
                    "not_started";

            }


            // =================================================
            // CHOICE FILLING OPEN
            // =================================================

            else if (
                now >=
                new Date(
                    round.choice_open_at
                )
                &&
                now <
                automaticLockAt
            ) {

                calculatedStatus =
                    "preference_open";

            }


            // =================================================
            // AUTOMATIC LOCK PERIOD
            // =================================================

            else if (
                now >=
                automaticLockAt
                &&
                now <
                new Date(
                    round.choice_close_at
                )
            ) {

                calculatedStatus =
                    "preferences_locked";

            }


            // =================================================
            // AFTER CHOICE CLOSE
            // =================================================

            else if (
                now >=
                new Date(
                    round.choice_close_at
                )
                &&
                round.allotment_at
                &&
                now <
                new Date(
                    round.allotment_at
                )
            ) {

                calculatedStatus =
                    "preferences_locked";

            }


            // =================================================
            // ALLOTMENT PERIOD
            // =================================================

            else if (
                round.allotment_at
                &&
                now >=
                new Date(
                    round.allotment_at
                )
                &&
                (
                    !round.allotment_published_at
                    ||
                    now <
                    new Date(
                        round.allotment_published_at
                    )
                )
            ) {

                calculatedStatus =
                    "allotment_completed";

            }


            // =================================================
            // PAYMENT PERIOD
            // =================================================

            else if (
                round.allotment_published_at
                &&
                now >=
                new Date(
                    round.allotment_published_at
                )
                &&
                (
                    !round.payment_deadline
                    ||
                    now <=
                    new Date(
                        round.payment_deadline
                    )
                )
            ) {

                calculatedStatus =
                    "payment_period";

            }


            // =================================================
            // COMPLETED
            // =================================================

            else if (
                round.payment_deadline
                &&
                now >
                new Date(
                    round.payment_deadline
                )
            ) {

                calculatedStatus =
                    "completed";

            }


            // =================================================
            // RESPONSE
            // =================================================

            return res.json({

                success: true,

                round_id:
                    round.id,

                round_number:
                    round.round_number,

                min_rank:
                    round.min_rank,

                max_rank:
                    round.max_rank,

                status:
                    calculatedStatus,

                database_status:
                    round.status,

                server_time:
                    now.toISOString(),

                choice_open_at:
                    round.choice_open_at,

                choice_close_at:
                    round.choice_close_at,

                automatic_lock_at:
                    automaticLockAt
                        ? automaticLockAt.toISOString()
                        : null,

                allotment_at:
                    round.allotment_at,

                allotment_published_at:
                    round.allotment_published_at,

                payment_deadline:
                    round.payment_deadline

            });

        }

        catch (error) {

            console.error(
                "ROUND STATUS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to calculate round status",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// GET ROUND BY ID
// COUNSELLOR ONLY
// GET /api/rounds/:id
// ============================================================

router.get(
    "/:id",
    authenticateToken,
    requireRole("counsellor"),
    async (req, res) => {

        try {

            const roundId =
                Number(req.params.id);


            // ------------------------------------------------
            // VALIDATE ID
            // ------------------------------------------------

            if (
                !Number.isInteger(roundId) ||
                roundId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid round ID"

                });

            }


            // ------------------------------------------------
            // GET ROUND
            // ------------------------------------------------

            const [rounds] =
                await db.execute(
                    `
                    SELECT
                        id,
                        round_number,
                        min_rank,
                        max_rank,
                        preference_start,
                        preference_end,
                        choice_open_at,
                        choice_close_at,
                        allotment_at,
                        allotment_published_at,
                        payment_deadline,
                        status,
                        created_at
                    FROM counselling_rounds
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [roundId]
                );


            if (rounds.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Round not found"

                });

            }


            return res.json({

                success: true,

                round:
                    rounds[0]

            });

        }

        catch (error) {

            console.error(
                "GET ROUND ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch round",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;