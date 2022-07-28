import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

class TRMAttendeeDonationGoalAchieved extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					align-items: center;
					animation: goalFlash 5s;
					display: flex;
					height: 100%;
					justify-content: center;
					left: 0;
					position: absolute;
					top: 0;
					width: 100%;
				}

				#popover {
					align-items: center;
					background: #333;
					border: 1px solid var(--marathon-col);
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					font-size: 40px;
					justify-content: center;
					min-height: 150px;
					padding: 20px;
					width: 770px;
				}

				@keyframes goalFlash {
					0% {
						background: darkgoldenrod;
					}
					10% {
						background: transparent;
					}
					20% {
						background: darkgoldenrod;
					}
					30% {
						background: transparent;
					}
					40% {
						background: darkgoldenrod;
					}
					50% {
						background: transparent;
					}
					60% {
						background: darkgoldenrod;
					}
					70% {
						background: transparent;
					}
					80% {
						background: darkgoldenrod;
					}
					100% {
						background: transparent;
					}
				}

				#amount,
				#name {
					font-weight: bold;
				}

				#amount-container {
					color: var(--marathon-col);
				}

				#name {
					text-align: center;
					width: 100%;
				}

				#title {
					font-size: 25px;
					margin-bottom: 20px;
					text-align: center;
					width: 100%;
				}
			</style>

			<div id="popover">
				<div id="title">DONATION GOAL ACHIEVED</div>
				<div id="amount-container">$<span id="amount"></span></div>
				<div id="name"></div>
			</div>
		`;
	}

	static get is() {
		return "trm-attendee-donation-goal-achieved";
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
		this.$.name.textContent = this.goal.reward;
	}
}

customElements.define(TRMAttendeeDonationGoalAchieved.is, TRMAttendeeDonationGoalAchieved);
