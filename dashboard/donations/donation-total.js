import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";

const donationTotal = nodecg.Replicant("total");

class DashboardDonationTotal extends PolymerElement {
	static get is() {
		return "dashboard-donation-total";
	}

	ready() {
		super.ready();

		donationTotal.on("change", (newVal) => {
			this.$.total.textContent = (newVal || 0).toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
		});
	}
}

customElements.define(DashboardDonationTotal.is, DashboardDonationTotal);
