import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

class TRMOmnibarSocials extends PolymerElement {
	static get template() {
		return html` <link rel="stylesheet" href="../shared/fonts/fontawesome/font-awesome.min.css" />

			<style>
				:host {
					align-items: center;
					display: flex;
					height: 100%;
					padding: 0 10px;
					width: 100%;
				}

				#socials,
				#discord {
					display: none;
					opacity: 0;
					text-align: center;
					width: 100%;
				}

				.header {
					display: flex;
					font-weight: bold;
					font-size: 20px;
					justify-content: center;
					width: 100%;
				}

				.social-account {
					display: inline-block;
				}

				.social-account:not(:first-child) {
					margin-left: 40px;
				}

				.social-account .fab:last-child {
					margin-right: 10px;
				}

				.fab {
					color: var(--marathon-col);
					margin-right: 5px;
				}
			</style>

			<div id="socials">
				<div class="header">
					<div class="social-account">
						<i class="fab fa-facebook"></i>
						<i class="fab fa-twitter"></i>
					</div>
					<div>tombraiderthon</div>
				</div>
			</div>

			<div id="discord">
				<div class="header">
					<div class="social-account">
						<i class="fab fa-discord"></i>
					</div>
					<div>discord.tombraidermarathon.com</div>
				</div>
			</div>`;
	}

	static get is() {
		return "trm-omnibar-socials";
	}

	static get properties() {
		return {};
	}

	ready() {
		super.ready();
	}

	enter(displayDuration) {
		const tl = new TimelineLite();

		// show social accounts
		tl.to(this.$.socials, 0.75, {
			opacity: 1,
			display: "block",
			ease: Power3.easeIn,
		});
		tl.to(this, displayDuration, {});
		tl.to(this.$.socials, 0.75, {
			opacity: 0,
			display: "none",
			ease: Power3.easeOut,
		});

		// show discord
		tl.to(this.$.discord, 0.75, {
			opacity: 1,
			display: "block",
			ease: Power3.easeIn,
		});
		tl.to(this, displayDuration, {});
		tl.to(this.$.discord, 0.75, {
			opacity: 0,
			display: "none",
			ease: Power3.easeOut,
		});

		return tl;
	}

	exit() {
		const tl = new TimelineLite();
		return tl;
	}
}

customElements.define(TRMOmnibarSocials.is, TRMOmnibarSocials);
