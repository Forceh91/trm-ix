"use strict";

const EventEmitter = require("events");

class CountupTimer extends EventEmitter {
  constructor({ tickRate = 100, offset = 0 } = {}) {
    super();

    const startTime = Date.now() - offset;
    this.interval = setInterval(() => {
      const currentTime = Date.now();
      const timeElapsed = currentTime - startTime;
      this.emit("tick", timeElapsed);
    }, tickRate);
  }

  stop() {
    clearInterval(this.interval);
  }
}

class CountdownTimer extends EventEmitter {
  constructor({ tickRate = 100, endTime = 0 } = {}) {
    super();

    this.interval = setInterval(() => {
      const currentTime = Date.now();
      const timeRemaining = Math.max(endTime - currentTime, 0);
      this.emit("tick", timeRemaining);
      if (timeRemaining <= 0) {
        this.emit("done");
      }
    }, tickRate);
  }

  stop() {
    clearInterval(this.interval);
  }
}

module.exports = { CountupTimer, CountdownTimer };
