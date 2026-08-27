// ============================================================
// GCE ERODE - COUNSELLOR DASHBOARD
// COUNSELLOR MANUAL CONTROL
// ============================================================

console.log("🔥 COUNSELLOR DASHBOARD LOADED");

const API_BASE = "http://localhost:5000";

const token = localStorage.getItem("token");

// ============================================================
// ELEMENTS
// ============================================================

const counsellorName =
    document.getElementById("counsellorName");

const logoutButton =
    document.getElementById("logoutButton");

const currentRound =
    document.getElementById("currentRound");

const roundStatus =
    document.getElementById("roundStatus");

const currentMinRank =
    document.getElementById("currentMinRank");

const currentMaxRank =
    document.getElementById("currentMaxRank");

const choiceStatus =
    document.getElementById("choiceStatus");

const allotmentStatus =
    document.getElementById("allotmentStatus");

const roundNumber =
    document.getElementById("roundNumber");

const minRank =
    document.getElementById("minRank");

const maxRank =
    document.getElementById("maxRank");

const saveRoundButton =
    document.getElementById("saveRoundButton");

const preferenceStartDate =
    document.getElementById("preferenceStartDate");

const preferenceStartTime =
    document.getElementById("preferenceStartTime");

const preferenceEndDate =
    document.getElementById("preferenceEndDate");

const preferenceEndTime =
    document.getElementById("preferenceEndTime");

const openChoiceButton =
    document.getElementById("openChoiceButton");

const closeChoiceButton =
    document.getElementById("closeChoiceButton");

const choiceAccessMessage =
    document.getElementById("choiceAccessMessage");

const lockPreferencesButton =
    document.getElementById("lockPreferencesButton");

const runAllotmentButton =
    document.getElementById("runAllotmentButton");

const publishAllotmentButton =
    document.getElementById("publishAllotmentButton");

const paymentDeadlineDate =
    document.getElementById("paymentDeadlineDate");

const paymentDeadlineTime =
    document.getElementById("paymentDeadlineTime");

const startPaymentButton =
    document.getElementById("startPaymentButton");

const completeRoundButton =
    document.getElementById("completeRoundButton");


// ============================================================
// LOGIN CHECK
// ============================================================

if (!token) {

    console.log("❌ Counsellor is not logged in");

    window.location.href = "counsellor-login.html";

}


// ============================================================
// API HELPER
// ============================================================

async function apiRequest(url, options = {}) {

    const response = await fetch(
        `${API_BASE}${url}`,
        {
            ...options,

            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",

                ...(options.headers || {})
            }
        }
    );

    let data;

    try {

        data = await response.json();

    } catch {

        data = {};

    }

    if (response.status === 401 ||
        response.status === 403) {

        alert(
            "Your counsellor session has expired or you do not have permission."
        );

        localStorage.removeItem("token");

        window.location.href =
            "counsellor-login.html";

        return null;

    }

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed"
        );

    }

    return data;

}


// ============================================================
// LOAD COUNSELLOR INFORMATION
// ============================================================

function loadCounsellorInfo() {

    try {

        const storedUser =
            localStorage.getItem("loggedInUser");

        if (!storedUser) {

            if (counsellorName) {

                counsellorName.textContent =
                    "Counsellor";

            }

            return;

        }

        const user =
            JSON.parse(storedUser);

        if (counsellorName) {

            counsellorName.textContent =
                user.name ||
                user.full_name ||
                user.email ||
                "Counsellor";

        }

    } catch (error) {

        console.error(
            "COUNSELLOR INFO ERROR:",
            error
        );

    }

}


// ============================================================
// CURRENT ROUND
// ============================================================

let activeRound = null;


// ============================================================
// LOAD CURRENT ROUND
// ============================================================

async function loadCurrentRound() {

    try {

        console.log(
            "📡 Loading current counselling round..."
        );

        const data =
            await apiRequest(
                "/api/rounds/current"
            );

        if (!data) return;

        console.log(
            "📊 CURRENT ROUND:",
            data
        );

        if (!data.success || !data.round) {

            setDefaultRoundDisplay();

            return;

        }

        activeRound =
            data.round;

        displayRound(
            activeRound
        );

    } catch (error) {

        console.error(
            "❌ CURRENT ROUND ERROR:",
            error
        );

        setDefaultRoundDisplay();

        showMessage(
            error.message,
            "error"
        );

    }

}


// ============================================================
// DISPLAY ROUND
// ============================================================

