import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";
import { beforeNextRender } from "../../node_modules/@polymer/polymer/lib/utils/render-status.js";

const donationGoals = nodecg.Replicant("donationGoals");

class DashboardDonationGoalList extends PolymerElement {
	static get is() {
		return "dashboard-donation-goal-list";
	}

	static get properties() {
		return {};
	}

	ready() {
		super.ready();

		const replicants = [donationGoals];

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
		donationGoals.on("change", (goals) => {
			self.renderDonationGoalList(goals);
		});
	}

	renderDonationGoalList(goals) {
		this.$.noData.style.display = "none";

		// clear the list
		while (this.$.donationGoalList.firstChild) {
			this.$.donationGoalList.removeChild(this.$.donationGoalList.firstChild);
		}

		if (goals.length < 1) {
			this.$.noData.style.display = "block";
			return;
		}

		const sortedGoals = goals.slice(0).sort((a, b) => b.total - a.total);

		// show donation goals
		sortedGoals.forEach((goal) => {
			const donationGoalListElement = document.createElement("dashboard-donation-goal-list-item");
			donationGoalListElement.goal = goal;

			this.$.donationGoalList.prepend(donationGoalListElement);
		});
	}
}

customElements.define(DashboardDonationGoalList.is, DashboardDonationGoalList);
