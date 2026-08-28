const tamil = {
    "Home": "முகப்பு",
    "How It Works": "இது எப்படி செயல்படுகிறது",
    "FAQ": "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    "Login": "உள்நுழைவு",

    "ANNOUNCEMENT": "அறிவிப்பு",
    "Welcome to GCE Erode Management Counselling 2026":
        "GCE Erode மேலாண்மை கலந்தாய்வு 2026-க்கு வரவேற்கிறோம்",

    "MANAGEMENT": "மேலாண்மை",
    "COUNSELLING 2026": "கலந்தாய்வு 2026",
    "Choose • Prefer • Allot • Confirm":
        "தேர்வு செய் • விருப்பம் தெரிவி • இடம் பெறு • உறுதிப்படுத்து",
    "STUDENT LOGIN": "மாணவர் உள்நுழைவு",

    "THE PROCESS": "செயல்முறை",
    "HOW IT WORKS": "இது எப்படி செயல்படுகிறது",
    "Your Choice -> Your College -> Your Future":
        "உங்கள் தேர்வு → உங்கள் கல்லூரி → உங்கள் எதிர்காலம்",

    "Check Your Details": "உங்கள் விவரங்களைச் சரிபார்க்கவும்",
    "Choose Your Preference": "உங்கள் விருப்பத்தைத் தேர்வு செய்யவும்",
    "Allotment": "இட ஒதுக்கீடு",
    "Details": "விவரங்கள்",
    "Preference": "விருப்பம்",

    "BENEFITS": "நன்மைகள்",
    "WHY ONLINE COUNSELLING?": "ஏன் ஆன்லைன் கலந்தாய்வு?",
    "Save Time": "நேரத்தைச் சேமிக்கவும்",
    "Easy Process": "எளிய செயல்முறை",
    "Transparent": "வெளிப்படையானது",

    "IMPORTANT": "முக்கியமானது",
    "COUNSELLING INFORMATION": "கலந்தாய்வு தகவல்கள்",
    "Counselling Schedule": "கலந்தாய்வு அட்டவணை",
    "Announcements": "அறிவிப்புகள்",
    "Required Documents": "தேவையான ஆவணங்கள்",
    "Guidelines": "வழிகாட்டுதல்கள்",

    "STEP BY STEP": "படிப்படியாக",
    "COUNSELLING PROCESS": "கலந்தாய்வு செயல்முறை",

    "HELP": "உதவி",
    "Frequently asked questions.": "அடிக்கடி கேட்கப்படும் கேள்விகள்.",

    "CONTACT US": "எங்களைத் தொடர்பு கொள்ளுங்கள்",
    "GCE Erode": "GCE ஈரோடு",
    "College Contact": "கல்லூரி தொடர்பு",
    "College Email": "கல்லூரி மின்னஞ்சல்",

    "Management Counselling 2026":
        "மேலாண்மை கலந்தாய்வு 2026"
};


function translatePage() {

    document.querySelectorAll("body *").forEach(function(element) {

        // Only elements containing text directly
        if (element.children.length === 0) {

            let text = element.textContent.trim();

            if (tamil[text]) {
                element.textContent = tamil[text];
            }
        }
    });
}


function changeLanguage(language) {

    if (language === "ta") {
        translatePage();
    } else {
        location.reload();
    }
}