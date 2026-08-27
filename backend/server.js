const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

// ===============================
// ROUTES
// ===============================

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const roundRoutes = require("./routes/roundRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const preferenceRoutes = require("./routes/preferenceRoutes");
const allotmentRoutes = require("./routes/allotmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());


// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/test", testRoutes);

app.use("/api/admin", adminRoutes);

// STUDENT ROUTES
app.use("/api/student", studentRoutes);

app.use("/api/departments", departmentRoutes);

app.use("/api/rounds", roundRoutes);

app.use("/api/applications", applicationRoutes);

app.use("/api/preferences", preferenceRoutes);

app.use("/api/allotments", allotmentRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/admin-dashboard", adminDashboardRoutes);


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "GCE Counselling Backend is running"
    });
});


// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is healthy"
    });
});


// ===============================
// DATABASE TEST
// ===============================

app.get("/api/db-test", async (req, res) => {

    try {

        const [rows] = await db.query(
            "SELECT 1 AS result"
        );

        res.json({
            success: true,
            message: "MySQL connected successfully",
            result: rows
        });

    } catch (error) {

        console.error(
            "DATABASE CONNECTION ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});


// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {

    console.log(
        "❌ ROUTE NOT FOUND:",
        req.method,
        req.originalUrl
    );

    res.status(404).json({
        success: false,
        message: "Route not found",
        route: req.originalUrl
    });

});


// ===============================
// ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {

    console.error(
        "❌ SERVER ERROR:",
        err
    );

    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
    });

});


// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log("=================================");
    console.log("GCE COUNSELLING BACKEND");
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log("=================================");

});