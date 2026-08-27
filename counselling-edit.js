const counsellingDate =
    document.getElementById("counsellingDate");

const counsellingTime =
    document.getElementById("counsellingTime");

const announcement =
    document.getElementById("announcement");

const documents =
    document.getElementById("documents");

const guidelines =
    document.getElementById("guidelines");

const saveDetails =
    document.getElementById("saveDetails");

const backButton =
    document.getElementById("backButton");

const saveMessage =
    document.getElementById("saveMessage");


// ==========================================
// LOAD EXISTING DATA
// ==========================================

const savedDetails =
    JSON.parse(
        localStorage.getItem(
            "counsellingDetails"
        )
    );


if (savedDetails) {

    counsellingDate.value =
        savedDetails.date || "";

    counsellingTime.value =
        savedDetails.time || "";

    announcement.value =
        savedDetails.announcement || "";

    documents.value =
        savedDetails.documents || "";

    guidelines.value =
        savedDetails.guidelines || "";

}


// ==========================================
// SAVE DETAILS
// ==========================================

saveDetails.addEventListener(
    "click",
    function () {

        const details = {

            date:
                counsellingDate.value,

            time:
                counsellingTime.value,

            announcement:
                announcement.value.trim(),

            documents:
                documents.value.trim(),

            guidelines:
                guidelines.value.trim()

        };


        localStorage.setItem(
            "counsellingDetails",
            JSON.stringify(details)
        );


        saveMessage.textContent =
            "Counselling details updated successfully.";


        setTimeout(function () {

            saveMessage.textContent = "";

        }, 3000);

    }
);


// ==========================================
// BACK
// ==========================================

backButton.addEventListener(
    "click",
    function () {

        history.back();

    }
);
