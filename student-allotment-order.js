/* ============================================================
   GCE ERODE - ALLOTMENT ORDER
   MANAGEMENT COUNSELLING 2026
   JAVASCRIPT
   ============================================================ */


/* ============================================================
   PAGE ELEMENTS
============================================================ */

const backButton =
    document.getElementById("backButton");

const printButton =
    document.getElementById("printButton");



/* ============================================================
   BACK TO DASHBOARD
============================================================ */

if (backButton) {

    backButton.addEventListener("click", function () {

        window.location.href =
            "student-dashboard.html";

    });

}



/* ============================================================
   PRINT / SAVE AS PDF
============================================================ */

if (printButton) {

    printButton.addEventListener("click", function () {

        window.print();

    });

}



/* ============================================================
   HELPER FUNCTION
============================================================ */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent =
        value !== undefined &&
        value !== null &&
        value !== ""
            ? value
            : "-";
}



/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
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



/* ============================================================
   FORMAT DATE + TIME
============================================================ */

function formatDateTime(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}



/* ============================================================
   GET LOGGED-IN STUDENT
============================================================ */

function getStudentData() {

    let student = null;


    /*
       Temporary frontend storage.

       Later this will be replaced by:

       GET /api/student/profile

       and

       GET /api/allotment/my-allotment
    */


    try {

        const storedStudent =
            localStorage.getItem("student");

        if (storedStudent) {

            student =
                JSON.parse(storedStudent);

        }

    } catch (error) {

        console.error(
            "Unable to read student data:",
            error
        );

    }


    return student;

}



/* ============================================================
   GET ALLOTMENT DATA
============================================================ */

function getAllotmentData() {

    let allotment = null;


    /*
       Temporary data source.

       Later this will come from backend:

       GET /api/allotment/my-allotment
    */


    try {

        const storedAllotment =
            localStorage.getItem("allotment");

        if (storedAllotment) {

            allotment =
                JSON.parse(storedAllotment);

        }

    } catch (error) {

        console.error(
            "Unable to read allotment data:",
            error
        );

    }


    return allotment;

}



/* ============================================================
   DEFAULT DEMO DATA
============================================================ */

function getDemoData() {

    return {

        student: {

            name: "Student Name",

            applicationNumber:
                "GCE2026XXXX",

            rank:
                "125",

            community:
                "BC",

            gender:
                "Female",

            dateOfBirth:
                "15/06/2007"

        },


        allotment: {

            status:
                "ALLOTTED",

            department:
                "Computer Science and Engineering",

            departmentCode:
                "CSE",

            seatNumber:
                "CSE-042",

            round:
                "Round 02",

            rankRange:
                "101 – 200",

            allotmentDate:
                "28/08/2026",

            paymentStatus:
                "PENDING",

            paymentDeadline:
                "30/08/2026",

            reportingDate:
                "02/09/2026",

            reportingTime:
                "10:00 AM"

        }

    };

}



/* ============================================================
   UPDATE STUDENT INFORMATION
============================================================ */

function displayStudentInformation(student) {

    setText(
        "studentName",
        student.name
    );


    setText(
        "applicationNumber",
        student.applicationNumber
    );


    setText(
        "rank",
        student.rank
    );


    setText(
        "community",
        student.community
    );


    setText(
        "gender",
        student.gender
    );


    setText(
        "dateOfBirth",
        formatDate(student.dateOfBirth)
    );

}



/* ============================================================
   UPDATE ALLOTMENT INFORMATION
============================================================ */

function displayAllotmentInformation(allotment) {

    setText(
        "department",
        allotment.department
    );


    setText(
        "departmentCode",
        allotment.departmentCode
    );


    setText(
        "seatNumber",
        allotment.seatNumber
    );


    setText(
        "round",
        allotment.round
    );


    setText(
        "rankRange",
        allotment.rankRange
    );


    setText(
        "allotmentDate",
        formatDateTime(
            allotment.allotmentDate
        )
    );


    setText(
        "paymentDeadline",
        formatDateTime(
            allotment.paymentDeadline
        )
    );


    setText(
        "reportingDate",
        formatDate(
            allotment.reportingDate
        )
    );


    setText(
        "reportingTime",
        allotment.reportingTime
    );


    setText(
        "paymentStatus",
        allotment.paymentStatus
    );

}



/* ============================================================
   UPDATE STATUS
============================================================ */

function updateAllotmentStatus(allotment) {

    const status =
        String(
            allotment.status || ""
        ).toUpperCase();


    const statusElement =
        document.getElementById(
            "allotmentStatus"
        );


    const statusIcon =
        document.getElementById(
            "statusIcon"
        );


    const statusDescription =
        document.getElementById(
            "statusDescription"
        );


    const resultSection =
        document.getElementById(
            "allotmentResult"
        );


    const notAllottedSection =
        document.getElementById(
            "notAllotted"
        );



    /* =========================================
       ALLOTTED
    ========================================= */

    if (status === "ALLOTTED") {

        if (statusElement) {

            statusElement.textContent =
                "Seat Allotted";

        }


        if (statusIcon) {

            statusIcon.textContent =
                "✓";

        }


        if (statusDescription) {

            statusDescription.textContent =
                "Congratulations! A seat has been allotted to you.";

        }


        if (resultSection) {

            resultSection.style.display =
                "block";

        }


        if (notAllottedSection) {

            notAllottedSection.style.display =
                "none";

        }

        return;

    }



    /* =========================================
       NOT ALLOTTED
    ========================================= */

    if (statusElement) {

        statusElement.textContent =
            "Allotment Not Published";

    }


    if (statusIcon) {

        statusIcon.textContent =
            "i";

    }


    if (statusDescription) {

        statusDescription.textContent =
            "Your seat allotment has not yet been published.";

    }


    if (resultSection) {

        resultSection.style.display =
            "none";

    }


    if (notAllottedSection) {

        notAllottedSection.style.display =
            "block";

    }

}



/* ============================================================
   LOAD PAGE
============================================================ */

function loadAllotmentOrder() {

    console.log(
        "Loading allotment order..."
    );


    let student =
        getStudentData();


    let allotment =
        getAllotmentData();



    /*
       TEMPORARY FALLBACK

       Remove this later when backend
       integration is completed.
    */

    if (!student || !allotment) {

        const demo =
            getDemoData();


        if (!student) {

            student =
                demo.student;

        }


        if (!allotment) {

            allotment =
                demo.allotment;

        }

    }



    displayStudentInformation(
        student
    );


    displayAllotmentInformation(
        allotment
    );


    updateAllotmentStatus(
        allotment
    );


    console.log(
        "Allotment order loaded successfully."
    );

}



/* ============================================================
   PAGE INITIALIZATION
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAllotmentOrder();

    }
);