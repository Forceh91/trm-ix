import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const voiceUsers = nodecg.Replicant("discord:voice_users");

class TRMHostInfo extends PolymerElement {
  static get template() {
    return html`
      <link rel="stylesheet" href="../shared/fonts/fontawesome/font-awesome.min.css" />

      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          overflow: hidden;
          width: 100%;
        }
      </style>

      <div id="host_list_container"></div>
    `;
  }

  static get is() {
    return "trm-host-info";
  }

  static get properties() {
    return {
      horizontal: Boolean,
    };
  }

  ready() {
    super.ready();

    voiceUsers.on("change", () => {
      this.updateHostsList();
    });
  }

  updateHostsList() {
    this.showHostsList();

    // get the list of hosts
    const hosts = voiceUsers.value;
    if (!hosts || !hosts.length) return this.hideHostsList();

    // filter down so we ignore bot users
    const nonBotHosts = hosts.filter((host) => !host.bot);
    if (!nonBotHosts || !nonBotHosts.length) return this.hideHostsList();

    this.$.host_list_container.innerHTML = nonBotHosts.map((user) => user.username).join(", ");
  }

  showHostsList() {
    this.$.host_list_container.style.display = "";
  }

  hideHostsList() {
    this.$.host_list_container.innerHTML = "N/A";
  }
}

customElements.define(TRMHostInfo.is, TRMHostInfo);
