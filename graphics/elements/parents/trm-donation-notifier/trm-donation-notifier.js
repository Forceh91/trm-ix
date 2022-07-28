import "../../../../shared/imports/gsap.js";
import "../../children/trm-donation-notifier/trm-donation-notification.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { beforeNextRender, afterNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { flush } from "../../../../node_modules/@polymer/polymer/lib/utils/flush.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
// config
const DISPLAY_DURATION = nodecg.bundleConfig.donationNotificationDisplayDuration || 10;

// replicants
let donations = nodecg.Replicant("donations");
const tl = new TimelineLite();

class TRMDonationNotifier extends PolymerElement {
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

				#body {
					align-items: center;
					display: flex;
					flex-direction: row;
					flex-wrap: nowrap;
					overflow: hidden;
					width: 100%;
				}

				#content {
					height: 100%;
					display: none;
					min-width: 100%;
				}

				#notifierPlaceholder {
					align-items: center;
					display: flex;
					justify-content: center;
					min-height: 280px;
					min-width: 100%;
					width: auto;
				}

				#notifierPlaceholder img {
					height: auto;
					width: 300px;
				}
			</style>

			<div id="body">
				<div id="content"></div>
				<div id="notifierPlaceholder"><img src="./img/charity.png" /></div>
			</div>
		`;
	}

	static get is() {
		return "trm-donation-notifier";
	}

	static get properties() {}

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

		donations.on("change", (newVal) => {
			this.showDonations(
				newVal.filter((a) => {
					return a.shown !== true;
				})
			);
		});
	}

	setContent(tl, element) {
		tl.to({}, 0.03, {});
		tl.to(this.$.notifierPlaceholder, 0.75, {
			opacity: 0,
			//display: "none",
			ease: Power3.easeOut,
		});
		tl.to(this.$.content, 0, {
			opacity: 1,
			display: "block",
			ease: Power3.easeIn,
		});
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

			tl.to(this.$.content, 0, {
				opacity: 0,
				display: "none",
				ease: Power3.easeOut,
			});
			tl.to(this.$.notifierPlaceholder, 0.75, {
				opacity: 1,
				//display: "block",
				ease: Power3.easeIn,
			});
		});
	}

	showDonations(newdonations) {
		if (!newdonations || newdonations.length < 1) {
			return tl;
		}

		let _donations = newdonations.sort(function (a, b) {
			return a.id - b.id;
		});

		let trmDonation = null;
		_donations.forEach(
			function (donation) {
				trmDonation = document.createElement("trm-donation-notification");
				trmDonation.donation = donation;

				this.setContent(tl, trmDonation);
				this.showContent(tl, trmDonation);
				tl.to(trmDonation, DISPLAY_DURATION, {});
				this.hideContent(tl, trmDonation);

				// mark as overlay seen
				donation.shown = true;
			}.bind(this)
		);

		return tl;
	}
}

customElements.define(TRMDonationNotifier.is, TRMDonationNotifier);
