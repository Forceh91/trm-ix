import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";
import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";

const secretSounds = nodecg.Replicant("secretSounds");

class DashboardSecretSoundDisplay extends PolymerElement {
	static get is() {
		return "dashboard-secret-sounds-display";
	}

	static get properties() {
		return {};
	}

	ready() {
		super.ready();

		const replicants = [secretSounds];

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
		secretSounds.on("change", (sounds) => {
			self.renderSecretSounds(sounds);
		});
	}

	renderSecretSounds(sounds) {
		let tempSounds = sounds;

		// remove existing
		while (this.$.secretSounds.firstChild) {
			this.$.secretSounds.removeChild(this.$.secretSounds.firstChild);
		}

		// welp no sounds, stop.
		if (tempSounds.length < 1) {
			this.$.secretSounds.innerHTML = `<div class="no-sounds">There are currently no secret sounds</div>`;
			return;
		}

		// loop through sounds and display
		let tempSoundElement = null;
		tempSounds.forEach((sound) => {
			tempSoundElement = document.createElement("dashboard-secret-sound-item");
			tempSoundElement.sound = sound;
			this.$.secretSounds.appendChild(tempSoundElement);
		});
	}
}

customElements.define(DashboardSecretSoundDisplay.is, DashboardSecretSoundDisplay);
