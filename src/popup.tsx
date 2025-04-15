import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import ReactSlider from "react-slider";
import "./popup.css";
import { EventListenersEventType, EventType, PopupEventType } from "./types/events";
import { DEFAULT_SETTINGS, Settings } from "./types/settings";
import { areSettingsEqual } from "./utils/settings.utils";

const Popup = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [lastSavedSettings, setLastSavedSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const {
    extensionEnabled,
    mute,
    spatializeAudio,
    voiceSpeed,
    scrollFeedback,
    spatializeScrollFeedback,
    edgeFeedback,
    blankRegionNavigationFeedback,
    leftStereoCutoff,
    rightStereoCutoff,
    detailedLogging,
    enableCloudWatch,
  } = settings;

  const [uid, setUid] = useState<string | undefined>(undefined);

  const setSetting = (setting: keyof Settings, value: boolean | number) => {
    setSettings((currentSettings) => ({ ...currentSettings, [setting]: value }));
  };

  const [elementsOutlined, setElementsOutlined] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.sync.get(settings, (items) => {
      setSettings(items as Settings);
      setLastSavedSettings(items as Settings);
    });
    chrome.storage.sync.get(["uid"], (items) => setUid(items.uid));
  }, []);

  const saveSettings = async (settingsOverride?: Settings) => {
    const settingsToSave = settingsOverride ?? settings;

    await chrome.storage.sync.set(settingsToSave);
    setSettings(settingsToSave);
    setLastSavedSettings(settingsToSave);

    console.log("Settings saved");
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
              // Requires page reload, since content script only checks this setting on initial load
              await saveSettings({ ...settings, extensionEnabled: e.target.checked });

              chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs[0].id)
                  chrome.tabs.sendMessage(tabs[0].id, {
                    type: EventType.EventListeners,
                    data: e.target.checked
                      ? EventListenersEventType.EnableListeners
                      : EventListenersEventType.DisableListeners,
                  });
              });
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
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={edgeFeedback}
            disabled={soundSettingDisabled}
            onChange={() => setSetting("edgeFeedback", !edgeFeedback)}
          />
          <p>Edge feedback</p>
        </div>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={blankRegionNavigationFeedback}
            disabled={soundSettingDisabled}
            onChange={() => setSetting("blankRegionNavigationFeedback", !blankRegionNavigationFeedback)}
          />
          <p>Blank region navigation feedback</p>
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
                  type: EventType.Popup,
                  data: elementsOutlined ? PopupEventType.ClearOutlines : PopupEventType.OutlineElements,
                });
            });
          }}
        >
          {`${elementsOutlined ? "Disable" : "Enable"} element outlines`}
        </button>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            disabled={settingDisabled}
            checked={detailedLogging}
            onChange={() => {
              setSetting("detailedLogging", !detailedLogging);
            }}
          />
          <p>Detailed navigation logging</p>
        </div>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            disabled={settingDisabled}
            checked={enableCloudWatch}
            onChange={async (e) => {
              // Requires page reload, since content script only checks this setting on initial load
              await saveSettings({ ...settings, enableCloudWatch: e.target.checked });

              chrome.tabs.reload();
            }}
          />
          <p>Log activity on AWS CloudWatch</p>
        </div>
        <div style={{ marginTop: "10px", display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={() => saveSettings()} disabled={areSettingsEqual(settings, lastSavedSettings)}>
            Save
          </button>
          <button onClick={resetSettings}>Reset to Default</button>
        </div>
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
