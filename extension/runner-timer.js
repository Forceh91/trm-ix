const { CountupTimer } = require("./lib/timer");
const TimeUtils = require("./lib/timeutils");
const TIMER_STATES = {
  STATE_STOPPED: 0, // never ran or murdered and set back to 0
  STATE_RUNNING: 1, // timer is running and ticking
  STATE_PAUSED: 2, // timer is paused
  STATE_FINISHED: 3 //timer is finished
};

module.exports = function(nodecg) {
  let timer = null;

  // the global timer for all runners
  const runnerTimer = nodecg.Replicant("runnerTimer", {
    defaultValue: (() => {
      return {
        state: TIMER_STATES.STATE_STOPPED,
        elapsedTime: 0,
        lastUpdate: 0,
        formattedTime: "00:00"
      };
    })()
  });

  // auto start when the app does if it was running
  if (runnerTimer.value.state === TIMER_STATES.STATE_RUNNING) {
    // regain time we lost whilst this was turned off
    const missedTime = Date.now() - runnerTimer.value.lastUpdate;
    nodecg.log.info(`:: Runner Timer :: Regaining ${missedTime} milliseconds`);

    // calculate how long has passed and it onto the timer's elapsed time
    runnerTimer.value.elapsedTime += missedTime;
    runnerTimer.value.formattedTime = TimeUtils.millisecondsToString(
      runnerTimer.value.elapsedTime
    );

    // start the timer
    nodecg.sendMessage("runnertimer:start");
  }

  // starting the timer
  nodecg.listenFor("runnertimer:start", () => {
    // create a new timer class
    timer = new CountupTimer({ offset: runnerTimer.value.elapsedTime });

    // each time it ticks, update the replicant
    timer.on("tick", elapsedTime => {
      runnerTimer.value.elapsedTime = elapsedTime;
      runnerTimer.value.lastUpdate = Date.now();
      runnerTimer.value.formattedTime = TimeUtils.millisecondsToString(
        elapsedTime,
        true
      );
    });

    // set it to running
    runnerTimer.value.state = TIMER_STATES.STATE_RUNNING;
  });

  nodecg.listenFor("runnertimer:pause", () => {
    // stop the timer if it exists
    if (timer) timer.stop();

    // set the state to paused
    runnerTimer.value.state = TIMER_STATES.STATE_PAUSED;
  });

  nodecg.listenFor("runnertimer:reset", () => {
    // stop the timer if it exists
    if (timer) timer.stop();

    // reset everything to 0 with a state of stopped
    runnerTimer.value.elapsedTime = 0;
    runnerTimer.value.lastUpdate = 0;
    runnerTimer.value.formattedTime = "00:00";
    runnerTimer.value.state = TIMER_STATES.STATE_STOPPED;
  });
};
