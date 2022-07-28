import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const donationTotal = nodecg.Replicant("total");

class TRMMarathonTotal extends PolymerElement {
	static get template() {
		return html`
			<link rel="stylesheet" href="../shared/fonts/exo2/exo2.css" />

			<style>
				:host {
					width: 100%;
				}

				#total {
					align-items: center;
					color: #fff;
					display: flex;
					font-size: 4rem;
					font-weight: bold;
					justify-content: center;
					padding: 0 10px;
					width: 100%;
				}

				#total_amount {
					font-variant-numeric: tabular-nums;
				}
			</style>

			<div id="total">
				<span id="total_currency">$</span>
				<span id="total_amount"></span>
			</div>
		`;
	}

	static get is() {
		return "trm-marathon-total";
	}

	ready() {
		super.ready();

		donationTotal.on("change", (newVal, oldVal) => {
			this.updateDonationTotal(newVal, oldVal);
		});
	}

	updateDonationTotal(newVal, oldVal) {
		oldVal = oldVal || 0;
		let donationTotal = parseFloat(newVal);
		let donationTotalIncrease = donationTotal - oldVal;
		let timeToUpdate = (Math.min(donationTotalIncrease * 0.03), 5);
		let previousTotal = { value: oldVal };

		new TimelineLite({ autoRemoveChildren: true }).to(
			previousTotal,
			timeToUpdate,
			{
				value: newVal || 0,
				ease: Power3.easeOut,
				onUpdate: function () {
					this.$.total_amount.textContent = previousTotal.value.toLocaleString("en-US", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					});
				}.bind(this),
			},
			"0"
		);
	}
}

customElements.define(TRMMarathonTotal.is, TRMMarathonTotal);
