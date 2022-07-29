import {
  beforeNextRender,
  afterNextRender,
} from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { flush } from "../../../../node_modules/@polymer/polymer/lib/utils/flush.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";

// config
const DISPLAY_DURATION = nodecg.bundleConfig.displayDuration || 5;

// replicants
const schedule = nodecg.Replicant("eventSchedule");
const scheduleSeek = nodecg.Replicant("scheduleSeek");
const runnerTimer = nodecg.Replicant("runnerTimer");

class TRMBreakNextGame extends PolymerElement {
  static get template() {
    return html`
      <link rel="stylesheet" href="../shared/fonts/exo2/exo2.css" />

      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          border: 0;
          color: #fff;
          display: flex;
          overflow: hidden;
          width: 100%;
        }

        #body {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          overflow: hidden;
          padding: 10px;
          width: 100%;
        }

        #body.hidden {
          display: none;
        }

        #content {
          padding: 20px;
          height: 100%;
          width: 100%;
        }

        .row {
          overflow: hidden;
        }

        .row.sub-row {
          color: #aaa;
        }

        h1 {
          font-size: 1.3rem;
          margin: 0;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .main-title {
          color: var(--marathon-col);
          font-size: 1.5rem;
          text-align: center;
          text-transform: uppercase;
          width: 100%;
          word-wrap: break-word;
        }

        .sub-title {
          color: #aaa;
          font-size: 1rem;
          text-align: center;
          width: 100%;
        }

        .text {
          margin-top: 30px;
        }

        .block-container {
          display: flex;
          justify-content: center;
        }

        .block {
          display: inline-block;
          font-size: 1.1rem;
          margin-bottom: 15px;
          text-transform: uppercase;
          text-align: center;
          width: auto;
        }

        .block#game {
          color: var(--marathon-col);
          font-size: 1.3rem;
          margin-bottom: 10px;
        }

        .row.sub-row .block {
          margin-bottom: 0;
        }
      </style>

      <div id="body">
        <div id="content">
          <h1 id="main_title" class="main-title">Up Next</h1>

          <div class="text">
            <div class="row">
              <div class="block-container">
                <div class="block" id="game"></div>
              </div>
            </div>

            <div class="row">
              <div class="block-container">
                <div class="block"><span id="category"></span> in <span id="estimate"></span></div>
              </div>
            </div>

            <div class="row sub-row">
              <div class="block-container">
                <div class="block">by <span id="runner"></span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  static get is() {
    return "trm-break-next-game";
  }

  static get properties() {
    return {
      wide: Boolean,
      isFuture: Boolean,
    };
  }

  ready() {
    super.ready();

    // list of replicants we need
    const replicants = [schedule, scheduleSeek, runnerTimer];

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

    scheduleSeek.on("change", () => {
      this.showRunInfo();
    });
  }

  run() {
    const self = this;
    const parts = [];
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

  updateTitle(nextRunScheduled) {
    if (!this.isFuture) return;

    const distance = this.calculateTimeUntilNextRun(nextRunScheduled);
    let distanceString = "";
    if (distance && distance.length) distanceString = `(In ${distance})`;
    this.$.main_title && (this.$.main_title.innerText = `After That ${distanceString}`).trim();
    this.$.body.style.opacity = 0.75;
  }

  showRunInfo() {
    const tempSchedule = schedule.value;

    // if in the future hide if not there and show if there
    const ix = this.isFuture ? scheduleSeek.value + 1 : scheduleSeek.value;
    if (ix >= tempSchedule.length) return this.$.body.classList.add("hidden");
    else this.$.body.classList.remove("hidden");

    // get run data
    const run = tempSchedule[ix];
    const rundata = run && run.data;

    // update the title
    this.updateTitle(run.scheduled_t);

    const regex = /(\w+)/;
    // we may have a list of runners (ie a race)
    const runnersList = rundata[1].split(",");
    const runners = [];

    // go through each runner
    runnersList.forEach((runner) => {
      // and parse out the markdown to something readable
      let demarkdownRunner = runner.match(regex);
      if (demarkdownRunner && demarkdownRunner[0]) runners.push(demarkdownRunner[0].trim());
    });

    this.$.runner.innerText = runners.join(", ") || "N/A";
    this.$.game.innerText = rundata[0] || "N/A";
    this.$.category.innerText = rundata[3] || "Casual";
    this.$.estimate.innerText = this.calculateRunLength(run.length_t) || "00:00";
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

  calculateTimeUntilNextRun(nextRunScheduled) {
    const now = Date.now();
    return dateFns.distanceInWords(nextRunScheduled * 1000, now);
  }
}

customElements.define(TRMBreakNextGame.is, TRMBreakNextGame);
