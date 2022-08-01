import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const donationTotal = nodecg.Replicant("total");

class TRMOmnibarTotal extends PolymerElement {
  static get template() {
    return html`
      <style>
        #total {
          align-items: center;
          background: #444;
          color: #ddd;
          display: flex;
          font-size: 30px;
          height: 100%;
          padding: 0 10px;
        }

        #total_amount {
          font-variant-numeric: tabular-nums;
        }
      </style>

      <div id="total">
        <span id="total_currency">$</span>
        <span id="total_amount"></span>
      </div>
    `;
  }

  static get is() {
    return "trm-omnibar-total";
  }

  ready() {
    super.ready();

    donationTotal.on("change", (newVal, oldVal) => {
      this.updateDonationTotal(newVal, oldVal);
    });
  }

  updateDonationTotal(newVal, oldVal) {
    oldVal = oldVal || 0;
    let donationTotal = parseFloat(newVal);
    let donationTotalIncrease = donationTotal - oldVal;
    let timeToUpdate = (Math.min(donationTotalIncrease * 0.03), 5);
    let previousTotal = { value: oldVal };

    new TimelineLite({ autoRemoveChildren: true }).to(
      previousTotal,
      timeToUpdate,
      {
        value: newVal || 0,
        ease: Power3.easeOut,
        onUpdate: function () {
          this.$.total_amount.textContent = previousTotal.value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }.bind(this),
      },
      "0"
    );
  }
}

customElements.define(TRMOmnibarTotal.is, TRMOmnibarTotal);
