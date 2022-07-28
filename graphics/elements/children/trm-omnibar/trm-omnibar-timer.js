import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const eventTimer = nodecg.Replicant("eventTimer");

class TRMOmnibarTimer extends PolymerElement {
	static get template() {
		return html` <link rel="stylesheet" href="../shared/fonts/exo2/exo2.css" />

			<style>
				* {
					box-sizing: border-box;
				}

				#timer {
					align-items: center;
					background: #444;
					color: #ddd;
					display: flex;
					font-size: 30px;
					font-variant-numeric: tabular-nums;
					height: 100%;
					padding: 0 10px;
				}
			</style>

			<div id="timer"></div>`;
	}
	static get is() {
		return "trm-omnibar-timer";
	}

	static get properties() {
		return {};
	}

	ready() {
		super.ready();

		eventTimer.on("change", (newVal) => {
			this.updateEventTimer(newVal);
		});
	}

	updateEventTimer(newVal) {
		this.$.timer.innerText = newVal.formattedTime || "00:00";
	}
}

customElements.define(TRMOmnibarTimer.is, TRMOmnibarTimer);
