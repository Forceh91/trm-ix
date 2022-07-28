import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

class TRMAttendeeDateTime extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					align-items: center;
					display: flex;
					height: 100%;
					width: 100%;
				}

				#datetime {
					color: #fff;
					font-size: 30px;
					padding: 0 10px;
					text-align: right;
					width: 100%;
				}
			</style>

			<div id="datetime"></div>
		`;
	}

	static get is() {
		return "trm-attendee-datetime";
	}

	static get properties() {
		return {};
	}

	ready() {
		super.ready();

		setInterval(this.updateLocalTime.bind(this), 1000);

		this.updateLocalTime();
	}

	updateLocalTime(newVal) {
		this.$.datetime.textContent = moment().format("ddd MMM D, hh:mm:ss a");
	}
}

customElements.define(TRMAttendeeDateTime.is, TRMAttendeeDateTime);
