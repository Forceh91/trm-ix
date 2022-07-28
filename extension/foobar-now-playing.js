"use strict";

const io = require("socket.io").listen(20000);

module.exports = function (nodecg) {
  const foobarNowPlaying = nodecg.Replicant("foobarNowPlaying", {
    defaultValue: {
      artist: "",
      track: "",
      album: "",
    },
  });
  let foobarSocketConnection = null;

  nodecg.log.info("[FOOBAR] Foobar2000 NP module loaded, waiting for input...");

  io.on("connection", function (socket) {
    nodecg.log.info("[FOOBAR] Connected to a Foobar2000 instance");
    foobarSocketConnection = socket;

    foobarSocketConnection.on("disconnect", function () {
      nodecg.log.info("[FOOBAR] Disconnected from the Foobar2000 instance");
    });

    foobarSocketConnection.on("foo_artist", function (data) {
      nodecg.log.info("[FOOBAR] New artist received: " + data);
      foobarNowPlaying.value.artist = data;
    });

    foobarSocketConnection.on("foo_title", function (data) {
      nodecg.log.info("[FOOBAR] New title received: " + data);
      foobarNowPlaying.value.track = data;
    });

    foobarSocketConnection.on("foo_album", (data) => {
      nodecg.log.info("[FOOBAR] New album received: ", data);
      foobarNowPlaying.value.album = data;
    });
  });

  nodecg.listenFor("foobar:start_playing", () => {
    if (foobarSocketConnection) foobarSocketConnection.emit("next");
    nodecg.sendMessage("foobar:start_playing_complete");
  });

  nodecg.listenFor("foobar:stop_playing", () => {
    if (foobarSocketConnection) foobarSocketConnection.emit("stop");
    nodecg.sendMessage("foobar:stop_playing_complete");
  });
};
