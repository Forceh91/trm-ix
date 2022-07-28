import { html } from "../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";

const secretSoundImages = nodecg.Replicant("assets:secret_sound_images");
class DashboardSecretSoundItem extends PolymerElement {
	static get template() {
		return html`
			<link rel="stylesheet" href="../../node_modules/bootstrap/dist/css/bootstrap.min.css" />

			<style>
				* {
					box-sizing: border-box;
				}

				#body {
					align-items: center;
					display: flex;
					width: 100%;
				}

				.right-align {
					text-align: right;
				}

				img {
					height: 50px;
					width: auto;
				}

				#body div {
					width: 100%;
				}

				button {
					float: right;
					margin: 0;
					width: 100px;
				}
			</style>

			<div id="body">
				<div>$[[_parseAmount(sound.amount)]]</div>
				<div><img src="[[_getImage(sound.imageName)]]" alt="[[sound.imageName]]" /></div>
				<div>[[sound.soundName]]</div>
				<div class="right-align">[[sound.used]]</div>
				<div><button type="button" class="btn btn-sm btn-danger" id="remove" title="Remove secret sound">Remove</button></div>
			</div>
		`;
	}

	static get is() {
		return "dashboard-secret-sound-item";
	}

	static get properties() {
		return {
			sound: Object,
		};
	}

	ready() {
		super.ready();

		this.$.remove.addEventListener("click", this._removeSecretSound.bind(this));
	}

	_parseAmount(amount) {
		return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	_getImage(image) {
		let imageFile = secretSoundImages.value.find((img) => img.name === image);
		if (imageFile) {
			return imageFile.url;
		}

		return "";
	}

	_removeSecretSound() {
		let confirmation = confirm(`Are you sure you want to delete this secret sound? It has been used ${this.sound.used} time(s)`);
		if (!confirmation) {
			return;
		}

		nodecg.sendMessage("secretSoundDestroy", this.sound.id);
	}
}

customElements.define(DashboardSecretSoundItem.is, DashboardSecretSoundItem);
