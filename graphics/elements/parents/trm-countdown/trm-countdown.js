import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const countdownTimer = nodecg.Replicant("countdownTimer");

class TRMCountdownTimer extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: flex;
          width: 100%;
        }

        #timer {
          align-items: center;
          color: #fff;
          display: flex;
          font-size: 3rem;
          font-variant-numeric: tabular-nums;
          font-weight: bold;
          justify-content: center;
          padding: 0 10px;
          width: 100%;
        }
      </style>

      <div id="timer"></div>
    `;
  }

  static get is() {
    return "trm-countdown";
  }

  static get properties() {
    return {};
  }

  ready() {
    super.ready();

    countdownTimer.on("change", (newVal) => {
      this.updateCountdownTimer(newVal);
    });
  }

  updateCountdownTimer(newVal) {
    this.$.timer.innerText = newVal.formattedTime;
  }
}

customElements.define(TRMCountdownTimer.is, TRMCountdownTimer);
