document.addEventListener("DOMContentLoaded", function () {


const studentNameInput =
    document.getElementById("studentName");

const usernameInput =
    document.getElementById("username");

const dateOfBirthInput =
    document.getElementById("dateOfBirth");

const applicationNumberInput =
    document.getElementById("applicationNumber");

const cutoffInput =
    document.getElementById("cutoff");

const communityInput =
    document.getElementById("community");


const marksheetVerifiedInput =
    document.getElementById("marksheetVerified");

const communityVerifiedInput =
    document.getElementById("communityVerified");

const applicationVerifiedInput =
    document.getElementById("applicationVerified");


const addStudentButton =
    document.getElementById("addStudentButton");

const clearButton =
    document.getElementById("clearButton");


const adminMessage =
    document.getElementById("adminMessage");

const studentTableBody =
    document.getElementById("studentTableBody");

const studentSearch =
    document.getElementById("studentSearch");


const totalStudentsElement =
    document.getElementById("totalStudents");

const verifiedStudentsElement =
    document.getElementById("verifiedStudents");

const rankGeneratedElement =
    document.getElementById("rankGenerated");


const currentRankElements =
    document.querySelectorAll(
        "#currentRank, #controlCurrentRank"
    );


const credentialsPanel =
    document.getElementById("credentialsPanel");

const generatedUsername =
    document.getElementById("generatedUsername");

const generatedPassword =
    document.getElementById("generatedPassword");

const copyCredentialsButton =
    document.getElementById("copyCredentialsButton");

const copyMessage =
    document.getElementById("copyMessage");


const startCounsellingButton =
    document.getElementById(
        "startCounsellingButton"
    );

const nextRankButton =
    document.getElementById(
        "nextRankButton"
    );


let students = [];

let counsellingStarted =
    false;

let activeRank = 0;


loadStudents();

loadCounsellingState();

calculateRanks();

saveStudents();

displayStudents();

updateSummary();



/* =========================================
   ADD STUDENT
========================================= */

addStudentButton.addEventListener(
    "click",
    function () {

        const name =
            studentNameInput.value.trim();

        const email =
            usernameInput.value.trim();

        const dob =
            dateOfBirthInput.value;

        const applicationNumber =
            applicationNumberInput.value.trim();

        const cutoffText =
            cutoffInput.value.trim();

        const community =
            communityInput.value;


        if (
            name === "" ||
            email === "" ||
            dob === "" ||
            applicationNumber === "" ||
            cutoffText === "" ||
            community === ""
        ) {

            showMessage(
                "Please fill all student details.",
                "error"
            );

            return;

        }


        if (
            !marksheetVerifiedInput.checked ||
            !communityVerifiedInput.checked ||
            !applicationVerifiedInput.checked
        ) {

            showMessage(
                "Please verify all documents before generating the rank.",
                "error"
            );

            return;

        }


        const cutoff =
            Number(cutoffText);


        if (
            Number.isNaN(cutoff) ||
            cutoff < 0 ||
            cutoff > 200
        ) {

            showMessage(
                "Please enter a valid cutoff between 0 and 200.",
                "error"
            );

            return;

        }


        const emailExists =
            students.some(
                function (student) {

                    return (
                        student.username.toLowerCase() ===
                        email.toLowerCase()
                    );

                }
            );


        if (emailExists) {

            showMessage(
                "This email / username already exists.",
                "error"
            );

            return;

        }


        const applicationExists =
            students.some(
                function (student) {

                    return (
                        student.applicationNumber.toLowerCase() ===
                        applicationNumber.toLowerCase()
                    );

                }
            );


        if (applicationExists) {

            showMessage(
                "This application number already exists.",
                "error"
            );

            return;

        }


        const password =
            generatePassword(
                name,
                dob
            );


        const student = {

            id: Date.now(),

            studentName: name,

            username: email,

            password: password,

            dateOfBirth: dob,

            applicationNumber:
                applicationNumber,

            cutoff: cutoff,

            community: community,

            documentsVerified: true,

            rank: 0,

            status: "Verified"

        };


        students.push(student);


        calculateRanks();

        saveStudents();

        displayStudents();

        updateSummary();


        showCredentials(
            email,
            password
        );


        showMessage(
            "Student added successfully. Rank generated automatically.",
            "success"
        );


        clearForm();

    }
);



/* =========================================
   CLEAR
========================================= */

clearButton.addEventListener(
    "click",
    function () {

        clearForm();

        showMessage(
            "",
            ""
        );

    }
);



/* =========================================
   SEARCH
========================================= */

studentSearch.addEventListener(
    "input",
    function () {

        displayStudents(
            studentSearch.value
        );

    }
);



/* =========================================
   GENERATE PASSWORD
========================================= */

function generatePassword(
    name,
    dob
) {

    const cleanName =
        name.replace(/\s+/g, "");


    const dateParts =
        dob.split("-");


    if (
        dateParts.length !== 3
    ) {

        return cleanName;

    }


    const year =
        dateParts[0];

    const month =
        dateParts[1];

    const day =
        dateParts[2];


    return (
        cleanName +
        "@" +
        day +
        month +
        year
    );

}



/* =========================================
   AUTOMATIC RANK
========================================= */

function calculateRanks() {

    students.sort(
        function (a, b) {

            const cutoffA =
                Number(a.cutoff);

            const cutoffB =
                Number(b.cutoff);


            if (
                cutoffB !== cutoffA
            ) {

                return (
                    cutoffB -
                    cutoffA
                );

            }


            return String(
                a.studentName || ""
            ).localeCompare(
                String(
                    b.studentName || ""
                )
            );

        }
    );


    students.forEach(
        function (student, index) {

            student.rank =
                index + 1;

        }
    );

}



/* =========================================
   DISPLAY TABLE
========================================= */

function displayStudents(
    searchText = ""
) {

    studentTableBody.innerHTML =
        "";


    const search =
        searchText
            .toLowerCase()
            .trim();


    const filteredStudents =
        students.filter(
            function (student) {

                return (

                    String(
                        student.studentName || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        student.username || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        student.applicationNumber || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        student.community || ""
                    )
                        .toLowerCase()
                        .includes(search)

                );

            }
        );


    if (
        filteredStudents.length === 0
    ) {

        const row =
            document.createElement("tr");


        const cell =
            document.createElement("td");


        cell.colSpan = 7;

        cell.textContent =
            "No student records found.";

        cell.style.textAlign =
            "center";

        cell.style.padding =
            "25px";


        row.appendChild(cell);

        studentTableBody.appendChild(
            row
        );

        return;

    }


    filteredStudents.forEach(
        function (student) {

            const row =
                document.createElement("tr");


            addCell(
                row,
                student.rank
            );


            addCell(
                row,
                student.applicationNumber
            );


            addCell(
                row,
                student.studentName
            );


            addCell(
                row,
                student.community
            );


            addCell(
                row,
                Number(
                    student.cutoff
                ).toFixed(2)
            );


            addCell(
                row,
                student.username
            );


            const statusCell =
                document.createElement("td");


            const status =
                document.createElement(
                    "span"
                );


            status.className =
                "table-status";


            status.textContent =
                student.status;


            statusCell.appendChild(
                status
            );


            row.appendChild(
                statusCell
            );


            studentTableBody.appendChild(
                row
            );

        }
    );

}



/* =========================================
   ADD TABLE CELL
========================================= */

function addCell(
    row,
    value
) {

    const cell =
        document.createElement("td");


    cell.textContent =
        value;


    row.appendChild(
        cell
    );

}



/* =========================================
   SUMMARY
========================================= */

function updateSummary() {

    totalStudentsElement.textContent =
        students.length;


    const verifiedCount =
        students.filter(
            function (student) {

                return (
                    student.documentsVerified ===
                    true
                );

            }
        ).length;


    const rankedCount =
        students.filter(
            function (student) {

                return (
                    Number(
                        student.rank
                    ) > 0
                );

            }
        ).length;


    verifiedStudentsElement.textContent =
        verifiedCount;


    rankGeneratedElement.textContent =
        rankedCount;


    currentRankElements.forEach(
        function (element) {

            if (
                counsellingStarted &&
                activeRank > 0
            ) {

                element.textContent =
                    activeRank;

            } else {

                element.textContent =
                    "-";

            }

        }
    );

}



/* =========================================
   COUNSELLING START
========================================= */

startCounsellingButton.addEventListener(
    "click",
    function () {

        if (
            students.length === 0
        ) {

            showMessage(
                "Add at least one verified student before starting counselling.",
                "error"
            );

            return;

        }


        calculateRanks();

        activeRank = 1;

        counsellingStarted =
            true;


        saveCounsellingState();

        updateSummary();


        showMessage(
            "Counselling started. Current rank is 1.",
            "success"
        );

    }
);



/* =========================================
   NEXT RANK
========================================= */

nextRankButton.addEventListener(
    "click",
    function () {

        if (
            !counsellingStarted
        ) {

            showMessage(
                "Please start counselling first.",
                "error"
            );

            return;

        }


        if (
            activeRank >= students.length
        ) {

            showMessage(
                "All student ranks have been completed.",
                "success"
            );

            return;

        }


        activeRank =
            activeRank + 1;


        saveCounsellingState();

        updateSummary();


        showMessage(
            "Counselling moved to rank " +
            activeRank +
            ".",
            "success"
        );

    }
);



/* =========================================
   SHOW CREDENTIALS
========================================= */

function showCredentials(
    username,
    password
) {

    generatedUsername.textContent =
        username;

    generatedPassword.textContent =
        password;

    credentialsPanel.style.display =
        "block";

    copyMessage.textContent =
        "";

}



/* =========================================
   COPY CREDENTIALS
========================================= */

copyCredentialsButton.addEventListener(
    "click",
    async function () {

        const username =
            generatedUsername.textContent;

        const password =
            generatedPassword.textContent;


        if (
            username === "-" ||
            password === "-"
        ) {

            return;

        }


        const credentialsText =
            "GCE Erode Student Login\n" +
            "Username: " +
            username +
            "\nPassword: " +
            password;


        try {

            await navigator.clipboard.writeText(
                credentialsText
            );


            copyMessage.textContent =
                "Credentials copied.";

        } catch (error) {

            copyMessage.textContent =
                "Unable to copy credentials.";

        }

    }
);



/* =========================================
   CLEAR FORM
========================================= */

function clearForm() {

    studentNameInput.value =
        "";

    usernameInput.value =
        "";

    dateOfBirthInput.value =
        "";

    applicationNumberInput.value =
        "";

    cutoffInput.value =
        "";

    communityInput.value =
        "";


    marksheetVerifiedInput.checked =
        false;

    communityVerifiedInput.checked =
        false;

    applicationVerifiedInput.checked =
        false;

}



/* =========================================
   MESSAGE
========================================= */

function showMessage(
    message,
    type
) {

    adminMessage.textContent =
        message;


    if (
        type === "success"
    ) {

        adminMessage.style.color =
            "#326d40";

    } else if (
        type === "error"
    ) {

        adminMessage.style.color =
            "#b34b4b";

    } else {

        adminMessage.style.color =
            "#55745d";

    }

}



/* =========================================
   LOCAL STORAGE
========================================= */

function loadStudents() {

    try {

        students =
            JSON.parse(
                localStorage.getItem(
                    "gceStudents"
                )
            ) || [];

    } catch (error) {

        students = [];

    }

}



function saveStudents() {

    localStorage.setItem(
        "gceStudents",
        JSON.stringify(
            students
        )
    );

}



function loadCounsellingState() {

    try {

        const savedState =
            JSON.parse(
                localStorage.getItem(
                    "gceCounsellingState"
                )
            );


        if (
            savedState
        ) {

            counsellingStarted =
                savedState.started ||
                false;

            activeRank =
                savedState.activeRank ||
                0;

        }

    } catch (error) {

        counsellingStarted =
            false;

        activeRank =
            0;

    }

}



function saveCounsellingState() {

    localStorage.setItem(
        "gceCounsellingState",
        JSON.stringify({

            started:
                counsellingStarted,

            activeRank:
                activeRank

        })
    );

}


});
