"use strict";

module.exports = (nodecg) => {
  const voiceUsers = nodecg.Replicant("discord:voice_users", { defaultValue: [] });

  const apiToken = nodecg.bundleConfig.discord_api_private;
  const permissions = 16778240;

  const COMMS_USER_NAME = nodecg.bundleConfig.discord_comms_bot_user;
  const COMMS_USER_DISCRIMINATOR = nodecg.bundleConfig.discord_comms_bot_discriminator;

  // import the thingy
  const { Client, GatewayIntentBits } = require("discord.js");
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

  client.on("ready", () => {
    console.log(`[DISCORD] Logged in as ${client.user.tag}!`);

    fetchUsersInLiveChannel();
  });

  client.login(apiToken);

  client.on("voiceStateUpdate", (oldState, newState) => {
    // when voice state is updated, fetch the users in the live channel
    fetchUsersInLiveChannel();
  });

  function getTransitionChannel() {
    return client.channels.cache.find((chan) => chan.name === "Transition") || null;
  }

  function getLiveChannel() {
    return client.channels.cache.find((chan) => chan.name.includes("[LIVE]")) || null;
  }

  function getTRMCommsFromChannel(channel) {
    if (!channel) return;

    const { members } = channel;
    if (!members.size) return;

    const commsUser = members.find(
      (member) =>
        member.user &&
        member.user.username === COMMS_USER_NAME &&
        member.user.discriminator === COMMS_USER_DISCRIMINATOR
    );

    return commsUser;
  }

  function moveCommsFromTransitionToLive() {
    const liveChannel = getLiveChannel();
    const comms = getTRMCommsFromChannel(getTransitionChannel());
    if (!comms) return;

    comms.voice.setChannel(liveChannel);
  }

  function moveCommsFromLiveToTransition() {
    const transitionChannel = getTransitionChannel();
    const comms = getTRMCommsFromChannel(getLiveChannel());
    if (!comms) return;

    comms.voice.setChannel(transitionChannel);
  }

  function fetchUsersInLiveChannel() {
    const liveChannel = getLiveChannel();
    if (!liveChannel) return;

    // get members and ignore our bot
    const { members } = liveChannel;
    const filteredMembers = members
      .map((member) => member.user)
      .filter((user) => user && user.username !== COMMS_USER_NAME);

    // store this as the value
    voiceUsers.value = filteredMembers || [];
  }

  nodecg.listenFor("discord:move_voice_from_live_to_transition", () => {
    moveCommsFromLiveToTransition();
  });

  nodecg.listenFor("discord:move_voice_from_transition_to_live", () => {
    moveCommsFromTransitionToLive();
  });
};