function displayRound(round) {

    if (currentRound) {

        currentRound.textContent =
            `Round ${round.round_number}`;

    }

    if (roundNumber) {

        roundNumber.value =
            round.round_number;

    }

    if (currentMinRank) {

        currentMinRank.textContent =
            round.min_rank ?? "-";

    }

    if (currentMaxRank) {

        currentMaxRank.textContent =
            round.max_rank ?? "-";

    }

    if (roundStatus) {

        roundStatus.textContent =
            formatStatus(round.status);

        updateStatusClass(
            roundStatus,
            round.status
        );

    }

    updateChoiceStatus(
        round.status
    );

    updateAllotmentStatus(
        round.status
    );

    // Fill rank controls

    if (minRank) {

        minRank.value =
            round.min_rank ?? "";

    }

    if (maxRank) {

        maxRank.value =
            round.max_rank ?? "";

    }

    // Fill opening time

    if (round.preference_start) {

        const start =
            convertDatabaseDateTime(
                round.preference_start
            );

        if (preferenceStartDate) {

            preferenceStartDate.value =
                start.date;

        }

        if (preferenceStartTime) {

            preferenceStartTime.value =
                start.time;

        }

    }

    // Fill closing time

    if (round.preference_end) {

        const end =
            convertDatabaseDateTime(
                round.preference_end
            );

        if (preferenceEndDate) {

            preferenceEndDate.value =
                end.date;

        }

        if (preferenceEndTime) {

            preferenceEndTime.value =
                end.time;

        }

    }

}


// ============================================================
// DEFAULT DISPLAY
// ============================================================

function setDefaultRoundDisplay() {

    if (currentRound)
        currentRound.textContent =
            "No Active Round";

    if (roundStatus)
        roundStatus.textContent =
            "NOT STARTED";

    if (currentMinRank)
        currentMinRank.textContent =
            "-";

    if (currentMaxRank)
        currentMaxRank.textContent =
            "-";

    if (choiceStatus)
        choiceStatus.textContent =
            "CLOSED";

    if (allotmentStatus)
        allotmentStatus.textContent =
            "PENDING";

}


// ============================================================
// STATUS FORMAT
// ============================================================

function formatStatus(status) {

    const statusMap = {

        not_started:
            "NOT STARTED",

        preference_open:
            "CHOICE FILLING OPEN",

        preferences_locked:
            "PREFERENCES LOCKED",

        allotment_completed:
            "ALLOTMENT COMPLETED",

        payment_period:
            "PAYMENT PERIOD",

        completed:
            "COMPLETED"

    };

    return (
        statusMap[status] ||
        String(status || "UNKNOWN")
            .replaceAll("_", " ")
            .toUpperCase()
    );

}


// ============================================================
// CHOICE STATUS
// ============================================================

function updateChoiceStatus(status) {

    if (!choiceStatus) return;

    if (status === "preference_open") {

        choiceStatus.textContent =
            "OPEN";

    } else {

        choiceStatus.textContent =
            "CLOSED";

    }

}


// ============================================================
// ALLOTMENT STATUS
// ============================================================

function updateAllotmentStatus(status) {

    if (!allotmentStatus) return;

    if (status === "allotment_completed" ||
        status === "payment_period" ||
        status === "completed") {

        allotmentStatus.textContent =
            "COMPLETED";

    } else {

        allotmentStatus.textContent =
            "PENDING";

    }

}


// ============================================================
// STATUS CLASS
// ============================================================

function updateStatusClass(element, status) {

    if (!element) return;

    element.classList.remove(
        "open",
        "active",
        "pending",
        "locked",
        "completed"
    );

    if (status === "preference_open") {

        element.classList.add("open");

    }

    else if (status === "preferences_locked") {

        element.classList.add("locked");

    }

    else if (status === "completed") {

        element.classList.add("completed");

    }

    else {

        element.classList.add("pending");

    }

}


// ============================================================
// DATE/TIME CONVERSION
// ============================================================

function convertDatabaseDateTime(value) {

    if (!value) {

        return {
            date: "",
            time: ""
        };

    }

    const dateObject =
        new Date(value);

    if (isNaN(dateObject.getTime())) {

        return {
            date: "",
            time: ""
        };

    }

    const date =
        dateObject
            .toISOString()
            .split("T")[0];

    const time =
        dateObject
            .toTimeString()
            .slice(0, 5);

    return {
        date,
        time
    };

}


// ============================================================
// SAVE ROUND SETTINGS
// ============================================================

