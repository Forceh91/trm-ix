import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
const charity = nodecg.bundleConfig.charity_name;
const donateURL = nodecg.bundleConfig.donateLink;

class TRMOmnibarCta extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          align-items: center;
          display: flex;
          height: 100%;
          padding: 0 10px;
          width: 100%;
        }

        #benefits,
        #donate {
          align-items: center;
          display: none;
          justify-content: center;
          opacity: 0;
          width: 100%;
        }

        #charity,
        #donateurl {
          color: var(--marathon-col);
          font-weight: bold;
        }
      </style>

      <div id="benefits">
        <span>All donations will benefit <span id="charity"></span></span>
      </div>

      <div id="donate">
        <span>Donate now at <span id="donateurl"></span></span>
      </div>
    `;
  }

  static get is() {
    return "trm-omnibar-cta";
  }

  ready() {
    super.ready();

    beforeNextRender(this, () => {
      this.$.charity.innerHTML = charity;
      this.$.donateurl.innerHTML = donateURL;
    });
  }

  reset() {
    const tl = new TimelineLite();

    tl.set([this.$.benefits, this.$.donate], { opacity: "0", display: "none" });
    return tl;
  }

  enter(displayDuration) {
    const tl = new TimelineLite();
    tl.add(this.reset());

    // show benefits line
    tl.to(this.$.benefits, 0.75, { display: "flex", opacity: 1, ease: Power3.easeIn });
    tl.to(this, displayDuration, {});
    tl.to(this.$.benefits, 0.75, { display: "none", opacity: 0, ease: Power3.easeOut });

    // show donate url
    tl.to(this.$.donate, 0.75, { display: "flex", opacity: 1, ease: Power3.easeOut });
    tl.to(this, displayDuration, {});
    tl.to(this.$.donate, 0.75, { display: "none", opacity: 0, ease: Power3.easeOut });

    return tl;
  }

  exit() {
    const tl = new TimelineLite();
    return tl;
  }
}

customElements.define(TRMOmnibarCta.is, TRMOmnibarCta);
