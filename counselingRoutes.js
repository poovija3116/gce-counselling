const express = require("express");

const router = express.Router();


// ==========================================
// STUDENT SEAT SELECTION
// ==========================================

router.post("/select-seat", async (req, res) => {

    try {

        const {
            rank,
            name,
            applicationNumber,
            category,
            department
        } = req.body;


        // Basic validation

        if (
            !rank ||
            !name ||
            !applicationNumber ||
            !category ||
            !department
        ) {

            return res.status(400).json({

                message:
                    "Student details are incomplete."

            });

        }


        // Temporary response
        // Database connection will be added next

        console.log(
            "Student Seat Selection:"
        );

        console.log({
            rank,
            name,
            applicationNumber,
            category,
            department
        });


        return res.status(200).json({

            success: true,

            message:
                "Seat selection submitted successfully.",

            selection: {

                rank,
                name,
                applicationNumber,
                category,
                department,

                status: "PENDING"

            }

        });

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({

            message:
                "Server error."

        });

    }

});


module.exports = router;