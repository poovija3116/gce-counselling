const express = require("express");

const {
    authenticateToken,
    requireRole
} = require("../middleware/authMiddleware");

const db = require("../config/db");

const router = express.Router();


// ============================================================
// GCE ERODE - COUNSELLING ROUND CONTROL
// COUNSELLOR CONTROLLED
// ============================================================


// ============================================================
// GET ALL COUNSELLING ROUNDS
// COUNSELLOR
// ============================================================

router.get(
    "/",
    authenticateToken,
    requireRole("counsellor"),
    async (req, res) => {

        try {

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
                    status,
                    created_at
                FROM counselling_rounds
                ORDER BY round_number ASC
            `);

            res.json({
                success: true,
                count: rounds.length,
                rounds
            });

        } catch (error) {

            console.error(
                "GET ALL ROUNDS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Failed to fetch counselling rounds",
                error: error.message
            });

        }

    }
);


// ============================================================
// GET CURRENT ROUND
// STUDENT + COUNSELLOR
// ============================================================

router.get(
    "/current",
    authenticateToken,
    async (req, res) => {

        try {

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
                    status,
                    created_at
                FROM counselling_rounds
                WHERE status != 'completed'
                ORDER BY round_number ASC
                LIMIT 1
            `);


            if (rounds.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "No active counselling round found"
                });

            }


            res.json({
                success: true,
                round: rounds[0]
            });


        } catch (error) {

            console.error(
                "GET CURRENT ROUND ERROR:",
                error
            );


            res.status(500).json({
                success: false,
                message: "Failed to fetch current round",
                error: error.message
            });

        }

    }
);


// ============================================================
// GET ROUND BY ID
// COUNSELLOR
// ============================================================

router.get(
    "/:id",
    authenticateToken,
    requireRole("counsellor"),
    async (req, res) => {

        try {

            const roundId =
                Number(req.params.id);


            if (!Number.isInteger(roundId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid round ID"
                });

            }


            const [rounds] = await db.execute(
                `
                SELECT
                    id,
                    round_number,
                    min_rank,
                    max_rank,
                    preference_start,
                    preference_end,
                    allotment_at,
                    payment_deadline,
                    status,
                    created_at
                FROM counselling_rounds
                WHERE id = ?
                `,
                [roundId]
            );


            if (rounds.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Round not found"
                });

            }


            res.json({
                success: true,
                round: rounds[0]
            });


        } catch (error) {

            console.error(
                "GET ROUND ERROR:",
                error
            );


            res.status(500).json({
                success: false,
                message: "Failed to fetch round",
                error: error.message
            });

        }

    }
);


// ============================================================
// CREATE COUNSELLING ROUND
// COUNSELLOR
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


            if (roundNumber <= 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Round number must be greater than 0"
                });

            }


            if (minRank <= 0 || maxRank <= 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Ranks must be greater than 0"
                });

            }


            if (minRank > maxRank) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Minimum rank cannot be greater than maximum rank"
                });

            }


            const [existing] = await db.execute(
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


            const [result] = await db.execute(
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


            res.status(201).json({

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


        } catch (error) {

            console.error(
                "CREATE ROUND ERROR:",
                error
            );


            res.status(500).json({
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
// UPDATE ROUND SETTINGS
// COUNSELLOR
//
// Counsellor decides:
// - Round number
// - Minimum rank
// - Maximum rank
// ============================================================

router.put(
    "/:id/settings",
    authenticateToken,
    requireRole("counsellor"),
    async (req, res) => {

        try {

            const roundId =
                Number(req.params.id);


            const {
                min_rank,
                max_rank
            } = req.body;


            if (
                min_rank === undefined ||
                max_rank === undefined
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "min_rank and max_rank are required"
                });

            }


            const minRank =
                Number(min_rank);

            const maxRank =
                Number(max_rank);


            if (
                !Number.isInteger(minRank) ||
                !Number.isInteger(maxRank)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Ranks must be integers"
                });

            }


            if (minRank <= 0 || maxRank <= 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Ranks must be greater than 0"
                });

            }


            if (minRank > maxRank) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Minimum rank cannot be greater than maximum rank"
                });

            }


            const [rounds] = await db.execute(
                `
                SELECT
                    id,
                    round_number,
                    status
                FROM counselling_rounds
                WHERE id = ?
                `,
                [roundId]
            );


            if (rounds.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Round not found"
                });

            }


            const round =
                rounds[0];


            if (
                round.status !== "not_started"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Round settings can only be changed before the round starts",
                    current_status:
                        round.status
                });

            }


            await db.execute(
                `
                UPDATE counselling_rounds
                SET
                    min_rank = ?,
                    max_rank = ?
                WHERE id = ?
                `,
                [
                    minRank,
                    maxRank,
                    roundId
                ]
            );


            res.json({

                success: true,

                message:
                    "Round settings updated successfully",

                round_id:
                    roundId,

                round_number:
                    round.round_number,

                min_rank:
                    minRank,

                max_rank:
                    maxRank,

                status:
                    round.status

            });


        } catch (error) {

            console.error(
                "UPDATE ROUND SETTINGS ERROR:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Failed to update round settings",
                error:
                    error.message
            });

        }

    }
);


