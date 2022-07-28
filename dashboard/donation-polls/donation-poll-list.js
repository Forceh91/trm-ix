import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";
import { beforeNextRender } from "../../node_modules/@polymer/polymer/lib/utils/render-status.js";

const donationPolls = nodecg.Replicant("donationpolls");

class DashboardDonationPollList extends PolymerElement {
	static get is() {
		return "dashboard-donation-poll-list";
	}

	static get properties() {
		return {};
	}

	ready() {
		super.ready();

		const replicants = [donationPolls];

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
		donationPolls.on("change", (polls) => {
			self.renderDonationPollList(polls);
		});
	}

	renderDonationPollList(polls) {
		this.$.noData.style.display = "none";

		// clear the list
		while (this.$.donationPollList.firstChild) {
			this.$.donationPollList.removeChild(this.$.donationPollList.firstChild);
		}

		if (!polls || polls.length < 1) {
			this.$.noData.style.display = "block";
			return;
		}

		let _polls = polls.slice(0);
		_polls = _polls.filter((a) => {
			return a.active === true;
		});

		// show donation goals
		_polls.forEach((poll) => {
			const donationPollListElement = document.createElement("dashboard-donation-poll-list-item");
			donationPollListElement.poll = poll;

			this.$.donationPollList.prepend(donationPollListElement);
		});
	}
}

customElements.define(DashboardDonationPollList.is, DashboardDonationPollList);
