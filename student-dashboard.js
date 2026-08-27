// ==========================================
// STUDENT DASHBOARD
// ==========================================

console.log("🔥 STUDENT DASHBOARD LOADED");

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
// ELEMENTS
// ==========================================

const studentName =
    document.getElementById("studentName");

const welcomeName =
    document.getElementById("welcomeName");

const studentNameCard =
    document.getElementById("studentNameCard");

const studentRank =
    document.getElementById("studentRank");

const applicationNumber =
    document.getElementById("applicationNumber");

const applicationStatus =
    document.getElementById("applicationStatus");

const studentCommunity =
    document.getElementById("studentCommunity");

const studentCutoff =
    document.getElementById("studentCutoff");

const currentRound =
    document.getElementById("currentRound");

const roundNumber =
    document.getElementById("roundNumber");

const eligibleRank =
    document.getElementById("eligibleRank");

const yourRank =
    document.getElementById("yourRank");

const roundMessage =
    document.getElementById("roundMessage");

const choiceFillingButton =
    document.getElementById("choiceFillingButton");

const startChoiceFilling =
    document.getElementById("startChoiceFilling");

const logoutButton =
    document.getElementById("logoutButton");


// ==========================================
// LOGIN CHECK
// ==========================================

if (!token) {

    console.log("❌ No login token found");

    window.location.href =
        "student-login.html";

}


// ==========================================
// AUTH HEADERS
// ==========================================

