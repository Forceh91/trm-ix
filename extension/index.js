"use strict";

module.exports = function (nodecg) {
  try {
    require("./timer")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "timer" lib:', e.stack);
    process.exit(1);
  }

  try {
    require("./countdown-timer")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "countdown-timer" lib:', e.stack);
    process.exit(1);
  }

  // event schedule
  try {
    require("./schedule.js")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "schedule" lib:', e.stack);
    process.exit(1);
  }

  // donation goals
  try {
    require("./goals.js")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "goals" lib:', e.stack);
    process.exit(1);
  }

  // foobar now playing
  try {
    require("./foobar-now-playing.js")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "foobar-now-playing" lib:', e.stack);
    process.exit(1);
  }

  // donation sounds
  try {
    require("./donation-sounds.js")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "donation-sounds" lib:', e.stack);
    process.exit(1);
  }

  // tiltify
  try {
    require("./tiltify.js")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "tiltify" lib:', e.stack);
    process.exit(1);
  }

  // runner timer
  try {
    require("./runner-timer.js")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "runner-timer" lib:', e.stack);
    process.exit(1);
  }

  // runner timers
  try {
    require("./runner-timers.js")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "runner-timers" lib:', e.stack);
    process.exit(1);
  }

  // featured runner
  try {
    require("./featuredrunner.js")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "featuredrunner" lib:', e.stack);
    process.exit(1);
  }

  // obs audio control
  // try {
  //   require("./obs-audio-control.js")(nodecg);
  // } catch (e) {
  //   nodecg.log.error('Failed to load "obs-audio-controller" lib:', e.stack);
  //   process.exit(1);
  // }

  // twitch
  try {
    require("./twitch")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "twitch" lib:', e.stack);
    process.exit(1);
  }

  // transition
  try {
    require("./transition")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "transition" lib:', e.stack);
    process.exit(1);
  }

  // obs controller
  try {
    require("./obs-controller")(nodecg);
  } catch (e) {
    nodecg.log.error('Failed to load "obs-controller" lib:', e.stack);
    process.exit(1);
  }
};
