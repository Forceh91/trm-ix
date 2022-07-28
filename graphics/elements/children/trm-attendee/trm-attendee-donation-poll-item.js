import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
import "../../../../node_modules/@polymer/polymer/lib/elements/dom-repeat.js";

class TRMAttendeeDonationPollItem extends PolymerElement {
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
					width: 100%;
				}

				#amount-container {
					display: inline-block;
					text-align: right;
					width: 100%;
				}

				#header,
				#total {
					font-weight: bold;
				}

				#header,
				#label,
				.label {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					width: 100%;
				}

				#header {
					color: var(--marathon-col);
					font-size: 25px;
					margin-bottom: 20px;
					text-transform: uppercase;
				}

				#remaining-container {
					color: #aaa;
					font-size: 20px;
					margin-top: 20px;
					width: 100%;
				}

				.body {
					display: flex;
					width: 100%;
				}

				.body:not(:last-child) {
					margin-bottom: 20px;
				}

				.body .label,
				.body .total {
					width: 100%;
				}

				.body .total {
					text-align: right;
				}
			</style>

			<div id="body">
				<div id="header">[[poll.name]]</div>
				<div class="row">
					<dom-repeat is="dom-repeat" items="[[_sortedOptions(poll.options)]]" as="polloption">
						<template>
							<div class$="[[_displayClass(index)]]">
								<div class="label">[[polloption.name]]</div>
								<div class="total">
									[[_displayTotal(polloption.totalAmountRaised)]]
								</div>
							</div>
						</template>
					</dom-repeat>
				</div>
			</div>
		`;
	}

	static get is() {
		return "trm-attendee-donation-poll-item";
	}

	static get properties() {
		return {
			poll: Object,
		};
	}

	ready() {
		super.ready();
	}

	_sortedOptions(options) {
		options = options.slice(0);
		options = options.sort(function (a, b) {
			return b.totalAmountRaised - a.totalAmountRaised;
		});

		return options;
	}

	_displayTotal(total) {
		return "$" + total.toLocaleString("en-US", { minimumFractionDigits: 2 });
	}

	_displayClass(index) {
		if (index > 0) {
			return "body";
		}

		return "body is-winning";
	}

	_displayTotalBehind(total) {
		let behind = total - this.poll.options[0].total;
		return "$" + behind.toLocaleString("en-US", { minimumFractionDigits: 2 });
	}
}

customElements.define(TRMAttendeeDonationPollItem.is, TRMAttendeeDonationPollItem);
