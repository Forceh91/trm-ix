import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
class TRMAttendeeDonation extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					align-items: center;
					animation: donationFlash 5s;
					color: #ddd;
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

				@keyframes donationFlash {
					0% {
						background: darkred;
					}
					10% {
						background: transparent;
					}
					20% {
						background: darkred;
					}
					30% {
						background: transparent;
					}
					40% {
						background: darkred;
					}
					50% {
						background: transparent;
					}
					60% {
						background: darkred;
					}
					70% {
						background: transparent;
					}
					80% {
						background: darkred;
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
					overflow: hidden;
					text-align: center;
					text-overflow: ellipsis;
					white-space: nowrap;
					width: 100%;
				}

				#comment {
					font-size: 25px;
					margin-top: 20px;
					text-align: center;
					width: 100%;
				}
			</style>

			<div id="popover">
				<div id="amount-container">$<span id="amount"></span></div>
				<div id="name"></div>
				<div id="comment"></div>
			</div>
		`;
	}

	static get is() {
		return "trm-attendee-donation";
	}

	static get properties() {
		return {
			donation: Object,
		};
	}

	ready() {
		super.ready();

		this.$.amount.textContent = this.donation.amount.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
		this.$.name.textContent = this.donation.name;

		if (this.donation.comment) {
			this.$.comment.textContent = this.donation.comment;
		} else {
			this.$.comment.style.display = "none";
		}
	}

	enter() {
		return new TimelineLite();
	}

	exit() {
		const tl = new TimelineLite();
		tl.to(this.$.popover, 0.75, { opacity: 0, ease: Power3.easeOut });
		return tl;
	}
}

customElements.define(TRMAttendeeDonation.is, TRMAttendeeDonation);
