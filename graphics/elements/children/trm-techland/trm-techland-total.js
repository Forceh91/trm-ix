import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const donationTotal = nodecg.Replicant("total");

class TRMTechLandTotal extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					height: 100%;
					width: 100%;
				}

				.total-container {
					color: var(--marathon-col);
				}

				.total-title {
					font-size: 15px;
					text-transform: uppercase;
				}
			</style>

			<div class="total-container">$<span id="total"></span></div>
		`;
	}

	static get is() {
		return "trm-techland-total";
	}

	static get properties() {
		return {};
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
				value: newVal,
				ease: Power3.easeOut,
				onUpdate: function () {
					this.$.total.textContent = previousTotal.value.toLocaleString("en-US", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					});
				}.bind(this),
			},
			"0"
		);
	}
}

customElements.define(TRMTechLandTotal.is, TRMTechLandTotal);
