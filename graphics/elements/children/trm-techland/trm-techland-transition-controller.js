import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const transitionCurrentState = nodecg.Replicant("transition_current_state");
const twitchAdStatus = nodecg.Replicant("twitch_ad_status");

class TRMTechLandTransitionController extends PolymerElement {
  static get template() {
    return html`
      <link rel="stylesheet" href="../shared/fonts/fontawesome/font-awesome.min.css" />
      <link rel="stylesheet" href="../shared/imports/bootstrap.css" />

      <style>
        :host {
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          height: 100%;
          width: 100%;
        }

        #transition_container {
        }

        #current_state {
          color: var(--marathon-col);
        }

        .info-title {
          color: #cacaca;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
          width: 100%;
        }

        .info-text {
          font-size: 18px;
          font-weight: normal;
          width: 100%;
        }

        #transition_stages_container {
          margin-top: 20px;
        }

        #transition_stages {
          list-style: none;
          margin-top: 20px;
        }

        #transition_stages i {
          display: none;
          margin-right: 10px;
        }

        #transition_stages .pending .fa-circle-notch {
          display: initial;
        }

        #transition_stages .working .fa-spinner {
          display: inline-block;
        }

        #transition_stages .attention {
          color: darkorange;
        }
        #transition_stages .attention .fa-exclamation-circle {
          display: inline-block;
        }

        #transition_stages .complete {
          opacity: 0.6;
        }

        #transition_stages .complete .fa-check {
          color: forestgreen;
          display: initial;
        }

        #button_container button:not(:last-child) {
          margin-bottom: 15px;
        }

        #button_container {
          align-items: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        #button_container button {
          width: 100%;
        }
      </style>

      <div id="transition_container">
        <div class="info-title">Current Stage</div>
        <div class="info-text"><span id="current_state"></span></div>

        <div class="row">
          <div id="transition_stages_container" class="col">
            <div class="info-title">Transition Stages</div>
            <ul class="info-text" id="transition_stages"></ul>
          </div>

          <div id="button_container" class="col">
            <button id="begin_transmission" on-click="beginTransmission" type="button" class="btn btn-warning">
              <span>Begin Transmission</span>
            </button>
            <button
              id="confirm_runners_ready"
              on-click="userConfirmRunnersReady"
              type="button"
              class="btn btn-success"
            ></button>
            <button
              id="transition_to_live"
              on-click="userWantsGameScreen"
              type="button"
              class="btn btn-danger"
            ></button>
          </div>
        </div>
      </div>
    `;
  }

  static get is() {
    return "trm-techland-transition-controller";
  }

  static get properties() {
    return {};
  }

  ready() {
    super.ready();

    transitionCurrentState.on("change", (newVal) => {
      this.updateCurrentTransitionState(newVal);
      this.setBeginTransmissionButtonState(newVal);

      nodecg.sendMessage("transition:get_transition_list", {}, (stages) => {
        this.$.transition_stages.innerHTML = "";

        stages.forEach((stage) => {
          let classString =
            newVal.stage.id === stage.id
              ? this.getClassForTransitionState(transitionCurrentState.value.state)
              : "pending";
          if (newVal.stage.id > stage.id) classString = this.getClassForTransitionState(2);
          this.$.transition_stages.innerHTML += `<li class="${classString}"><i class="fa fa-circle-notch"></i><i class="fa fa-spinner fa-spin"></i><i class="fa fa-check"></i><i class="fa fa-exclamation-circle"></i><span>${stage.title}</span></li>`;
        });
      });
    });
  }

  updateCurrentTransitionState(transitionState) {
    this.$.current_state.textContent = transitionState.stage.title;
  }

  getClassForTransitionState(state) {
    switch (state) {
      case 0: // pending
        return "attention";
      case 1: // working
        return "working";
      case 2: // finished
        return "complete";
    }
  }

  beginTransmission() {
    const resp = confirm("Are you sure you want to transition to game change? THIS CANNOT BE UNDONE ONCE STARTED");
    if (!resp) return;

    const self = this;
    nodecg.sendMessage("transition:start_transmission", null, () => {
      self.disableBeginTransmission().bind(self);
    });
  }

  setBeginTransmissionButtonState(state) {
    this.disableBeginTransmission();
    this.disableConfirmRunnersReady();
    this.disableConfirmTransitionToLive(state.stage.id < 6);

    if (state.stage.id !== -1) this.disableBeginTransmission(); // past game screen
    if (state.stage.id === -1) this.enableBeginTransmission(); // on game screen
    if (state.stage.id === 5 && state.state !== 2) this.enableConfirmRunnersReady();
    if (state.stage.id === 6 && state.state !== 2) this.enableConfirmTransitionToLive();
  }

  enableBeginTransmission() {
    this.$.begin_transmission.textContent = "Transition to game change";
    this.$.begin_transmission.removeAttribute("disabled");
  }

  disableBeginTransmission() {
    const self = this;
    self.$.begin_transmission.setAttribute("disabled", true);
    self.$.begin_transmission.textContent = "Transitioning...";
  }

  enableConfirmRunnersReady() {
    this.$.confirm_runners_ready.removeAttribute("disabled");
    this.$.confirm_runners_ready.textContent = "Confirm runners ready";
  }

  disableConfirmRunnersReady() {
    const self = this;
    self.$.confirm_runners_ready.setAttribute("disabled", true);
    self.$.confirm_runners_ready.textContent = "RUNNERS READY";
  }

  userConfirmRunnersReady() {
    const self = this;
    const resp = confirm("Are you sure runners are ready? Game looks good and audio sounds good for everyone?");
    if (!resp) return;

    nodecg.sendMessage("transition:user_confirmed_runners_ready");
    self.disableConfirmRunnersReady();
  }

  enableConfirmTransitionToLive() {
    const self = this;
    self.$.transition_to_live.removeAttribute("disabled");
    self.$.transition_to_live.textContent = "Transition to live (game)";
  }

  disableConfirmTransitionToLive(isBefore) {
    const self = this;
    self.$.transition_to_live.setAttribute("disabled", true);
    self.$.transition_to_live.textContent = isBefore ? "Transition to live (game)" : "GAME SCREEN REQUESTED";
  }

  userWantsGameScreen() {
    if (twitchAdStatus && twitchAdStatus.value && twitchAdStatus.value.end_time > Date.now())
      return alert("ADVERTS ARE STILL RUNNING, WAIT UNTIL THESE ARE COMPLETE");

    const resp = confirm(
      "Are you want to show the LIVE GAME SCREEN?\n\nTHE REMAINING STEPS ARE AUTOMATED AND CANNOT BE STOPPED\n\nONCE TRANSITION IS COMPLETE THE TECH DESK WILL BE LOCKED FOR 10 SECONDS"
    );
    if (!resp) return;

    nodecg.sendMessage("transition:user_wants_game_screen");
  }
}

customElements.define(TRMTechLandTransitionController.is, TRMTechLandTransitionController);
