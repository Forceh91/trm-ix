import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const total = nodecg.Replicant("total");
class TRMOmnibarLevel extends PolymerElement {
	static get template() {
		return html`
			<style>
				* {
					box-sizing: border-box;
				}

				:host {
					align-items: center;
					box-sizing: border-box;
					display: flex;
					flex-wrap: wrap;
					float: left;
					font-size: 15px;
					height: 100%;
					justify-content: flex-end;
					padding-right: 20px;
					position: relative;
					min-width: 150px;
				}

				#label {
					align-items: center;
					color: var(--marathon-col);
					display: flex;
					font-size: 18px;
					font-weight: bold;
					text-align: center;
					text-transform: uppercase;
					white-space: nowrap;
					width: auto;
				}

				#progressFill {
					background: #aaa;
					bottom: 0;
					left: 0;
					opacity: 0.2;
					position: absolute;
					top: 0;
					z-index: 0;
				}

				#lara {
					display: none;
					left: 0;
					position: absolute;
					z-index: 2;
				}

				#label {
					z-index: 1;
				}

				#goal {
					color: #fff;
					text-align: right;
					width: 100%;
					z-index: 3;
				}
			</style>

			<div id="progressFill"></div>
			<img src="./img/pixel-lara.png" id="lara" />

			<div id="label">[[level.name]]</div>
			<div id="goal">$[[level.total]]</div>
		`;
	}

	static get is() {
		return "trm-omnibar-level";
	}

	static get properties() {
		return {
			level: Object,
			previousLevel: Object,
		};
	}

	ready() {
		super.ready();

		const tl = new TimelineLite();
		if (this.previousLevel && total.value < this.previousLevel.total) return tl;

		const min = this.previousLevel ? total.value - this.previousLevel.total : total.value;
		const max = this.previousLevel ? this.level.total - this.previousLevel.total : this.level.total;

		// figure out how far along to do a thing
		let levelPercentage = (min / max) * 100;
		levelPercentage = Math.min(levelPercentage, 100);
		levelPercentage = Math.max(levelPercentage, 0);

		// fill the thing
		tl.to(this.$.progressFill, 0, {
			width: `${levelPercentage}%`,
			ease: Power3.easeInOut,
		});

		if (levelPercentage < 100) {
			// move lara to the correct place
			tl.to(this.$.lara, 0, {
				left: `${levelPercentage}%`,
				display: "block",
			});
		}

		return tl;
	}

	enter() {
		const tl = new TimelineLite();

		tl.to([this.$.goal], 0.75, {
			opacity: 1,
			ease: Power3.easeIn,
		});

		return tl;
	}

	exit() {
		const tl = new TimelineLite();
		return tl;
	}

	render() {
		const tl = new TimelineLite();
		return tl;
	}
}

customElements.define(TRMOmnibarLevel.is, TRMOmnibarLevel);
