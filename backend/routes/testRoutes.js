const express = require("express");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "Protected route working",
        user: req.user
    });
});

module.exports = router;