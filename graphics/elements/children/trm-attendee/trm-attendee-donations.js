import "./trm-attendee-donation.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { beforeNextRender, afterNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { flush } from "../../../../node_modules/@polymer/polymer/lib/utils/flush.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const globalTL = new TimelineLite();
let showingDonationGoalAchieved = false;

const DISPLAY_DURATION = nodecg.bundleConfig.donationNotificationDisplayDuration || 10;

// replicants
let donations = nodecg.Replicant("donations");

class TRMAttendeeDonations extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					display: flex;
					height: 100%;
					width: 100%;
				}
			</style>

			<div id="donationHolder"></div>
		`;
	}

	static get is() {
		return "trm-attendee-donations";
	}

	ready() {
		super.ready();

		// list of replicants we need
		const replicants = [donations];

		let numDeclared = 0;
		replicants.forEach((replicant) => {
			replicant.once("change", () => {
				numDeclared++;

				if (numDeclared == replicants.length) {
					beforeNextRender(this, this.run);
				}
			});
		});

		nodecg.listenFor("donationGoalAchieved", this.showAchievedDonationGoal.bind(this));

		donations.on("change", (newVal) => {
			this.showDonations(
				newVal.filter((a) => {
					return a.attendeeshown !== true;
				})
			);
		});
	}

	setContent(tl, element) {
		tl.to({}, 0.03, {});
		tl.call(() => {
			tl.pause();
			this.$.donationHolder.innerHTML = "";
			this.$.donationHolder.appendChild(element);
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

			const elementEntranceAnim = element.enter(DISPLAY_DURATION);
			elementEntranceAnim.call(tl.resume, null, tl);
		});
	}

	hideContent(tl, element) {
		tl.to({}, 0.03, {});
		tl.call(() => {
			tl.pause();

			const elementExitAnim = element.exit();
			elementExitAnim.call(tl.resume, null, tl);
		});
	}

	showDonations(newdonations) {
		if (!newdonations || newdonations.length < 1) {
			return;
		}

		let _donations = newdonations.sort(function (a, b) {
			return a.id - b.id;
		});

		let trmDonation = null,
			self = this;
		_donations.forEach(
			function (donation) {
				trmDonation = document.createElement("trm-attendee-donation");
				trmDonation.donation = donation;

				this.setContent(globalTL, trmDonation);
				this.showContent(globalTL, trmDonation);
				globalTL.to(trmDonation, DISPLAY_DURATION, {});
				this.hideContent(globalTL, trmDonation);

				donation.attendeeshown = true;
			}.bind(this)
		);
	}

	showAchievedDonationGoal(goal) {
		if (!goal) {
			return;
		}

		const donationGoalAchievedElement = document.createElement("trm-attendee-donation-goal-achieved");
		donationGoalAchievedElement.goal = goal;

		// wait 10 seconds before we hide the achieved stuff
		globalTL.call(
			() => {
				this.$.donationHolder.appendChild(donationGoalAchievedElement);
				showingDonationGoalAchieved = true;
			},
			null,
			null,
			"+=0.06"
		);
		globalTL.to({}, 10, {});
		globalTL.to(donationGoalAchievedElement, 0.75, {
			opacity: 0,
			ease: Power3.easeOut,
		});
		globalTL.call(() => {
			this.$.donationHolder.removeChild(donationGoalAchievedElement);
			showingDonationGoalAchieved = false;
		});
	}
}

customElements.define(TRMAttendeeDonations.is, TRMAttendeeDonations);
