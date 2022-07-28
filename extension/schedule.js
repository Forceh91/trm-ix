"use strict";

const request = require("request-promise");

module.exports = function (nodecg) {
  const eventSchedule = nodecg.Replicant("eventSchedule", {
    persistent: false,
    defaultValue: [],
  });
  const scheduleSeek = nodecg.Replicant("scheduleSeek", {
    persistent: false,
    defaultValue: 0,
  });

  const currentGame = nodecg.Replicant("currentGame", {
    defaultValue: {},
    persistent: false,
  });

  if (nodecg.bundleConfig.horaro_event == "") {
    nodecg.log.info("Please set Hoararo Event name in the config");
    return;
  }

  if (nodecg.bundleConfig.horaro_schedule == "") {
    nodecg.log.info("Please set Hoararo Schedule name in the config");
    return;
  }

  getSchedule();

  function getSchedule() {
    nodecg.log.info("[SCHEDULE] Fetching the schedule");

    const schedulePromise = request({
      uri: `http://horaro.org/-/api/v1/events/${nodecg.bundleConfig.horaro_event}/schedules/${nodecg.bundleConfig.horaro_schedule}`,
      json: true,
    })
      .then((response) => {
        parseSchedule(response.data && response.data.items);
      })
      .catch((error) => {
        nodecg.log.info("[SCHEDULE] An error occured: " + error);
      })
      .then((response) => {
        nodecg.sendMessage("scheduleReceived");
      });
  }

  function parseSchedule(games) {
    games.forEach((game, index) => {
      game.order = index;
    });

    // schedule array is already in game order
    eventSchedule.value = games;

    // set the current game
    setCurrentGame();
  }

  // if we tell it to fetch the schedule, do so
  nodecg.listenFor("scheduleFetch", getSchedule);

  // select the next game
  nodecg.listenFor("scheduleSelectNext", (data, callback) => {
    scheduleSeek.value++;

    setCurrentGame();
    if (typeof callback === "function") callback();
  });

  // select the previous game
  nodecg.listenFor("scheduleSelectPrev", function () {
    scheduleSeek.value--;

    setCurrentGame();
  });

  function setCurrentGame() {
    // check the seek is valid
    if (!checkScheduleSeekIsValid()) return;

    // set the current game
    const game = eventSchedule.value[scheduleSeek.value];
    currentGame.value = { ...game.data, length_t: game.length_t };
  }

  function checkScheduleSeekIsValid() {
    if (!eventSchedule || scheduleSeek.value < 0 || scheduleSeek.value > eventSchedule.length - 1) return false;

    return true;
  }
};
