import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";

const foobarNowPlaying = nodecg.Replicant("foobarNowPlaying");
const tl = new TimelineLite();

class TRMNowPlaying extends PolymerElement {
	static get template() {
		return html`
			<link rel="stylesheet" href="../shared/fonts/fontawesome/font-awesome.min.css" />
			<link rel="stylesheet" href="../shared/fonts/exo2/exo2.css" />

			<style>
				#body {
					align-items: center;
					color: #fff;
					display: flex;
					font-size: 20px;
					height: 100%;
					overflow: hidden;
					width: 100%;
					white-space: nowrap;
				}

				#body:not(.has-background) span {
					text-shadow: 2px 1px #000;
				}

				#body.has-background {
					text-transform: uppercase;
					font-size: 1rem;
				}

				#track_container {
					display: flex;
					max-width: 100%;
				}

				#track_container div:first-child {
					background: black;
					z-index: 2;
				}

				.fa.fa-music {
					margin-right: 5px;
				}
			</style>

			<div id="body">
				<div id="track_container">
					<div><span class="fa fa-music"></span>&nbsp;</div>
					<div id="track_artist">
						<span id="artist"></span>&nbsp;-&nbsp;<span id="track"></span><span id="album_container">&nbsp;(<span id="album"></span>)</span>
					</div>
				</div>
			</div>
		`;
	}

	static get is() {
		return "trm-now-playing";
	}

	static get properties() {
		return {
			hasBackground: Boolean,
		};
	}

	ready() {
		super.ready();

		const replicants = [foobarNowPlaying];
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
		foobarNowPlaying.on("change", newVal => {
			// this.$.body.classList.remove("overflowing");

			if (!foobarNowPlaying.value || (foobarNowPlaying.value.artist === "" && foobarNowPlaying.value.track === "")) {
				this.$.body.style.display = "none";
			} else {
				if (this.$.body.style.display === "none") {
					this.$.body.style.display = "";
				}
			}

			// reset before we do anything
			tl.clear();
			this.resetOverflowingTrackName();

			// update the track and artist info
			this.$.artist.textContent = newVal.artist;
			this.$.track.textContent = newVal.track;

			// update the album information
			if (newVal.album) {
				this.$.album.textContent = newVal.album;
				this.$.album_container.style.display = "initial";
			} else this.$.album_container.style.display = "none";

			setTimeout(() => {
				const boundingRectTrackArtist = this.$.track_artist.getBoundingClientRect();
				const boundingRectBody = this.$.body.getBoundingClientRect();

				// see if the track is too long and take measures to fit it
				if (boundingRectTrackArtist.right > boundingRectBody.right) {
					// this.$.body.classList.add("overflowing");
					this.handleOverflowingTrackName();
				} else {
					this.$.body.classList.remove("overflowing");
				}
			}, 0);
		});

		if (this.hasBackground) {
			this.$.body.classList.add("has-background");
		}
	}

	handleOverflowingTrackName() {
		const overflowAmount = this.$.track_artist.clientWidth - this.$.body.clientWidth + 50;

		tl.to(
			this.$.track_artist,
			overflowAmount * 0.015,
			{
				marginLeft: `-${overflowAmount}px`,
				ease: Power0.easeOut,
				onComplete: () => this.resetOverflowingTrackName(true),
			},
			`+=5`
		);
	}

	resetOverflowingTrackName(shouldContinue) {
		// reset the margin
		if (!shouldContinue) return tl.set(this.$.track_artist, { marginLeft: 0 });

		// and do it all again if shouldContinue was set
		tl.to(this.$.track_artist, 0, { marginLeft: 0, ease: Power0.easeOut }, `+=5`);
		this.handleOverflowingTrackName();
	}
}

customElements.define(TRMNowPlaying.is, TRMNowPlaying);
