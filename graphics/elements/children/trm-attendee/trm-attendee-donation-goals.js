import "./trm-attendee-donation-goal-item.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const donationGoals = nodecg.Replicant("donationGoals");
const DISPLAY_DURATION = nodecg.bundleConfig.attendeeDonationGoalDisplayDuration || 10;

class TRMAttendeeDonationGoals extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					height: 100%;
					overflow: hidden;
					width: 100%;
				}

				#goalList {
					align-items: center;
					color: #fff;
					font-size: 30px;
					justify-content: center;
					margin-top: 20px;
					width: 100%;
				}

				.donation-goals-title {
					font-size: 15px;
					text-transform: uppercase;
				}

				#goalList trm-attendee-donation-goal-item {
					display: flex;
				}

				#noData {
					font-size: 20px;
					margin-top: 20px;
					text-transform: uppercase;
				}
			</style>

			<div class="donation-goals-title">Donation Goals</div>
			<div id="noData">There are currently no donation goals</div>
			<div id="goalList"></div>
		`;
	}

	static get is() {
		return "trm-attendee-donation-goals";
	}

	ready() {
		super.ready();

		// list of replicants we need
		const replicants = [donationGoals];

		let numDeclared = 0;
		replicants.forEach((replicant) => {
			replicant.once("change", () => {
				numDeclared++;

				if (numDeclared == replicants.length) {
					beforeNextRender(this, this.run);
				}
			});
		});
	}

	run() {
		const self = this;
		const parts = [this.showDonationGoals];

		function processNextPart() {
			if (parts.length > 0) {
				const part = parts.shift().bind(self);
				promisifyTimeline(part())
					.then(processNextPart)
					.catch((error) => {
						nodecg.log.error("Error when running main loop:", error);
					});
			} else {
				self.run();
			}
		}

		function promisifyTimeline(tl) {
			return new Promise((resolve) => {
				tl.call(resolve, null, null, "+=0.03");
			});
		}

		processNextPart();
	}

	showDonationGoals() {
		const tl = new TimelineLite();

		let goals = donationGoals.value;
		if (!goals || goals.length < 1) {
			this.$.noData.style.display = "block";
			return tl;
		}

		this.$.noData.style.display = "none";
		this.$.goalList.innerHTML = "";

		goals.forEach((goal, index) => {
			const donationGoalItemElement = document.createElement("trm-attendee-donation-goal-item");
			donationGoalItemElement.goal = goal;

			this.$.goalList.appendChild(donationGoalItemElement);

			// tl.to(donationGoalItemElement, 0.75, {
			// 	opacity: 1,
			// 	ease: Power3.easeIn,
			// });
			// tl.to({}, DISPLAY_DURATION, {});
			// tl.to(donationGoalItemElement, 0.75, {
			// 	marginLeft: "-100%",
			// 	ease: Power3.easeOut,
			// });
		});

		return tl;
	}
}

customElements.define(TRMAttendeeDonationGoals.is, TRMAttendeeDonationGoals);
