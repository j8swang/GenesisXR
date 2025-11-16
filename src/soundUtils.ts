// Sound imports
import earthSound from "./assets/models/Earth_Sound.mp3";
import fireSound from "./assets/models/Fire_Sound.mp3";
import waterSound from "./assets/models/Water_Sound.mp3";
import mudSound from "./assets/models/Mud_Sound.mp3";
import sandSound from "./assets/models/Sand__Sound.mp3";
import glassSound from "./assets/models/glass-shatter-7-95202.mp3";
import woodSound from "./assets/models/Wood_Sound.mp3";
import combineSound from "./assets/models/ACombine_Sound.mp3";
import binauralBeatsSound from "./assets/models/Binaural_Beats_Sound.mp3";

// Element types
export type ElementType =
  | "earth"
  | "fire"
  | "water"
  | "mud"
  | "dirt"
  | "sand"
  | "glass"
  | "wood";

// Map element types to their corresponding sounds
export const getSoundUrl = (element: ElementType): string | null => {
  switch (element) {
    case "fire":
      return fireSound;
    case "earth":
      return earthSound;
    case "water":
      return waterSound;
    case "mud":
      return mudSound;
    case "sand":
      return sandSound;
    case "glass":
      return glassSound;
    case "wood":
      return woodSound;
    case "dirt":
      return null; // No sound file for dirt
    default:
      return null;
  }
};

// Utility function to play a sound effect
export const playSound = (soundUrl: string, volume: number = 1.0) => {
  const audio = new Audio(soundUrl);
  audio.volume = volume;
  audio.play().catch((error) => {
    console.error("Error playing sound:", error);
  });
};

// Export combine sound
export const getCombineSound = () => combineSound;

// Background music manager
class BackgroundMusicManager {
  private audio: HTMLAudioElement | null = null;
  private isInitialized = false;

  constructor() {
    this.audio = new Audio(binauralBeatsSound);
    this.audio.loop = true;
    this.audio.volume = 0.3;
  }

  async start() {
    if (this.isInitialized || !this.audio) return;

    try {
      await this.audio.play();
      this.isInitialized = true;
      console.log("Background music started successfully");
    } catch (error) {
      console.warn("Background music autoplay blocked. Will retry on user interaction:", error);

      // Add event listener to start music on first user interaction
      const startOnInteraction = async () => {
        if (!this.audio || this.isInitialized) return;

        try {
          await this.audio.play();
          this.isInitialized = true;
          console.log("Background music started after user interaction");

          // Remove listeners after successful play
          document.removeEventListener('click', startOnInteraction);
          document.removeEventListener('touchstart', startOnInteraction);
          document.removeEventListener('keydown', startOnInteraction);
        } catch (err) {
          console.error("Failed to start background music:", err);
        }
      };

      document.addEventListener('click', startOnInteraction, { once: true });
      document.addEventListener('touchstart', startOnInteraction, { once: true });
      document.addEventListener('keydown', startOnInteraction, { once: true });
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isInitialized = false;
    }
  }

  cleanup() {
    this.stop();
    this.audio = null;
  }
}

// Export singleton instance
export const backgroundMusic = new BackgroundMusicManager();
