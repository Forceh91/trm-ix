import "./trm-attendee-donation-poll-item.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const donationPolls = nodecg.Replicant("donationpolls");
const DISPLAY_DURATION = nodecg.bundleConfig.attendeeDonationPollDisplayDuration || 20;

class TRMAttendeeDonationPolls extends PolymerElement {
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

				#pollList {
					align-items: center;
					color: #fff;
					font-size: 30px;
					justify-content: center;
					margin-top: 20px;
					width: 100%;
				}

				.donation-polls-title {
					font-size: 15px;
					text-transform: uppercase;
				}

				#pollList trm-attendee-donation-poll-item {
					display: flex;
				}

				#noData {
					font-size: 20px;
					margin-top: 20px;
					text-transform: uppercase;
				}
			</style>

			<div class="donation-polls-title">Donation Polls</div>
			<div id="noData">There are currently no donation polls</div>
			<div id="pollList"></div>
		`;
	}

	static get is() {
		return "trm-attendee-donation-polls";
	}

	ready() {
		super.ready();

		// list of replicants we need
		const replicants = [donationPolls];

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
		const parts = [this.showDonationPolls];

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

	showDonationPolls() {
		const tl = new TimelineLite();

		let polls = donationPolls.value;
		if (!polls || polls.length < 1) {
			this.$.noData.style.display = "block";
			return tl;
		}

		this.$.noData.style.display = "none";
		this.$.pollList.innerHTML = "";

		polls.forEach((poll, index) => {
			const donationPollItemElement = document.createElement("trm-attendee-donation-poll-item");
			donationPollItemElement.poll = poll;

			this.$.pollList.appendChild(donationPollItemElement);
		});

		return tl;
	}
}

customElements.define(TRMAttendeeDonationPolls.is, TRMAttendeeDonationPolls);