// ============================================================
// OPEN CHOICE FILLING
// COUNSELLOR
//
// Counsellor decides the exact opening date/time.
// ============================================================

router.post(
    "/:id/open-preferences",
    authenticateToken,
    requireRole("counsellor"),
    async (req, res) => {

        try {

            const roundId =
                Number(req.params.id);


            const {
                preference_start
            } = req.body;


            if (!preference_start) {

                return res.status(400).json({
                    success: false,
                    message:
                        "preference_start is required"
                });

            }


            const startDate =
                new Date(preference_start);


            if (
                Number.isNaN(
                    startDate.getTime()
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid preference start date/time"
                });

            }


            const [rounds] = await db.execute(
                `
                SELECT
                    id,
                    round_number,
                    status,
                    preference_end
                FROM counselling_rounds
                WHERE id = ?
                `,
                [roundId]
            );


            if (rounds.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Round not found"
                });

            }


            const round =
                rounds[0];


            if (
                round.status !== "not_started"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Only a not_started round can be opened",
                    current_status:
                        round.status
                });

            }


            await db.execute(
                `
                UPDATE counselling_rounds
                SET
                    status = 'preference_open',
                    preference_start = ?
                WHERE id = ?
                `,
                [
                    preference_start,
                    roundId
                ]
            );


            res.json({

                success: true,

                message:
                    "Choice filling opened successfully",

                round_id:
                    roundId,

                round_number:
                    round.round_number,

                preference_start:
                    preference_start,

                status:
                    "preference_open"

            });


        } catch (error) {

            console.error(
                "OPEN PREFERENCES ERROR:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Failed to open choice filling",
                error:
                    error.message
            });

        }

    }
);


// ============================================================
// CLOSE / LOCK CHOICE FILLING
// COUNSELLOR
//
// IMPORTANT:
// Student does NOT control this anymore.
// Counsellor explicitly closes it.
// ============================================================

