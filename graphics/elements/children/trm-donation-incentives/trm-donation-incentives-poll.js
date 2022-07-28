import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
import {} from "../../../../node_modules/@polymer/polymer/lib/elements/dom-repeat.js";

const pollOptionHoldDuration = 10;

class TRMDonationIncentivesPoll extends PolymerElement {
	static get template() {
		return html`
			<link rel="stylesheet" href="../shared/fonts/fontawesome/font-awesome.min.css" />

			<style>
				* {
					box-sizing: border-box;
				}

				:host {
					box-sizing: border-box;
					display: flex;
					float: left;
					height: 100%;
					min-width: 100%;
					width: 100%;
				}

				#body {
					background: #333;
					color: #ddd;
					width: 100%;
					display: flex;
					align-items: center;
					flex-direction: column;
					padding: 15px;
					height: 100%;
					overflow: hidden;
				}

				#body #poll_title {
					align-items: flex-start;
					display: flex;
					font-size: 20px;
					font-weight: bold;
					justify-content: center;
					margin-bottom: 25px;
					text-transform: uppercase;
					text-align: center;
				}

				#body #poll_options {
					overflow: hidden;
					width: 100%;
				}

				#body #poll_title #poll_title_type {
					color: var(--marathon-col);
				}

				#body #poll_title #poll_title_text {
					padding: 0 10px;
				}

				#body .poll-option {
					align-items: center;
					border: 1px solid #aaa;
					background: #444;
					display: flex;
					font-size: 20px;
					margin-bottom: 25px;
					text-align: right;
					width: 100%;
				}

				#body .poll-option .poll-option-amount {
					align-items: center;
					background: var(--marathon-col);
					display: flex;
					justify-content: center;
					padding: 10px;
					width: 95px;
				}

				#body .poll-option .poll-option-text {
					padding: 0 10px;
				}
			</style>

			<div id="body">
				<div id="poll_title">
					<div id="poll_title_type"><i class="fas fa-chart-bar"></i></div>
					<div id="poll_title_text">[[poll.name]]</div>
				</div>

				<div id="poll_options">
					<div id="poll_options_scroller">
						<dom-repeat id="poll_options_repeater" items="[[_sortedOptions(poll.options)]]" as="polloption" sort="_sortPoll">
							<template>
								<div class="poll-option">
									<div class="poll-option-amount">[[_displayTotal(polloption.totalAmountRaised)]]</div>
									<div class="poll-option-text">[[polloption.name]]</div>
								</div>
							</template>
						</dom-repeat>
					</div>
				</div>
			</div>
		`;
	}

	static get is() {
		return "trm-donation-incentives-poll";
	}

	static get properties() {
		return {
			poll: Object,
		};
	}

	ready() {
		super.ready();

		TweenLite.set(this.$.poll_options, { opacity: 0 });
	}

	enter(displayDuration, scrollHoldDuration) {
		const tl = new TimelineLite();

		tl.to(this.$.poll_options, 0.75, {
			opacity: 1,
			ease: Power3.easeIn,
			onComplete: () => {
				this.autoScrollOptions(tl, displayDuration, scrollHoldDuration);
			},
		});

		return tl;
	}

	autoScrollOptions(tl, displayDuration, scrollHoldDuration) {
		const newTl = new TimelineLite();
		let totalHeight = 0;

		// get children
		let children = this.$.poll_options.children,
			childObject = null;
		for (var child in children) {
			if (children.hasOwnProperty(child) === false || (childObject = children[child]) === null) {
				continue;
			}

			// ignore the template
			if (childObject.clientHeight == 0) {
				continue;
			}

			totalHeight += childObject.clientHeight + 5;
		}

		this.$.poll_options_scroller.style.height = `${totalHeight}px`;

		if (totalHeight < this.$.body.clientHeight / 2) {
			return tl;
		}

		let boundingRect = null,
			pollOptionsEnd = this.$.poll_options.getBoundingClientRect().bottom,
			movementAmount = 0;

		children = [...this.$.poll_options_scroller.children];

		children.forEach((childObject, ix) => {
			// ignore the template
			if (childObject.clientHeight == 0) return true;

			boundingRect = childObject.getBoundingClientRect();
			if (boundingRect.bottom > pollOptionsEnd) {
				movementAmount = boundingRect.bottom - pollOptionsEnd + 20;
				if (this.$.poll_options_scroller.style.marginTop) {
					movementAmount += Math.abs(parseInt(this.$.poll_options_scroller.style.marginTop));
				}

				tl.pause();

				// wait a bit and then move it into view (+ a bit more to be safe)
				newTl.to(this, scrollHoldDuration, {});
				newTl.to(this.$.poll_options_scroller, 0.75, {
					marginTop: `-${movementAmount}px`,
					ease: Power3.easeOut,
					onComplete: () => {
						if (ix === children.length - 2) tl.resume();
					},
				});
			}
		});
	}

	exit() {
		const tl = new TimelineLite();
		tl.to(this, 0.75, { marginLeft: "-100%", ease: Power3.easeOut });
		return tl;
	}

	_sortPoll(a, b) {
		return b.total - a.total;
	}

	_sortedOptions(options) {
		options = options.slice(0);
		options = options.sort(function (a, b) {
			return b.totalAmountRaised - a.totalAmountRaised;
		});

		return options;
	}

	_displayTotal(total) {
		return "$" + total.toLocaleString("en-US", { maximumFractionDigits: 0 });
	}

	_displayClass(index) {
		if (index > 0) {
			return "body";
		}

		return "body is-winning";
	}
}

customElements.define(TRMDonationIncentivesPoll.is, TRMDonationIncentivesPoll);
