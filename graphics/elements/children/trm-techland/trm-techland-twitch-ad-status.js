import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const twitchAdStatus = nodecg.Replicant("twitch_ad_status");

class TRMTechLandTwitchAdStatus extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          height: 100%;
          width: 100%;
        }

        #ad_status_container {
          color: var(--marathon-col);
        }
      </style>

      <div id="ad_status_container"><span id="status"></span></div>
    `;
  }

  static get is() {
    return "trm-techland-twitch-ad-status";
  }

  static get properties() {
    return {};
  }

  ready() {
    super.ready();

    twitchAdStatus.on("change", (newVal) => {
      this.updateTwitchAdStatus(newVal);
    });
  }

  updateTwitchAdStatus(val) {
    const currentTime = Date.now();
    if (!val.end_time || !val.length || val.end_time < currentTime) return this.updateTwitchAdStatusFinished();
    else {
      const updateInterval = setInterval(() => {
        const intervalCurrentTime = Date.now();
        const remainingTime = ((val.end_time - intervalCurrentTime) / 1000).toFixed(0);
        if (remainingTime <= 0) {
          this.updateTwitchAdStatusFinished();
          clearInterval(updateInterval);
        } else this.$.status.textContent = `ACTIVE - ${remainingTime}s remaining (${val.length}s of commercials)`;
      }, 1000);
    }
  }

  updateTwitchAdStatusFinished() {
    this.$.status.textContent = "IDLE";
  }
}

customElements.define(TRMTechLandTwitchAdStatus.is, TRMTechLandTwitchAdStatus);
