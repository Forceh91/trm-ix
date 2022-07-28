import { html } from "../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";
const wheelspinAmount = nodecg.bundleConfig.wheelspin_amount;

class DashboardDonationListItem extends PolymerElement {
	static get template() {
		return html`
			<link rel="stylesheet" href="../../node_modules/bootstrap/dist/css/bootstrap.min.css" />

			<style>
				:host {
					display: block;
					width: 100%;
				}

				* {
					box-sizing: border-box;
				}

				#body {
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					padding: 15px;
					width: 100%;
				}

				.row {
					flex-wrap: nowrap;
					width: 100%;
				}

				#amount-container {
					display: inline-block;
					text-align: right;
					width: 100%;
				}

				#amount,
				#name {
					font-weight: bold;
				}

				#name {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					width: 100%;
				}

				#comment {
					color: #888;
					margin-top: 10px;
					width: 100%;
				}

				button.mark-as-read {
					margin: 0;
					margin-left: auto;
				}

				button.mark-as-read {
					margin-top: 15px;
				}

				#tags {
					width: 100%;
				}

				#tags .tag {
					background: var(--marathon-col);
					color: #fff;
					display: inline-block;
					font-size: 0.7rem;
					font-weight: bold;
					margin-bottom: 10px;
					margin-top: 20px;
					padding: 10px;
					text-transform: uppercase;
					width: auto;
				}

				#tags .tag:not(:first-child) {
					margin-left: 10px;
				}

				#tags #needWheelspin {
					background: indianred;
				}
			</style>

			<div id="body">
				<div class="row">
					<div id="name"></div>
					<div id="amount-container">$<span id="amount"></span></div>
				</div>
				<div id="tags">
					<div class="tag" id="needWheelspin">Requires wheelspin</div>
				</div>
				<div id="comment"></div>
				<button type="button" class="btn btn-sm btn-danger mt-3 mark-as-read" id="markDonationRead">Mark as read</button>
			</div>
		`;
	}

	static get is() {
		return "dashboard-donation-list-item";
	}

	static get properties() {
		return {
			donation: Object,
		};
	}

	ready() {
		super.ready();

		this.$.amount.textContent = this.donation.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		this.$.name.textContent = this.donation.name;
		this.$.markDonationRead.addEventListener("click", this._markDonationRead.bind(this));

		if (this.donation.comment) {
			this.$.comment.textContent = this.donation.comment;
		} else {
			this.$.comment.style.display = "none";
		}

		if (!wheelspinAmount || wheelspinAmount === 0 || this.donation.amount < wheelspinAmount) {
			this.$.needWheelspin.style.display = "none";
		}
	}

	_markDonationRead() {
		this.donation.read = true;
	}
}

customElements.define(DashboardDonationListItem.is, DashboardDonationListItem);
