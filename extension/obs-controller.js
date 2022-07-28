"use strict";
const OBS_WEBSOCKET_LATEST_VERSION = "4.8.0"; // https://api.github.com/repos/Palakis/obs-websocket/releases/latest

module.exports = (nodecg) => {
  const compareVersions = require("compare-versions");

  // Import OBS-websocket
  const OBSWebSocket = require("obs-websocket-js");
  const obs = new OBSWebSocket();

  nodecg.log.info("[OBS]", "OBS extension loaded, connecting to OBS in 5 seconds...");
  setTimeout(() => {
    nodecg.log.info("[OBS]", "Connecting to OBS");
    connect();
  }, 5 * 1000);

  // State
  let connected,
    heartbeat,
    currentScene,
    currentPreviewScene,
    isFullScreen,
    isStudioMode,
    isSceneOnTop,
    wakeLock = false;
  let scenes = [];
  let host,
    password = nodecg.bundleConfig.obs_websocket_password,
    errorMessage = "",
    sceneChunks = Array(Math.ceil(scenes.length / 4))
      .fill()
      .map((_, index) => index * 4)
      .map((begin) => scenes.slice(begin, begin + 4));

  const obsScreenshots = nodecg.Replicant("obs_screenshots", {
    defaultValue: { live: "", preview: "" },
    persistent: false,
  });
  const scheduleSeek = nodecg.Replicant("scheduleSeek");

  async function toggleStudioMode() {
    await sendCommand("ToggleStudioMode");
  }
  async function switchSceneView() {
    isSceneOnTop = !isSceneOnTop;
  }
  // OBS functions
  async function sendCommand(command, params) {
    try {
      return await obs.send(command, params || {});
    } catch (e) {
      console.log("Error sending command", command, " - error is:", e);
      return {};
    }
  }
  async function setScene(sceneName) {
    await sendCommand("SetCurrentScene", { "scene-name": sceneName });
  }
  async function transitionScene(e) {
    await sendCommand("TransitionToProgram");
  }
  async function setPreview(sceneName) {
    await sendCommand("SetPreviewScene", { "scene-name": sceneName });
  }
  async function startStream() {
    await sendCommand("StartStreaming");
  }
  async function stopStream() {
    await sendCommand("StopStreaming");
  }
  async function startRecording() {
    await sendCommand("StartRecording");
  }
  async function stopRecording() {
    await sendCommand("StopRecording");
  }
  async function pauseRecording() {
    await sendCommand("PauseRecording");
  }
  async function resumeRecording() {
    await sendCommand("ResumeRecording");
  }
  async function updateScenes() {
    let data = await sendCommand("GetSceneList");
    currentScene = data.currentScene;
    scenes = data.scenes.filter((i) => {
      return i.name.indexOf("(hidden)") === -1;
    }); // Skip hidden scenes
    if (isStudioMode) {
      obs
        .send("GetPreviewScene")
        .then((data) => (currentPreviewScene = data.name))
        .catch((_) => {
          // Switching off studio mode calls SwitchScenes, which will trigger this
          // before the socket has recieved confirmation of disabled studio mode.
        });
    }
    nodecg.log.info("[OBS]", "Scenes updated");
  }

  async function getStudioMode() {
    let data = await sendCommand("GetStudioModeStatus");
    isStudioMode = (data && data.studioMode) || false;
  }

  async function getScreenshot() {
    if (connected) {
      let data = await sendCommand("TakeSourceScreenshot", {
        sourceName: currentScene,
        embedPictureFormat: "png",
        width: 960,
        height: 540,
      });
      if (data && data.img) {
        obsScreenshots.value.live = data.img;
      }
      if (isStudioMode) {
        let data = await sendCommand("TakeSourceScreenshot", {
          sourceName: currentPreviewScene,
          embedPictureFormat: "png",
          width: 960,
          height: 540,
        });
        if (data && data.img) {
          obsScreenshots.value.preview = data.img;
        }
      }
    }
    setTimeout(getScreenshot, 1000);
  }

  async function connect() {
    host = host || "localhost:4444";
    nodecg.log.info("[OBS]", "Connecting to:", host, "- using password:", password);
    await disconnect();
    connected = false;
    try {
      await obs.connect({ address: host, password, secure: false });
    } catch (e) {
      nodecg.log.error("[OBS]", e);
      errorMessage = e.description;
    }
  }
  async function disconnect() {
    await obs.disconnect();
    connected = false;
    errorMessage = "Disconnected";
  }
  async function hostkey(event) {
    if (event.key !== "Enter") return;
    await connect();
    event.preventDefault();
  }
  // OBS events
  obs.on("ConnectionClosed", () => {
    connected = false;
    nodecg.log.info("[OBS]", "Connection closed");
  });
  obs.on("AuthenticationSuccess", async () => {
    nodecg.log.info("[OBS]", "Connected");
    connected = true;
    const version = (await sendCommand("GetVersion")).obsWebsocketVersion || "";
    nodecg.log.info("[OBS]", "OBS-websocket version:", version);
    if (compareVersions(version, OBS_WEBSOCKET_LATEST_VERSION) < 0) {
      alert(
        "You are running an outdated OBS-websocket (version " +
          version +
          "), please upgrade to the latest version for full compatibility."
      );
    }
    await sendCommand("SetHeartbeat", { enable: true });
    await getStudioMode();
    await updateScenes();
    await getScreenshot();
    nodecg.sendMessage("obs:new_scene_activated", currentScene);
  });

  obs.on("AuthenticationFailure", async () => {
    password = prompt("Please enter your password:", password);
    if (password === null) {
      connected = false;
      password = "";
    } else {
      await connect();
    }
  });
  // Heartbeat
  obs.on("Heartbeat", (data) => {
    heartbeat = data;
  });
  // Scenes
  obs.on("SwitchScenes", async (data) => {
    nodecg.log.info("[OBS]", `New Active Scene: ${data.sceneName}`);
    nodecg.sendMessage("obs:new_scene_activated", data.sceneName);
    await updateScenes();
  });
  obs.on("error", (err) => {
    nodecg.log.error("[OBS]", "Socket error:", err);
  });
  obs.on("StudioModeSwitched", async (data) => {
    nodecg.log.info("[OBS]", `Studio Mode: ${data.newState}`);
    isStudioMode = data.newState;
    if (!isStudioMode) {
      currentPreviewScene = false;
    } else {
      await updateScenes();
    }
  });
  obs.on("PreviewSceneChanged", async (data) => {
    nodecg.log.info("[OBS]", `New Preview Scene: ${data.sceneName}`);
    await updateScenes();
  });

  nodecg.listenFor("obs:show_game_change_screen", () => {
    setPreview(`game_change`);
    transitionScene();
    // wait 3s then set the preview to the next upcoming game
    setTimeout(() => {
      setPreview(`game_${scheduleSeek.value}`);
    }, 3 * 1000);
  });

  nodecg.listenFor("obs:show_live_game_screen", () => {
    setPreview(`game_${scheduleSeek.value}`);
    transitionScene();
    setTimeout(() => {
      setPreview(`game_change`);
    }, 4 * 1000);
  });
};
