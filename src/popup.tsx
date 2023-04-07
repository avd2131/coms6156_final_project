import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactSlider from 'react-slider';

import './popup.css';

const Popup = () => {
	const [scrollFeedback, setScrollFeedback] = useState<boolean>(true);
	const [spatialAudio, setSpatialAudio] = useState<boolean>(true);
	const [spatializeFeedback, setSpatializeFeedback] = useState<boolean>(true);
	const [mute, setMute] = useState<boolean>(false);
	const [elementsOutlined, setElementsOutlined] = useState<boolean>(false);
	const [leftStereoCutoff, setLeftStereoCutoff] = useState<number>(-1);
	const [rightStereoCutoff, setRightStereoCutoff] = useState<number>(1);
	const [voiceSpeed, setVoiceSpeed] = useState<number>(175);

	useEffect(() => {
		chrome.storage.sync.get(
			{
				scrollFeedback: scrollFeedback,
				spatialAudio: spatialAudio,
				spatializeFeedback: spatializeFeedback,
				mute: mute,
				leftStereoCutoff: leftStereoCutoff,
				rightStereoCutoff: rightStereoCutoff,
				voiceSpeed: voiceSpeed
			},
			(items) => {
				setScrollFeedback(items.scrollFeedback);
				setSpatialAudio(items.spatialAudio);
				setSpatializeFeedback(items.spatializeFeedback);
				setMute(items.mute);
				setLeftStereoCutoff(items.leftStereoCutoff);
				setRightStereoCutoff(items.rightStereoCutoff);
				setVoiceSpeed(items.voiceSpeed);

				console.log('loaded options:', items);
			}
		);
	}, []);

	const saveOptions = () => {
		// Saves options to chrome.storage.sync.
		chrome.storage.sync.set(
			{
				scrollFeedback: scrollFeedback,
				spatialAudio: spatialAudio,
				spatializeFeedback: spatializeFeedback,
				mute: mute,
				leftStereoCutoff: leftStereoCutoff,
				rightStereoCutoff: rightStereoCutoff,
				voiceSpeed: voiceSpeed
			},
			() => {
				console.log('Options saved.', leftStereoCutoff, rightStereoCutoff);
			}
		);

		self.close();

		chrome.tabs.reload();
	};

	return (
		<>
			<h3>Spatial Interactions Extension</h3>
			<div id='settings'>
				<div id='muteCheckboxWrapper' className='checkbox-wrapper'>
					<input
						type='checkbox'
						checked={mute}
						onChange={() => {
							setMute(!mute);
						}}
					/>
					<p>Mute</p>
				</div>
				<div id='spatialAudioCheckboxWrapper' className='checkbox-wrapper'>
					<input
						type='checkbox'
						checked={spatialAudio}
						onChange={() => {
							setSpatialAudio(!spatialAudio);
						}}
					/>
					<p>Spatialize Audio</p>
				</div>
				<div id='scrollFeedbackCheckboxWrapper' className='checkbox-wrapper'>
					<input
						type='checkbox'
						checked={scrollFeedback}
						onChange={() => {
							setScrollFeedback(!scrollFeedback);
						}}
					/>
					<p>Scroll feedback</p>
				</div>
				<div id='spatializeFeedbackCheckboxWrapper' className='checkbox-wrapper'>
					<input
						type='checkbox'
						checked={spatializeFeedback}
						onChange={() => {
							setSpatializeFeedback(!spatializeFeedback);
						}}
					/>
					<p>Spatialize</p>
				</div>
				<p>Stereo panning thresholds</p>
				<div id='sliderContainer'>
					<div className='slideContainer'>
						<p>Left</p>
						<ReactSlider
							className='horizontal-slider'
							thumbClassName='slider-thumb'
							trackClassName='slider-track'
							value={(1 + leftStereoCutoff) * 100}
							ariaLabel={'Thumb'}
							ariaValuetext={(state) => `Thumb value ${(state.valueNow - 100) / 100}`}
							renderThumb={(props, state) => <div {...props}>{(state.valueNow - 100) / 100}</div>}
							onAfterChange={(value) => {
								setLeftStereoCutoff(-(1 - value / 100));
							}}
							step={5}
							pearling
							minDistance={0}
						/>
					</div>
					<div className='slideContainer'>
						<p>Right</p>
						<ReactSlider
							className='horizontal-slider'
							thumbClassName='slider-thumb'
							trackClassName='slider-track'
							value={rightStereoCutoff * 100}
							ariaLabel={'Thumb'}
							ariaValuetext={(state) => `Thumb value ${state.valueNow / 100}`}
							renderThumb={(props, state) => <div {...props}>{state.valueNow / 100}</div>}
							onAfterChange={(value) => {
								setRightStereoCutoff(value / 100);
							}}
							step={5}
							pearling
							minDistance={0}
						/>
					</div>
				</div>
				<div className='slideContainer'>
					<p>Voice Speed</p>
					<ReactSlider
						className='horizontal-slider'
						thumbClassName='slider-thumb'
						trackClassName='slider-track'
						value={voiceSpeed}
						min={50}
						max={400}
						ariaLabel={'Thumb'}
						ariaValuetext={(state) => `Thumb value ${state.valueNow}`}
						renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
						onAfterChange={(value) => {
							setVoiceSpeed(value);
						}}
						step={5}
						pearling
						minDistance={0}
					/>
				</div>
				<br></br>
				<div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
					<button onClick={() => saveOptions()}>Save</button>
					<button
						onClick={() => {
							setScrollFeedback(true);
							setSpatialAudio(true);
							setSpatializeFeedback(true);
							setMute(false);
							setElementsOutlined(false);
							setLeftStereoCutoff(-1);
							setRightStereoCutoff(1);
							setVoiceSpeed(175);
						}}
					>
						Reset to Default
					</button>
				</div>
				{/* <br></br>
				<br></br>
				<button
					onClick={() => {
						setElementsOutlined(!elementsOutlined);

						chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
							if (tabs[0].id) chrome.tabs.sendMessage(tabs[0].id, { type: 'popupEvent', data: elementsOutlined ? 'clear-outlines' : 'outline-elements' });
						});
					}}
				>
					Toggle element outlines
				</button> */}
			</div>
		</>
	);
};

ReactDOM.render(
	<React.StrictMode>
		<Popup />
	</React.StrictMode>,
	document.getElementById('root')
);
