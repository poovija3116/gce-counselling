
// ============================================================
// GCE ERODE - CHOICE FILLING
// ============================================================

console.log("🔥 CHOICE FILLING SCRIPT RUNNING 🔥");


// ============================================================
// API
// ============================================================

const API_BASE_URL = "http://localhost:5000";


// ============================================================
// DOM
// ============================================================

const departmentList =
    document.getElementById("departmentList");

const preferenceList =
    document.getElementById("preferenceList");

const departmentSearch =
    document.getElementById("departmentSearch");

const choiceCount =
    document.getElementById("choiceCount");

const lockPreferencesButton =
    document.getElementById("lockPreferences");


// ============================================================
// DATA
// ============================================================

let departments = [];

let preferences = [];

let preferencesLocked = false;


// ============================================================
// GET TOKEN
// ============================================================

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("studentToken")
    );

}


// ============================================================
// AUTH CHECK
// ============================================================

function checkAuthentication() {

    const token = getToken();

    if (!token) {

        alert(
            "Your login session has expired. Please login again."
        );

        window.location.href = "login.html";

        return false;

    }

    return true;

}


// ============================================================
// API HEADERS
// ============================================================

function getHeaders() {

    const token = getToken();

    return {

        "Content-Type": "application/json",

        "Authorization":
            `Bearer ${token}`

    };

}


// ============================================================
// LOAD STUDENT DETAILS
// ============================================================

