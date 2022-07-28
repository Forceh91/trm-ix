"use strict";

module.exports = function (nodecg) {
	const webrequest = require("web-request");
	const currentgame = nodecg.Replicant("currentGame");

	const apikey = nodecg.bundleConfig.featured_runner_api_key;
	if (!apikey || !apikey.length) {
		return nodecg.log.info(`[featuredrunner] Please set "featured_runner_api_key" in the config`);
	}

	async function updateFeaturedRunner(runners) {
		runners = runners.replace(/(\s)/g, "").toLowerCase();

		await webrequest
			.post(`https://api.furious.pro/featuredchannels/bot/${apikey}/${runners}`)
			.then((resp) => {
				nodecg.log.info(`[featuredrunner] Featured runner updated to be ${runners}`);
			})
			.catch((err) => {
				nodecg.log.error(`[featuredrunner] Failed to update featured runner (${runners}) for this run`);
			});
	}

	currentgame.on("change", (newval) => {
		const runners = newval[2];
		if (!runners) return;

		updateFeaturedRunner(newval[2]);
	});
};
