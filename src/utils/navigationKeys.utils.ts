import { Keys, NavigationType } from "../types/keys";

export const isKeyInProfile = (key: string, profile: NavigationType) => {
  const lowercaseKey = key.toLowerCase();

  const arrowKeys = [Keys.ArrowUp, Keys.ArrowDown, Keys.ArrowLeft, Keys.ArrowRight];
  if (profile === NavigationType.ArrowKeys) {
    return arrowKeys.includes(lowercaseKey as Keys);
  }

  const wasdKeys = [Keys.W, Keys.A, Keys.S, Keys.D];
  if (profile === NavigationType.WASD) {
    return wasdKeys.includes(lowercaseKey as Keys);
  }

  return false;
};
