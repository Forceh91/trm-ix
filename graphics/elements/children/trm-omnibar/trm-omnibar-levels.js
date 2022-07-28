import "./trm-omnibar-level.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const levels = nodecg.bundleConfig.levels;
const total = nodecg.Replicant("total");

class TRMOmnibarLevels extends PolymerElement {
	static get template() {
		return html`
			<style>
				:host {
					display: flex;
					height: 100%;
					width: 100%;
				}

				#levels {
					display: flex;
					height: 100%;
					opacity: 0;
				}
			</style>

			<div id="levels"></div>
		`;
	}

	static get is() {
		return "trm-omnibar-levels";
	}

	static get properties() {
		return {
			levels: Array,
		};
	}

	enter(displayDuration) {
		const tl = new TimelineLite();
		tl.to(this.$.levels, 0.75, { opacity: 1, ease: Power3.easeIn });

		let totalIndex = 0;
		levels.forEach((level, index) => {
			const levelElement = document.createElement("trm-omnibar-level");

			levelElement.level = level;
			if (index) levelElement.previousLevel = levels[index - 1];
			levelElement.setAttribute("total", level.total);
			this.$.levels.appendChild(levelElement);

			if (total.value >= level.total) totalIndex = index;
		});

		// get the level we're on and the left offset
		const currentLevel = this.$.levels.children[totalIndex];
		let leftOffset = (currentLevel && currentLevel.offsetLeft) || 0;

		// account for the offset of the containers
		leftOffset -= this.offsetLeft;

		// scroll the thing to this
		tl.to(
			this.$.levels,
			2,
			{
				marginLeft: `-${leftOffset}px`,
				ease: Power3.easeOut,
			},
			`+=2`
		);

		tl.to({}, displayDuration * 2, {});

		return tl;
	}

	exit() {
		const tl = new TimelineLite();
		return tl;
	}
}

customElements.define(TRMOmnibarLevels.is, TRMOmnibarLevels);
