export interface Settings extends ScrollSettings, StereoPanningSettings, DeveloperSettings {
  extensionEnabled: boolean;
  mute: boolean;
  spatializeAudio: boolean;
  voiceSpeed: number;
}

export interface ScrollSettings {
  scrollFeedback: boolean;
  spatializeScrollFeedback: boolean;
}

export interface StereoPanningSettings {
  leftStereoCutoff: number;
  rightStereoCutoff: number;
}

export interface DeveloperSettings {
  detailedLogging: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  extensionEnabled: true,
  scrollFeedback: true,
  spatializeAudio: true,
  spatializeScrollFeedback: true,
  mute: false,
  leftStereoCutoff: -1,
  rightStereoCutoff: 1,
  voiceSpeed: 175,
  detailedLogging: false,
};
