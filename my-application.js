// ==========================================
// MY APPLICATION
// ==========================================

console.log("🔥 MY APPLICATION LOADED");

const API_BASE = "http://localhost:5000";


// ==========================================
// GET TOKEN
// ==========================================

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("studentToken")
    );

}

const token = getToken();


// ==========================================
// AUTH CHECK
// ==========================================

if (!token) {

    console.log("❌ No login token found");

    window.location.href = "student-login.html";

}


// ==========================================
// AUTH HEADERS
// ==========================================

function getHeaders() {

    return {

        "Content-Type": "application/json",

        "Authorization": `Bearer ${getToken()}`

    };

}


// ==========================================
// HTML ELEMENTS
// ==========================================

const applicationNumber =
    document.getElementById("applicationNumber");

const submittedDate =
    document.getElementById("submittedDate");

const studentName =
    document.getElementById("studentName");

const dateOfBirth =
    document.getElementById("dateOfBirth");

const gender =
    document.getElementById("gender");

const community =
    document.getElementById("community");

const phone =
    document.getElementById("phone");

const email =
    document.getElementById("email");

const rank =
    document.getElementById("rank");

const currentRound =
    document.getElementById("currentRound");

const rankRange =
    document.getElementById("rankRange");


// ==========================================
// LOAD APPLICATION
// ==========================================

async function loadApplication() {

    try {

        console.log("📡 Loading application...");

        const response = await fetch(
            `${API_BASE}/api/applications/my`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );


        console.log(
            "📊 Application response:",
            response.status
        );


        const data = await response.json();


        console.log(
            "📋 APPLICATION DATA:",
            data
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load application"
            );

        }


        /*
         * Depending on your backend,
         * application may be returned as:
         *
         * data.application
         *
         */

        const application =
            data.application;


        if (!application) {

            throw new Error(
                "Application information not found"
            );

        }


        console.log(
            "✅ APPLICATION:",
            application
        );


        // =====================================
        // APPLICATION NUMBER
        // =====================================

        if (applicationNumber) {

            applicationNumber.textContent =
                application.application_number || "-";

        }


        // =====================================
        // SUBMITTED DATE
        // =====================================

        if (submittedDate) {

            submittedDate.textContent =
                formatDate(
                    application.submitted_at ||
                    application.created_at
                );

        }


        // =====================================
        // APPLICATION STATUS
        // =====================================

        const applicationStatus =
            document.querySelector(
                ".status-card .status-badge"
            );


        if (applicationStatus) {

            applicationStatus.textContent =
                (
                    application.status ||
                    "SUBMITTED"
                ).toUpperCase();

        }


        // =====================================
        // STUDENT DETAILS
        // =====================================

        if (studentName) {

            studentName.textContent =
                application.name || "-";

        }


        if (dateOfBirth) {

            dateOfBirth.textContent =
                formatDate(
                    application.date_of_birth
                );

        }


        if (gender) {

            gender.textContent =
                application.gender || "-";

        }


        if (community) {

            community.textContent =
                application.community || "-";

        }


        if (phone) {

            phone.textContent =
                application.phone || "-";

        }


        if (email) {

            email.textContent =
                application.email || "-";

        }


        // =====================================
        // RANK
        // =====================================

        if (rank) {

            rank.textContent =
                application.rank_number ||
                application.rank ||
                "-";

        }


        console.log(
            "✅ APPLICATION LOADED"
        );


        // =====================================
        // LOAD CURRENT ROUND
        // =====================================

        await loadCurrentRound();

    }

    catch (error) {

        console.error(
            "❌ APPLICATION ERROR:",
            error
        );

        showApplicationError(
            "Unable to load your application details."
        );

    }

}


// ==========================================
// LOAD CURRENT ROUND
// ==========================================

async function loadCurrentRound() {

    try {

        console.log(
            "📡 Loading current round..."
        );


        const response = await fetch(
            `${API_BASE}/api/rounds/current`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );


        const data =
            await response.json();


        console.log(
            "📊 ROUND DATA:",
            data
        );


        if (!response.ok || !data.success) {

            console.warn(
                "⚠️ Current round unavailable"
            );

            return;

        }


        const round =
            data.round;


        if (!round) {

            return;

        }


        // =====================================
        // CURRENT ROUND
        // =====================================

        if (currentRound) {

            currentRound.textContent =
                `Round ${round.round_number}`;

        }


        // =====================================
        // RANK RANGE
        // =====================================

        if (rankRange) {

            const minRank =
                round.min_rank;

            const maxRank =
                round.max_rank;


            if (
                minRank !== null &&
                minRank !== undefined &&
                maxRank !== null &&
                maxRank !== undefined
            ) {

                rankRange.textContent =
                    `${minRank} - ${maxRank}`;

            }

        }

    }

    catch (error) {

        console.error(
            "❌ ROUND ERROR:",
            error
        );

    }

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "-";

    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {

        return dateValue;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


// ==========================================
// SHOW ERROR
// ==========================================

function showApplicationError(message) {

    console.error(
        "❌",
        message
    );

}


// ==========================================
// START
// ==========================================

async function initializeApplication() {

    console.log(
        "🚀 INITIALIZING MY APPLICATION"
    );


    if (!getToken()) {

        window.location.href =
            "student-login.html";

        return;

    }


    await loadApplication();

}


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApplication
    );

}
else {

    initializeApplication();

}