async function loadStudentDetails() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/student/profile`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        const data =
            await response.json();


        console.log(
            "STUDENT PROFILE:",
            data
        );


        if (!response.ok || !data.success) {

            return;

        }


        const student =
            data.student ||
            data.profile ||
            data.user;


        if (!student) {

            return;

        }


        const name =
            student.name ||
            student.student_name ||
            "Student";


        const rank =
            student.rank_number ||
            student.rank ||
            "-";


        const applicationNumber =
            student.application_number ||
            student.applicationNumber ||
            "-";


        const studentName =
            document.getElementById(
                "studentName"
            );


        const studentNameCard =
            document.getElementById(
                "studentNameCard"
            );


        const studentRank =
            document.getElementById(
                "studentRank"
            );


        const applicationNumberElement =
            document.getElementById(
                "applicationNumber"
            );


        if (studentName) {

            studentName.textContent =
                name;

        }


        if (studentNameCard) {

            studentNameCard.textContent =
                name;

        }


        if (studentRank) {

            studentRank.textContent =
                rank;

        }


        if (applicationNumberElement) {

            applicationNumberElement.textContent =
                applicationNumber;

        }

    }

    catch (error) {

        console.error(
            "STUDENT DETAILS ERROR:",
            error
        );

    }

}


// ============================================================
// LOAD DEPARTMENTS
// ============================================================

async function loadDepartments() {

    try {

        departmentList.innerHTML = `
            <div class="loading">
                Loading departments...
            </div>
        `;


        const response =
            await fetch(
                `${API_BASE_URL}/api/departments`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        const data =
            await response.json();


        console.log(
            "DEPARTMENT RESPONSE:",
            data
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to load departments"
            );

        }


        departments =
            data.departments || [];


        renderDepartments(
            departments
        );

    }

    catch (error) {

        console.error(
            "DEPARTMENT ERROR:",
            error
        );


        departmentList.innerHTML = `
            <div class="loading">
                Failed to load departments.
                <br><br>
                ${error.message}
            </div>
        `;

    }

}


// ============================================================
// RENDER DEPARTMENTS
// ============================================================

function renderDepartments(
    departmentData
) {

    if (
        !departmentData ||
        departmentData.length === 0
    ) {

        departmentList.innerHTML = `
            <div class="loading">
                No departments available.
            </div>
        `;

        return;

    }


    departmentList.innerHTML = "";


    departmentData.forEach(
        department => {

            const alreadySelected =
                preferences.some(
                    preference =>
                        Number(
                            preference.department_id
                        ) === Number(
                            department.id
                        )
                );


            const availableSeats =
                Number(
                    department.available_seats || 0
                );


            const item =
                document.createElement("div");


            item.className =
                "department-item";


            item.dataset.departmentId =
                department.id;


            item.innerHTML = `

                <div class="department-info">

                    <span class="department-code">
                        ${escapeHTML(
                            department.code
                        )}
                    </span>

                    <span class="department-name">
                        ${escapeHTML(
                            department.name
                        )}
                    </span>

                    <span class="seat-info">

                        Available Seats:

                        <span class="seat-number">
                            ${availableSeats}
                        </span>

                    </span>

                </div>


                <button
                    class="add-btn"
                    type="button"
                    ${alreadySelected ? "disabled" : ""}>

                    ${
                        alreadySelected
                            ? "ADDED"
                            : "ADD"
                    }

                </button>

            `;


            const addButton =
                item.querySelector(
                    ".add-btn"
                );


            addButton.addEventListener(
                "click",
                () => {

                    addPreference(
                        department
                    );

                }
            );


            departmentList.appendChild(
                item
            );

        }
    );

}


// ============================================================
// ADD PREFERENCE
// ============================================================

function addPreference(
    department
) {

    if (preferencesLocked) {

        alert(
            "Your preferences are already locked."
        );

        return;

    }


    const exists =
        preferences.some(
            preference =>
                Number(
                    preference.department_id
                ) === Number(
                    department.id
                )
        );


    if (exists) {

        alert(
            "This department is already selected."
        );

        return;

    }


    preferences.push({

        department_id:
            Number(
                department.id
            ),

        code:
            department.code,

        name:
            department.name,

        priority:
            preferences.length + 1

    });


    updatePriorities();

    renderPreferences();

    renderDepartments(
        getFilteredDepartments()
    );

}


// ============================================================
// REMOVE PREFERENCE
// ============================================================

function removePreference(
    departmentId
) {

    if (preferencesLocked) {

        alert(
            "Your preferences are already locked."
        );

        return;

    }


    preferences =
        preferences.filter(
            preference =>
                Number(
                    preference.department_id
                ) !== Number(
                    departmentId
                )
        );


    updatePriorities();

    renderPreferences();

    renderDepartments(
        getFilteredDepartments()
    );

}


// ============================================================
// MOVE UP
// ============================================================

function moveUp(index) {

    if (preferencesLocked) {

        return;

    }


    if (index <= 0) {

        return;

    }


    const temp =
        preferences[index - 1];


    preferences[index - 1] =
        preferences[index];


    preferences[index] =
        temp;


    updatePriorities();

    renderPreferences();

}


// ============================================================
// MOVE DOWN
// ============================================================

function moveDown(index) {

    if (preferencesLocked) {

        return;

    }


    if (
        index >=
        preferences.length - 1
    ) {

        return;

    }


    const temp =
        preferences[index + 1];


    preferences[index + 1] =
        preferences[index];


    preferences[index] =
        temp;


    updatePriorities();

    renderPreferences();

}


// ============================================================
// UPDATE PRIORITIES
// ============================================================

function updatePriorities() {

    preferences.forEach(
        (
            preference,
            index
        ) => {

            preference.priority =
                index + 1;

        }
    );

}


// ============================================================
// RENDER PREFERENCES
// ============================================================

function renderPreferences() {

    updateChoiceCount();


    if (
        preferences.length === 0
    ) {

        preferenceList.innerHTML = `

            <div
                id="emptyPreferences"
                class="empty-preferences">

                <div class="empty-icon">
                    📋
                </div>

                <h3>
                    No Preferences Added
                </h3>

                <p>
                    Select departments from the left
                    to add them here.
                </p>

            </div>

        `;

        return;

    }


    preferenceList.innerHTML = "";


    preferences.forEach(
        (
            preference,
            index
        ) => {

            const item =
                document.createElement("div");


            item.className =
                "preference-item";


            item.innerHTML = `

                <div class="priority-number">
                    ${index + 1}
                </div>


                <div class="preference-info">

                    <strong>
                        ${escapeHTML(
                            preference.code
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            preference.name
                        )}
                    </span>

                </div>


                <div class="preference-actions">

                    <button
                        type="button"
                        class="move-btn"
                        title="Move Up"
                        ${index === 0
                            ? "disabled"
                            : ""}>

                        ↑

                    </button>


                    <button
                        type="button"
                        class="move-btn"
                        title="Move Down"
                        ${
                            index ===
                            preferences.length - 1
                                ? "disabled"
                                : ""
                        }>

                        ↓

                    </button>


                    <button
                        type="button"
                        class="remove-btn"
                        title="Remove">

                        ×

                    </button>

                </div>

            `;


            const buttons =
                item.querySelectorAll(
                    "button"
                );


            buttons[0].addEventListener(
                "click",
                () => {

                    moveUp(index);

                }
            );


            buttons[1].addEventListener(
                "click",
                () => {

                    moveDown(index);

                }
            );


            buttons[2].addEventListener(
                "click",
                () => {

                    removePreference(
                        preference.department_id
                    );

                }
            );


            preferenceList.appendChild(
                item
            );

        }
    );

}


// ============================================================
// CHOICE COUNT
// ============================================================

function updateChoiceCount() {

    const count =
        preferences.length;


    if (choiceCount) {

        choiceCount.textContent =
            `${count} ${
                count === 1
                    ? "Choice"
                    : "Choices"
            }`;

    }

}


// ============================================================
// SAVE PREFERENCES
// ============================================================

async function savePreferences() {

    if (preferences.length === 0) {

        throw new Error(
            "Please select at least one department."
        );

    }


    const preferenceIds =
        preferences.map(
            preference =>
                Number(
                    preference.department_id
                )
        );


    console.log(
        "SAVING PREFERENCES:",
        preferenceIds
    );


    const response =
        await fetch(
            `${API_BASE_URL}/api/preferences`,
            {
                method: "POST",

                headers:
                    getHeaders(),

                body:
                    JSON.stringify({
                        preferences:
                            preferenceIds
                    })
            }
        );


    const data =
        await response.json();


    console.log(
        "SAVE RESPONSE:",
        data
    );


    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.message ||
            "Failed to save preferences"
        );

    }


    return data;

}


// ============================================================
// LOCK PREFERENCES
// ============================================================

async function lockPreferences() {

    if (preferencesLocked) {

        return;

    }


    if (preferences.length === 0) {

        alert(
            "Please select at least one department before locking."
        );

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to lock your preferences?\n\n" +
            "After locking, you cannot change your choices " +
            "unless the administration reopens the choice-filling window."
        );


    if (!confirmed) {

        return;

    }


    try {

        lockPreferencesButton.disabled =
            true;


        lockPreferencesButton.textContent =
            "SAVING...";


        // ----------------------------------------
        // FIRST SAVE
        // ----------------------------------------

        await savePreferences();


        // ----------------------------------------
        // THEN LOCK
        // ----------------------------------------

        const response =
            await fetch(
                `${API_BASE_URL}/api/preferences/lock`,
                {
                    method: "POST",

                    headers:
                        getHeaders(),

                    body:
                        JSON.stringify({})
                }
            );


        const data =
            await response.json();


        console.log(
            "LOCK RESPONSE:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Failed to lock preferences"
            );

        }


        preferencesLocked =
            true;


        lockPreferencesButton.textContent =
            "🔒 PREFERENCES LOCKED";


        lockPreferencesButton.disabled =
            true;


        lockPreferencesButton.style.background =
            "#5c756e";


        alert(
            "Your preferences have been locked successfully."
        );


        renderPreferences();

        renderDepartments(
            getFilteredDepartments()
        );

    }

    catch (error) {

        console.error(
            "LOCK ERROR:",
            error
        );


        lockPreferencesButton.disabled =
            false;


        lockPreferencesButton.textContent =
            "🔒 LOCK PREFERENCES";


        alert(
            "Failed to lock preferences:\n" +
            error.message
        );

    }

}


// ============================================================
// LOAD EXISTING PREFERENCES
// ============================================================

async function loadExistingPreferences() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/preferences`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        const data =
            await response.json();


        console.log(
            "EXISTING PREFERENCES:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            return;

        }


        const existing =
            data.preferences || [];


        preferences =
            existing.map(
                preference => ({

                    department_id:
                        Number(
                            preference.department_id
                        ),

                    code:
                        preference.code ||
                        preference.department_code ||
                        "",

                    name:
                        preference.name ||
                        preference.department_name ||
                        "",

                    priority:
                        Number(
                            preference.priority
                        )

                })
            );


        preferences.sort(
            (
                a,
                b
            ) =>
                a.priority -
                b.priority
        );


        updatePriorities();

        renderPreferences();


        // Check whether preferences are locked

        const locked =
            existing.some(
                preference =>
                    Number(
                        preference.is_locked
                    ) === 1 ||
                    preference.is_locked === true
            );


        if (locked) {

            preferencesLocked =
                true;


            lockPreferencesButton.textContent =
                "🔒 PREFERENCES LOCKED";


            lockPreferencesButton.disabled =
                true;


            lockPreferencesButton.style.background =
                "#5c756e";

        }

    }

    catch (error) {

        console.error(
            "LOAD EXISTING PREFERENCES ERROR:",
            error
        );

    }

}


