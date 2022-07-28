import { PolymerElement } from "../../../node_modules/@polymer/polymer/polymer-element.js";
import { beforeNextRender } from "../../../node_modules/@polymer/polymer/lib/utils/render-status.js";

const donationTotal = nodecg.Replicant("total");

class DashboardDonationGoalAddDialog extends PolymerElement {
	static get is() {
		return "dashboard-donation-goal-add-dialog";
	}

	static get properties() {
		return {};
	}

	ready() {
		super.ready();

		const replicants = [donationTotal];

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
		document.addEventListener("dialog-confirmed", (e) => {
			let value = parseFloat(this.$.amount.value);
			if (value < donationTotal.value) {
				e.preventDefault();
				return;
			}

			let reward = this.$.reward.value;
			if (reward) {
				nodecg.sendMessage("addDonationGoal", {
					total: value,
					reward: reward,
				});
			}
		});
	}
}

customElements.define(DashboardDonationGoalAddDialog.is, DashboardDonationGoalAddDialog);
