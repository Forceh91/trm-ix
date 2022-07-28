(function() {
  "use strict";

  const deathCount = nodecg.Replicant("deathCounter");

  class TRMOmnibarDeathCount extends Polymer.Element {
    static get is() {
      return "trm-omnibar-death-count";
    }

    static get properties() {
      return {};
    }

    ready() {
      super.ready();

      deathCount.on("change", newVal => {
        this.updateDeathCount(newVal);
      });
    }

    updateDeathCount(newVal) {
      this.$.deaths.innerText = newVal;
    }
  }

  customElements.define(TRMOmnibarDeathCount.is, TRMOmnibarDeathCount);
})();
