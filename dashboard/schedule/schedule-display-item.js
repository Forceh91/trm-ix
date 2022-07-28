import { html } from "../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";

class DashboardScheduleDisplayItem extends PolymerElement {
	static get template() {
		return html`
			<style>
				* {
					box-sizing: border-box;
				}

				#scheduleItem {
					display: block;
					width: 100%;
				}

				.row {
					display: block;
					width: 100%;
				}

				.row:not(:last-child) {
					margin-bottom: 20px;
				}

				h4 {
					color: #aaa;
					font-size: 14px;
					margin: 0;
					margin-bottom: 10px;
					text-transform: uppercase;
				}

				.data {
					font-size: 18px;
					width: 100%;
				}
			</style>

			<div id="scheduleItem">
				<div class="row">
					<h4>Game</h4>
					<div id="game" class="data">N/A</div>
				</div>

				<div class="row">
					<h4>Runner</h4>
					<div id="runner" class="data">N/A</div>
				</div>

				<div class="row">
					<h4>Category</h4>
					<div id="category" class="data">N/A</div>
				</div>

				<div class="row">
					<h4>Platform</h4>
					<div id="platform" class="data">N/A</div>
				</div>

				<div class="row">
					<h4>Year</h4>
					<div id="year" class="data">N/A</div>
				</div>

				<!--
      <div class="row">
        <h4>Donation Goals</h4>
        <div id="donationGoals" class="data">N/A</div>
      </div>
      -->
			</div>
		`;
	}

	static get is() {
		return "dashboard-schedule-display-item";
	}

	static get properties() {
		return {
			game: Object,
		};
	}

	ready() {
		super.ready();

		if (!this.game) {
			return;
		}

		let game = this.game && this.game.data;

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
		this.$.platform.textContent = game[4] || "N/A";
		this.$.category.textContent = game[3] || "N/A";
		this.$.year.textContent = game[5] || "N/A";
		this.$.runner.textContent = runners.join(", ") || "N/A";

		if (!game.donation_total || game.donation_total.length < 1) {
			return;
		}

		let donationGoals = "";
		game.donation_total.forEach((donation_goal, index) => {
			donationGoals += `$${donation_goal} - ${donation_unlock[index]}<br/>`;
		});

		this.$.donationGoals.innerHTML = donationGoals;
	}
}

customElements.define(DashboardScheduleDisplayItem.is, DashboardScheduleDisplayItem);
