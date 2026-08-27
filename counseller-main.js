const controlButton =
    document.getElementById("controlButton");

const controlStatus =
    document.getElementById("controlStatus");

const controlMessage =
    document.getElementById("controlMessage");


let counsellingActive = false;


controlButton.addEventListener(
    "click",
    function () {

        counsellingActive =
            !counsellingActive;


        if (counsellingActive) {

            // ON

            controlStatus.textContent =
                "COUNSELLING ON";

            controlStatus.style.color =
                "#34804a";

            controlMessage.textContent =
                "Counselling is currently active.";

            controlButton.textContent =
                "TURN OFF";

            controlButton.classList.remove(
                "off"
            );

            controlButton.classList.add(
                "on"
            );

        }

        else {

            // OFF

            controlStatus.textContent =
                "COUNSELLING OFF";

            controlStatus.style.color =
                "#a33b3b";

            controlMessage.textContent =
                "Counselling is currently stopped.";

            controlButton.textContent =
                "TURN ON";

            controlButton.classList.remove(
                "on"
            );

            controlButton.classList.add(
                "off"
            );

        }

    }
);