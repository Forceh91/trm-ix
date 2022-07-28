import { PolymerElement } from "../../../node_modules/@polymer/polymer/polymer-element.js";
import { beforeNextRender } from "../../../node_modules/@polymer/polymer/lib/utils/render-status.js";

const assetsSecretSoundImages = nodecg.Replicant("assets:secret_sound_images");
const assetsSecretSounds = nodecg.Replicant("assets:sounds");

class DashboardSecretSoundAddDialog extends PolymerElement {
	static get is() {
		return "dashboard-secret-sound-add-dialog";
	}

	static get properties() {
		return {};
	}

	ready() {
		super.ready();

		const replicants = [assetsSecretSoundImages, assetsSecretSounds];

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

		// remove previous list of images
		while (this.$.images.firstChild) {
			this.$.images.removeChild(this.$.images.firstChild);
		}

		// remove previous list of sounds
		while (this.$.sounds.firstChild) {
			this.$.sounds.removeChild(this.$.sounds.firstChild);
		}

		// add new images
		let images = assetsSecretSoundImages.value;
		if (images.length > 0) {
			let imageOption = null;
			images.forEach((image) => {
				imageOption = document.createElement("option");
				imageOption.value = image.name;
				imageOption.innerHTML = image.name;
				imageOption.class = "form-control";

				this.$.images.appendChild(imageOption);
			});
		}

		// add new sounds
		let sounds = assetsSecretSounds.value;
		if (sounds.length > 0) {
			let soundOption = null;
			sounds.forEach((sound) => {
				soundOption = document.createElement("option");
				soundOption.value = sound.name;
				soundOption.innerHTML = sound.name;
				soundOption.class = "form-control";

				this.$.sounds.appendChild(soundOption);
			});
		}

		document.addEventListener("dialog-confirmed", () => {
			let value = parseFloat(this.$.amount.value);
			if (value < 5) {
				return;
			}

			let image = this.$.images.value;
			let sound = this.$.sounds.value;
			if (image && sound) {
				nodecg.sendMessage("secretSoundCreate", {
					amount: value,
					imageAssetName: image,
					soundAssetName: sound,
				});
			}

			this.$.amount.value = 0;
			this.$.images.value = "";
			this.$.sounds.value = "";
		});
	}
}

customElements.define(DashboardSecretSoundAddDialog.is, DashboardSecretSoundAddDialog);