// ============================================================
// SEARCH
// ============================================================

function getFilteredDepartments() {

    if (!departmentSearch) {

        return departments;

    }


    const search =
        departmentSearch.value
            .trim()
            .toLowerCase();


    if (!search) {

        return departments;

    }


    return departments.filter(
        department => {

            return (

                String(
                    department.code || ""
                )
                .toLowerCase()
                .includes(search)

                ||

                String(
                    department.name || ""
                )
                .toLowerCase()
                .includes(search)

            );

        }
    );

}


if (departmentSearch) {

    departmentSearch.addEventListener(
        "input",
        () => {

            renderDepartments(
                getFilteredDepartments()
            );

        }
    );

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
        () => {

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
                "adminToken"
            );


            window.location.href =
                "login.html";

        }
    );

}


// ============================================================
// START CHOICE FILLING
// ============================================================

async function initializeChoiceFilling() {

    console.log(
        "Initializing choice filling..."
    );


    if (!checkAuthentication()) {

        return;

    }


    await loadStudentDetails();

    await loadDepartments();

    await loadExistingPreferences();

    renderDepartments(
        getFilteredDepartments()
    );


    console.log(
        "Choice filling ready."
    );

}


// ============================================================
// LOCK BUTTON
// ============================================================

if (lockPreferencesButton) {

    lockPreferencesButton.addEventListener(
        "click",
        lockPreferences
    );

}


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeChoiceFilling
);

