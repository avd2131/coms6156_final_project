import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactSlider from 'react-slider';

import './popup.css';

const Popup = () => {
	const [scrollFeedback, setScrollFeedback] = useState<boolean>(false);
	const [spatialAudio, setSpatialAudio] = useState<boolean>(false);
	const [spatializeFeedback, setSpatializeFeedback] = useState<boolean>(false);
	const [mute, setMute] = useState<boolean>(false);
	const [elementsOutlined, setElementsOutlined] = useState<boolean>(false);
	const [leftStereoCutoff, setLeftStereoCutoff] = useState<number>(-1);
	const [rightStereoCutoff, setRightStereoCutoff] = useState<number>(1);

	useEffect(() => {
		chrome.storage.sync.get(
			{
				scrollFeedback: scrollFeedback,
				spatialAudio: spatialAudio,
				spatializeFeedback: spatializeFeedback,
				mute: mute,
				leftStereoCutoff: leftStereoCutoff,
				rightStereoCutoff: rightStereoCutoff
			},
			(items) => {
				setScrollFeedback(items.scrollFeedback);
				setSpatialAudio(items.spatialAudio);
				setSpatializeFeedback(items.spatializeFeedback);
				setMute(items.mute);
				setLeftStereoCutoff(items.leftStereoCutoff);
				setRightStereoCutoff(items.rightStereoCutoff);

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
				rightStereoCutoff: rightStereoCutoff
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
				<br></br>
				<button onClick={() => saveOptions()}>Save</button>
				<br></br>
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
				</button>
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
