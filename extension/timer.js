const { CountupTimer } = require("./lib/timer");
const TimeUtils = require("./lib/timeutils");
const TIMER_STATES = {
  STATE_STOPPED: 0, // never ran or murdered and set back to 0
  STATE_RUNNING: 1, // timer is running and ticking
  STATE_PAUSED: 2 // timer is paused
};

module.exports = function(nodecg) {
  // load our replicant
  let timer = null;
  const eventTimer = nodecg.Replicant("eventTimer", {
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
  if (eventTimer.value.state === TIMER_STATES.STATE_RUNNING) {
    // regain time we lost whilst this was turned off
    const missedTime = Date.now() - eventTimer.value.lastUpdate;
    nodecg.log.info(`:: Event Timer :: Regaining ${missedTime} milliseconds`);

    // calculate how long has passed and it onto the timer's elapsed time
    eventTimer.value.elapsedTime += missedTime;
    eventTimer.value.formattedTime = TimeUtils.millisecondsToString(
      eventTimer.value.elapsedTime
    );

    // start the timer
    nodecg.sendMessage("eventtimer:start");
  }

  // starting the timer
  nodecg.listenFor("eventtimer:start", () => {
    // create a new timer class
    timer = new CountupTimer({ offset: eventTimer.value.elapsedTime });

    // each time it ticks, update the replicant
    timer.on("tick", elapsedTime => {
      eventTimer.value.elapsedTime = elapsedTime;
      eventTimer.value.lastUpdate = Date.now();
      eventTimer.value.formattedTime = TimeUtils.millisecondsToString(
        elapsedTime
      );
    });

    // set it to running
    eventTimer.value.state = TIMER_STATES.STATE_RUNNING;
  });

  nodecg.listenFor("eventtimer:pause", () => {
    // stop the timer if it exists
    if (timer) timer.stop();

    // set the state to paused
    eventTimer.value.state = TIMER_STATES.STATE_PAUSED;
  });

  nodecg.listenFor("eventtimer:reset", () => {
    // stop the timer if it exists
    if (timer) timer.stop();

    // reset everything to 0 with a state of stopped
    eventTimer.value.elapsedTime = 0;
    eventTimer.value.lastUpdate = 0;
    eventTimer.value.formattedTime = "00:00";
    eventTimer.value.state = TIMER_STATES.STATE_STOPPED;
  });
};
