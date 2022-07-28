"use strict";

module.exports = function (nodecg) {
  const TwitchHelixAPI = require("node-twitch").default;
  const Passport = require("passport");
  const TwitchPassport = require("passport-twitch-new").Strategy;

  let broadcasterID = "";
  const twitchTitleReplicant = nodecg.Replicant("twitch_title", {
    defaultValue: "",
    persistent: false,
  });
  const twitchAdvertReplicant = nodecg.Replicant("twitch_ad_status", {
    defaultValue: { length: 0, end_time: 0 },
    persistent: false,
  });

  const twitch = new TwitchHelixAPI({
    client_id: nodecg.bundleConfig.twitch_client_id,
    client_secret: nodecg.bundleConfig.twitch_client_secret,
    scopes: ["channel:edit:commercial", "channel:manage:broadcast", "user:edit:broadcast"],
  });

  nodecg.log.error("[TWITCH]", "Waiting for tech desk to authorize Twitch connection");
  nodecg.log.error("[TWITCH]", "Twitch integration will not work until this is done");
  nodecg.log.info("[TWITCH]", "Please visit http://localhost:9090/trm-viii/authenticatenodecgtwitch");

  const passport = Passport.use(
    new TwitchPassport(
      {
        clientID: nodecg.bundleConfig.twitch_client_id,
        clientSecret: nodecg.bundleConfig.twitch_client_secret,
        callbackURL: "http://localhost:9090/trm-viii/auth/twitch/callback",
        scope: "channel:edit:commercial channel:manage:broadcast user:edit:broadcast",
      },
      function (accessToken, refreshToken, profile, done) {
        if (!profile || !accessToken || !refreshToken) return;

        broadcasterID = profile.id;
        twitch.access_token = accessToken;
        twitch.refresh_token = refreshToken;

        nodecg.log.info("[TWITCH]", "Twitch has authorized the tech desk");
        nodecg.log.info("[TWITCH]", "Automatic transitions are now active");

        completeTwitchSetup();
        done();
      }
    )
  );

  //   window.open("http://localhost:9090/trm-viii/authenticatenodecgtwitch");

  const router = nodecg.Router();
  router.get("/authenticatenodecgtwitch", passport.authenticate("twitch", { forceVerify: true }));
  router.get(
    "/auth/twitch/callback",
    passport.authenticate("twitch", { failureRedirect: "/dashboard" }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect("http://localhost:9090/bundles/trm-viii/graphics/techland.html");
    }
  );

  nodecg.mount("/trm-viii", router);

  function completeTwitchSetup() {
    twitch.getChannelInformation({ broadcaster_id: broadcasterID }).then((resp) => {
      if (!resp.data || !resp.data.length) return;

      const channelInfo = resp.data[0] || {};
      twitchTitleReplicant.value = channelInfo.title;
      nodecg.log.info("[TWITCH]", "Twitch setup, current Twitch title retrieved");
    });
  }

  nodecg.listenFor("twitch:update_title_and_game", ({ title, game }) => {
    nodecg.log.info("[TWITCH]", "Asking Twitch to update title/game");
    twitch
      .modifyChannelInformation({
        broadcaster_id: broadcasterID,
        title: encodeURI(title),
        game_id: game,
      })
      .then((resp) => {
        // const jsonResp = JSON.parse(resp.data);
        // if (!jsonResp || jsonResp.status !== 200) throw "Twitch response was not 200 OK";

        twitchTitleReplicant.value = title;
        nodecg.log.info("[TWITCH]", "Twitch has confirmed title/game update");
      })
      .catch((e) => {
        nodecg.log.error("[TWITCH]", "Unable to update title/game: " + e);
      });
  });

  nodecg.listenFor("twitch:run_adverts", () => {
    nodecg.log.info("[TWITCH]", "Asking Twitch to run adverts");
    const length = 90;
    twitch
      .startCommercial({ broadcaster_id: broadcasterID, length: length })
      .then((resp) => {
        // const jsonResp = JSON.parse(resp.data);
        // if (!jsonResp || jsonResp.status !== 200) throw "Twitch response was not 200 OK";

        twitchAdvertReplicant.value.length = length;
        twitchAdvertReplicant.value.end_time = Date.now() + length * 1000;
        nodecg.log.info("[TWITCH]", "Twitch has confirmed adverts are running");
      })
      .catch((e) => {
        nodecg.log.error("[TWITCH]", "Unable to run adverts: " + e);
      });
  });
};
