import "../../children/trm-omnibar/trm-omnibar-cta.js";
import "../../children/trm-omnibar/trm-omnibar-socials.js";
import "../../children/trm-omnibar/trm-omnibar-total.js";
import "../../children/trm-omnibar/trm-omnibar-timer.js";
import "../../children/trm-omnibar/trm-omnibar-levels.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import {
  beforeNextRender,
  afterNextRender,
} from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { flush } from "../../../../node_modules/@polymer/polymer/lib/utils/flush.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

// config
const DISPLAY_DURATION = nodecg.bundleConfig.displayDuration || 5;
const SCROLL_HOLD_DURATION = nodecg.bundleConfig.scrollHoldDuration || 10;

// replicants
const total = nodecg.Replicant("total");
const timer = nodecg.Replicant("eventTimer");
const donationGoals = nodecg.Replicant("donationGoals");
const donationPolls = nodecg.Replicant("donationpolls");

class TRMOmnibar extends PolymerElement {
  static get template() {
    return html`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          border-top: 4px solid var(--marathon-col);
          display: flex;
          height: 100%;
          overflow: hidden;
          width: 100%;
        }

        #container {
          align-items: center;
          display: flex;
          font-size: 28px;
          height: 100%;
          width: 100%;
        }

        #logo {
          height: 100%;
        }

        #logo img {
          height: 100%;
          padding: 5px 20px;
        }

        #timer {
          height: 100%;
          justify-content: flex-start;
        }

        #body {
          align-items: center;
          display: flex;
          height: 100%;
          overflow: hidden;
          max-width: 100%;
          width: 100%;
        }

        #body #content {
          height: 100%;
          width: 100%;
        }

        #total {
          height: 100%;
          margin-left: auto;
        }
      </style>

      <div id="container">
        <div id="logo"><img src="./img/logo.png" /></div>
        <trm-omnibar-timer id="timer"></trm-omnibar-timer>
        <div id="body">
          <div id="content"></div>
        </div>
        <trm-omnibar-total id="total"></trm-omnibar-total>
      </div>
    `;
  }

  static get is() {
    return "trm-omnibar";
  }

  static get properties() {
    return {
      hideDeaths: Boolean,
      hideTimer: Boolean,
      hidetotal: Boolean,
    };
  }

  ready() {
    super.ready();

    // list of replicants we need
    const replicants = [total, timer, donationGoals, donationPolls];

    let numDeclared = 0;
    replicants.forEach((replicant) => {
      replicant.once("change", () => {
        numDeclared++;

        if (numDeclared == replicants.length) {
          beforeNextRender(this, this.run);
        }
      });
    });

    if (this.hidetotal) this.$.total.style.display = "none";

    if (this.dataset) {
      if (this.dataset.hideTimer === "true") {
        this.$.timer.style.display = "none";
      }
    }
  }

  run() {
    const self = this;
    const parts = [this.showCTA, this.showSocials, this.showLevels];

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

    processNextPart();
  }

  setContent(tl, element) {
    tl.to({}, 0.03, {});
    tl.call(() => {
      tl.pause();
      this.$.content.innerHTML = "";
      this.$.content.appendChild(element);
      flush();
      afterNextRender(this, () => {
        flush();
        requestAnimationFrame(() => {
          tl.resume(null, false);
        });
      });
    });
  }

  showContent(tl, element) {
    tl.to({}, 0.03, {});
    tl.call(() => {
      tl.pause();

      const elementEntranceAnim = element.enter(DISPLAY_DURATION, SCROLL_HOLD_DURATION);
      elementEntranceAnim.call(tl.resume, null, tl);
    });
  }

  hideContent(tl, element) {
    tl.to({}, 0.03, {});
    tl.call(() => {
      tl.pause();

      const elementExitAnim = element.exit();
      elementExitAnim.call(tl.resume, null, tl);
    });
  }

  showCTA() {
    const tl = new TimelineLite();
    const trmCTA = document.createElement("trm-omnibar-cta");

    this.setContent(tl, trmCTA);
    this.showContent(tl, trmCTA);
    this.hideContent(tl, trmCTA);

    return tl;
  }

  showSocials() {
    const tl = new TimelineLite();
    const trmSocials = document.createElement("trm-omnibar-socials");

    this.setContent(tl, trmSocials);
    this.showContent(tl, trmSocials);
    this.hideContent(tl, trmSocials);

    return tl;
  }

  showLevels() {
    const tl = new TimelineLite();

    const trmLevels = document.createElement("trm-omnibar-levels");
    this.setContent(tl, trmLevels);
    this.showContent(tl, trmLevels);
    this.hideContent(tl, trmLevels);

    return tl;
  }
}

customElements.define(TRMOmnibar.is, TRMOmnibar);
