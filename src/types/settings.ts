export interface Settings extends ScrollSettings, AddtlAudioFeedbackSettings, StereoPanningSettings, DeveloperSettings {
  extensionEnabled: boolean;
  mute: boolean;
  spatializeAudio: boolean;
  voiceSpeed: number;
}

export interface ScrollSettings {
  scrollFeedback: boolean;
  spatializeScrollFeedback: boolean;
}

export interface AddtlAudioFeedbackSettings {
  edgeFeedback: boolean;
  blankRegionNavigationFeedback: boolean;
}

export interface StereoPanningSettings {
  leftStereoCutoff: number;
  rightStereoCutoff: number;
}

export interface DeveloperSettings {
  detailedLogging: boolean;
  enableCloudWatch: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  extensionEnabled: true,
  scrollFeedback: true,
  edgeFeedback: false,
  blankRegionNavigationFeedback: false,
  spatializeAudio: true,
  spatializeScrollFeedback: true,
  mute: false,
  leftStereoCutoff: -1,
  rightStereoCutoff: 1,
  voiceSpeed: 175,
  detailedLogging: false,
  enableCloudWatch: true,
};
