import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const Popup = () => {
	const [scrollFeedback, setScrollFeedback] = useState<boolean>(false);
	const [spatialAudio, setSpatialAudio] = useState<boolean>(false);
	const [spatializeFeedback, setSpatializeFeedback] = useState<boolean>(false);
	const [mute, setMute] = useState<boolean>(false);
	const [elementsOutlined, setElementsOutlined] = useState<boolean>(false);

	useEffect(() => {
		chrome.storage.sync.get(
			{
				scrollFeedback: scrollFeedback,
				spatialAudio: spatialAudio,
				spatializeFeedback: spatializeFeedback,
				mute: mute
			},
			(items) => {
				setScrollFeedback(items.scrollFeedback);
				setSpatialAudio(items.spatialAudio);
				setSpatializeFeedback(items.spatializeFeedback);
				setMute(items.mute);
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
				mute: mute
			},
			() => {
				console.log('Options saved.');
			}
		);

		self.close();
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
