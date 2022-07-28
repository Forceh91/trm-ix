import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";
import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";

const countdownTimer = nodecg.Replicant("countdownTimer");
class DashboardCountdownTimer extends PolymerElement {
	static get is() {
		return "dashboard-countdown-timer";
	}

	ready() {
		super.ready();

		const replicants = [countdownTimer];

		let numDeclared = 0;
		replicants.forEach((replicant) => {
			replicant.once("change", () => {
				numDeclared++;

				if (numDeclared == replicants.length) {
					beforeNextRender(this, this.run);
				}
			});
		});
	}

	run() {
		const self = this;

		countdownTimer.on("change", (newVal) => {
			this.$.timer.textContent = newVal.formattedTime || "00:00";
			self.toggleButtonStatus(newVal.state);
		});

		this.$.startTimer.addEventListener("click", () => {
			nodecg.sendMessage("countdowntimer:start");
		});

		this.$.stopTimer.addEventListener("click", () => {
			nodecg.sendMessage("countdowntimer:reset");
		});
	}

	toggleButtonStatus(state) {
		const isRunning = state === 1;
		this.$.startTimer.toggleAttribute("disabled", isRunning);
		this.$.stopTimer.toggleAttribute("disabled", !isRunning);
	}
}

customElements.define(DashboardCountdownTimer.is, DashboardCountdownTimer);
