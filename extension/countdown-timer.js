const { CountdownTimer } = require("./lib/timer");
const TimeUtils = require("./lib/timeutils");
const TIMER_STATES = {
  STATE_STOPPED: 0, // never ran or murdered and set back to 0
  STATE_RUNNING: 1, // timer is running and ticking
  STATE_PAUSED: 2 // timer is paused
};

module.exports = function(nodecg) {
  // load our replicant
  let timer = null;
  const countdownTimer = nodecg.Replicant("countdownTimer", {
    defaultValue: (() => {
      return {
        state: TIMER_STATES.STATE_STOPPED,
        duration: 0,
        lastUpdate: 0,
        formattedTime: "00:00"
      };
    })()
  });

  // auto start when the app does if it was running
  if (countdownTimer.value.state === TIMER_STATES.STATE_RUNNING) {
    nodecg.sendMessage("countdowntimer:start");
  }

  nodecg.listenFor("countdowntimer:start", () => {
    // create a new timer class
    timer = new CountdownTimer({
      endTime: Date.now() + countdownTimer.value.duration
    });

    // each time it ticks, update replicant
    timer.on("tick", timeRemaining => {
      countdownTimer.value.lastUpdate = Date.now();
      countdownTimer.value.formattedTime = TimeUtils.millisecondsToString(
        timeRemaining
      );
    });

    timer.on("done", () => {
      nodecg.sendMessage("countdowntimer:reset");
    });

    // set it to running
    countdownTimer.value.state = TIMER_STATES.STATE_RUNNING;
  });

  nodecg.listenFor("countdowntimer:stop", () => {
    // stop the timer if it exists
    if (timer) timer.stop();

    // set the value to paused
    countdownTimer.value.state = TIMER_STATES.STATE_PAUSED;
  });

  nodecg.listenFor("countdowntimer:reset", () => {
    // stop the timer if it exists
    if (timer) timer.stop();

    // reset everything to 0
    countdownTimer.value.formattedTime = TimeUtils.millisecondsToString(
      countdownTimer.value.duration
    );
    countdownTimer.value.lastUpdate = 0;
    countdownTimer.value.state = TIMER_STATES.STATE_STOPPED;
  });

  nodecg.listenFor("countdowntimer:settime", seconds => {
    countdownTimer.value.duration = seconds;
    countdownTimer.value.formattedTime = TimeUtils.millisecondsToString(
      seconds
    );
  });
};
