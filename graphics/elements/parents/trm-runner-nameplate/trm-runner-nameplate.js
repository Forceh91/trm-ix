import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";

// replicants
const runnerTimers = nodecg.Replicant("runnerTimers");
const obsAudioSources = nodecg.Replicant("obsAudioSources");

class TRMRunnerNameplate extends PolymerElement {
	static get template() {
		return html`
			<link rel="stylesheet" href="../shared/fonts/fontawesome/font-awesome.min.css" />
			<style>
				* {
					box-sizing: border-box;
				}

				:host {
					border: 0;
					color: #fff;
					display: block;
					overflow: hidden;
					width: auto;
				}

				#body {
					color: #fff;
					display: flex;
					font-weight: bold;
					text-transform: uppercase;
				}

				#body.right-align {
					flex-direction: row-reverse;
				}

				#body.right-align #name {
					text-align: right;
				}

				#name.standardize-width {
					min-width: 150px;
				}

				#name_container {
					background: var(--marathon-alt-col);
					display: flex;
					float: left;
					padding: 15px;
				}

				#name_container #sound {
					display: none;
				}

				#name_container #sound.is-on {
					display: block;
					margin-right: 10px;
				}

				#time {
					display: flex;
				}

				#position {
					background: #111;
					float: left;
					padding: 15px;
					text-align: center;
				}

				#finalTime {
					background: #151515;
					float: left;
					padding: 15px;
					text-align: right;
				}

				#time.hidden {
					display: none;
				}
			</style>

			<div id="body">
				<div id="name_container">
					<div id="sound"><i class="fas fa-volume-up"></i></div>
					<div id="name"></div>
				</div>
				<div id="time">
					<div id="position"></div>
					<div id="finalTime"></div>
				</div>
			</div>
		`;
	}

	static get is() {
		return "trm-runner-nameplate";
	}

	static get properties() {
		return {
			runnerid: Number,
			setsize: Boolean,
			rightalign: Boolean,
		};
	}

	ready() {
		super.ready();

		// list of replicants we need
		const replicants = [runnerTimers];

		let numDeclared = 0;
		replicants.forEach(replicant => {
			replicant.once("change", () => {
				numDeclared++;

				if (numDeclared == replicants.length) {
					beforeNextRender(this, this.run);
				}
			});
		});
	}

	run() {
		runnerTimers.on("change", newVal => {
			this.drawNameplate(newVal);
		});

		obsAudioSources.on("change", newVal => {
			this.drawAudioInfo(newVal);
		});
	}

	drawNameplate(value) {
		const nameplate = value && value.find(timer => timer.id === parseInt(this.runnerid));
		if (!nameplate) return;

		if (this.setsize) this.$.name.classList.add("standardize-width");
		if (this.rightalign) this.$.body.classList.add("right-align");

		this.$.name.innerText = nameplate.runner || "Unknown";
		if (nameplate.state !== 3) this.$.time.classList.add("hidden");
		else {
			this.$.time.classList.remove("hidden");
			this.$.position.innerText = nameplate.position;
			this.$.finalTime.innerText = nameplate.formattedTime;
		}

		this.drawAudioInfo();
	}

	drawAudioInfo() {
		const audio = this.getAudioSource();
		if (!audio) return this.$.sound.classList.remove("is-on");

		if (audio.muted) this.$.sound.classList.remove("is-on");
		else this.$.sound.classList.add("is-on");
	}

	getAudioSource() {
		const ix = this.runnerid;
		return obsAudioSources && obsAudioSources.value && ix < obsAudioSources.value.length && obsAudioSources.value[ix];
	}
}

customElements.define(TRMRunnerNameplate.is, TRMRunnerNameplate);
