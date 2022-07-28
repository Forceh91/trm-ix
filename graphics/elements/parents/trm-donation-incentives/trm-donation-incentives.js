import "../../../../shared/imports/gsap.js";
import "../../children/trm-donation-incentives/trm-donation-incentives-goals.js";
import "../../children/trm-donation-incentives/trm-donation-incentives-polls.js";
import "../../children/trm-donation-incentives/trm-donation-incentives-goal-achieved.js";

import { flush } from "../../../../node_modules/@polymer/polymer/lib/utils/flush.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { beforeNextRender, afterNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

// config
const DISPLAY_DURATION = nodecg.bundleConfig.donationNotificationDisplayDuration || 10;
const SCROLL_HOLD_DURATION = nodecg.bundleConfig.scrollHoldDuration || 5;

// replicants
const total = nodecg.Replicant("total");
const goals = nodecg.Replicant("donationGoals");
const polls = nodecg.Replicant("donationpolls");

// limit how much we display this (once every 2.5m)
const TIME_BETWEEN_DISPLAYS = 2.5 * 1000 * 60;
let currentElement = null;
let currentTl = null;

class TRMDonationIncentives extends PolymerElement {
	static get template() {
		return html`
			<style>
				* {
					box-sizing: border-box;
				}

				:host {
					display: flex;
					overflow: hidden;
					width: 100%;
				}

				#content {
					border-bottom: 3px solid var(--marathon-col);
					border-top: 3px solid var(--marathon-col);
					display: flex;
					align-items: center;
					justify-content: center;
					flex-direction: column;
					width: 100%;
				}

				#content.is-horizontal {
					border: 0;
				}

				#goals {
					display: flex;
					justify-content: center;
					width: 100%;
				}

				#polls {
					display: flex;
					justify-content: center;
					width: 100%;
				}
			</style>

			<div id="content"></div>
		`;
	}

	static get is() {
		return "trm-donation-incentives";
	}

	static get properties() {
		return {
			horizontal: Boolean,
		};
	}

	ready() {
		super.ready();

		// list of replicants we need
		const replicants = [total, goals, polls];

		let numDeclared = 0;
		replicants.forEach((replicant) => {
			replicant.once("change", () => {
				numDeclared++;

				if (numDeclared == replicants.length) {
					beforeNextRender(this, this.run);
				}
			});
		});

		if (this.horizontal) this.$.content.classList.add("is-horizontal");

		nodecg.listenFor("donationGoalAchieved", this.showDonationGoalAchieved.bind(this));
	}

	run() {
		const self = this;
		const parts = [this.showGoals, this.showPolls];

		function processNextPart() {
			if (parts.length > 0) {
				setTimeout(
					() => {
						const part = parts.shift().bind(self);
						promisifyTimeline(part())
							.then(processNextPart)
							.catch((error) => {
								nodecg.log.error("Error when running main loop:", error);
							});
					},
					self.horizontal ? 0 : TIME_BETWEEN_DISPLAYS
				);
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

	showGoals() {
		const tl = new TimelineLite();
		const tempGoals = [...goals.value];
		if (tempGoals.length < 1) {
			return tl;
		}

		tempGoals.sort((a, b) => a.total - b.total);

		const trmGoals = document.createElement("trm-donation-incentives-goals");
		trmGoals.goals = tempGoals;

		this.setContent(tl, trmGoals);
		this.showContent(tl, trmGoals);
		this.hideContent(tl, trmGoals);

		return tl;
	}

	showPolls() {
		const tl = new TimelineLite();
		const tempPolls = polls.value;
		if (tempPolls.length < 1) {
			return tl;
		}

		const trmPolls = document.createElement("trm-donation-incentives-polls");
		trmPolls.polls = tempPolls;

		this.setContent(tl, trmPolls);
		this.showContent(tl, trmPolls);
		this.hideContent(tl, trmPolls);

		return tl;
	}

	showDonationGoalAchieved(goal) {
		const tl = new TimelineLite();

		const show = () => {
			const trmGoalAchieved = document.createElement("trm-donation-incentives-goal-achieved");
			trmGoalAchieved.goal = goal;

			this.setContent(tl, trmGoalAchieved);
			this.showContent(tl, trmGoalAchieved);
			this.hideContent(tl, trmGoalAchieved, () => this.run());
		};

		if (currentElement) this.hideContent(currentTl, currentElement, show);
		else show();
	}

	setContent(tl, element) {
		currentTl = tl;
		currentElement = element;

		tl.to({}, 0.03, {});
		tl.call(() => {
			tl.pause();
			this.$.content.innerHTML = "";
			this.$.content.appendChild(element);
			flush();
			afterNextRender(this, () => {
				flush();
				requestAnimationFrame(() => {
					tl.resume(null, false);
				});
			});
		});
	}

	showContent(tl, element) {
		tl.to({}, 0.03, {});
		tl.call(() => {
			tl.pause();

			const elementEntranceAnim = element.enter(DISPLAY_DURATION, SCROLL_HOLD_DURATION);
			elementEntranceAnim.call(tl.resume, null, tl);
		});
	}

	hideContent(tl, element, callback) {
		currentElement = null;
		currentTl = null;

		tl.to({}, 0.03, {});
		tl.call(() => {
			tl.pause();

			const elementExitAnim = element.exit();
			elementExitAnim.call(tl.resume, null, tl);
			elementExitAnim.call(() => element.parentNode.removeChild(element));
		});
		if (callback && typeof callback === "function") tl.call(callback);
	}
}

customElements.define(TRMDonationIncentives.is, TRMDonationIncentives);
