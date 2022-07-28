import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
const $_documentContainer = document.createElement("template");

$_documentContainer.innerHTML = `<dom-module id="trm-station-identification">
  

  <template>
    <style>
      * {
        box-sizing: border-box;
      }

      :host {
        display: flex;
        height: 100%;
        width: 100%;
      }

      #body {
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        height: 100%;
        opacity: 0;
        width: 100%;
      }

      #stationIdentDonate,
      #stationIdentSocials {
        align-items: center;
        color: #eee;
        display: none;
        opacity: 0;
        flex-direction: column;
        flex-wrap: wrap;
        font-size: 1.5rem;
        justify-content: center;
        overflow: hidden;
        padding: 30px;
        width: 100%;
      }

      #helpHopeLive {
        width: 100%;
      }

      .donate_overlay_text {
        margin-top: 30px;
        text-align: center;
        text-transform: uppercase;
      }

      .donate_link {
        color: var(--marathon-col);
        font-weight: bold;
      }

      .social_media_option {
        margin-bottom: 5px;
        min-width: 375px;
        text-align: left;
      }

      .fa {
        margin-right: 15px;
        width: 15px;
      }
    </style>

    <div id="body">
      <div id="stationIdentDonate">
        <img id="helpHopeLive" src="img/charity.png">
        <div class="donate_overlay_text">
          DONATE NOW AT<br>
          <span class="donate_link">donate.tombraidermarathon.com</span>
        </div>
      </div>

      <div id="stationIdentSocials">
        <h2>Follow us!</h2>
        <div class="social_media_option">
          <span class="fa fa-globe"></span> tombraidermarathon.com
        </div>
        <div class="social_media_option">
          <span class="fa fa-twitter"></span> TRMarathon17
        </div>
        <div class="social_media_option">
          <span class="fa fa-facebook"></span> TRMarathon17
        </div>
      </div>
    </div>
  </template>

  
</dom-module>`;

document.head.appendChild($_documentContainer.content);

// config
const DISPLAY_DURATION = nodecg.bundleConfig.displaySIDuation || 20;

// others
let showStationIdentification = false;

class TRMStationIdentification extends PolymerElement {
	static get is() {
		return "trm-station-identification";
	}

	ready() {
		super.ready();
		beforeNextRender(this, this.run);

		nodecg.listenFor("stationIdentShow", () => {
			showStationIdentification = true;
			this.run();
		});

		nodecg.listenFor("stationIdentHide", () => {
			showStationIdentification = false;
		});
	}

	run() {
		const self = this;
		const parts = [this.showDonate, this.showSocials];

		function processNextPart() {
			if (parts.length > 0) {
				const part = parts.shift().bind(self);
				promisifyTimeline(part())
					.then(processNextPart)
					.catch((error) => {
						nodecg.log.error("Error when running main loop:", error);
					});
			} else {
				self.run();
			}
		}

		function promisifyTimeline(tl) {
			return new Promise((resolve) => {
				tl.call(resolve, null, null, "+=0.03");
			});
		}

		if (showStationIdentification === true) {
			processNextPart();
		}
	}

	showDonate() {
		const tl = new TimelineLite();

		tl.to([this.$.body, this.$.stationIdentDonate], 1, {
			display: "flex",
			opacity: 1,
			ease: Power3.easeIn,
		});
		tl.to(this.$.stationIdentDonate, 0.75, {
			opacity: 1,
			ease: Power3.easeIn,
		});
		tl.to(this, DISPLAY_DURATION, {});
		tl.to(this.$.stationIdentDonate, 0.75, {
			display: "none",
			opacity: 0,
			ease: Power3.easeOut,
		});

		return tl;
	}

	showSocials() {
		const tl = new TimelineLite();

		tl.to(this.$.stationIdentSocials, 0.75, {
			display: "flex",
			opacity: 1,
			ease: Power3.easeIn,
		});
		tl.to(this, DISPLAY_DURATION, {});
		tl.to(this.$.body, 1, { opacity: 0, ease: Power3.easeOut });
		tl.to(this.$.stationIdentSocials, 1, {
			display: "none",
			opacity: 0,
			ease: Power3.easeOut,
		});
		tl.call(() => {
			nodecg.sendMessage("stationIdentHide");
		});

		return tl;
	}
}

customElements.define(TRMStationIdentification.is, TRMStationIdentification);
