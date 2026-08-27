const displayDate =
    document.getElementById("displayDate");

const displayTime =
    document.getElementById("displayTime");

const displayAnnouncement =
    document.getElementById("displayAnnouncement");

const displayDocuments =
    document.getElementById("displayDocuments");

const displayGuidelines =
    document.getElementById("displayGuidelines");


// ==========================================
// GET SAVED COUNSELLING DETAILS
// ==========================================

const savedDetails =
    JSON.parse(
        localStorage.getItem(
            "counsellingDetails"
        )
    );


// ==========================================
// DISPLAY DATA
// ==========================================

if (savedDetails) {

    displayDate.textContent =
        savedDetails.date || "Not updated";

    displayTime.textContent =
        savedDetails.time || "Not updated";

    displayAnnouncement.textContent =
        savedDetails.announcement ||
        "No announcements available.";

    displayDocuments.textContent =
        savedDetails.documents ||
        "No document information available.";

    displayGuidelines.textContent =
        savedDetails.guidelines ||
        "No guidelines available.";

}