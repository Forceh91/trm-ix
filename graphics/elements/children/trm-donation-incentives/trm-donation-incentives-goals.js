import "./trm-donation-incentives-goal.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

class TRMDonationIncentivesPoll extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					display: flex;
					height: 100%;
					width: 100%;
				}

				#goals {
					display: flex;
					height: auto;
					width: 100%;
				}
			</style>

			<div id="goals"></div>
		`;
	}

	static get is() {
		return "trm-donation-incentives-goals";
	}

	static get properties() {
		return {
			goals: Array,
		};
	}

	ready() {
		super.ready();
	}

	enter(displayDuration, scrollHoldDuration) {
		const tl = new TimelineLite();

		this.goals.forEach((goal, index) => {
			const goalElement = document.createElement("trm-donation-incentives-goal");
			goalElement.goal = goal;

			tl.call(
				() => {
					this.$.goals.appendChild(goalElement);
				},
				null,
				null,
				"+=0.03"
			);

			tl.call(() => {
				tl.pause();
				goalElement.render();

				const tempTl = goalElement.enter(displayDuration, scrollHoldDuration);
				tempTl.call(tl.resume, null, tl);
			});

			tl.call(
				() => {
					tl.pause();

					const tempTl = goalElement.exit();
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

customElements.define(TRMDonationIncentivesPoll.is, TRMDonationIncentivesPoll);