function getHeaders() {

    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${getToken()}`

    };

}


// ==========================================
// LOAD STUDENT PROFILE
// ==========================================

async function loadStudentProfile() {

    try {

        console.log(
            "📡 Loading student profile..."
        );


        const response =
            await fetch(
                `${API_BASE}/api/student/profile`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        console.log(
            "📊 Profile response status:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "📊 STUDENT PROFILE:",
            data
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load student information"
            );

        }


        const student =
            data.student;


        if (!student) {

            throw new Error(
                "Student information is missing"
            );

        }


        console.log(
            "✅ STUDENT:",
            student
        );


        // =====================================
        // NAME
        // =====================================

        const name =
            student.name || "Student";


        if (studentName) {

            studentName.textContent =
                name;

        }


        if (welcomeName) {

            welcomeName.textContent =
                name;

        }


        if (studentNameCard) {

            studentNameCard.textContent =
                name;

        }


        // =====================================
        // RANK
        // =====================================

        if (studentRank) {

            if (
                student.rank_number !== null &&
                student.rank_number !== undefined &&
                student.rank_number !== ""
            ) {

                studentRank.textContent =
                    "#" + student.rank_number;

            } else {

                studentRank.textContent =
                    "-";

            }

        }


        // =====================================
        // APPLICATION NUMBER
        // =====================================

        if (applicationNumber) {

            applicationNumber.textContent =
                student.application_number || "-";

        }


        // =====================================
        // APPLICATION STATUS
        // =====================================

        if (applicationStatus) {

            applicationStatus.textContent =
                student.application_status
                    ? String(
                        student.application_status
                    ).toUpperCase()
                    : "PENDING";

        }


        // =====================================
        // COMMUNITY
        // =====================================

        if (studentCommunity) {

            studentCommunity.textContent =
                student.community || "-";

        }


        // =====================================
        // CUTOFF
        // =====================================

        if (studentCutoff) {

            if (
                student.cutoff_mark !== null &&
                student.cutoff_mark !== undefined &&
                student.cutoff_mark !== ""
            ) {

                const cutoff =
                    Number(
                        student.cutoff_mark
                    );


                studentCutoff.textContent =
                    Number.isNaN(cutoff)
                        ? student.cutoff_mark
                        : cutoff.toFixed(2);

            } else {

                studentCutoff.textContent =
                    "-";

            }

        }


        // =====================================
        // SAVE STUDENT
        // =====================================

        localStorage.setItem(
            "loggedInStudent",
            JSON.stringify(student)
        );


        console.log(
            "✅ STUDENT INFORMATION LOADED"
        );


        // =====================================
        // LOAD ROUND
        // =====================================

        await loadCurrentRound(
            student
        );

    }

    catch (error) {

        console.error(
            "❌ STUDENT PROFILE ERROR:",
            error
        );


        if (studentName) {

            studentName.textContent =
                "Unable to load";

        }


        if (welcomeName) {

            welcomeName.textContent =
                "Unable to load";

        }


        if (studentNameCard) {

            studentNameCard.textContent =
                "Unable to load";

        }


        if (roundMessage) {

            roundMessage.textContent =
                "Unable to load student information.";

        }


        /*
         * IMPORTANT:
         *
         * Do not permanently disable
         * the choice filling button just
         * because the profile request failed.
         *
         * The button can still take the
         * student to choice-filling.html.
         */

        enableChoiceFilling();

    }

}


// ==========================================
// LOAD CURRENT COUNSELLING ROUND
// ==========================================

async function loadCurrentRound(student) {

    try {

        console.log(
            "📡 Loading current counselling round..."
        );


        const response =
            await fetch(
                `${API_BASE}/api/rounds/current`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        console.log(
            "📊 Round response status:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "📊 CURRENT ROUND:",
            data
        );


        // =====================================
        // ROUND API FAILED
        // =====================================

        if (
            !response.ok ||
            !data.success
        ) {

            console.warn(
                "⚠️ Current round unavailable"
            );


            if (currentRound) {

                currentRound.textContent =
                    "ROUND INFORMATION UNAVAILABLE";

            }


            if (roundMessage) {

                roundMessage.textContent =
                    "You can enter the choice filling page.";

            }


            // IMPORTANT:
            // Never block navigation because
            // round API failed.

            enableChoiceFilling();

            return;

        }


        const round =
            data.round;


        if (!round) {

            throw new Error(
                "Round information is missing"
            );

        }


        // =====================================
        // STUDENT RANK
        // =====================================

        const myRank =
            Number(
                student.rank_number
            );


        const minRank =
            Number(
                round.min_rank
            );


        const maxRank =
            Number(
                round.max_rank
            );


        // =====================================
        // SHOW ROUND
        // =====================================

        if (currentRound) {

            currentRound.textContent =
                `ROUND ${round.round_number}`;

        }


        if (roundNumber) {

            roundNumber.textContent =
                round.round_number;

        }


        if (eligibleRank) {

            if (
                !Number.isNaN(minRank) &&
                !Number.isNaN(maxRank)
            ) {

                eligibleRank.textContent =
                    `${minRank} - ${maxRank}`;

            } else {

                eligibleRank.textContent =
                    "-";

            }

        }


        if (yourRank) {

            yourRank.textContent =
                Number.isNaN(myRank)
                    ? "-"
                    : myRank;

        }


        // =====================================
        // CHECK ELIGIBILITY
        // =====================================

        const eligible =
            !Number.isNaN(myRank) &&
            !Number.isNaN(minRank) &&
            !Number.isNaN(maxRank) &&
            myRank >= minRank &&
            myRank <= maxRank;


        console.log(
            "🎯 Student Rank:",
            myRank
        );


        console.log(
            "🎯 Eligible:",
            eligible
        );


        console.log(
            "🎯 Round Status:",
            round.status
        );


        // =====================================
        // PREFERENCE OPEN
        // =====================================

        if (
            round.status ===
            "preference_open"
        ) {

            if (roundMessage) {

                if (eligible) {

                    roundMessage.textContent =
                        "Your rank is eligible for this counselling round. Choice filling is open.";

                }

                else if (
                    !Number.isNaN(myRank) &&
                    myRank < minRank
                ) {

                    roundMessage.textContent =
                        "Your rank was processed in an earlier counselling round.";

                }

                else {

                    roundMessage.textContent =
                        "Your rank is not included in this counselling round.";

                }

            }


            // Student can still enter
            // choice filling.

            enableChoiceFilling();

        }


        // =====================================
        // PREFERENCES LOCKED
        // =====================================

        else if (
            round.status ===
            "preferences_locked"
        ) {

            if (roundMessage) {

                roundMessage.textContent =
                    "Choice filling for this round has been locked.";

            }


            enableChoiceFilling();

        }


        // =====================================
        // ALLOTMENT COMPLETED
        // =====================================

        else if (
            round.status ===
            "allotment_completed"
        ) {

            if (roundMessage) {

                roundMessage.textContent =
                    "Automatic allotment has been completed for this round.";

            }


            /*
             * IMPORTANT:
             *
             * Do NOT show:
             * ALLOTMENT PUBLISHED
             *
             * on the choice filling button.
             *
             * The button must remain:
             *
             * ENTER CHOICE FILLING →
             */

            enableChoiceFilling();

        }


        // =====================================
        // PAYMENT PERIOD
        // =====================================

        else if (
            round.status ===
            "payment_period"
        ) {

            if (roundMessage) {

                roundMessage.textContent =
                    "Payment period is currently active.";

            }


            enableChoiceFilling();

        }


        // =====================================
        // COMPLETED
        // =====================================

        else if (
            round.status ===
            "completed"
        ) {

            if (roundMessage) {

                roundMessage.textContent =
                    "This counselling round has been completed.";

            }


            /*
             * Keep choice filling navigation.
             */

            enableChoiceFilling();

        }


        // =====================================
        // NOT STARTED / OTHER STATUS
        // =====================================

        else {

            if (roundMessage) {

                roundMessage.textContent =
                    "Counselling round information is available.";

            }


            /*
             * Still allow navigation.
             */

            enableChoiceFilling();

        }

    }

    catch (error) {

        console.error(
            "❌ CURRENT ROUND ERROR:",
            error
        );


        if (currentRound) {

            currentRound.textContent =
                "ROUND INFORMATION UNAVAILABLE";

        }


        if (roundMessage) {

            roundMessage.textContent =
                "You can enter the choice filling page.";

        }


        /*
         * Even if the round API fails,
         * keep the button usable.
         */

        enableChoiceFilling();

    }

}


// ==========================================
// ENABLE CHOICE FILLING
// ==========================================

function enableChoiceFilling() {

    console.log(
        "🟢 CHOICE FILLING: ENABLED"
    );


    // =====================================
    // MAIN CHOICE FILLING BUTTON
    // =====================================

    if (choiceFillingButton) {

        choiceFillingButton.disabled =
            false;


        choiceFillingButton.textContent =
            "ENTER CHOICE FILLING →";


        choiceFillingButton.onclick =
            function () {

                console.log(
                    "➡️ Opening choice-filling.html"
                );


                window.location.href =
                    "choice-filling.html";

            };

    }


    // =====================================
    // ROUND ENTER BUTTON
    // =====================================

    if (startChoiceFilling) {

        startChoiceFilling.disabled =
            false;


        startChoiceFilling.textContent =
            "ENTER CHOICE FILLING →";


        startChoiceFilling.onclick =
            function () {

                console.log(
                    "➡️ Opening choice-filling.html"
                );


                window.location.href =
                    "choice-filling.html";

            };

    }

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            console.log(
                "🚪 Logging out..."
            );


            localStorage.removeItem(
                "token"
            );


            localStorage.removeItem(
                "authToken"
            );


            localStorage.removeItem(
                "studentToken"
            );


            localStorage.removeItem(
                "loggedInStudent"
            );


            localStorage.removeItem(
                "studentLoggedIn"
            );


            window.location.href =
                "student-login.html";

        }
    );

}


// ==========================================
// START DASHBOARD
// ==========================================

async function initializeDashboard() {

    console.log(
        "🚀 INITIALIZING STUDENT DASHBOARD"
    );


    if (!getToken()) {

        console.log(
            "❌ Authentication token missing"
        );


        window.location.href =
            "student-login.html";


        return;

    }


    /*
     * Set the choice filling buttons
     * immediately so they are never stuck
     * permanently because of an API error.
     */

    enableChoiceFilling();


    /*
     * Then load the real student information.
     */

    await loadStudentProfile();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );

} else {

    initializeDashboard();

}