if (saveRoundButton) {

    saveRoundButton.addEventListener(
        "click",
        async function () {

            const selectedRound =
                roundNumber.value;

            const minimum =
                Number(minRank.value);

            const maximum =
                Number(maxRank.value);


            if (!minimum ||
                !maximum) {

                alert(
                    "Please enter minimum and maximum rank."
                );

                return;

            }


            if (minimum < 1) {

                alert(
                    "Minimum rank must be at least 1."
                );

                return;

            }


            if (maximum < minimum) {

                alert(
                    "Maximum rank must be greater than minimum rank."
                );

                return;

            }


            if (!activeRound) {

                alert(
                    "No active counselling round found."
                );

                return;

            }


            try {

                saveRoundButton.disabled =
                    true;

                saveRoundButton.textContent =
                    "SAVING...";


                // IMPORTANT:
                // This endpoint must exist in backend.
                // We will add it if it does not exist.

                const data =
                    await apiRequest(
                        `/api/rounds/${activeRound.id}/settings`,
                        {
                            method: "PUT",

                            body: JSON.stringify({

                                round_number:
                                    Number(selectedRound),

                                min_rank:
                                    minimum,

                                max_rank:
                                    maximum

                            })
                        }
                    );


                if (!data) return;


                alert(
                    "Round settings saved successfully."
                );


                await loadCurrentRound();


            } catch (error) {

                console.error(
                    "SAVE ROUND ERROR:",
                    error
                );

                alert(
                    error.message
                );

            } finally {

                saveRoundButton.disabled =
                    false;

                saveRoundButton.textContent =
                    "SAVE ROUND SETTINGS";

            }

        }
    );

}


// ============================================================
// OPEN CHOICE FILLING
// ============================================================

if (openChoiceButton) {

    openChoiceButton.addEventListener(
        "click",
        async function () {

            if (!activeRound) {

                alert(
                    "No active counselling round found."
                );

                return;

            }


            const startDate =
                preferenceStartDate.value;

            const startTime =
                preferenceStartTime.value;


            if (!startDate ||
                !startTime) {

                alert(
                    "Please set the choice filling opening date and time first."
                );

                return;

            }


            const startDateTime =
                `${startDate} ${startTime}:00`;


            const confirmed =
                confirm(
                    `Open choice filling for Round ${activeRound.round_number}?\n\nOpening time: ${startDate} ${startTime}`
                );


            if (!confirmed) return;


            try {

                openChoiceButton.disabled =
                    true;

                openChoiceButton.textContent =
                    "OPENING...";


                const data =
                    await apiRequest(
                        `/api/rounds/${activeRound.id}/open-preferences`,
                        {
                            method: "POST",

                            body: JSON.stringify({

                                preference_start:
                                    startDateTime

                            })
                        }
                    );


                if (!data) return;


                alert(
                    "Choice filling opened successfully."
                );


                await loadCurrentRound();


            } catch (error) {

                console.error(
                    "OPEN CHOICE ERROR:",
                    error
                );

                alert(
                    error.message
                );

            } finally {

                openChoiceButton.disabled =
                    false;

                openChoiceButton.textContent =
                    "OPEN CHOICE FILLING";

            }

        }
    );

}


// ============================================================
// CLOSE CHOICE FILLING
// ============================================================

if (closeChoiceButton) {

    closeChoiceButton.addEventListener(
        "click",
        async function () {

            if (!activeRound) {

                alert(
                    "No active counselling round found."
                );

                return;

            }


            if (
                activeRound.status !==
                "preference_open"
            ) {

                alert(
                    "Choice filling is not currently open."
                );

                return;

            }


            const endDate =
                preferenceEndDate.value;

            const endTime =
                preferenceEndTime.value;


            if (!endDate ||
                !endTime) {

                alert(
                    "Please set the choice filling closing date and time first."
                );

                return;

            }


            const endDateTime =
                `${endDate} ${endTime}:00`;


            const confirmed =
                confirm(
                    `Close choice filling for Round ${activeRound.round_number}?\n\nClosing time: ${endDate} ${endTime}`
                );


            if (!confirmed) return;


            try {

                closeChoiceButton.disabled =
                    true;

                closeChoiceButton.textContent =
                    "CLOSING...";


                // The backend lock endpoint is used.
                // IMPORTANT: this is manual.
                // There is NO automatic locking here.

                const data =
                    await apiRequest(
                        `/api/rounds/${activeRound.id}/lock-preferences`,
                        {
                            method: "POST",

                            body: JSON.stringify({

                                preference_end:
                                    endDateTime

                            })
                        }
                    );


                if (!data) return;


                alert(
                    "Choice filling closed successfully."
                );


                await loadCurrentRound();


            } catch (error) {

                console.error(
                    "CLOSE CHOICE ERROR:",
                    error
                );

                alert(
                    error.message
                );

            } finally {

                closeChoiceButton.disabled =
                    false;

                closeChoiceButton.textContent =
                    "CLOSE CHOICE FILLING";

            }

        }
    );

}


