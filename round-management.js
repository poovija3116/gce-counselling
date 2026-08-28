// ============================================================
// GCE ERODE - COUNSELLING ROUND MANAGEMENT
// COUNSELLOR CONTROLLED
// ============================================================

console.log("🔥 ROUND MANAGEMENT SCRIPT LOADED");


// ============================================================
// API
// ============================================================

const API_BASE_URL = "http://localhost:5000";


// ============================================================
// DOM
// ============================================================

const numberOfRounds =
    document.getElementById("numberOfRounds");

const generateButton =
    document.getElementById("generateRoundsButton");

const roundContainer =
    document.getElementById("roundContainer");

const saveButton =
    document.getElementById("saveRoundsButton");

const saveMessage =
    document.getElementById("saveMessage");

const overallStatus =
    document.getElementById("overallStatus");

const currentRoundNumber =
    document.getElementById("currentRoundNumber");

const currentRoundDescription =
    document.getElementById("currentRoundDescription");

const currentRoundStatus =
    document.getElementById("currentRoundStatus");

const controlRoundSelect =
    document.getElementById("controlRoundSelect");

const selectedRoundNumber =
    document.getElementById("selectedRoundNumber");

const selectedRoundRank =
    document.getElementById("selectedRoundRank");

const selectedRoundStatus =
    document.getElementById("selectedRoundStatus");

const selectedChoiceStatus =
    document.getElementById("selectedChoiceStatus");

const preferenceStart =
    document.getElementById("preferenceStart");

const preferenceEnd =
    document.getElementById("preferenceEnd");

const allotmentAt =
    document.getElementById("allotmentAt");

const paymentDeadline =
    document.getElementById("paymentDeadline");

const updateRoundSettingsButton =
    document.getElementById("updateRoundSettingsButton");

const openChoiceFillingButton =
    document.getElementById("openChoiceFillingButton");

const lockChoiceFillingButton =
    document.getElementById("lockChoiceFillingButton");

const allotmentCompletedButton =
    document.getElementById("allotmentCompletedButton");

const paymentPeriodButton =
    document.getElementById("paymentPeriodButton");

const completeRoundButton =
    document.getElementById("completeRoundButton");

const controlMessage =
    document.getElementById("controlMessage");


// ============================================================
// DATA
// ============================================================

let rounds = [];

let selectedRound = null;


// ============================================================
// TOKEN
// ============================================================

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("counsellorToken")
    );

}


// ============================================================
// AUTH CHECK
// ============================================================

function checkAuthentication() {

    const token = getToken();

    if (!token) {

        alert(
            "Your counsellor login session has expired. Please login again."
        );

        window.location.href =
            "student-login.html";

        return false;

    }

    return true;

}


// ============================================================
// HEADERS
// ============================================================

