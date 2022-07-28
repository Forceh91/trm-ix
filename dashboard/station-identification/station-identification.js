(function() {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        let showButton = document.getElementById("showStationIdent");
        let hideButton = document.getElementById("hideStationIdent");
        let isActive = document.getElementById("isActive");

        showButton.addEventListener("click", () => {
            nodecg.sendMessage("stationIdentShow");
        });

        hideButton.addEventListener("click", () => {
            nodecg.sendMessage("stationIdentHide");
        });

        nodecg.listenFor("stationIdentShow", () => {
            showButton.setAttribute("disabled", true);
            hideButton.removeAttribute("disabled");
            
            isActive.textContent = "Showing";
            isActive.classList.add("active")
            isActive.classList.remove("hidden");
        });

        nodecg.listenFor("stationIdentHide", () => {
            hideButton.setAttribute("disabled", true);
            showButton.removeAttribute("disabled");

            isActive.textContent = "Hidden";
            isActive.classList.remove("active")
            isActive.classList.add("hidden");            
        });        
    });
})();