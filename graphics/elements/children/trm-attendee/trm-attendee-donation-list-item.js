import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
class TRMAttendeeDonationListItem extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					width: 100%;
				}

				#body {
					display: flex;
					flex-wrap: wrap;
					font-size: 26px;
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
					color: #aaa;
					font-size: 22px;
					margin-top: 20px;
					width: 100%;
				}
			</style>

			<div id="body">
				<div class="row">
					<div id="name"></div>
					<div id="amount-container">$<span id="amount"></span></div>
				</div>
				<div id="comment"></div>
			</div>
		`;
	}

	static get is() {
		return "trm-attendee-donation-list-item";
	}

	static get properties() {
		return {
			donation: Object,
		};
	}

	ready() {
		super.ready();

		this.$.amount.textContent = this.donation.amount.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
		this.$.name.textContent = this.donation.name;

		if (this.donation.comment) {
			this.$.comment.textContent = this.donation.comment;
		} else {
			this.$.comment.style.display = "none";
		}
	}
}

customElements.define(TRMAttendeeDonationListItem.is, TRMAttendeeDonationListItem);
