import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

class TRMDonationIncentivesGoalAchieved extends PolymerElement {
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
					height: 100%:
					min-width: 100%;
					width: 100%;
				}

				#body {
					align-items: center;
					display: flex;
					flex-direction: column;
					justify-content: center;
					padding: 15px;
					width: 100%;
				}

				#body #incentive_title {
					font-size: 25px;
					display: flex;
					align-items: flex-start;
					margin-bottom: 25px;
					text-transform: uppercase;
					font-weight: bold;
					justify-content: center;
					text-align: center;
				}

				#body #incentive_title #incentive_title_type {
					color: var(--marathon-col);
				}

				#body #incentive_title #incentive_title_text {
					padding: 0 10px;
				}

				#body .incentive-data {
					font-size: 25px;
					margin-bottom: 10px;
				}

				#body .incentive-data:not(.additional) {
					color: #fff;
				}

				#body .incentive-data.highlight {
					color: var(--marathon-col);
					font-size: 60px;
					font-weight: bold;
					margin-bottom: 15px;
				}

				#body .incentive-data.additional {
					font-size: 30px;
				}
			</style>

			<div id="body">
				<div id="incentive_title">
					<div id="incentive_title_type"><i class="fas fa-trophy"></i></div>
					<div id="incentive_title_text">Donation goal achieved</div>
				</div>
				<div class="incentive-data highlight">$[[_prettifyAmount(goal.total)]]</div>
				<div class="incentive-data additional">[[goal.reward]]</div>
			</div>
			<audio id="goalAchievedSound" src="../../../assets/trm-vi/sounds/goalachieved.mp3" autoplay></audio>
		`;
	}

	static get is() {
		return "trm-donation-incentives-goal-achieved";
	}

	static get properties() {
		return {
			goal: Object,
		};
	}

	ready() {
		super.ready();

		TweenLite.set(this.$.body, { opacity: 0 });
		this.$.goalAchievedSound.volume = 0.2;
	}

	enter(displayDuration) {
		const tl = new TimelineLite();

		tl.to(this.$.body, 0.75, { opacity: 1, ease: Power3.easeIn });
		tl.to(this, 10, {});

		return tl;
	}

	exit() {
		const tl = new TimelineLite();
		tl.to(this, 0.75, {
			opacity: 0,
			ease: Power3.easeOut,
		});

		return tl;
	}

	_prettifyAmount(val) {
		return val.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	}
}

customElements.define(TRMDonationIncentivesGoalAchieved.is, TRMDonationIncentivesGoalAchieved);
