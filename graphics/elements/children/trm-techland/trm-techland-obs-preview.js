import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const obsScreenshots = nodecg.Replicant("obs_screenshots");

class TRMTechLandOBSPreview extends PolymerElement {
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

        #preview_container {
          color: var(--marathon-col);
        }

        #preview_container img {
            display: block;
            height: auto;
            margin: 0 auto;
          width: 70%;
        }

        #preview_container img:not(:last-child) {
          margin-right: 15px;
        }

        .info-title {
            color: #cacaca;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
            text-align: center;
            text-transform: uppercase;
            width: 100%;
          }        

          .img-container {
              float: left;
              width: 50%;
          }
      </style>

      <div id="preview_container">
        <div class="img-container">
            <div class="info-title">Preview</div>
            <img id="preview"></img>
        </div>
        <div class="img-container">
            <div class="info-title">Live</div>
            <img id="live"></img>
        </div>
    </div>
    `;
  }

  static get is() {
    return "trm-techland-obs-preview";
  }

  static get properties() {
    return {};
  }

  ready() {
    super.ready();

    obsScreenshots.on("change", (newVal) => {
      this.updatePreviewImages(newVal);
    });
  }

  updatePreviewImages(newVal) {
    this.$.preview.src = newVal.preview;
    this.$.live.src = newVal.live;
  }
}

customElements.define(TRMTechLandOBSPreview.is, TRMTechLandOBSPreview);
