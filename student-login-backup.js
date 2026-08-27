// ==========================================
// GET ELEMENTS
// ==========================================

const loginForm =
    document.getElementById("loginForm");

const applicationNumber =
    document.getElementById("applicationNumber");

const password =
    document.getElementById("password");

const loginMessage =
    document.getElementById("loginMessage");


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const username =
            applicationNumber.value.trim();

        const enteredPassword =
            password.value.trim();


        // Get students created by Admin

        const students =
            JSON.parse(
                localStorage.getItem("gceStudents")
            ) || [];


        // Find student

        const student =
            students.find(
                student =>
                    student.username === username &&
                    student.password === enteredPassword
            );


        // Invalid login

        if (!student) {

            loginMessage.textContent =
                "Invalid username or password.";

            loginMessage.style.color =
                "#b91c1c";

            return;
        }


        // Save logged-in student

        localStorage.setItem(
            "studentLoggedIn",
            "true"
        );

        localStorage.setItem(
            "loggedInStudent",
            JSON.stringify(student)
        );


        loginMessage.textContent =
            "Login successful. Redirecting...";

        loginMessage.style.color =
            "#166534";


        // Go to student dashboard

        setTimeout(function () {

            window.location.href =
                "student-dashboard.html";

        }, 700);

    }
);
const roleButtons =
    document.querySelectorAll(".role-button");

const loginRole =
    document.getElementById("loginRole");


roleButtons.forEach(button => {

    button.addEventListener("click", function () {

        roleButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        loginRole.value =
            this.dataset.role;

    });

});


document
    .getElementById("loginForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value.trim();

        const role =
            loginRole.value;


        if (!username || !password) {

            document.getElementById("loginMessage")
                .textContent =
                "Please enter username and password.";

            return;
        }


        /*
         * Temporary frontend routing.
         * Later this will be replaced by
         * backend authentication.
         */

        if (role === "student") {

            window.location.href =
                "student-dashboard.html";

        }

        else if (role === "admin") {

            window.location.href =
                "admin-main.html";

        }

        else if (role === "counsellor") {

            window.location.href =
                "counseller-main.html";

        }

    });