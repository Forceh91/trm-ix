("use strict");

module.exports = function (nodecg) {
	const OBSWebSocket = require("obs-websocket-js");
	const obsAudioSources = nodecg.Replicant("obsAudioSources", { defaultValue: [], persistent: false });
	const currentGame = nodecg.Replicant("currentGame");

	const obs = new OBSWebSocket();
	obs.connect({ address: "localhost:4444", password: "MiniLaraFTW" });

	nodecg.listenFor("runner:togglesound", toggleGameSourceAudio);

	obs.on("AuthenticationSuccess", () => {
		fetchSourcesList();
	});

	currentGame.on("change", () => {
		fetchSourcesList();
	});

	// when we switch scenes we need to redo our game sources
	obs.on("SwitchScenes", sceneData => {
		// get the sources for this scene and all the sources with a name YT
		const sources = sceneData.sources;
		parseSourcesList(sources);
	});

	function fetchSourcesList() {
		obs.send("GetCurrentScene").then(resp => {
			parseSourcesList(resp.sources);
		});
	}

	function parseSourcesList(sources) {
		if (!sources || !sources.length) return;

		const gameSources = sources && sources.filter(source => source.type === "vlc_source" && source.name.includes("[YT]"));

		// clear out what we currently have
		obsAudioSources.value.splice(0, obsAudioSources.value.length);

		// no game sources so ignore
		if (!gameSources.length) return;

		// put these into the replicant
		obsAudioSources.value.push(...gameSources);
	}

	// when we get a message to unmute a source, make sure its not the only one
	function toggleGameSourceAudio(data) {
		const { runnerIx, muteStatus } = data;

		// if theres only one source then dont bother
		if (obsAudioSources.value.length < 2) return;

		// loop through all the sources and set the correct mute
		obsAudioSources.value.forEach((obsAudioSource, ix) => {
			const runnerMute = ix !== runnerIx ? !muteStatus : muteStatus;
			obs.send("SetMute", { source: obsAudioSource.name, mute: runnerMute }).then(resp => {
				obsAudioSource.muted = runnerMute;
			});
		});
	}
};
