import { getArrayBuffer } from './fileUtils';

let audioCtx: AudioContext | undefined;
let panner: PannerNode | undefined;

// MeSpeak
const meSpeak = require('mespeak');
meSpeak.loadConfig(require('../public/mespeak-config.json'));
meSpeak.loadVoice(require('mespeak/voices/en/en-us.json'));

// Scroll Indicator
const beepFileURL = require('../public/beep.mp3');
let beepArrayBuffer: ArrayBuffer;
let beepAudioBuffer: AudioBuffer;

getArrayBuffer(beepFileURL).then((buffer) => {
	beepArrayBuffer = buffer;
});

let pitchConst = 350;

/** Sets the position of the PannerNode. */
export function setPannerPosition(x: number = 0, y: number = 0, z: number = 5): void {
	if (!panner) {
		console.error("Panner has not been initialized; make sure to only call setPannerPosition() once you're the audioContext has been initialized!");
		return;
	}

	panner.positionX.value = x * 20;
	panner.positionY.value = y;
	panner.positionZ.value = z;

	//console.log('Panner Position', panner.positionX.value, panner.positionY.value, panner.positionZ.value);
	//console.log('Listener Position', audioCtx.listener.positionX.value, audioCtx.listener.positionY.value, audioCtx.listener.positionZ.value);
}

let lastSoundSource: { sourceNode: AudioBufferSourceNode; id: number } | undefined;
let soundPromiseRejectMethods: Map<number, Function> = new Map();
let soundsPlayed = 0;
let sources: AudioBufferSourceNode[] = [];

let spatialAudioEnabled = true;
chrome.storage.sync.get(['spatialAudio'], (items) => {
	spatialAudioEnabled = items.spatialAudio ?? true;
});

export async function playSound(bias: { x: number; y: number }, text: string): Promise<void> {
	// Don't waste any resources with empty strings.
	if (text === '') return;

	if (!spatialAudioEnabled) bias = { x: 0, y: 0 };

	let playBeep = false;
	if (text === '_scroll-indicator_') {
		// Special behavior to play scroll sound
		// Royalty free beep: https://samplefocus.com/samples/short-beep
		playBeep = true;

		console.log('attempting to play beep...');
	}

	if (!audioCtx) {
		audioCtx = new AudioContext();
		panner = audioCtx.createPanner();

		beepAudioBuffer = await audioCtx.decodeAudioData(beepArrayBuffer);
	}

	return new Promise(async (resolve, reject) => {
		await audioCtx!.resume();

		const id = soundsPlayed++;

		soundPromiseRejectMethods.set(id, reject);

		// Prevent multiple sounds from playing at the same time
		await stopAllSounds();

		let source = audioCtx!.createBufferSource();
		lastSoundSource = { sourceNode: source, id: id };
		sources.push(source);

		// Using MeSpeak
		if (!playBeep) {
			const audioData = meSpeak.speak(text, { rawdata: true });
			source.buffer = await audioCtx!.decodeAudioData(audioData);
		} else {
			if (!beepArrayBuffer) console.error('There was an error in loading the beep sound file.');
			else source.buffer = beepAudioBuffer;
		}

		source.onended = () => {
			lastSoundSource = undefined;
			resolve();
		};

		// Modifies pitch based on provided y-value
		setPannerPosition(bias.x, bias.y);

		source.detune.value = pitchConst * panner!.positionY.value;

		// Balancing volume levels
		const gainNode = audioCtx!.createGain();
		gainNode.gain.value = 10 + 2 * Math.abs(bias.x); // Gain increases as distance from center increases to help balance out volume levels

		source.connect(gainNode).connect(panner!).connect(audioCtx!.destination);

		source.start(0);
	});
}

export function stopAllSounds() {
	return new Promise<void>(async (resolve, reject) => {
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

			resolve();
		} catch {
			reject();
			//Possible error: InvalidStateNode (DOMException) Thrown if the node has not been started by calling start(). (https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/stop)
			//This error isn't important. A try/catch block is used to help keep the console neater until a better method of solving this issue is found.
		}
	});
}

document.addEventListener('keydown', (e) => {
	if (e.key.toLowerCase() === 'escape') stopAllSounds();
});
