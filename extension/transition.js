"use strict";

const STATE = { PENDING: 0, WORKING: 1, COMPLETE: 2 };
const TRANSITION_STAGES = {
  TRANSITION_TO_SETUP_SCREEN: {
    id: 0,
    title: "Switch OBS to setup screen",
    requiresInput: false,
  },
  MOVE_LIVE_COMMS_TO_TRANSITION_COMMS: {
    id: 1,
    title: "Move comms from live to transition",
    requiresInput: false,
  },
  UPDATE_TO_NEXT_GAME: {
    id: 2,
    title: "Update stream overlay game",
    requiresInput: false,
  },
  UPDATE_TWITCH_TITLE: {
    id: 3,
    title: "Update Twitch title/game",
    requiresInput: false,
  },
  RUN_ADVERTS: {
    id: 4,
    title: "Run Twitch adverts",
    requiresInput: false,
  },
  START_MUSIC: {
    id: 5,
    title: "Start music",
    requiresInput: false,
  },
  CONFIRM_RUNNERS_READY: {
    id: 6,
    title: "Confirm runners ready",
    requiresInput: true,
  },
  BEGIN_TRANSITION_TO_GAME: {
    id: 7,
    title: "Start transition to LIVE",
    requiresInput: true,
  },
  STOP_MUSIC: {
    id: 8,
    title: "Stop music",
    requiresInput: false,
  },
  SHOW_GAME_SCREEN: {
    id: 9,
    title: "Switch OBS to game screen",
    requiresInput: false,
  },
  MOVE_TRANSITION_COMMS_TO_LIVE_COMMS: {
    id: 10,
    title: "Move comms from transition to live",
    requiresInput: false,
  },
  GAME_SCREEN_VISIBLE: {
    id: -1,
    title: "Game screen visible",
    requiresInput: true,
  },
};

