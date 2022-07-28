(function() {
    "use strict";

    class DashboardCountdownControl extends Polymer.Element {
        static get is() {
            return "dashboard-countdown-control";
        }

        ready() {
            super.ready();

            this.$.showCountdownOverlay.addEventListener("click", () => {
                nodecg.sendMessage("countdownUnfade");
            });

            this.$.hideCountdownOverlay.addEventListener("click", () => {
                nodecg.sendMessage("countdownFade");
            });            

            nodecg.listenFor("countdownFade", () => {
                this.$.hideCountdownOverlay.setAttribute("disabled", true);
                this.$.showCountdownOverlay.removeAttribute("disabled");
                this.$.isShowing.textContent = "Hidden";
                
                this.$.isShowing.classList.add("faded");
                this.$.isShowing.classList.remove("showing");
            });

            nodecg.listenFor("countdownUnfade", () => {
                this.$.showCountdownOverlay.setAttribute("disabled", true);
                this.$.hideCountdownOverlay.removeAttribute("disabled");
                this.$.isShowing.textContent = "Showing";

                this.$.isShowing.classList.remove("faded");
                this.$.isShowing.classList.add("showing");                
            });
        }
    }

    customElements.define(DashboardCountdownControl.is, DashboardCountdownControl);
})();
