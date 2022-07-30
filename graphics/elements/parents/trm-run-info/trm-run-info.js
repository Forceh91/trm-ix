import "../trm-host-info/trm-host-info.js";

import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import {
  beforeNextRender,
  afterNextRender,
} from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { flush } from "../../../../node_modules/@polymer/polymer/lib/utils/flush.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

// config
const DISPLAY_DURATION = nodecg.bundleConfig.displayDuration || 5;

// replicants
const currentGame = nodecg.Replicant("currentGame");
const runnerTimer = nodecg.Replicant("runnerTimer");

class TRMRunInfo extends PolymerElement {
  static get template() {
    return html`
      <link rel="stylesheet" href="../shared/fonts/fontawesome/font-awesome.min.css" />
      <link rel="stylesheet" href="../shared/fonts/exo2/exo2.css" />

      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          overflow: hidden;
          width: 100%;
        }

        .run_container {
          width: 100%;
        }

        .run_container #run_title {
          color: var(--marathon-col);
          font-size: 30px;
          font-weight: bold;
          text-align: center;
          width: 100%;
          margin-bottom: 10px;
        }

        .run_container #run_category {
          font-size: 25px;
          text-align: center;
          margin-bottom: 30px;
          width: 100%;
        }

        .run_container .run-info-block {
          border: 1px solid #aaa;
          background: #444;
          font-size: 25px;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .run_container .run-info-block {
          margin-bottom: 25px;
        }

        .run_container .run-info-block .run-info-type {
          background: var(--marathon-col);
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
        }

        .run_container .run-info-block .run-info-text {
          padding: 0 10px;
        }

        .run_container #timer,
        .run_container #estimate {
          font-variant-numeric: tabular-nums;
        }

        .run_container.is-horizontal {
          align-items: center;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          height: 100%;
        }

        .runner_container.is-horizontal {
          display: none;
        }

        .run_container .run-info-text.timer {
          align-items: center;
          display: flex;
          width: calc(100% - 50px);
        }

        .run_container .timer #timer {
          min-width: 130px;
        }

        .run_container .timer #estimate_container {
          align-items: center;
          display: flex;
          font-weight: bold;
          margin-left: auto;
        }

        .run_container .timer #estimate_container #estimate {
          padding-left: 10px;
          text-align: right;
        }
      </style>

      <div class="run_container">
        <div id="run_title"></div>
        <div id="run_category"></div>

        <div id="runners" class="run_container run-info-block runner_container">
          <div class="run-info-type"><i class="fas fa-user"></i></div>
          <div class="run-info-text" id="runner"></div>
        </div>

        <div class="run_container run-info-block">
          <div class="run-info-type"><i class="fas fa-gamepad"></i></div>
          <div class="run-info-text" id="platform"></div>
        </div>

        <div class="run_container run-info-block">
          <div class="run-info-type"><i class="fas fa-stopwatch"></i></div>
          <div class="run-info-text timer">
            <div id="timer"></div>
            <div id="estimate_container">
              <div class="run-info-type"><i class="fas fa-flag-checkered"></i></div>
              <div id="estimate"></div>
            </div>
          </div>
        </div>

        <div class="run-container run-info-block">
          <div class="run-info-type"><i class="fas fa-microphone"></i></div>
          <div class="run-info-text hosts">
            <trm-host-info></trm-host-info>
          </div>
        </div>
      </div>
    `;
  }

  static get is() {
    return "trm-run-info";
  }

  static get properties() {
    return {
      horizontal: Boolean,
    };
  }

  ready() {
    super.ready();

    // list of replicants we need
    const replicants = [currentGame, runnerTimer];

    let numDeclared = 0;
    replicants.forEach((replicant) => {
      replicant.once("change", () => {
        numDeclared++;

        if (numDeclared == replicants.length) {
          beforeNextRender(this, this.run);
          this.showRunInfo();
        }
      });
    });

    currentGame.on("change", () => {
      this.showRunInfo();
    });

    runnerTimer.on("change", (newVal) => {
      this.$.timer.innerText = newVal.formattedTime || "00:00";
    });

    if (this.horizontal) this.$.runners.classList.add("is-horizontal");
  }

  run() {
    const self = this;
    const parts = [this.showRunnerName, this.showRunnerTwitch];

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

    //processNextPart();
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

  showRunInfo() {
    const rundata = currentGame.value;
    if (!rundata) return;

    const regex = /(\w+)/;
    const runnerParsed = rundata[1].match(regex);
    const runnerName = runnerParsed && runnerParsed[0];

    this.$.runner.innerText = runnerName || "N/A";
    this.$.run_title.innerText = rundata[0] || "N/A";
    this.$.run_category.innerText = rundata[3] || "Casual";
    this.$.platform.innerText = `${rundata[4] || "N/A"} (${rundata[5] || "N/A"})`;

    this.$.estimate.innerText = this.calculateRunLength(rundata.length_t) || "00:00";
  }

  showRunnerName() {
    const rundata = currentGame.value;
    if (!rundata) return;

    const tl = new TimelineLite();
    if (!rundata[2]) return tl;

    const regex = /(\w+)/;
    const runnerParsed = rundata[1].match(regex);
    const runnerName = runnerParsed && runnerParsed[0];

    tl.call(() => {
      this.$.runner.innerText = runnerName || "N/A";
      //this.$.runner_twitch.innerText = rundata[2];
    });
    tl.to({}, DISPLAY_DURATION, {});
    tl.to(this.$.runnerContainer, 0.75, {
      marginLeft: "-100%",
      ease: Power0.easeOut,
    });
    return tl;
  }

  showRunnerTwitch() {
    const rundata = currentGame.value;
    if (!rundata) return;

    const tl = new TimelineLite();
    tl.call(() => {
      //this.$.runner_twitch.innerText = rundata[2] || "Twitch Account";
    });
    tl.to({}, DISPLAY_DURATION, {});
    tl.to(this.$.runnerContainer, 0.75, {
      marginLeft: 0,
      ease: Power0.easeOut,
    });
    return tl;
  }

  calculateRunLength(seconds) {
    let milliseconds = seconds * 1000;

    const pyramid = {
      hour: 3.6e6,
      minute: 6e4,
      second: 1000,
    };

    const msObject = {};
    Object.keys(pyramid).forEach((key) => {
      msObject[key] = Math.floor(milliseconds / pyramid[key]);
      milliseconds -= msObject[key] * pyramid[key];
    });

    if (msObject.hour > 0) {
      return `${msObject.hour > 9 ? msObject.hour : "0" + msObject.hour}:${
        msObject.minute > 9 ? msObject.minute : "0" + msObject.minute
      }:${msObject.second > 9 ? msObject.second : "0" + msObject.second}`;
    }

    return `${msObject.minute > 9 ? msObject.minute : "0" + msObject.minute}:${
      msObject.second > 9 ? msObject.second : "0" + msObject.second
    }`;
  }
}

customElements.define(TRMRunInfo.is, TRMRunInfo);
