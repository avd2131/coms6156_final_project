import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const Popup = () => {
	const [scrollFeedback, setScrollFeedback] = useState<boolean>(false);
	const [spatializeFeedback, setSpatializeFeedback] = useState<boolean>(false);

	useEffect(() => {
		chrome.storage.sync.get(
			{
				scrollFeedback: scrollFeedback,
				spatializeFeedback: spatializeFeedback
			},
			(items) => {
				setScrollFeedback(items.scrollFeedback);
				setSpatializeFeedback(items.spatializeFeedback);
			}
		);
	}, []);

	const saveOptions = () => {
		// Saves options to chrome.storage.sync.
		chrome.storage.sync.set(
			{
				scrollFeedback: scrollFeedback,
				spatializeFeedback: spatializeFeedback
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
