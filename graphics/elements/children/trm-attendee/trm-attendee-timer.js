import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const eventTimer = nodecg.Replicant("eventTimer");

class TRMAttendeeTimer extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					display: flex;
					height: 100%;
					width: 100%;
				}

				#timer {
					align-items: center;
					color: #fff;
					display: flex;
					font-size: 30px;
					justify-content: center;
					padding: 0 10px;
				}
			</style>

			<div id="timer"></div>
		`;
	}

	static get is() {
		return "trm-attendee-timer";
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
		this.$.timer.innerText = newVal.formattedTime;
	}
}

customElements.define(TRMAttendeeTimer.is, TRMAttendeeTimer);
