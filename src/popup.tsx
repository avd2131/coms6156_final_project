import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import ReactSlider from "react-slider";
import "./popup.css";
import { DEFAULT_SETTINGS, Settings } from "./types/settings";

const Popup = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const {
    extensionEnabled,
    mute,
    spatializeAudio,
    voiceSpeed,
    scrollFeedback,
    spatializeScrollFeedback,
    leftStereoCutoff,
    rightStereoCutoff,
    detailedLogging,
  } = settings;

  const [uid, setUid] = useState<string | undefined>(undefined);

  const setSetting = (setting: keyof Settings, value: boolean | number) => {
    setSettings((currentSettings) => ({ ...currentSettings, [setting]: value }));
  };

  const [elementsOutlined, setElementsOutlined] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.sync.get(settings, (items) => setSettings(items as Settings));
    chrome.storage.sync.get(["uid"], (items) => setUid(items.uid));
  }, []);

  const saveSettings = async (settingsOverride?: Settings) => {
    await chrome.storage.sync.set(settingsOverride ?? settings);
    console.log("Settings saved");

    self.close();
  };

  const resetSettings = () => setSettings(DEFAULT_SETTINGS);

  const settingDisabled = !extensionEnabled;
  const soundSettingDisabled = mute || settingDisabled;

  return (
    <>
      <h3>Spatial Interactions Extension</h3>
      <p id="username">Username: {uid}</p>
      <div id="settings">
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={extensionEnabled}
            onChange={async (e) => {
              await saveSettings({ ...settings, extensionEnabled: e.target.checked });

              chrome.tabs.reload();
            }}
          />
          <p>Enable screen reader</p>
        </div>
        <h3>Settings</h3>
        <div className="checkbox-wrapper">
          <input type="checkbox" checked={mute} disabled={settingDisabled} onChange={() => setSetting("mute", !mute)} />
          <p>Mute</p>
        </div>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={spatializeAudio}
            disabled={soundSettingDisabled}
            onChange={() => setSetting("spatializeAudio", !spatializeAudio)}
          />
          <p>Spatialize audio</p>
        </div>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={scrollFeedback}
            disabled={soundSettingDisabled}
            onChange={() => setSetting("scrollFeedback", !scrollFeedback)}
          />
          <p>Scroll feedback</p>
        </div>
        <div className="checkbox-wrapper indented">
          <input
            type="checkbox"
            checked={spatializeScrollFeedback}
            disabled={!scrollFeedback || soundSettingDisabled}
            onChange={() => setSetting("spatializeScrollFeedback", !spatializeScrollFeedback)}
          />
          <p>Spatialize</p>
        </div>
        <h4>Stereo panning thresholds</h4>
        <div id="sliderContainer">
          <div className="slideContainer">
            <p>Left</p>
            <ReactSlider
              disabled={soundSettingDisabled || !spatializeAudio}
              className="horizontal-slider"
              thumbClassName="slider-thumb"
              trackClassName="slider-track"
              value={(1 + leftStereoCutoff) * 100}
              ariaLabel={"Thumb"}
              ariaValuetext={(state) => `Thumb value ${(state.valueNow - 100) / 100}`}
              renderThumb={(props, state) => <div {...props}>{(state.valueNow - 100) / 100}</div>}
              onAfterChange={(value) => setSetting("leftStereoCutoff", -(1 - value / 100))}
              step={5}
              pearling
              minDistance={0}
            />
          </div>
          <div className="slideContainer">
            <p>Right</p>
            <ReactSlider
              disabled={soundSettingDisabled || !spatializeAudio}
              className="horizontal-slider"
              thumbClassName="slider-thumb"
              trackClassName="slider-track"
              value={rightStereoCutoff * 100}
              ariaLabel={"Thumb"}
              ariaValuetext={(state) => `Thumb value ${state.valueNow / 100}`}
              renderThumb={(props, state) => <div {...props}>{state.valueNow / 100}</div>}
              onAfterChange={(value) => setSetting("rightStereoCutoff", value / 100)}
              step={5}
              pearling
              minDistance={0}
            />
          </div>
        </div>
        <div className="slideContainer">
          <p>Voice Speed</p>
          <ReactSlider
            disabled={soundSettingDisabled || !spatializeAudio}
            className="horizontal-slider"
            thumbClassName="slider-thumb"
            trackClassName="slider-track"
            value={voiceSpeed}
            min={50}
            max={400}
            ariaLabel={"Thumb"}
            ariaValuetext={(state) => `Thumb value ${state.valueNow}`}
            renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
            onAfterChange={(value) => setSetting("voiceSpeed", value)}
            step={5}
            pearling
            minDistance={0}
          />
        </div>
        <br />
        <h4>Developer</h4>
        <button
          onClick={() => {
            setElementsOutlined(!elementsOutlined);

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
              if (tabs[0].id)
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: "popupEvent",
                  data: elementsOutlined ? "clear-outlines" : "outline-elements",
                });
            });
          }}
        >
          {`${elementsOutlined ? "Disable" : "Enable"} element outlines`}
        </button>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={detailedLogging}
            onChange={() => {
              setSetting("detailedLogging", !detailedLogging);
            }}
          />
          <p>Detailed navigation logging</p>
        </div>
        <div style={{ marginTop: "10px", display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={() => saveSettings()}>Save</button>
          <button onClick={resetSettings}>Reset to Default</button>
        </div>
        <br />
      </div>
    </>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
