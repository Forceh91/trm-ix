"use strict";

module.exports = function(nodecg) {
  const secretSounds = nodecg.Replicant("secretSounds", {
    defaultValue: []
  });

  const images = nodecg.Replicant("assets:secret_sound_images");
  const sounds = nodecg.Replicant("assets:sounds");

  nodecg.log.info(
    "[SECRET SOUNDS] Loaded",
    secretSounds.value.length,
    "secret sounds"
  );

  nodecg.listenFor("secretSoundCreate", addSound);
  nodecg.listenFor("secretSoundDestroy", removeSound);
  nodecg.listenFor("secretSoundFind", getSoundAndImageForAmount);

  function addSound(data) {
    if (typeof data.amount !== "number" || data.amount < 1) return;

    if (typeof data.imageAssetName !== "string") return;

    if (typeof data.soundAssetName !== "string") return;

    if (secretSounds.value.find(sound => sound.amount == data.amount)) {
      return;
    }

    let sSounds = secretSounds.value.slice(0);
    sSounds.push({
      id: "sound_" + Date.now(),
      amount: data.amount,
      imageName: data.imageAssetName,
      soundName: data.soundAssetName,
      used: 0
    });

    // sort them by which comes first
    let sortedSounds = sSounds.sort(function(a, b) {
      return a.amount > b.amount;
    });

    secretSounds.value = sortedSounds;
  }

  function removeSound(id) {
    let soundToRemove = id;
    if (typeof soundToRemove !== "string") return;

    secretSounds.value.some((secretSound, index) => {
      if (secretSound.id == soundToRemove) {
        secretSounds.value.splice(index, 1);
        return true;
      }
    });
  }

  function getSoundAndImageForAmount(amount, callback) {
    amount = parseFloat(amount);

    let imageFile = undefined;
    let soundFile = undefined;
    let soundType = undefined;
    let defaultSoundName = "donation";
    let defaultImageName = "jade";

    // we do default stuff first, overriding with secret sounds after
    imageFile = images.value.find(image => image.name == defaultImageName);

    // secret sound for this amount?
    let secretSound = null;
    if (
      (secretSound = secretSounds.value.find(
        sound => sound.amount == amount
      )) != null
    ) {
      imageFile = images.value.find(
        image => image.name === secretSound.imageName
      );
      soundFile = sounds.value.find(
        sound => sound.name === secretSound.soundName
      );
      secretSound.used++;
    } else {
      // nope, use default stuff
      if (amount >= 5) {
        soundFile = sounds.value.find(sound => sound.name == defaultSoundName);
      }

      // default images
      let imageName = "";
      if (amount < 15) {
        imageName = "stone";
      } else if (amount < 25) {
        imageName = "jade";
      } else if (amount < 50) {
        imageName = "gold";
      } else {
        imageName = "scion";
      }

      // woo image
      imageFile = images.value.find(image => image.name === imageName);
    }

    // get the url of the image file
    if (typeof imageFile == "object") {
      imageFile = imageFile.url;
    }

    // get the name of the sound file
    if (typeof soundFile == "object") {
      soundType = soundFile.type;
      soundFile = soundFile.url;
    }

    // callback with what we found
    if (typeof callback == "function")
      callback({
        image: imageFile,
        sound: soundFile,
        soundType: soundType
      });
  }
};
