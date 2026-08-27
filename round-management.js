const numberOfRounds = document.getElementById("numberOfRounds");
const generateButton = document.getElementById("generateRoundsButton");
const roundContainer = document.getElementById("roundContainer");
const saveButton = document.getElementById("saveRoundsButton");
const saveMessage = document.getElementById("saveMessage");


// ================================
// GENERATE ROUNDS
// ================================

generateButton.addEventListener("click", function () {

    const totalRounds = Number(numberOfRounds.value);

    if (totalRounds < 1) {
        alert("Enter a valid number of rounds");
        return;
    }

    roundContainer.innerHTML = "";

    let startRank = 1;


    for (let i = 1; i <= totalRounds; i++) {

        // Default 45 students per round
        let endRank = startRank + 44;


        const round = document.createElement("div");

        round.className = "round-card";


        round.innerHTML = `

            <div class="round-number">
                ROUND ${String(i).padStart(2, "0")}
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
                    ${endRank - startRank + 1}
                </strong>

            </div>

        `;


        roundContainer.appendChild(round);


        startRank = endRank + 1;

    }


    addCalculationListeners();

});



// ================================
// UPDATE STUDENT COUNT
// ================================

function addCalculationListeners() {

    const rounds =
        document.querySelectorAll(".round-card");


    rounds.forEach(function (round) {

        const from =
            round.querySelector(".from-rank");

        const to =
            round.querySelector(".to-rank");

        const studentCount =
            round.querySelector(".student-number");


        function updateCount() {

            const fromValue = Number(from.value);
            const toValue = Number(to.value);


            if (
                fromValue > 0 &&
                toValue >= fromValue
            ) {

                const count =
                    toValue - fromValue + 1;

                studentCount.textContent = count;

            } else {

                studentCount.textContent = 0;

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

    });

}



// ================================
// SAVE
// ================================

saveButton.addEventListener("click", function () {

    const rounds =
        document.querySelectorAll(".round-card");


    if (rounds.length === 0) {

        alert("Generate rounds first.");

        return;
    }


    const roundData = [];


    rounds.forEach(function (round, index) {

        const from =
            Number(
                round.querySelector(".from-rank").value
            );


        const to =
            Number(
                round.querySelector(".to-rank").value
            );


        roundData.push({

            round: index + 1,

            fromRank: from,

            toRank: to,

            students: to - from + 1

        });

    });


    console.log(roundData);


    saveMessage.textContent =
        "✓ Round settings saved successfully.";

});