import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
class TRMDonationNotification extends PolymerElement {
	static get template() {
		return html`
			<style>
				* {
					box-sizing: border-box;
				}

				#body {
					align-items: center;
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					height: 100%;
					justify-content: center;
					opacity: 0;
					width: 100%;
				}

				#donationInfo {
					float: left;
					width: 100%;
				}

				#donationAmount {
					color: var(--marathon-col);
					font-size: 2.2rem;
					font-weight: bold;
					margin-bottom: 10px;
					text-align: center;
					width: 100%;
				}

				#donationName {
					font-size: 1.7rem;
					overflow: hidden;
					text-align: center;
					word-wrap: break-word;
					width: 100%;
				}

				#donationImage {
					float: left;
					height: 70px;
					margin-bottom: 10px;
				}
			</style>

			<div id="body">
				<img id="donationImage" />
				<div id="donationInfo">
					<div id="donationAmount"></div>
					<div id="donationName"></div>
				</div>
				<audio id="donationSound"></audio>
			</div>
		`;
	}

	static get is() {
		return "trm-donation-notification";
	}

	static get properties() {
		return {
			donation: Object,
		};
	}

	ready() {
		super.ready();
	}

	enter() {
		const tl = new TimelineLite();

		tl.call(this.showDonation.bind(this));
		tl.to(this.$.body, 0.75, { opacity: 1, ease: Power3.easeIn });

		return tl;
	}

	exit() {
		const tl = new TimelineLite();
		tl.to(this.$.body, 0.75, { marginLeft: "-100%", ease: Power3.easeOut });
		return tl;
	}

	showDonation() {
		const tl = new TimelineLite();
		const self = this;

		nodecg.sendMessage("secretSoundFind", this.donation.amount, (data) => {
			if (data.image) self.$.donationImage.src = data.image;
			self.$.donationAmount.textContent =
				"$" +
				this.donation.amount.toLocaleString("en-US", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});
			self.$.donationName.textContent = this.donation.name;

			if (data.sound) {
				self.$.donationSound.src = data.sound;
				self.$.donationSound.type = data.soundType;
				self.$.donationSound.play();
			}
		});
	}
}

customElements.define(TRMDonationNotification.is, TRMDonationNotification);
