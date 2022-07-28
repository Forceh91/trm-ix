import { html } from "../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { beforeNextRender } from "../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";

const donationTotal = nodecg.Replicant("total");
class DashboardDonationGoalListItem extends PolymerElement {
	static get template() {
		return html`
			<link rel="stylesheet" href="../../node_modules/bootstrap/dist/css/bootstrap.min.css" />

			<style>
				* {
					box-sizing: border-box;
				}

				#body {
					align-items: center;
					display: flex;
					flex-wrap: wrap;
					width: 100%;
				}

				.row {
					align-items: center;
					display: flex;
					flex-wrap: nowrap;
					margin-bottom: 15px;
					width: 100%;
				}

				.row:last-child {
					margin-bottom: 0;
				}

				.row > div {
					width: 100%;
				}

				.row.header {
					font-weight: bold;
				}

				.right-align {
					text-align: right;
				}

				.remaining {
					color: #888;
					text-transform: uppercase;
					width: 100%;
				}

				button {
					float: right;
					margin: 0;
					width: 100px;
				}
			</style>

			<div id="body">
				<div class="row no-gutters header">
					<div>[[goal.reward]]</div>
					<div class="right-align">$[[_parseTotal(goal.total)]]</div>
				</div>
				<div class="row no-gutters">
					<div>
						<span class="remaining">$[[_parseTotalRemaining(goal.total)]] remaining</span>
					</div>
					<div>
						<button type="button" id="remove" class="btn btn-sm btn-danger" title="Remove donation goal">Remove</button>
					</div>
				</div>
			</div>
		`;
	}

	static get is() {
		return "dashboard-donation-goal-list-item";
	}

	static get properties() {
		return {
			goal: Object,
		};
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
		donationTotal.on("change", () => {
			this._parseTotalRemaining(this.goal.total);
		});

		this.$.remove.addEventListener("click", this._removeDonationGoal.bind(this));
	}

	_parseTotal(total) {
		return total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	_parseTotalRemaining(total) {
		return (total - donationTotal.value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	_removeDonationGoal() {
		let confirmation = confirm(`Are you sure you want to remove this donation goal?`);
		if (!confirmation) {
			return;
		}

		nodecg.sendMessage("removeDonationGoal", this.goal.goalid);
	}
}

customElements.define(DashboardDonationGoalListItem.is, DashboardDonationGoalListItem);
