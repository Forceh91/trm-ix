import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
const donationTotal = nodecg.Replicant("total");

class TRMAttendeeDonationGoalItem extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					width: 100%;
				}

				#body {
					display: flex;
					flex-wrap: wrap;
					font-size: 20px;
					justify-content: center;
					padding-bottom: 20px;
					width: 100%;
				}

				.row {
					display: flex;
					width: 100%;
				}

				#amount-container {
					display: inline-block;
					text-align: right;
					width: 100%;
				}

				#amount,
				#goal {
					font-weight: bold;
				}

				#goal {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					width: 100%;
				}

				#remaining-container {
					color: #aaa;
					font-size: 20px;
					margin-top: 20px;
					width: 100%;
				}
			</style>

			<div id="body">
				<div class="row">
					<div id="goal"></div>
					<div id="amount-container">$<span id="amount"></span></div>
				</div>
				<div id="remaining-container">$<span id="remaining"></span> remaining</div>
			</div>
		`;
	}

	static get is() {
		return "trm-attendee-donation-goal-item";
	}

	static get properties() {
		return {
			goal: Object,
		};
	}

	ready() {
		super.ready();

		this.$.amount.textContent = this.goal.total.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
		this.$.goal.textContent = this.goal.reward;
		this.$.remaining.textContent = (this.goal.total - donationTotal.value).toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

		donationTotal.on("change", (newVal) => {
			this.$.remaining.textContent = (this.goal.total - newVal).toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
		});
	}
}

customElements.define(TRMAttendeeDonationGoalItem.is, TRMAttendeeDonationGoalItem);
