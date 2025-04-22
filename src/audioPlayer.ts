import { Keys } from "./types/keys";
import { Settings } from "./types/settings";
import { onEventListenerStatusChange } from "./utils/eventHandling.utils";
import { getArrayBuffer } from "./utils/file.utils";

let audioCtx: AudioContext | undefined;
let panner: PannerNode | undefined;

// MeSpeak
const meSpeak = require("mespeak");
meSpeak.loadConfig(require("../public/mespeak-config.json"));
meSpeak.loadVoice(require("mespeak/voices/en/en-us.json"));

// Scroll Indicator
const beepFileURL = require("../public/beep.mp3");
let beepArrayBuffer: ArrayBuffer;
let beepAudioBuffer: AudioBuffer;

getArrayBuffer(beepFileURL).then((buffer) => {
  beepArrayBuffer = buffer;
});

// Click
const clickFileURL = require("../public/click.mp3");
let clickArrayBuffer: ArrayBuffer;
let clickAudioBuffer: AudioBuffer;

getArrayBuffer(clickFileURL).then((buffer) => {
  clickArrayBuffer = buffer;
});

let pitchConst = 350;

/** Sets the position of the PannerNode. */
export function setPannerPosition(x: number = 0, y: number = 0, z: number = 5): void {
  if (!panner) {
    console.error(
      "Panner has not been initialized; make sure to only call setPannerPosition() once you're the audioContext has been initialized!"
    );
    return;
  }

  panner.positionX.value = Math.min(Math.max(x, leftStereoCutoff), rightStereoCutoff) * 20;
  panner.positionY.value = y;
  panner.positionZ.value = z;
}

let lastSoundSource: { sourceNode: AudioBufferSourceNode; id: number } | undefined;
let soundPromiseRejectMethods: Map<number, Function> = new Map();
let soundsPlayed = 0;
let sources: AudioBufferSourceNode[] = [];

let leftStereoCutoff = -1;
let rightStereoCutoff = 1;

let voiceSpeed = 175;

let spatializeAudio = true;
chrome.storage.sync.get(["spatializeAudio", "leftStereoCutoff", "rightStereoCutoff", "voiceSpeed"], (items) => {
  const loadedSettings = items as Partial<Settings>;

  spatializeAudio = loadedSettings.spatializeAudio ?? true;
  leftStereoCutoff = loadedSettings.leftStereoCutoff ?? -1;
  rightStereoCutoff = loadedSettings.rightStereoCutoff ?? 1;
  voiceSpeed = loadedSettings.voiceSpeed ?? 175;
});

interface PlaySoundProps {
  bias: { x: number; y: number };
  text?: string;
  scrollBeep?: boolean;
  click?: boolean;
}

export async function playSound({ bias, text, scrollBeep = false, click = false }: PlaySoundProps): Promise<void> {
  if (text === "") return;

  return new Promise(async (resolve, reject) => {
    if (!spatializeAudio) bias = { x: 0, y: 0 };

    if (!audioCtx) {
      audioCtx = new AudioContext();
      panner = audioCtx.createPanner();

      beepAudioBuffer = await audioCtx.decodeAudioData(beepArrayBuffer);
      clickAudioBuffer = await audioCtx.decodeAudioData(clickArrayBuffer);
    }

    await audioCtx.resume();

    const id = soundsPlayed++;

    soundPromiseRejectMethods.set(id, reject);

    // Prevent multiple sounds from playing at the same time
    stopAllSounds();

    let source = audioCtx.createBufferSource();
    lastSoundSource = { sourceNode: source, id: id };
    sources.push(source);

    if (scrollBeep) {
      // Royalty free beep: https://samplefocus.com/samples/short-beep
      if (!beepArrayBuffer) {
        console.error("There was an error in loading the beep sound file.");
        reject();
        return;
      }

      source.buffer = beepAudioBuffer;
    } else if (click) {
      // Royalty free click: https://samplefocus.com/samples/click-latin-jazz-drum-kit
      if (!clickArrayBuffer) {
        console.error("There was an error in loading the beep sound file.");
        reject();
        return;
      }

      source.buffer = clickAudioBuffer;
    } else {
      // TTS using MeSpeak
      const audioData = meSpeak.speak(text, { speed: voiceSpeed, rawdata: true });
      source.buffer = await audioCtx.decodeAudioData(audioData);
    }

    source.onended = () => {
      lastSoundSource = undefined;
      resolve();
    };

    // Modifies pitch based on provided y-value
    setPannerPosition(bias.x, bias.y);

    source.detune.value = pitchConst * panner!.positionY.value;

    // Balancing volume levels
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = logarithmicIncrease(Math.abs(bias.x)); // Gain increases as distance from center increases to help balance out volume levels

    console.log(`%cGain amount: ${gainNode.gain.value}; Bias: x: ${bias.x}, y: ${bias.y}`, "color: lightblue");

    source.connect(gainNode).connect(panner!).connect(audioCtx.destination);

    source.start(0);
  });
}

export function stopAllSounds() {
  try {
    if (lastSoundSource !== undefined) {
      lastSoundSource.sourceNode.stop();

      //Reject last sound's promise
      soundPromiseRejectMethods.get(lastSoundSource.id)!(lastSoundSource.id);
      soundPromiseRejectMethods.delete(lastSoundSource.id);

      lastSoundSource = undefined;
    }

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];

      if (source) {
        source.stop();
      }
    }
  } catch {
    // Possible error: InvalidStateNode (DOMException) Thrown if the node has not been started by calling start(). (https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/stop)
    // This error isn't important. A try/catch block is used to help keep the console neater until a better method of solving this issue is found.
  }
}

const cancelSoundsCallback = (e: KeyboardEvent) => {
  if (e.key.toLowerCase() === Keys.Esc) stopAllSounds();
};
const addCancelSoundsHandler = () => document.addEventListener("keydown", cancelSoundsCallback);
const clearCancelSoundsHandler = () => document.removeEventListener("keydown", cancelSoundsCallback);

// Generated by ChatGPT
function logarithmicIncrease(x: number) {
  const maxOutput = 10; // Set the maximum output value
  const minInput = 0.25; // Set the input value where the curve peaks
  const k = Math.log(maxOutput + 1) / Math.log(1 + maxOutput * (1 - minInput)); // Calculate the logarithmic scaling factor
  return (Math.log(1 + maxOutput * x) / Math.log(1 + maxOutput * minInput)) * k + 1; // Apply the logarithmic scaling factor and shift output to start at 1
}

onEventListenerStatusChange({ onEnable: addCancelSoundsHandler, onDisable: clearCancelSoundsHandler });