module.exports = (nodecg) => {
  const transitionStateReplicant = nodecg.Replicant("transition_current_state", {
    defaultValue: {
      stage: TRANSITION_STAGES.GAME_SCREEN_VISIBLE,
      state: STATE.COMPLETE,
    },
    persistent: false,
  });

  const currentGame = nodecg.Replicant("currentGame");
  currentGame.on("change", (newVal, oldVal) => {
    if (!transitionStateReplicant || !transitionStateReplicant.value) return;
    if (
      transitionStateReplicant.value.stage.id === TRANSITION_STAGES.UPDATE_TO_NEXT_GAME.id &&
      transitionStateReplicant.value.state === STATE.WORKING
    )
      startTwitchTitleUpdate(newVal);
  });

  const twitchTitle = nodecg.Replicant("twitch_title");
  twitchTitle.on("change", () => {
    if (!transitionStateReplicant || !transitionStateReplicant.value) return;

    const currentTransitionState = transitionStateReplicant.value;
    if (
      currentTransitionState.stage.id === TRANSITION_STAGES.UPDATE_TWITCH_TITLE.id &&
      currentTransitionState.state === STATE.WORKING
    )
      startTwitchAdvertRun();
  });

  const twitchAdStatus = nodecg.Replicant("twitch_ad_status");
  twitchAdStatus.on("change", () => {
    if (!transitionStateReplicant || !transitionStateReplicant.value) return;

    const currentTransitionState = transitionStateReplicant.value;
    if (
      currentTransitionState.stage.id === TRANSITION_STAGES.RUN_ADVERTS.id &&
      currentTransitionState.state === STATE.WORKING
    )
      startFoobarMusicPlay();
  });

  nodecg.listenFor("foobar:start_playing_complete", () => {
    if (!transitionStateReplicant || !transitionStateReplicant.value) return;

    const currentTransitionState = transitionStateReplicant.value;
    if (
      currentTransitionState.stage.id === TRANSITION_STAGES.START_MUSIC.id &&
      currentTransitionState.state === STATE.WORKING
    )
      nodecg.log.info("[TRANSITION]", "Foobar confirmed music is playing");
    moveToConfirmRunnersReady();
  });

  nodecg.listenFor("foobar:stop_playing_complete", () => {
    if (!transitionStateReplicant || !transitionStateReplicant.value) return;

    const currentTransitionState = transitionStateReplicant.value;
    if (
      currentTransitionState.stage.id === TRANSITION_STAGES.STOP_MUSIC.id &&
      currentTransitionState.state === STATE.WORKING
    )
      setTimeout(() => {
        // we wait 5s here because we fade out music when stopping it
        nodecg.log.info("[TRANSITION]", "Foobar confirmed music is stopped");
        moveToGameScreen();
      }, 5 * 1000);
  });

  nodecg.listenFor("transition:get_transition_list", (data, callback) => {
    if (typeof callback === "function")
      callback([
        TRANSITION_STAGES.GAME_SCREEN_VISIBLE,
        TRANSITION_STAGES.TRANSITION_TO_SETUP_SCREEN,
        TRANSITION_STAGES.MOVE_LIVE_COMMS_TO_TRANSITION_COMMS,
        TRANSITION_STAGES.UPDATE_TO_NEXT_GAME,
        TRANSITION_STAGES.UPDATE_TWITCH_TITLE,
        TRANSITION_STAGES.RUN_ADVERTS,
        TRANSITION_STAGES.START_MUSIC,
        TRANSITION_STAGES.CONFIRM_RUNNERS_READY,
        TRANSITION_STAGES.BEGIN_TRANSITION_TO_GAME,
        TRANSITION_STAGES.STOP_MUSIC,
        TRANSITION_STAGES.SHOW_GAME_SCREEN,
        TRANSITION_STAGES.MOVE_TRANSITION_COMMS_TO_LIVE_COMMS,
      ]);
  });

  nodecg.listenFor("transition:start_transmission", (data) => {
    if (transitionStateReplicant.value.stage.id !== TRANSITION_STAGES.GAME_SCREEN_VISIBLE.id) return;

    const firstStage = TRANSITION_STAGES.TRANSITION_TO_SETUP_SCREEN;
    transitionStateReplicant.value = {
      stage: firstStage,
      state: firstStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    startOBSTransitionToGameChange();
  });

  nodecg.listenFor("transition:user_confirmed_runners_ready", () => {
    nodecg.log.info("[TRANSITION]", "Tech Desk has confirmed runners are ready");
    const nextStage = TRANSITION_STAGES.BEGIN_TRANSITION_TO_GAME;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };
  });

  nodecg.listenFor("transition:user_wants_game_screen", () => {
    startFoobarMusicStop();
  });

  nodecg.listenFor("obs:new_scene_activated", (sceneName) => {
    if (
      sceneName === "countdown_screen" ||
      (sceneName === "game_change" &&
        transitionStateReplicant.value.stage.id === TRANSITION_STAGES.GAME_SCREEN_VISIBLE.id)
    ) {
      const nextStage = TRANSITION_STAGES.CONFIRM_RUNNERS_READY;
      transitionStateReplicant.value = {
        stage: nextStage,
        state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
      };
    } else {
      const transitionState = transitionStateReplicant.value;
      switch (transitionState.stage.id) {
        case TRANSITION_STAGES.TRANSITION_TO_SETUP_SCREEN.id:
          if (transitionState.state === STATE.WORKING) moveLiveCommsToTransition();
          break;

        case TRANSITION_STAGES.SHOW_GAME_SCREEN.id:
          if (transitionState.state === STATE.WORKING) moveTransitionCommsToLive();
          break;
      }
    }
  });

  function startOBSTransitionToGameChange() {
    nodecg.log.info("[TRANSITION]", "Switching to game change screen");
    nodecg.sendMessage("obs:show_game_change_screen");
  }

  function moveLiveCommsToTransition() {
    nodecg.log.info("[TRANSITION]", "Moving comms from LIVE to TRANSITION");
    const nextStage = TRANSITION_STAGES.MOVE_LIVE_COMMS_TO_TRANSITION_COMMS;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    nodecg.sendMessage("discord:move_voice_from_live_to_transition");
    startStreamOverlayRunUpdate();
  }

  function startStreamOverlayRunUpdate() {
    const nextStage = TRANSITION_STAGES.UPDATE_TO_NEXT_GAME;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    nodecg.log.info("[TRANSITION]", "Updating schedule to next game");
    nodecg.sendMessage("scheduleSelectNext");
  }

  function startTwitchTitleUpdate(game) {
    if (!game) return;
    nodecg.log.info("[TRANSITION]", "Generating Twitch title/game");

    const nextStage = TRANSITION_STAGES.UPDATE_TWITCH_TITLE;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    // we may have a list of runners (ie a race)
    const runnersList = game[1].split(",");
    const runners = [];

    // go through each runner
    const regex = /(\w+)/;
    runnersList.forEach((runner) => {
      // and parse out the markdown to something readable
      let demarkdownRunner = runner.match(regex);
      if (demarkdownRunner && demarkdownRunner[0]) runners.push(demarkdownRunner[0].trim());
    });

    nodecg.log.info("[TRANSITION]", "Updating Twitch/Title game");
    nodecg.sendMessage("twitch:update_title_and_game", {
      title: `${nodecg.bundleConfig.marathon_name} for ${nodecg.bundleConfig.charity_name}: ${game[0]} [${
        game[3]
      }] by ${runners.join(", ")}`, // title
      game: game[6] || 33214, // game
    });
  }

  function startTwitchAdvertRun() {
    const nextStage = TRANSITION_STAGES.RUN_ADVERTS;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    nodecg.log.info("[TRANSITION]", "Running adverts");
    nodecg.sendMessage("twitch:run_adverts");
  }

  function startFoobarMusicPlay() {
    const nextStage = TRANSITION_STAGES.START_MUSIC;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    // confirm that foobar has done this
    nodecg.log.info("[TRANSITION]", "Asking Foobar to play");
    nodecg.sendMessage("foobar:start_playing");
  }

  function moveToConfirmRunnersReady() {
    const nextStage = TRANSITION_STAGES.CONFIRM_RUNNERS_READY;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };
    nodecg.log.info("[TRANSITION]", "Transition ready to confirm runners ready");
  }

  function startFoobarMusicStop() {
    const nextStage = TRANSITION_STAGES.STOP_MUSIC;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    nodecg.log.info("[TRANSITION]", "Asking Foobar to stop playing");
    nodecg.sendMessage("foobar:stop_playing");
  }

  function moveToGameScreen() {
    const nextStage = TRANSITION_STAGES.SHOW_GAME_SCREEN;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    nodecg.log.info("[TRANSITION]", "Moving to game screen");
    nodecg.sendMessage("obs:show_live_game_screen");
  }

  function moveTransitionCommsToLive() {
    nodecg.log.info("[TRANSITION]", "Moving comms from TRANSITION to LIVE");
    const nextStage = TRANSITION_STAGES.MOVE_TRANSITION_COMMS_TO_LIVE_COMMS;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    nodecg.sendMessage("discord:move_voice_from_transition_to_live");
    completeTransitionToGameScreen();
  }

  function completeTransitionToGameScreen() {
    nodecg.log.info("[TRANSITION]", "Game screen now visible, transition complete");
    transitionStateReplicant.value.state = STATE.COMPLETE;

    // 30s later reset all the transition stuff
    setTimeout(() => {
      nodecg.log.info("[TRANSITION]", "Unlocking tech desk");
      const nextStage = TRANSITION_STAGES.GAME_SCREEN_VISIBLE;
      transitionStateReplicant.value = {
        stage: nextStage,
        state: STATE.COMPLETE,
      };
    }, 10 * 1000);
  }
};
