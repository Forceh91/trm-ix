import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const foobarNowPlaying = nodecg.Replicant("foobarNowPlaying");

class TRMTechLandNowPlaying extends PolymerElement {
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

        #now_playing_container {
          color: var(--marathon-col);
        }
      </style>

      <div id="now_playing_container">
        <span id="artist"></span>&nbsp;-&nbsp;<span id="track"></span
        ><span id="album_container">&nbsp;(<span id="album"></span>)</span>
      </div>
    `;
  }

  static get is() {
    return "trm-techland-now-playing";
  }

  static get properties() {
    return {};
  }

  ready() {
    super.ready();

    foobarNowPlaying.on("change", (newVal) => {
      this.$.artist.textContent = newVal.artist;
      this.$.track.textContent = newVal.track;
      if (newVal.album) {
        this.$.album.textContent = newVal.album;
        this.$.album_container.style.display = "initial";
      } else this.$.album_container.style.display = "none";
    });
  }
}

customElements.define(TRMTechLandNowPlaying.is, TRMTechLandNowPlaying);