function getHeaders() {

    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${getToken()}`

    };

}


// ============================================================
// API HELPER
// ============================================================

async function apiRequest(
    url,
    options = {}
) {

    const response =
        await fetch(
            `${API_BASE_URL}${url}`,
            {
                ...options,

                headers: {
                    ...getHeaders(),
                    ...(options.headers || {})
                }
            }
        );


    let data = {};

    try {

        data =
            await response.json();

    } catch (error) {

        data = {};

    }


    console.log(
        "API REQUEST:",
        url,
        response.status,
        data
    );


    if (!response.ok || !data.success) {

        throw new Error(
            data.message ||
            `Request failed with status ${response.status}`
        );

    }


    return data;

}


// ============================================================
// LOAD ALL ROUNDS
// ============================================================

async function loadRounds() {

    try {

        setControlMessage(
            "Loading counselling rounds..."
        );


        const data =
            await apiRequest(
                "/api/rounds"
            );


        rounds =
            data.rounds || [];


        renderRoundCards();

        populateRoundSelector();

        updateOverallStatus();

        updateCurrentRound();


        if (rounds.length > 0) {

            const activeRound =
                rounds.find(
                    round =>
                        round.status !==
                        "completed"
                );


            if (activeRound) {

                controlRoundSelect.value =
                    String(
                        activeRound.id
                    );

                selectRound(
                    activeRound.id
                );

            }

        }


        setControlMessage(
            ""
        );

    }

    catch (error) {

        console.error(
            "LOAD ROUNDS ERROR:",
            error
        );


        setControlMessage(
            error.message,
            true
        );

    }

}


// ============================================================
// RENDER ROUND CARDS
// ============================================================

function renderRoundCards() {

    if (!roundContainer) {

        return;

    }


    roundContainer.innerHTML = "";


    if (rounds.length === 0) {

        roundContainer.innerHTML = `

            <div class="loading">
                No counselling rounds found.
            </div>

        `;

        return;

    }


    rounds.forEach(
        round => {

            const card =
                document.createElement("div");


            card.className =
                "round-card";


            card.dataset.roundId =
                round.id;


            card.innerHTML = `

                <div class="round-number">

                    ROUND
                    ${String(
                        round.round_number
                    ).padStart(2, "0")}

                </div>


                <div class="rank-input">

                    <label>
                        FROM RANK
                    </label>

                    <input
                        type="number"
                        class="from-rank"
                        value="${round.min_rank}"
                        min="1">

                </div>


                <div class="arrow">
                    →
                </div>


                <div class="rank-input">

                    <label>
                        TO RANK
                    </label>

                    <input
                        type="number"
                        class="to-rank"
                        value="${round.max_rank}"
                        min="1">

                </div>


                <div class="student-count">

                    <span>
                        STATUS
                    </span>

                    <strong class="student-number">

                        ${escapeHTML(
                            formatStatus(
                                round.status
                            )
                        )}

                    </strong>

                </div>

            `;


            roundContainer.appendChild(
                card
            );

        }
    );

}


// ============================================================
// POPULATE ROUND SELECT
// ============================================================

function populateRoundSelector() {

    if (!controlRoundSelect) {

        return;

    }


    controlRoundSelect.innerHTML = `

        <option value="">
            Select a counselling round
        </option>

    `;


    rounds.forEach(
        round => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                round.id;


            option.textContent =
                `Round ${round.round_number} - Rank ${round.min_rank}-${round.max_rank} - ${formatStatus(round.status)}`;


            controlRoundSelect.appendChild(
                option
            );

        }
    );

}


// ============================================================
// SELECT ROUND
// ============================================================

function selectRound(roundId) {

    const id =
        Number(roundId);


    selectedRound =
        rounds.find(
            round =>
                Number(round.id) === id
        );


    if (!selectedRound) {

        clearSelectedRound();

        return;

    }


    selectedRoundNumber.textContent =
        `ROUND ${String(
            selectedRound.round_number
        ).padStart(2, "0")}`;


    selectedRoundRank.textContent =
        `${selectedRound.min_rank} - ${selectedRound.max_rank}`;


    selectedRoundStatus.textContent =
        formatStatus(
            selectedRound.status
        );


    selectedChoiceStatus.textContent =
        getChoiceStatus(
            selectedRound.status
        );


    preferenceStart.value =
        toDateTimeLocal(
            selectedRound.preference_start
        );


    preferenceEnd.value =
        toDateTimeLocal(
            selectedRound.preference_end
        );


    allotmentAt.value =
        toDateTimeLocal(
            selectedRound.allotment_at
        );


    paymentDeadline.value =
        toDateTimeLocal(
            selectedRound.payment_deadline
        );


    updateControlButtons();

}


// ============================================================
// CLEAR SELECTED ROUND
// ============================================================

function clearSelectedRound() {

    selectedRound =
        null;


    if (selectedRoundNumber) {

        selectedRoundNumber.textContent =
            "-";

    }


    if (selectedRoundRank) {

        selectedRoundRank.textContent =
            "-";

    }


    if (selectedRoundStatus) {

        selectedRoundStatus.textContent =
            "-";

    }


    if (selectedChoiceStatus) {

        selectedChoiceStatus.textContent =
            "-";

    }


    if (preferenceStart) {

        preferenceStart.value = "";

    }


    if (preferenceEnd) {

        preferenceEnd.value = "";

    }


    if (allotmentAt) {

        allotmentAt.value = "";

    }


    if (paymentDeadline) {

        paymentDeadline.value = "";

    }


    updateControlButtons();

}


// ============================================================
// UPDATE CONTROL BUTTONS
// ============================================================

function updateControlButtons() {

    if (!selectedRound) {

        disableAllControlButtons();

        return;

    }


    const status =
        selectedRound.status;


    disableAllControlButtons();


    if (status === "not_started") {

        updateRoundSettingsButton.disabled =
            false;

        openChoiceFillingButton.disabled =
            false;

        return;

    }


    if (status === "preference_open") {

        lockChoiceFillingButton.disabled =
            false;

        return;

    }


    if (status === "preferences_locked") {

        allotmentCompletedButton.disabled =
            false;

        return;

    }


    if (status === "allotment_completed") {

        paymentPeriodButton.disabled =
            false;

        return;

    }


    if (status === "payment_period") {

        completeRoundButton.disabled =
            false;

        return;

    }

}


// ============================================================
// DISABLE ALL CONTROL BUTTONS
// ============================================================

function disableAllControlButtons() {

    const buttons = [

        updateRoundSettingsButton,

        openChoiceFillingButton,

        lockChoiceFillingButton,

        allotmentCompletedButton,

        paymentPeriodButton,

        completeRoundButton

    ];


    buttons.forEach(
        button => {

            if (button) {

                button.disabled =
                    true;

            }

        }
    );

}


// ============================================================
// GENERATE ROUNDS
// ============================================================

if (generateButton) {

    generateButton.addEventListener(
        "click",
        function () {

            const totalRounds =
                Number(
                    numberOfRounds.value
                );


            if (
                totalRounds < 1 ||
                totalRounds > 20
            ) {

                alert(
                    "Enter a valid number of rounds."
                );

                return;

            }


            roundContainer.innerHTML =
                "";


            let startRank =
                1;


            const studentsPerRound =
                100;


            for (
                let i = 1;
                i <= totalRounds;
                i++
            ) {

                const endRank =
                    startRank +
                    studentsPerRound -
                    1;


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "round-card";


                card.innerHTML = `

                    <div class="round-number">

                        ROUND
                        ${String(i).padStart(2, "0")}

                    </div>


                    <div class="rank-input">

                        <label>
                            FROM RANK
                        </label>

                        <input
                            type="number"
                            class="from-rank"
                            value="${startRank}"
                            min="1">

                    </div>


                    <div class="arrow">
                        →
                    </div>


                    <div class="rank-input">

                        <label>
                            TO RANK
                        </label>

                        <input
                            type="number"
                            class="to-rank"
                            value="${endRank}"
                            min="1">

                    </div>


                    <div class="student-count">

                        <span>
                            STUDENTS
                        </span>

                        <strong class="student-number">

                            ${studentsPerRound}

                        </strong>

                    </div>

                `;


                roundContainer.appendChild(
                    card
                );


                startRank =
                    endRank + 1;

            }


            addCalculationListeners();

        }
    );

}


// ============================================================
// UPDATE STUDENT COUNT
// ============================================================

function addCalculationListeners() {

    const roundCards =
        document.querySelectorAll(
            ".round-card"
        );


    roundCards.forEach(
        card => {

            const from =
                card.querySelector(
                    ".from-rank"
                );


            const to =
                card.querySelector(
                    ".to-rank"
                );


            const countElement =
                card.querySelector(
                    ".student-number"
                );


            if (
                !from ||
                !to ||
                !countElement
            ) {

                return;

            }


            function updateCount() {

                const fromValue =
                    Number(
                        from.value
                    );


                const toValue =
                    Number(
                        to.value
                    );


                if (
                    fromValue > 0 &&
                    toValue >= fromValue
                ) {

                    countElement.textContent =
                        toValue -
                        fromValue +
                        1;

                } else {

                    countElement.textContent =
                        0;

                }

            }


            from.addEventListener(
                "input",
                updateCount
            );


            to.addEventListener(
                "input",
                updateCount
            );


            updateCount();

        }
    );

}


// ============================================================
// SAVE GENERATED ROUND SETTINGS
// ============================================================

if (saveButton) {

    saveButton.addEventListener(
        "click",
        async function () {

            const cards =
                document.querySelectorAll(
                    "#roundContainer .round-card"
                );


            if (cards.length === 0) {

                alert(
                    "Generate rounds first."
                );

                return;

            }


            try {

                saveButton.disabled =
                    true;


                saveMessage.textContent =
                    "Saving round settings...";


                // --------------------------------------------
                // Update each existing round
                // --------------------------------------------

                for (
                    let index = 0;
                    index < cards.length;
                    index++
                ) {

                    const round =
                        rounds[index];


                    if (!round) {

                        continue;

                    }


                    const from =
                        Number(
                            cards[index]
                                .querySelector(
                                    ".from-rank"
                                )
                                .value
                        );


                    const to =
                        Number(
                            cards[index]
                                .querySelector(
                                    ".to-rank"
                                )
                                .value
                        );


                    if (
                        !Number.isInteger(from) ||
                        !Number.isInteger(to) ||
                        from <= 0 ||
                        to < from
                    ) {

                        throw new Error(
                            `Invalid rank range for Round ${index + 1}`
                        );

                    }


                    await apiRequest(
                        `/api/rounds/${round.id}/settings`,
                        {
                            method: "PUT",

                            body:
                                JSON.stringify({
                                    min_rank: from,
                                    max_rank: to
                                })
                        }
                    );

                }


                saveMessage.textContent =
                    "✓ Round settings saved successfully.";


                await loadRounds();

            }

            catch (error) {

                console.error(
                    "SAVE ROUND SETTINGS ERROR:",
                    error
                );


                saveMessage.textContent =
                    `❌ ${error.message}`;

            }

            finally {

                saveButton.disabled =
                    false;

            }

        }
    );

}


// ============================================================
// ROUND SELECTOR
// ============================================================

if (controlRoundSelect) {

    controlRoundSelect.addEventListener(
        "change",
        function () {

            selectRound(
                this.value
            );

        }
    );

}


// ============================================================
// UPDATE SELECTED ROUND SETTINGS
// ============================================================

if (updateRoundSettingsButton) {

    updateRoundSettingsButton.addEventListener(
        "click",
        async function () {

            if (!selectedRound) {

                alert(
                    "Select a counselling round first."
                );

                return;

            }


            const minRank =
                Number(
                    document.querySelector(
                        `[data-round-id="${selectedRound.id}"] .from-rank`
                    )?.value ||
                    selectedRound.min_rank
                );


            const maxRank =
                Number(
                    document.querySelector(
                        `[data-round-id="${selectedRound.id}"] .to-rank`
                    )?.value ||
                    selectedRound.max_rank
                );


            try {

                setControlMessage(
                    "Updating round settings..."
                );


                await apiRequest(
                    `/api/rounds/${selectedRound.id}/settings`,
                    {
                        method: "PUT",

                        body:
                            JSON.stringify({
                                min_rank: minRank,
                                max_rank: maxRank
                            })
                    }
                );


                setControlMessage(
                    "✓ Round settings updated successfully."
                );


                await loadRounds();

            }

            catch (error) {

                setControlMessage(
                    error.message,
                    true
                );

            }

        }
    );

}


// ============================================================
// OPEN CHOICE FILLING
// ============================================================

if (openChoiceFillingButton) {

    openChoiceFillingButton.addEventListener(
        "click",
        async function () {

            if (!selectedRound) {

                alert(
                    "Select a counselling round first."
                );

                return;

            }


            if (!preferenceStart.value) {

                alert(
                    "Select the choice-filling opening date and time."
                );

                preferenceStart.focus();

                return;

            }


            if (
                !confirm(
                    `Open choice filling for Round ${selectedRound.round_number}?`
                )
            ) {

                return;

            }


            try {

                disableAllControlButtons();


                setControlMessage(
                    "Opening choice filling..."
                );


                await apiRequest(
                    `/api/rounds/${selectedRound.id}/open-preferences`,
                    {
                        method: "POST",

                        body:
                            JSON.stringify({
                                preference_start:
                                    preferenceStart.value
                            })
                    }
                );


                setControlMessage(
                    "✓ Choice filling opened successfully."
                );


                await loadRounds();

            }

            catch (error) {

                setControlMessage(
                    error.message,
                    true
                );

            }

        }
    );

}


// ============================================================
// LOCK CHOICE FILLING
// ============================================================

if (lockChoiceFillingButton) {

    lockChoiceFillingButton.addEventListener(
        "click",
        async function () {

            if (!selectedRound) {

                alert(
                    "Select a counselling round first."
                );

                return;

            }


            if (!preferenceEnd.value) {

                alert(
                    "Select the choice-filling closing date and time."
                );

                preferenceEnd.focus();

                return;

            }


            if (
                !confirm(
                    `Lock choice filling for Round ${selectedRound.round_number}?\n\nStudents will no longer be able to modify their preferences.`
                )
            ) {

                return;

            }


            try {

                disableAllControlButtons();


                setControlMessage(
                    "Locking choice filling..."
                );


                await apiRequest(
                    `/api/rounds/${selectedRound.id}/lock-preferences`,
                    {
                        method: "POST",

                        body:
                            JSON.stringify({
                                preference_end:
                                    preferenceEnd.value
                            })
                    }
                );


                setControlMessage(
                    "🔒 Choice filling has been locked successfully."
                );


                await loadRounds();

            }

            catch (error) {

                setControlMessage(
                    error.message,
                    true
                );

            }

        }
    );

}


// ============================================================
// ALLOTMENT COMPLETED
// ============================================================

if (allotmentCompletedButton) {

    allotmentCompletedButton.addEventListener(
        "click",
        async function () {

            if (!selectedRound) {

                alert(
                    "Select a counselling round first."
                );

                return;

            }


            if (
                !confirm(
                    `Mark allotment as completed for Round ${selectedRound.round_number}?`
                )
            ) {

                return;

            }


            try {

                disableAllControlButtons();


                setControlMessage(
                    "Marking allotment as completed..."
                );


                await apiRequest(
                    `/api/rounds/${selectedRound.id}/allotment-completed`,
                    {
                        method: "POST",

                        body:
                            JSON.stringify({})
                    }
                );


                setControlMessage(
                    "✓ Allotment marked as completed."
                );


                await loadRounds();

            }

            catch (error) {

                setControlMessage(
                    error.message,
                    true
                );

            }

        }
    );

}


// ============================================================
// START PAYMENT PERIOD
// ============================================================

if (paymentPeriodButton) {

    paymentPeriodButton.addEventListener(
        "click",
        async function () {

            if (!selectedRound) {

                alert(
                    "Select a counselling round first."
                );

                return;

            }


            if (!paymentDeadline.value) {

                alert(
                    "Select the payment deadline."
                );

                paymentDeadline.focus();

                return;

            }


            if (
                !confirm(
                    `Start the payment period for Round ${selectedRound.round_number}?`
                )
            ) {

                return;

            }


            try {

                disableAllControlButtons();


                setControlMessage(
                    "Starting payment period..."
                );


                await apiRequest(
                    `/api/rounds/${selectedRound.id}/payment-period`,
                    {
                        method: "POST",

                        body:
                            JSON.stringify({
                                payment_deadline:
                                    paymentDeadline.value
                            })
                    }
                );


                setControlMessage(
                    "✓ Payment period started successfully."
                );


                await loadRounds();

            }

            catch (error) {

                setControlMessage(
                    error.message,
                    true
                );

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

            if (!selectedRound) {

                alert(
                    "Select a counselling round first."
                );

                return;

            }


            if (
                !confirm(
                    `Complete counselling Round ${selectedRound.round_number}?`
                )
            ) {

                return;

            }


            try {

                disableAllControlButtons();


                setControlMessage(
                    "Completing counselling round..."
                );


                await apiRequest(
                    `/api/rounds/${selectedRound.id}/complete`,
                    {
                        method: "POST",

                        body:
                            JSON.stringify({})
                    }
                );


                setControlMessage(
                    "✓ Counselling round completed successfully."
                );


                await loadRounds();

            }

            catch (error) {

                setControlMessage(
                    error.message,
                    true
                );

            }

        }
    );

}


// ============================================================
// UPDATE OVERALL STATUS
// ============================================================

function updateOverallStatus() {

    if (!overallStatus) {

        return;

    }


    const activeRound =
        rounds.find(
            round =>
                round.status !==
                "completed"
        );


    if (!activeRound) {

        overallStatus.textContent =
            "● COMPLETED";

        return;

    }


    overallStatus.textContent =
        `● ROUND ${activeRound.round_number} - ${formatStatus(activeRound.status)}`;

}


// ============================================================
// UPDATE CURRENT ROUND
// ============================================================

function updateCurrentRound() {

    if (
        !currentRoundNumber ||
        !currentRoundDescription ||
        !currentRoundStatus
    ) {

        return;

    }


    const activeRound =
        rounds.find(
            round =>
                round.status !==
                "completed"
        );


    if (!activeRound) {

        currentRoundNumber.textContent =
            "ALL ROUNDS COMPLETED";


        currentRoundDescription.textContent =
            "All counselling rounds have been completed.";


        currentRoundStatus.textContent =
            "● COMPLETED";


        return;

    }


    currentRoundNumber.textContent =
        `ROUND ${String(
            activeRound.round_number
        ).padStart(2, "0")}`;


    currentRoundDescription.textContent =
        `Students with ranks ${activeRound.min_rank}–${activeRound.max_rank} are currently being processed.`;


    currentRoundStatus.textContent =
        `● ${formatStatus(
            activeRound.status
        ).toUpperCase()}`;

}


// ============================================================
// FORMAT STATUS
// ============================================================

function formatStatus(status) {

    const statuses = {

        not_started:
            "Not Started",

        preference_open:
            "Choice Filling Open",

        preferences_locked:
            "Choice Filling Locked",

        allotment_completed:
            "Allotment Completed",

        payment_period:
            "Payment Period",

        completed:
            "Completed"

    };


    return (
        statuses[status] ||
        status ||
        "Unknown"
    );

}


// ============================================================
// CHOICE STATUS
// ============================================================

function getChoiceStatus(status) {

    if (
        status === "preference_open"
    ) {

        return "OPEN";

    }


    if (
        status === "preferences_locked"
    ) {

        return "LOCKED";

    }


    if (
        status === "not_started"
    ) {

        return "NOT STARTED";

    }


    return "CLOSED";

}


// ============================================================
// DATE FORMATTER
// ============================================================

function toDateTimeLocal(value) {

    if (!value) {

        return "";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");


    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");


    return `${year}-${month}-${day}T${hours}:${minutes}`;

}


// ============================================================
// MESSAGE
// ============================================================

function setControlMessage(
    message,
    isError = false
) {

    if (!controlMessage) {

        return;

    }


    controlMessage.textContent =
        message || "";


    controlMessage.style.display =
        message
            ? "block"
            : "none";


    if (isError) {

        controlMessage.classList.add(
            "error"
        );

    } else {

        controlMessage.classList.remove(
            "error"
        );

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
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
        function () {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "authToken"
            );

            localStorage.removeItem(
                "counsellorToken"
            );

            localStorage.removeItem(
                "studentToken"
            );

            window.location.href =
                "student-login.html";

        }
    );

}


// ============================================================
// PAGE INITIALIZATION
// ============================================================

async function initializeRoundManagement() {

    console.log(
        "Initializing round management..."
    );


    if (!checkAuthentication()) {

        return;

    }


    await loadRounds();


    addCalculationListeners();


    console.log(
        "✅ Round management ready."
    );

}


document.addEventListener(
    "DOMContentLoaded",
    initializeRoundManagement
);