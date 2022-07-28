import "./trm-attendee-donation-list-item.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const donationQueue = nodecg.Replicant("donations");

class TRMAttendeeDonationList extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					height: 100%;
					width: 100%;
				}

				#donationlist {
					align-items: center;
					color: #fff;
					font-size: 30px;
					justify-content: center;
					margin-top: 20px;
					width: 100%;
				}

				.donation-list-title {
					font-size: 15px;
					text-transform: uppercase;
				}

				.donation-list-no-items {
					font-size: 20px;
					margin-top: 20px;
					text-transform: uppercase;
				}
			</style>

			<div class="donation-list-title">Donations</div>
			<div id="noDonations" class="donation-list-no-items">
				There are currently no donations
			</div>
			<iron-selector id="donationlist"></iron-selector>
		`;
	}

	static get is() {
		return "trm-attendee-donation-list";
	}

	static get properties() {
		return {};
	}

	ready() {
		super.ready();

		const self = this;
		donationQueue.on("change", (donations) => {
			self.renderDonationList(donations);
		});
	}

	renderDonationList(donations) {
		if (donations.length < 1) {
			this.$.noDonations.style.display = "block";
			return;
		}

		this.$.noDonations.style.display = "none";
		this.$.donationlist.innerHTML = "";

		let _donations = donations.slice(0);
		_donations = _donations
			.sort((a, b) => {
				return a.id - b.id;
			})
			.filter((a) => {
				return a.read === false;
			});

		if (_donations.length < 1) {
			this.$.noDonations.style.display = "block";
			return;
		}

		_donations.forEach((donation) => {
			const donationListElement = document.createElement("trm-attendee-donation-list-item");
			donationListElement.donation = donation;

			this.$.donationlist.prepend(donationListElement);
		});
	}
}

customElements.define(TRMAttendeeDonationList.is, TRMAttendeeDonationList);
