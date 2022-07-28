import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const twitchTitleReplicant = nodecg.Replicant("twitch_title");

class TRMTechLandTwitchTitle extends PolymerElement {
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

        #title_container {
          color: var(--marathon-col);
        }
      </style>

      <div id="title_container"><span id="title"></span></div>
    `;
  }

  static get is() {
    return "trm-techland-twitch-title";
  }

  static get properties() {
    return {};
  }

  ready() {
    super.ready();

    twitchTitleReplicant.on("change", (newVal, oldVal) => {
      this.updateTitle(newVal);
    });
  }

  updateTitle(newVal) {
    this.$.title.textContent = newVal;
  }
}

customElements.define(TRMTechLandTwitchTitle.is, TRMTechLandTwitchTitle);
