import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";
import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";

const schedule = nodecg.Replicant("eventSchedule");
const scheduleSeek = nodecg.Replicant("scheduleSeek");

class DashboardScheduleDisplay extends PolymerElement {
	static get is() {
		return "dashboard-schedule-display";
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
					beforeNextRender(this, this.run);
				}
			});
		});
	}

	run() {
		const self = this;
		scheduleSeek.on("change", (seek) => {
			self.renderScheduleItems(seek);
		});

		// assign event listners
		this.$.selectPrevGame.addEventListener("click", this.selectPrevGame);
		this.$.selectNextGame.addEventListener("click", this.selectNextGame);

		this.$.fetchSchedule.addEventListener("click", this.fetchSchedule.bind(this));
		nodecg.listenFor("scheduleReceived", this.scheduleReceived.bind(this));
	}

	renderScheduleItems(seek) {
		// make sure the seek is valid
		let tempSchedule = schedule.value;
		if (seek >= tempSchedule.length || seek < 0) {
			return;
		}

		// toggle buttons for prev game
		if (seek < 1) {
			this.$.selectPrevGame.setAttribute("disabled", true);
		} else {
			this.$.selectPrevGame.removeAttribute("disabled");
		}

		// current game and next game
		let currentGame = tempSchedule[seek],
			nextGame = null;

		// check we have a next game
		let nextSeek = seek + 1;
		if (nextSeek < tempSchedule.length) {
			this.$.selectNextGame.removeAttribute("disabled");
			nextGame = tempSchedule[nextSeek];
		} else {
			this.$.selectNextGame.setAttribute("disabled", true);
		}

		// clear current game
		this.$.currentGame.innerHTML = "";

		// display new current game
		let currentGameElement = document.createElement("dashboard-schedule-display-item");
		currentGameElement.game = currentGame;
		this.$.currentGame.append(currentGameElement);

		// clear next game
		this.$.nextGame.innerHTML = "";

		// display new next game
		let nextGameElement = document.createElement("dashboard-schedule-display-item");
		nextGameElement.game = nextGame;
		this.$.nextGame.append(nextGameElement);
	}

	selectPrevGame() {
		nodecg.sendMessage("scheduleSelectPrev");
	}

	selectNextGame() {
		nodecg.sendMessage("scheduleSelectNext");
	}

	fetchSchedule() {
		nodecg.sendMessage("scheduleFetch");

		this.$.fetchSchedule.setAttribute("disabled", true);
		this.$.fetch.textContent = "Fetching...";
	}

	scheduleReceived() {
		this.$.fetchSchedule.removeAttribute("disabled");
		this.$.fetch.textContent = "Fetch Schedule";
	}
}

customElements.define(DashboardScheduleDisplay.is, DashboardScheduleDisplay);
