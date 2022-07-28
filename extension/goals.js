'use strict';

module.exports = function(nodecg) {
	const donationGoals = nodecg.Replicant('donationGoals', {
		defaultValue: []
	});

	const donationTotal = nodecg.Replicant('total');
	donationTotal.on('change', checkAchievedDonationGoals);

	nodecg.listenFor('addDonationGoal', addDonationGoal);
	nodecg.listenFor('removeDonationGoal', removeDonationGoal);
	nodecg.listenFor('clearDonationGoals', clearDonationGoals);

	function addDonationGoal(data) {
		if (data.total < donationTotal.value)
			return;
		
		let goals = donationGoals.value.slice(0);
		goals.push({
			goalid: Date.now(),
			total: data.total,
			reward: data.reward
		});

		// sort them by which comes first
		let sortedGoals = goals.sort(function(a, b) {
			return (a.total > b.total);
		});

		donationGoals.value = sortedGoals;		
	}

	function removeDonationGoal(data) {
		let goalToRemove = data;
		if (typeof goalToRemove !== 'number')
			return;

		donationGoals.value.some((goal, index) => {
			if (goal.goalid == goalToRemove) {
				donationGoals.value.splice(index, 1);
				return true;
			}
		});
	}

	function clearDonationGoals(data) {
		let goals = donationGoals.value;
		donationGoals.value = [];
	}

	function checkAchievedDonationGoals(newVal, oldVal) {
		donationGoals.value.forEach((goal, index) => {
			if (goal.total <= newVal) {
				nodecg.sendMessage('donationGoalAchieved', goal);
				donationGoals.value.splice(index, 1);
			}
		});
	}
};
