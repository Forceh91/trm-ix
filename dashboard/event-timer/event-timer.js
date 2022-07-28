import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";
import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";

const eventTimer = nodecg.Replicant("eventTimer");

class DashboardEventTimer extends PolymerElement {
	static get is() {
		return "dashboard-event-timer";
	}

	ready() {
		super.ready();

		const replicants = [eventTimer];

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

		eventTimer.on("change", (newVal) => {
			this.$.timer.textContent = newVal.formattedTime || "00:00";
			self.toggleButtonStatus(newVal.state);
		});

		this.$.startTimer.addEventListener("click", () => {
			nodecg.sendMessage("eventtimer:start");
		});

		this.$.pauseTimer.addEventListener("click", () => {
			nodecg.sendMessage("eventtimer:pause");
		});

		this.$.resetTimer.addEventListener("click", () => {
			const result = confirm("Are you sure you want to RESET the event timer to 00:00? This action CANNOT be UNDONE");
			if (result) nodecg.sendMessage("eventtimer:reset");
		});
	}

	toggleButtonStatus(state) {
		const isRunning = state === 1;
		this.$.startTimer.toggleAttribute("disabled", isRunning);
		this.$.resetTimer.toggleAttribute("disabled", isRunning);
		this.$.pauseTimer.toggleAttribute("disabled", !isRunning);
	}
}

customElements.define(DashboardEventTimer.is, DashboardEventTimer);
