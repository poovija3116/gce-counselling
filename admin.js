// ==========================================
// DEFAULT SEAT DATA
// ==========================================

const defaultSeatData = {

    "AUTO": {
        OC:  { total: 10, occupied: 8 },
        BC:  { total: 20, occupied: 17 },
        BCM: { total: 5, occupied: 4 },
        SC:  { total: 8, occupied: 7 },
        ST:  { total: 2, occupied: 2 },
        SCA: { total: 1, occupied: 1 }
    },

    "CIVIL": {
        OC:  { total: 10, occupied: 9 },
        BC:  { total: 20, occupied: 18 },
        BCM: { total: 5, occupied: 5 },
        SC:  { total: 8, occupied: 6 },
        ST:  { total: 2, occupied: 1 },
        SCA: { total: 1, occupied: 1 }
    },

    "MECH": {
        OC:  { total: 10, occupied: 7 },
        BC:  { total: 20, occupied: 16 },
        BCM: { total: 5, occupied: 4 },
        SC:  { total: 8, occupied: 7 },
        ST:  { total: 2, occupied: 2 },
        SCA: { total: 1, occupied: 1 }
    },

    "CSE": {
        OC:  { total: 10, occupied: 9 },
        BC:  { total: 20, occupied: 19 },
        BCM: { total: 5, occupied: 4 },
        SC:  { total: 8, occupied: 8 },
        ST:  { total: 2, occupied: 2 },
        SCA: { total: 1, occupied: 1 }
    },

    "ECE": {
        OC:  { total: 10, occupied: 8 },
        BC:  { total: 20, occupied: 18 },
        BCM: { total: 5, occupied: 5 },
        SC:  { total: 8, occupied: 7 },
        ST:  { total: 2, occupied: 1 },
        SCA: { total: 1, occupied: 1 }
    },

    "EEE": {
        OC:  { total: 10, occupied: 10 },
        BC:  { total: 20, occupied: 20 },
        BCM: { total: 5, occupied: 5 },
        SC:  { total: 8, occupied: 8 },
        ST:  { total: 2, occupied: 2 },
        SCA: { total: 1, occupied: 1 }
    },

    "IT": {
        OC:  { total: 10, occupied: 7 },
        BC:  { total: 20, occupied: 17 },
        BCM: { total: 5, occupied: 4 },
        SC:  { total: 8, occupied: 7 },
        ST:  { total: 2, occupied: 2 },
        SCA: { total: 1, occupied: 1 }
    },

    "CSE DS": {
        OC:  { total: 5, occupied: 4 },
        BC:  { total: 10, occupied: 8 },
        BCM: { total: 3, occupied: 2 },
        SC:  { total: 4, occupied: 4 },
        ST:  { total: 1, occupied: 1 },
        SCA: { total: 1, occupied: 1 }
    }

};


// ==========================================
// LOAD DATA FROM LOCAL STORAGE
// ==========================================

let seatData =
    JSON.parse(localStorage.getItem("gceSeatData"))
    || structuredClone(defaultSeatData);


// ==========================================
// HTML ELEMENTS
// ==========================================

const branchSelect =
    document.getElementById("branch");

const categorySelect =
    document.getElementById("category");

const totalSeatsInput =
    document.getElementById("totalSeats");

const occupiedSeatsInput =
    document.getElementById("occupiedSeats");

const vacancyDisplay =
    document.getElementById("vacancy");

const updateButton =
    document.getElementById("updateButton");

const message =
    document.getElementById("message");

const adminTableBody =
    document.getElementById("adminTableBody");


// ==========================================
// CALCULATE VACANCY
// ==========================================

function calculateVacancy() {

    const total =
        Number(totalSeatsInput.value) || 0;

    const occupied =
        Number(occupiedSeatsInput.value) || 0;

    const vacancy =
        total - occupied;

    vacancyDisplay.textContent =
        vacancy >= 0 ? vacancy : 0;

}


// ==========================================
// LOAD SELECTED DATA
// ==========================================

function loadSelectedData() {

    const branch =
        branchSelect.value;

    const category =
        categorySelect.value;

    const data =
        seatData[branch][category];

    totalSeatsInput.value =
        data.total;

    occupiedSeatsInput.value =
        data.occupied;

    calculateVacancy();

}


// ==========================================
// INPUT CHANGE
// ==========================================

totalSeatsInput.addEventListener(
    "input",
    calculateVacancy
);

occupiedSeatsInput.addEventListener(
    "input",
    calculateVacancy
);


branchSelect.addEventListener(
    "change",
    loadSelectedData
);

categorySelect.addEventListener(
    "change",
    loadSelectedData
);


// ==========================================
// UPDATE SEAT DATA
// ==========================================

updateButton.addEventListener(
    "click",
    function () {

        const branch =
            branchSelect.value;

        const category =
            categorySelect.value;

        const total =
            Number(totalSeatsInput.value);

        const occupied =
            Number(occupiedSeatsInput.value);


        // VALIDATION

        if (
            isNaN(total) ||
            isNaN(occupied)
        ) {

            showMessage(
                "Please enter valid numbers.",
                "error"
            );

            return;
        }


        if (total < 0 || occupied < 0) {

            showMessage(
                "Seat values cannot be negative.",
                "error"
            );

            return;
        }


        if (occupied > total) {

            showMessage(
                "Occupied seats cannot be greater than total seats.",
                "error"
            );

            return;
        }


        // UPDATE DATA

        seatData[branch][category].total =
            total;

        seatData[branch][category].occupied =
            occupied;


        // SAVE

        localStorage.setItem(
            "gceSeatData",
            JSON.stringify(seatData)
        );


        // UPDATE SCREEN

        calculateVacancy();

        renderAdminTable();


        showMessage(
            `${branch} - ${category} updated successfully.`,
            "success"
        );

    }
);


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(text, type) {

    message.textContent =
        text;

    if (type === "success") {

        message.style.color =
            "#166534";

    } else {

        message.style.color =
            "#b91c1c";

    }

}


// ==========================================
// RENDER ADMIN TABLE
// ==========================================

function renderAdminTable() {

    adminTableBody.innerHTML = "";


    Object.keys(seatData).forEach(
        branch => {

            Object.keys(seatData[branch]).forEach(
                category => {

                    const data =
                        seatData[branch][category];

                    const vacancy =
                        data.total -
                        data.occupied;


                    const row =
                        document.createElement("tr");


                    let status;


                    if (vacancy === 0) {

                        status =
                            `<span class="status-full">
                                FULL
                            </span>`;

                    } else {

                        status =
                            `<span class="status-available">
                                AVAILABLE
                            </span>`;

                    }


                    row.innerHTML = `

                        <td>
                            ${branch}
                        </td>

                        <td>
                            ${category}
                        </td>

                        <td>
                            ${data.total}
                        </td>

                        <td>
                            ${data.occupied}
                        </td>

                        <td>
                            ${vacancy}
                        </td>

                        <td>
                            ${status}
                        </td>

                    `;


                    adminTableBody.appendChild(row);

                }
            );

        }
    );

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadSelectedData();

renderAdminTable();