router.post(
    "/:id/lock-preferences",
    authenticateToken,
    requireRole("counsellor"),
    async (req, res) => {

        try {

            const roundId =
                Number(req.params.id);


            const {
                preference_end
            } = req.body;


            if (!preference_end) {

                return res.status(400).json({
                    success: false,
                    message:
                        "preference_end is required"
                });

            }


            const endDate =
                new Date(preference_end);


            if (
                Number.isNaN(
                    endDate.getTime()
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid preference end date/time"
                });

            }


            const [rounds] = await db.execute(
                `
                SELECT
                    id,
                    round_number,
                    status,
                    preference_start
                FROM counselling_rounds
                WHERE id = ?
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


            if (
                round.status !==
                "preference_open"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Choice filling can only be closed when it is open",
                    current_status:
                        round.status
                });

            }


            if (
                round.preference_start &&
                endDate <=
                new Date(round.preference_start)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Closing time must be after opening time"
                });

            }


            await db.execute(
                `
                UPDATE counselling_rounds
                SET
                    status = 'preferences_locked',
                    preference_end = ?
                WHERE id = ?
                `,
                [
                    preference_end,
                    roundId
                ]
            );


            res.json({

                success: true,

                message:
                    "Choice filling closed successfully",

                round_id:
                    roundId,

                round_number:
                    round.round_number,

                preference_end:
                    preference_end,

                status:
                    "preferences_locked"

            });


        } catch (error) {

            console.error(
                "LOCK PREFERENCES ERROR:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Failed to close choice filling",
                error:
                    error.message
            });

        }

    }
);


// ============================================================
// MARK ALLOTMENT COMPLETED
// COUNSELLOR
// ============================================================

router.post(
    "/:id/allotment-completed",
    authenticateToken,
    requireRole("counsellor"),
    async (req, res) => {

        try {

            const roundId =
                Number(req.params.id);


            const [rounds] = await db.execute(
                `
                SELECT
                    id,
                    round_number,
                    status
                FROM counselling_rounds
                WHERE id = ?
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


            if (
                round.status !==
                "preferences_locked"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Allotment can only be completed after choice filling is locked",
                    current_status:
                        round.status
                });

            }


            await db.execute(
                `
                UPDATE counselling_rounds
                SET
                    status = 'allotment_completed',
                    allotment_at = NOW()
                WHERE id = ?
                `,
                [roundId]
            );


            res.json({

                success: true,

                message:
                    "Allotment marked as completed",

                round_id:
                    roundId,

                round_number:
                    round.round_number,

                status:
                    "allotment_completed"

            });


        } catch (error) {

            console.error(
                "ALLOTMENT COMPLETED ERROR:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Failed to update allotment status",
                error:
                    error.message
            });

        }

    }
);


// ============================================================
// START PAYMENT PERIOD
// COUNSELLOR
// ============================================================

router.post(
    "/:id/payment-period",
    authenticateToken,
    requireRole("counsellor"),
    async (req, res) => {

        try {

            const roundId =
                Number(req.params.id);


            const {
                payment_deadline
            } = req.body;


            if (!payment_deadline) {

                return res.status(400).json({
                    success: false,
                    message:
                        "payment_deadline is required"
                });

            }


            const deadlineDate =
                new Date(payment_deadline);


            if (
                Number.isNaN(
                    deadlineDate.getTime()
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid payment deadline"
                });

            }


            const [rounds] = await db.execute(
                `
                SELECT
                    id,
                    round_number,
                    status
                FROM counselling_rounds
                WHERE id = ?
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


            if (
                round.status !==
                "allotment_completed"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Payment period can only start after allotment is completed",
                    current_status:
                        round.status
                });

            }


            await db.execute(
                `
                UPDATE counselling_rounds
                SET
                    status = 'payment_period',
                    payment_deadline = ?
                WHERE id = ?
                `,
                [
                    payment_deadline,
                    roundId
                ]
            );


            res.json({

                success: true,

                message:
                    "Payment period started successfully",

                round_id:
                    roundId,

                round_number:
                    round.round_number,

                payment_deadline:
                    payment_deadline,

                status:
                    "payment_period"

            });


        } catch (error) {

            console.error(
                "PAYMENT PERIOD ERROR:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Failed to start payment period",
                error:
                    error.message
            });

        }

    }
);


// ============================================================
// COMPLETE ROUND
// COUNSELLOR
// ============================================================

router.post(
    "/:id/complete",
    authenticateToken,
    requireRole("counsellor"),
    async (req, res) => {

        try {

            const roundId =
                Number(req.params.id);


            const [rounds] = await db.execute(
                `
                SELECT
                    id,
                    round_number,
                    status
                FROM counselling_rounds
                WHERE id = ?
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


            if (
                round.status !==
                "payment_period"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Round can only be completed during the payment period",
                    current_status:
                        round.status
                });

            }


            await db.execute(
                `
                UPDATE counselling_rounds
                SET
                    status = 'completed'
                WHERE id = ?
                `,
                [roundId]
            );


            res.json({

                success: true,

                message:
                    "Counselling round completed successfully",

                round_id:
                    roundId,

                round_number:
                    round.round_number,

                status:
                    "completed"

            });


        } catch (error) {

            console.error(
                "COMPLETE ROUND ERROR:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Failed to complete counselling round",
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