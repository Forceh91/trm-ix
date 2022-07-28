const { CountupTimer } = require("./lib/timer");
const TimeUtils = require("./lib/timeutils");
const TIMER_STATES = {
  STATE_STOPPED: 0, // never ran or murdered and set back to 0
  STATE_RUNNING: 1, // timer is running and ticking
  STATE_PAUSED: 2, // timer is paused
  STATE_FINISHED: 3 //timer is finished
};

function generateRunnerTimers() {
  const timers = [];
  for (let i = 0; i < 4; i++) {
    timers.push(generateRunnerTimer(i));
  }

  return timers;
}

function generateRunnerTimer(id) {
  return {
    state: TIMER_STATES.STATE_STOPPED,
    elapsedTime: 0,
    formattedTime: "00:00",
    id: id,
    position: -1
  };
}

module.exports = nodecg => {
  const runnerTimers = nodecg.Replicant("runnerTimers", {
    defaultValue: (() => [...generateRunnerTimers()])()
  });

  const runnerTimer = nodecg.Replicant("runnerTimer");

  const getRunnerTimerFromID = id =>
    runnerTimers.value.find(timer => timer.id === id);

  nodecg.listenFor("runnertimers:start", id => {
    // get the timer to start
    const timer = getRunnerTimerFromID(id);
    if (!timer) return;

    // mark it as running
    timer.state = TIMER_STATES.STATE_RUNNING;
    timer.position = -1;

    // calculate positions
    calculateFinishPositions();
  });

  nodecg.listenFor("runnertimers:finish", id => {
    // get the timerstate to pause
    const timerState = getRunnerTimerFromID(id);
    if (!timerState) return;

    // mark it as finished
    timerState.state = TIMER_STATES.STATE_FINISHED;
    timerState.elapsedTime = runnerTimer.value.elapsedTime;
    timerState.formattedTime = runnerTimer.value.formattedTime;

    // calculate positions
    calculateFinishPositions();

    // was this the last runner? stop the timer
    shouldStopTimerIfNoRunnersRemaining();
  });

  nodecg.listenFor("runnertimers:reset", id => {
    // get the timerstate to pause
    const timerState = getRunnerTimerFromID(id);
    if (!timerState) return;

    // reset everything to 0 with a state of stopped
    timerState.elapsedTime = 0;
    timerState.formattedTime = "00:00";
    timerState.state = TIMER_STATES.STATE_STOPPED;
    timerState.position = -1;

    // calculate positions
    calculateFinishPositions();

    // was this the last runner? stop the timer
    shouldStopTimerIfNoRunnersRemaining();
  });

  nodecg.listenFor("runnertimers:start:all", () => {
    runnerTimers.value.forEach(runnerTimer =>
      nodecg.sendMessage("runnertimers:start", runnerTimer.id)
    );
  });

  nodecg.listenFor("runnertimers:pause:all", () => {
    runnerTimers.value.forEach(runnerTimer =>
      nodecg.sendMessage("runnertimers:pause", runnerTimer.id)
    );
  });

  nodecg.listenFor("runnertimers:reset:all", () => {
    runnerTimers.value.forEach(runnerTimer =>
      nodecg.sendMessage("runnertimers:reset", runnerTimer.id)
    );
  });

  const calculateFinishPositions = () => {
    const positions = runnerTimers.value
      .map(timerState => ({
        id: timerState.id,
        elapsedTime: timerState.elapsedTime,
        isFinished: timerState.state === TIMER_STATES.STATE_FINISHED
      }))
      .sort((a, b) => {
        if (a.isFinished && !b.isFinished) return -1;
        if (!a.isFinished && b.isFinished) return 1;

        return a.elapsedTime - b.elapsedTime;
      });

    positions.forEach((pos, ix) => {
      const timer = getRunnerTimerFromID(pos.id);
      if (timer) timer.position = ix + 1;
    });
  };

  const shouldStopTimerIfNoRunnersRemaining = () => {
    const remainingRunners = runnerTimers.value.filter(
      timer => timer.state === TIMER_STATES.STATE_RUNNING && timer.runner
    );

    if (!remainingRunners.length) nodecg.sendMessage("runnertimer:pause");
  };
};
