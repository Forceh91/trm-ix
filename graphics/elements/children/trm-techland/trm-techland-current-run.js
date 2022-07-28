import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const schedule = nodecg.Replicant("eventSchedule");
const scheduleSeek = nodecg.Replicant("scheduleSeek");

class TRMTechLandCurrentRun extends PolymerElement {
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

        #current_run {
          color: var(--marathon-col);
        }
      </style>

      <div id="current_run">
        <span id="game"></span> (<span id="category"></span>) by <span id="runner"></span> (Est.
        <span id="estimate"></span>)
      </div>
    `;
  }

  static get is() {
    return "trm-techland-current-run";
  }

  static get properties() {
    return {};
  }

  ready() {
    super.ready();

    const replicants = [schedule, scheduleSeek];

    let numDeclared = 0;
    replicants.forEach((replicant) => {
      replicant.once("change", () => {
        numDeclared++;

        if (numDeclared == replicants.length) {
          this.completeReady();
        }
      });
    });
  }

  completeReady() {
    // make sure the seek is valid
    const tempSchedule = schedule.value;
    if (scheduleSeek >= tempSchedule.length || scheduleSeek < 0) return;

    scheduleSeek.on("change", () => {
      console.log("schedule change", scheduleSeek.value);
      const game = tempSchedule[scheduleSeek.value] || null;
      this.updateCurrentRunner(game);
    });
  }

  updateCurrentRunner(game) {
    if (!game) return;

    const runLength = this.calculateRunLength(game.length_t);
    game = game.data;
    if (!game) return;

    const regex = /(\w+)/;

    // we may have a list of runners (ie a race)
    const runnersList = game[1].split(",");
    const runners = [];

    // go through each runner
    runnersList.forEach((runner) => {
      // and parse out the markdown to something readable
      let demarkdownRunner = runner.match(regex);
      if (demarkdownRunner && demarkdownRunner[0]) runners.push(demarkdownRunner[0].trim());
    });

    this.$.game.textContent = game[0] || "N/A";
    this.$.category.textContent = game[3] || "N/A";
    this.$.runner.textContent = runners.join(", ") || "N/A";
    this.$.estimate.textContent = runLength || "N/A";
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

customElements.define(TRMTechLandCurrentRun.is, TRMTechLandCurrentRun);
