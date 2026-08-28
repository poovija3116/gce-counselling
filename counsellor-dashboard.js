// ============================================================
// GCE ERODE - COUNSELLOR DASHBOARD
// ============================================================

console.log("COUNSELLOR DASHBOARD RUNNING");


const API_BASE_URL = "http://localhost:5000";


// ============================================================
// GET TOKEN
// ============================================================

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("counsellorToken")
    );

}


// ============================================================
// AUTHENTICATION
// ============================================================

function checkAuthentication() {

    const token = getToken();

    if (!token) {

        alert("Please login as counsellor.");

        window.location.href = "login.html";

        return false;

    }

    return true;

}


// ============================================================
// HEADERS
// ============================================================

function getHeaders() {

    return {

        "Content-Type": "application/json",

        "Authorization":
            `Bearer ${getToken()}`

    };

}


// ============================================================
// LOAD CURRENT ROUND
// ============================================================

async function loadCurrentRound() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/rounds/current`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        const data =
            await response.json();


        console.log(
            "CURRENT ROUND:",
            data
        );


        if (!response.ok || !data.success) {

            showNoCounselling();

            return;

        }


        const round =
            data.round;


        displayRound(round);


    }

    catch (error) {

        console.error(
            "CURRENT ROUND ERROR:",
            error
        );

        showNoCounselling();

    }

}


// ============================================================
// DISPLAY ROUND
// ============================================================

function displayRound(round) {

    const status =
        String(
            round.status || ""
        ).toLowerCase();


    document.getElementById(
        "currentRound"
    ).textContent =
        `ROUND ${String(
            round.round_number
        ).padStart(2, "0")}`;


    document.getElementById(
        "eligibleRank"
    ).textContent =
        `${round.min_rank} – ${round.max_rank}`;


    // ----------------------------------------
    // STATUS
    // ----------------------------------------

    let statusText =
        "Counselling is active";


    let description =
        "The current counselling round is being processed.";


    let choiceStatus =
        "NOT STARTED";


    switch (status) {

        case "not_started":

            statusText =
                "COUNSELLING NOT STARTED";

            description =
                "The current round has not started yet.";

            choiceStatus =
                "NOT STARTED";

            break;


        case "preference_open":

            statusText =
                "COUNSELLING IS RUNNING";

            description =
                "Choice filling is currently open for eligible students.";

            choiceStatus =
                "OPEN";

            break;


        case "preferences_locked":

            statusText =
                "COUNSELLING IS RUNNING";

            description =
                "Choice filling has been closed. Preferences are locked.";

            choiceStatus =
                "LOCKED";

            break;


        case "allotment_completed":

            statusText =
                "COUNSELLING IS RUNNING";

            description =
                "Allotment for this round has been completed.";

            choiceStatus =
                "LOCKED";

            break;


        case "payment_period":

            statusText =
                "COUNSELLING IS RUNNING";

            description =
                "Payment period is currently active for allotted students.";

            choiceStatus =
                "COMPLETED";

            break;


        case "completed":

            statusText =
                "ROUND COMPLETED";

            description =
                "This counselling round has been completed.";

            choiceStatus =
                "COMPLETED";

            break;


        default:

            statusText =
                "COUNSELLING STATUS";

            description =
                "Current counselling status loaded.";

            choiceStatus =
                status;

    }


    document.getElementById(
        "counsellingStatus"
    ).textContent =
        statusText;


    document.getElementById(
        "statusDescription"
    ).textContent =
        description;


    document.getElementById(
        "choiceFillingStatus"
    ).textContent =
        choiceStatus;


    // ----------------------------------------
    // DATES
    // ----------------------------------------

    document.getElementById(
        "preferenceStart"
    ).textContent =
        formatDate(
            round.preference_start
        );


    document.getElementById(
        "preferenceEnd"
    ).textContent =
        formatDate(
            round.preference_end
        );


    document.getElementById(
        "allotmentAt"
    ).textContent =
        formatDate(
            round.allotment_at
        );


    document.getElementById(
        "paymentDeadline"
    ).textContent =
        formatDate(
            round.payment_deadline
        );


    document.getElementById(
        "choiceFillingTime"
    ).textContent =
        getChoiceTime(
            round
        );


    updateTimeline(status);

}


// ============================================================
// CHOICE TIME
// ============================================================

function getChoiceTime(round) {

    if (
        round.status ===
        "preference_open"
    ) {

        return (
            "Closes: " +
            formatDate(
                round.preference_end
            )
        );

    }


    if (
        round.status ===
        "preferences_locked"
    ) {

        return "Choice filling closed";

    }


    if (
        round.status ===
        "not_started"
    ) {

        return (
            "Opens: " +
            formatDate(
                round.preference_start
            )
        );

    }


    return "-";

}


// ============================================================
// TIMELINE
// ============================================================

function updateTimeline(status) {

    const steps = [

        {
            id: "stepPreference",
            active:
                [
                    "preference_open"
                ].includes(status)
        },

        {
            id: "stepLocked",
            active:
                [
                    "preferences_locked",
                    "allotment_completed",
                    "payment_period",
                    "completed"
                ].includes(status)
        },

        {
            id: "stepAllotment",
            active:
                [
                    "allotment_completed",
                    "payment_period",
                    "completed"
                ].includes(status)
        },

        {
            id: "stepPayment",
            active:
                [
                    "payment_period",
                    "completed"
                ].includes(status)
        },

        {
            id: "stepCompleted",
            active:
                status === "completed"
        }

    ];


    steps.forEach(step => {

        const element =
            document.getElementById(
                step.id
            );


        if (!element) {

            return;

        }


        if (step.active) {

            element.classList.add(
                "active"
            );

        }
        else {

            element.classList.remove(
                "active"
            );

        }

    });

}


// ============================================================
// NO COUNSELLING
// ============================================================

function showNoCounselling() {

    document.getElementById(
        "counsellingStatus"
    ).textContent =
        "COUNSELLING NOT RUNNING";


    document.getElementById(
        "statusDescription"
    ).textContent =
        "There is currently no active counselling round.";


    document.getElementById(
        "currentRound"
    ).textContent =
        "-";


    document.getElementById(
        "eligibleRank"
    ).textContent =
        "-";


    document.getElementById(
        "choiceFillingStatus"
    ).textContent =
        "NOT ACTIVE";


    document.getElementById(
        "choiceFillingTime"
    ).textContent =
        "-";

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(value) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ============================================================
// LOGOUT
// ============================================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem("token");

            localStorage.removeItem("authToken");

            localStorage.removeItem("counsellorToken");

            window.location.href =
                "login.html";

        }
    );

}


// ============================================================
// INITIALIZE
// ============================================================

async function initializeDashboard() {

    console.log(
        "Initializing counsellor dashboard..."
    );


    if (!checkAuthentication()) {

        return;

    }


    await loadCurrentRound();


    console.log(
        "Counsellor dashboard ready."
    );

}


document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);