// ============================================================
// LOCK PREFERENCES
// ============================================================

if (lockPreferencesButton) {

    lockPreferencesButton.addEventListener(
        "click",
        async function () {

            if (!activeRound) {

                alert(
                    "No active counselling round found."
                );

                return;

            }


            if (
                activeRound.status !==
                "preference_open"
            ) {

                alert(
                    "Preferences can only be locked while choice filling is open."
                );

                return;

            }


            const confirmed =
                confirm(
                    "Are you sure you want to lock all student preferences?\n\nStudents will no longer be able to modify their choices."
                );


            if (!confirmed) return;


            try {

                lockPreferencesButton.disabled =
                    true;

                lockPreferencesButton.textContent =
                    "LOCKING...";


                const data =
                    await apiRequest(
                        `/api/rounds/${activeRound.id}/lock-preferences`,
                        {
                            method: "POST"
                        }
                    );


                if (!data) return;


                alert(
                    "Student preferences have been locked."
                );


                await loadCurrentRound();


            } catch (error) {

                console.error(
                    "LOCK PREFERENCES ERROR:",
                    error
                );

                alert(
                    error.message
                );

            } finally {

                lockPreferencesButton.disabled =
                    false;

                lockPreferencesButton.textContent =
                    "LOCK";

            }

        }
    );

}


// ============================================================
// RUN ALLOTMENT
// ============================================================

if (runAllotmentButton) {

    runAllotmentButton.addEventListener(
        "click",
        async function () {

            if (!activeRound) {

                alert(
                    "No active counselling round found."
                );

                return;

            }


            if (
                activeRound.status !==
                "preferences_locked"
            ) {

                alert(
                    "You must lock student preferences before running allotment."
                );

                return;

            }


            const confirmed =
                confirm(
                    "Run automatic seat allotment for this round?"
                );


            if (!confirmed) return;


            try {

                runAllotmentButton.disabled =
                    true;

                runAllotmentButton.textContent =
                    "RUNNING...";


                // IMPORTANT:
                // This endpoint must exist in backend.
                // We will connect it to the allotment algorithm.

                const data =
                    await apiRequest(
                        `/api/allotments/run/${activeRound.id}`,
                        {
                            method: "POST"
                        }
                    );


                if (!data) return;


                alert(
                    data.message ||
                    "Allotment completed successfully."
                );


                await loadCurrentRound();


            } catch (error) {

                console.error(
                    "RUN ALLOTMENT ERROR:",
                    error
                );

                alert(
                    error.message
                );

            } finally {

                runAllotmentButton.disabled =
                    false;

                runAllotmentButton.textContent =
                    "RUN";

            }

        }
    );

}


// ============================================================
// PUBLISH ALLOTMENT
// ============================================================

if (publishAllotmentButton) {

    publishAllotmentButton.addEventListener(
        "click",
        async function () {

            if (!activeRound) {

                alert(
                    "No active counselling round found."
                );

                return;

            }


            if (
                activeRound.status !==
                "allotment_completed"
            ) {

                alert(
                    "Allotment must be completed before publishing."
                );

                return;

            }


            const confirmed =
                confirm(
                    "Publish the allotment results to students?"
                );


            if (!confirmed) return;


            try {

                publishAllotmentButton.disabled =
                    true;

                publishAllotmentButton.textContent =
                    "PUBLISHING...";


                // Backend endpoint to be connected.

                const data =
                    await apiRequest(
                        `/api/allotments/${activeRound.id}/publish`,
                        {
                            method: "POST"
                        }
                    );


                if (!data) return;


                alert(
                    data.message ||
                    "Allotment published successfully."
                );


                await loadCurrentRound();


            } catch (error) {

                console.error(
                    "PUBLISH ALLOTMENT ERROR:",
                    error
                );

                alert(
                    error.message
                );

            } finally {

                publishAllotmentButton.disabled =
                    false;

                publishAllotmentButton.textContent =
                    "PUBLISH";

            }

        }
    );

}


// ============================================================
// START PAYMENT PERIOD
// ============================================================

