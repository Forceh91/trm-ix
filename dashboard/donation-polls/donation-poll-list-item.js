import { html } from "../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { beforeNextRender } from "../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";
import "../../node_modules/@polymer/polymer/lib/elements/dom-repeat.js";

class DashboardDonationPollListItem extends PolymerElement {
	static get template() {
		return html`
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

				.poll-option .label {
					font-weight: bold;
					margin-bottom: 10px;
					width: 100%;
				}
			</style>

			<div id="body">
				<div class="row header">
					<div>[[poll.name]]</div>
				</div>
				<div class="row">
					<dom-repeat items="[[poll.options]]" as="polloption" sort="_sortPoll">
						<template>
							<div class="poll-option">
								<div class="label">[[polloption.name]]</div>
								<div class="total">
									$[[_parseTotal(polloption.totalAmountRaised)]]
								</div>
							</div>
						</template>
					</dom-repeat>
				</div>
			</div>
		`;
	}

	static get is() {
		return "dashboard-donation-poll-list-item";
	}

	static get properties() {
		return {
			poll: Object,
		};
	}

	ready() {
		super.ready();
		beforeNextRender(this, this.run);
	}

	run() {}

	_sortPoll(a, b) {
		return b.totalAmountRaised - a.totalAmountRaised;
	}

	_parseTotal(total) {
		return total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}
}

customElements.define(DashboardDonationPollListItem.is, DashboardDonationPollListItem);
