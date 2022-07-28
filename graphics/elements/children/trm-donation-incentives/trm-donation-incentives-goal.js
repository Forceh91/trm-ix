import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const total = nodecg.Replicant("total");

class TRMDonationIncentivesGoal extends PolymerElement {
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

				#body .incentive-data.additional {
					font-size: 20px;
				}
			</style>

			<div id="body">
				<div id="incentive_title">
					<div id="incentive_title_type"><i class="fas fa-bullseye"></i></div>
					<div id="incentive_title_text">[[goal.reward]]</div>
				</div>
				<div class="incentive-data"><span id="total"></span> / $[[_prettifyAmount(goal.total)]]</div>
				<div class="incentive-data additional"><span id="remaining"></span> remaining</div>
			</div>
		`;
	}

	static get is() {
		return "trm-donation-incentives-goal";
	}

	static get properties() {
		return {
			goal: Object,
			ix: Number,
		};
	}

	ready() {
		super.ready();

		TweenLite.set(this.$.body, { opacity: 0 });
	}

	enter() {
		const tl = new TimelineLite();

		tl.to([this.$.body], 0.75, {
			opacity: 1,
			ease: Power3.easeIn,
		});

		return tl;
	}

	exit() {
		const tl = new TimelineLite();
		tl.to(this, 0.75, { marginLeft: "-100%", ease: Power3.easeOut });
		return tl;
	}

	render() {
		const tl = new TimelineLite();
		if (total.value > this.goal.total) {
			return this.exit();
		}

		this.$.total.innerHTML =
			"$" +
			total.value.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});

		this.$.remaining.innerHTML =
			"$" +
			(this.goal.total - total.value).toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
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

customElements.define(TRMDonationIncentivesGoal.is, TRMDonationIncentivesGoal);