if (startPaymentButton) {

    startPaymentButton.addEventListener(
        "click",
        async function () {

            if (!activeRound) {

                alert(
                    "No active counselling round found."
                );

                return;

            }


            if (
                activeRound.status !==
                "allotment_completed"
            ) {

                alert(
                    "Allotment must be completed before starting payment."
                );

                return;

            }


            const deadlineDate =
                paymentDeadlineDate.value;

            const deadlineTime =
                paymentDeadlineTime.value;


            if (!deadlineDate ||
                !deadlineTime) {

                alert(
                    "Please enter the payment deadline."
                );

                return;

            }


            const paymentDeadline =
                `${deadlineDate} ${deadlineTime}:00`;


            const confirmed =
                confirm(
                    `Start payment period?\n\nPayment deadline: ${deadlineDate} ${deadlineTime}`
                );


            if (!confirmed) return;


            try {

                startPaymentButton.disabled =
                    true;

                startPaymentButton.textContent =
                    "STARTING...";


                const data =
                    await apiRequest(
                        `/api/rounds/${activeRound.id}/payment-period`,
                        {
                            method: "POST",

                            body: JSON.stringify({

                                payment_deadline:
                                    paymentDeadline

                            })
                        }
                    );


                if (!data) return;


                alert(
                    "Payment period started successfully."
                );


                await loadCurrentRound();


            } catch (error) {

                console.error(
                    "PAYMENT PERIOD ERROR:",
                    error
                );

                alert(
                    error.message
                );

            } finally {

                startPaymentButton.disabled =
                    false;

                startPaymentButton.textContent =
                    "START PAYMENT PERIOD";

            }

        }
    );

}


// ============================================================
// COMPLETE ROUND
// ============================================================

if (completeRoundButton) {

    completeRoundButton.addEventListener(
        "click",
        async function () {

            if (!activeRound) {

                alert(
                    "No active counselling round found."
                );

                return;

            }


            if (
                activeRound.status !==
                "payment_period"
            ) {

                alert(
                    "The payment period must be active before completing the round."
                );

                return;

            }


            const confirmed =
                confirm(
                    "Are you sure you want to complete this counselling round?"
                );


            if (!confirmed) return;


            try {

                completeRoundButton.disabled =
                    true;

                completeRoundButton.textContent =
                    "COMPLETING...";


                const data =
                    await apiRequest(
                        `/api/rounds/${activeRound.id}/complete`,
                        {
                            method: "POST"
                        }
                    );


                if (!data) return;


                alert(
                    "Counselling round completed successfully."
                );


                await loadCurrentRound();


            } catch (error) {

                console.error(
                    "COMPLETE ROUND ERROR:",
                    error
                );

                alert(
                    error.message
                );

            } finally {

                completeRoundButton.disabled =
                    false;

                completeRoundButton.textContent =
                    "COMPLETE ROUND";

            }

        }
    );

}


// ============================================================
// ACCESS MESSAGE
// ============================================================

function updateAccessMessage() {

    if (!choiceAccessMessage) return;

    if (!activeRound) {

        choiceAccessMessage.textContent =
            "Choice filling is currently closed.";

        return;

    }


    switch (activeRound.status) {

        case "preference_open":

            choiceAccessMessage.textContent =
                "Choice filling is OPEN. Students can enter and submit their preferences.";

            break;


        case "preferences_locked":

            choiceAccessMessage.textContent =
                "Choice filling is CLOSED. Preferences have been locked by the counsellor.";

            break;


        case "allotment_completed":

            choiceAccessMessage.textContent =
                "Choice filling is CLOSED. Allotment has been completed.";

            break;


        case "payment_period":

            choiceAccessMessage.textContent =
                "Choice filling is CLOSED. Payment period is active.";

            break;


        case "completed":

            choiceAccessMessage.textContent =
                "This counselling round has been completed.";

            break;


        default:

            choiceAccessMessage.textContent =
                "Choice filling is currently closed.";

    }

}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(message, type = "info") {

    console.log(
        `[${type.toUpperCase()}]`,
        message
    );

}


// ============================================================
// REFRESH AFTER ROUND LOAD
// ============================================================

// Override display function so access message
// is updated every time round information changes.

const originalDisplayRound =
    displayRound;

displayRound = function (round) {

    originalDisplayRound(round);

    updateAccessMessage();

};


// ============================================================
// LOGOUT
// ============================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmed) return;


            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "loggedInUser"
            );

            localStorage.removeItem(
                "loggedInCounsellor"
            );

            localStorage.removeItem(
                "counsellorLoggedIn"
            );


            window.location.href =
                "counsellor-login.html";

        }
    );

}


// ============================================================
// START DASHBOARD
// ============================================================

loadCounsellorInfo();

loadCurrentRound();

console.log(
    "✅ COUNSELLOR DASHBOARD READY"
);