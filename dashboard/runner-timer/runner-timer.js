import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";
import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";

const runnerTimer = nodecg.Replicant("runnerTimer");
const runnerTimers = nodecg.Replicant("runnerTimers");
const currentGame = nodecg.Replicant("currentGame");
const obsAudioSources = nodecg.Replicant("obsAudioSources");

class DashboardRunnerTimer extends PolymerElement {
	static get is() {
		return "dashboard-runner-timer";
	}

	ready() {
		super.ready();

		const replicants = [currentGame, runnerTimer, runnerTimers];

		let numDeclared = 0;
		replicants.forEach(replicant => {
			replicant.once("change", () => {
				numDeclared++;

				if (numDeclared == replicants.length) {
					beforeNextRender(this, this.run);
				}
			});
		});
	}

	run() {
		const self = this;

		currentGame.on("change", newVal => {
			// get the runners
			const runners = newVal[1];

			// parse out into a nice list
			this.runners = this.parseRunners(runners);

			// update the timers
			runnerTimers.value.forEach((runnerTimer, i) => {
				runnerTimer.runner = this.runners[i];
			});
		});

		runnerTimer.on("change", newVal => {
			this.$.runnerTimer.innerText = newVal.formattedTime;

			this.toggleButtonStatus(newVal.state);
		});

		runnerTimers.on("change", newVal => {
			this.renderRunnerTimers(newVal);
		});

		obsAudioSources.on("change", () => {
			this.renderRunnerTimers(runnerTimers.value);
		});

		this.$.startTimer.addEventListener("click", () => {
			nodecg.sendMessage("runnertimer:start");
			nodecg.sendMessage("runnertimers:start:all");
		});

		this.$.pauseTimer.addEventListener("click", () => {
			nodecg.sendMessage("runnertimer:pause");
		});

		this.$.resetTimer.addEventListener("click", () => {
			const result = confirm("Are you sure you want to RESET ALL RUNNER TIMERS to 00:00? This action CANNOT be UNDONE");
			if (result) {
				nodecg.sendMessage("runnertimers:reset:all");
				nodecg.sendMessage("runnertimer:reset");
			}
		});
	}

	toggleButtonStatus(state) {
		const isRunning = state === 1;
		this.$.startTimer.toggleAttribute("disabled", isRunning);
		this.$.resetTimer.toggleAttribute("disabled", isRunning);
		this.$.pauseTimer.toggleAttribute("disabled", !isRunning);
	}

	renderRunnerTimers(newVal) {
		this.timers && this.timers.splice(0);
		this.$.runnerTimers.render();

		const timers = newVal.slice(0);
		timers.length = 4;

		for (let i = 0; i < 4; i++) {
			timers[i] = timers[i] || false;
		}

		this.timers = timers;
	}

	parseRunners(runners) {
		if (!runners) return [];
		return runners.split(",").map(runner => {
			// trim whitespace
			runner.trim();

			// handle the url stuff
			const regex = /(\w+)/;
			const runnerParsed = runner.match(regex);
			const runnerName = runnerParsed && runnerParsed[0];

			if (runnerName) return runnerName;

			return null;
		});
	}

	_onlyTimersWithRunner(timer) {
		return timer.runner && timer.runner.length;
	}
}

customElements.define(DashboardRunnerTimer.is, DashboardRunnerTimer);
