import "./trm-donation-incentives-poll.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

class TRMDonationIncentivesPolls extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					display: flex;
					height: 100%;
					width: 100%;
				}

				#polls {
					display: flex;
					height: 200px;
					width: 100%;
				}
			</style>

			<div id="polls"></div>
		`;
	}

	static get is() {
		return "trm-donation-incentives-polls";
	}

	static get properties() {
		return {
			polls: Array,
		};
	}

	ready() {
		super.ready();
	}

	enter(displayDuration, scrollHoldDuration) {
		const tl = new TimelineLite();

		this.polls.forEach((poll, index) => {
			const pollElement = document.createElement("trm-donation-incentives-poll");
			pollElement.poll = poll;

			tl.call(
				() => {
					this.$.polls.appendChild(pollElement);
				},
				null,
				null,
				"+=0.03"
			);

			tl.call(() => {
				tl.pause();

				const tempTl = pollElement.enter(displayDuration, scrollHoldDuration);
				tempTl.call(tl.resume, null, tl);
			});

			tl.call(
				() => {
					tl.pause();

					const tempTl = pollElement.exit();
					tempTl.call(tl.resume, null, tl);
				},
				null,
				null,
				`+=${displayDuration}`
			);
		});

		return tl;
	}

	exit() {
		const tl = new TimelineLite();
		return tl;
	}
}

customElements.define(TRMDonationIncentivesPolls.is, TRMDonationIncentivesPolls);
