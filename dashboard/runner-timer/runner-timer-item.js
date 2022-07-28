import { html } from "../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";

const obsAudioSources = nodecg.Replicant("obsAudioSources");

class DashboardRunnerTimerItem extends PolymerElement {
  static get template() {
    return html`
      <link rel="stylesheet" href="../../node_modules/bootstrap/dist/css/bootstrap.min.css" />

      <style>
        * {
          box-sizing: border-box;
        }

        #body {
          align-items: center;
          display: flex;
          width: 100%;
        }

        .right-side {
          margin-left: auto;
        }

        .time {
          margin-right: 10px;
        }

        .right-align {
          text-align: right;
        }

        button {
          float: right;
          margin: 0;
          width: 100px;
        }

        button:not(:last-child) {
          margin-right: 10px;
        }

        button.danger:not([disabled]) {
          background: indianred;
          color: #fff;
        }

        .start {
          background: green;
        }

        .pause {
          background: purple;
        }

        .finish {
          background: darkorange;
        }

        .reset {
          background: darkred;
        }

        .hidden {
          display: none;
        }

        .pos {
          background: purple;
          font-weight: bold;
          margin-right: 10px;
          padding: 5px;
          text-align: center;
        }
      </style>

      <div id="body">
        <div class$="[[getPositionClass()]]">[[timer.position]]</div>
        <div>[[timer.runner]]</div>
        <div class="right-side time">
          <span class$="[[shouldShowTime()]]">[[timer.formattedTime]]</span>
        </div>

        <button
          type="button"
          class="btn btn-sm btn-success"
          id="startTimer"
          class="start"
          disabled$="[[shouldDisableIfNotFinished()]]"
        >
          Resume
        </button>

        <button
          type="button"
          class="btn btn-sm btn-primary"
          id="finishTimer"
          class="finish"
          disabled$="[[shouldDisableWhenNotRunning()]]"
        >
          Finish
        </button>

        <button
          type="button"
          class="btn btn-sm btn-danger"
          id="resetTimer"
          class="reset"
          disabled$="[[shouldDisableWhenRunning()]]"
        >
          Reset
        </button>
      </div>
    `;
  }

  static get is() {
    return "dashboard-runner-timer-item";
  }

  static get properties() {
    return {
      ix: Number,
      timer: Object,
    };
  }

  ready() {
    super.ready();

    this.$.startTimer.addEventListener("click", this._startTimer.bind(this));
    this.$.finishTimer.addEventListener("click", this._finishTimer.bind(this));
    this.$.resetTimer.addEventListener("click", this._resetTimer.bind(this));
    // this.$.toggleSound.addEventListener("click", this._toggleSound.bind(this));
  }

  shouldDisableWhenRunning() {
    return this.timer.state === 1;
  }

  shouldDisableWhenNotRunning() {
    return this.timer.state !== 1;
  }

  shouldDisableIfNotFinished() {
    return this.timer.state !== 3;
  }

  isFinished() {
    return this.timer.state === 3;
  }

  audioSource() {
    return this.ix >= 0 && obsAudioSources && this.ix < obsAudioSources.value.length && obsAudioSources.value[this.ix];
  }

  shouldDisableSoundOption() {
    const audioSource = this.audioSource();
    return obsAudioSources.value.length < 2 || !audioSource || !audioSource.muted;
  }

  getPositionClass() {
    return this.isFinished() ? "pos" : "hidden";
  }

  shouldShowTime() {
    return this.isFinished() ? "time" : "hidden";
  }

  _startTimer() {
    nodecg.sendMessage("runnertimers:start", this.timer.id);
  }

  _pauseTimer() {
    nodecg.sendMessage("runnertimers:pause", this.timer.id);
  }

  _finishTimer() {
    nodecg.sendMessage("runnertimers:finish", this.timer.id);
  }

  _resetTimer() {
    nodecg.sendMessage("runnertimers:reset", this.timer.id);
  }

  _toggleSound() {
    nodecg.sendMessage("runner:togglesound", { runnerIx: this.ix, muteStatus: !this.audioSource().muted });
  }
}

customElements.define(DashboardRunnerTimerItem.is, DashboardRunnerTimerItem);
