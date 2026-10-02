import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2 } from "lucide-react";

/**
 * AccessibilityToolbar (Audio Menu Reader, High/Normal Contrast, Saturation)
 * 
 * Disabled-friendly accessibility controls for the website header:
 * 1. [ A ] (Black square, white 'A'): High Contrast Theme
 * 2. [ A ] (White square, dark 'A'): Normal Contrast / Reset
 * 3. [ Saturation ]: Cycles between Normal, Desaturated (Grayscale), and High Saturation
 * 4. [ 🔊 ]: Audio Menu Reader (Icon-only, no text label) - speaks menus on hover & Tab focus
 */
const AccessibilityAudioReader = () => {
  const [isSupported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );
  const [isAudioEnabled, setIsAudioEnabled] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem("college_audio_reader_enabled") === "true";
      }
    } catch {
      // Ignore storage errors
    }
    return false;
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [contrastMode, setContrastMode] = useState("normal"); // "normal" | "high"
  const [saturationMode, setSaturationMode] = useState("normal"); // "normal" | "desaturate" | "high-saturate"

  const lastSpokenRef = useRef("");
  const hoverTimeoutRef = useRef(null);
  const selectedVoiceRef = useRef(null);

  // Initialize Web Speech API & load voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const preferredVoice =
            voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("David"))) ||
            voices.find((v) => v.lang.startsWith("en")) ||
            voices[0];
          selectedVoiceRef.current = preferredVoice || null;
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  // Safe speech synthesis function
  const speak = useCallback((text, onEnd) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text.trim());
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  // Synchronize state across multiple mounted instances (desktop header and mobile navbar)
  useEffect(() => {
    const handleSync = () => {
      if (typeof document !== "undefined") {
        setContrastMode(
          document.documentElement.classList.contains("high-contrast-mode") ? "high" : "normal"
        );
        if (document.documentElement.classList.contains("desaturate-mode")) {
          setSaturationMode("desaturate");
        } else if (document.documentElement.classList.contains("high-saturate-mode")) {
          setSaturationMode("high-saturate");
        } else {
          setSaturationMode("normal");
        }
      }
      try {
        setIsAudioEnabled(localStorage.getItem("college_audio_reader_enabled") === "true");
      } catch {
        // Ignore storage error
      }
    };

    window.addEventListener("accessibilityChange", handleSync);
    return () => window.removeEventListener("accessibilityChange", handleSync);
  }, []);

  // Stop speech
  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Toggle Audio Reader
  const toggleAudio = useCallback(() => {
    setIsAudioEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("college_audio_reader_enabled", String(next));
      } catch {
        // Ignore
      }

      if (next) {
        speak("Audio guide enabled. Hover over or tab through menus to listen.");
      } else {
        stopSpeech();
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("accessibilityChange"));
      }, 0);

      return next;
    });
  }, [speak, stopSpeech]);

  // Keyboard shortcut: Alt + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        toggleAudio();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleAudio]);

  // Interactive Hover and Tab focus listener for navigation
  useEffect(() => {
    if (!isAudioEnabled) return;

    const handleInteraction = (e) => {
      const target = e.target;
      if (!target) return;

      // Ignore interactions inside the accessibility toolbar itself
      if (target.closest("[data-accessibility-toolbar]")) return;

      const navItem = target.closest("nav a, nav button, nav li, header a, header button");
      if (!navItem) return;

      let speechText = "";

      if (navItem.matches("nav li") && !target.closest("a")) {
        const titleSpan = navItem.querySelector("span, a");
        if (titleSpan) {
          const title = titleSpan.textContent?.trim();
          const hasChildren = navItem.querySelector("ul, a, .dropdown-card");
          speechText = hasChildren ? `Menu: ${title}, dropdown` : `Menu: ${title}`;
        }
      } else {
        const title = navItem.getAttribute("aria-label") || navItem.textContent?.trim();
        if (title) {
          const isDropdownLink = navItem.closest(".dropdown-card, ul ul");
          if (isDropdownLink) {
            speechText = `Option: ${title}`;
          } else if (navItem.tagName.toLowerCase() === "a") {
            speechText = `Link: ${title}`;
          } else if (navItem.tagName.toLowerCase() === "button") {
            speechText = `Button: ${title}`;
          } else {
            speechText = title;
          }
        }
      }

      if (speechText && speechText !== lastSpokenRef.current) {
        lastSpokenRef.current = speechText;
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
          speak(speechText);
        }, 100);
      }
    };

    document.addEventListener("mouseover", handleInteraction);
    document.addEventListener("focusin", handleInteraction);

    return () => {
      document.removeEventListener("mouseover", handleInteraction);
      document.removeEventListener("focusin", handleInteraction);
      clearTimeout(hoverTimeoutRef.current);
    };
  }, [isAudioEnabled, speak]);

  // Apply High Contrast Mode
  const applyHighContrast = () => {
    setContrastMode("high");
    document.documentElement.classList.add("high-contrast-mode");
    if (isAudioEnabled) speak("High contrast mode enabled");
    window.dispatchEvent(new Event("accessibilityChange"));
  };

  // Apply Normal Contrast Mode
  const applyNormalContrast = () => {
    setContrastMode("normal");
    document.documentElement.classList.remove("high-contrast-mode");
    if (isAudioEnabled) speak("Normal contrast restored");
    window.dispatchEvent(new Event("accessibilityChange"));
  };

  // Cycle Saturation: Normal -> Desaturated (Grayscale) -> High Saturation -> Normal
  const cycleSaturation = () => {
    const html = document.documentElement;
    html.classList.remove("desaturate-mode", "high-saturate-mode");

    if (saturationMode === "normal") {
      setSaturationMode("desaturate");
      html.classList.add("desaturate-mode");
      if (isAudioEnabled) speak("Low saturation grayscale enabled");
    } else if (saturationMode === "desaturate") {
      setSaturationMode("high-saturate");
      html.classList.add("high-saturate-mode");
      if (isAudioEnabled) speak("High saturation enabled");
    } else {
      setSaturationMode("normal");
      if (isAudioEnabled) speak("Normal saturation restored");
    }
    window.dispatchEvent(new Event("accessibilityChange"));
  };

  return (
    <div
      data-accessibility-toolbar
      className="inline-flex items-center gap-1.5 select-none"
      role="region"
      aria-label="Accessibility controls"
    >
      {/* 1. Black Box [ A ]: High Contrast */}
      <button
        type="button"
        onClick={applyHighContrast}
        className={`
          w-[24px] h-[24px] flex items-center justify-center rounded-[3px]
          bg-black text-white font-bold text-[13px] leading-none
          border transition-all duration-150 shadow-xs
          ${contrastMode === "high" ? "border-amber-400 ring-1 ring-amber-400" : "border-black hover:opacity-90"}
        `}
        title="High Contrast (Dark Theme)"
        aria-label="High Contrast"
        aria-pressed={contrastMode === "high"}
      >
        A
      </button>

      {/* 2. White Box [ A ]: Normal Contrast */}
      <button
        type="button"
        onClick={applyNormalContrast}
        className={`
          w-[24px] h-[24px] flex items-center justify-center rounded-[3px]
          bg-white text-[#222222] font-bold text-[13px] leading-none
          border transition-all duration-150 shadow-xs
          ${contrastMode === "normal" ? "border-[#999999]" : "border-[#D1D5DB] hover:border-[#888888]"}
        `}
        title="Normal Contrast (Default Theme)"
        aria-label="Normal Contrast"
        aria-pressed={contrastMode === "normal"}
      >
        A
      </button>

      {/* 3. [ Saturation ] Button */}
      <button
        type="button"
        onClick={cycleSaturation}
        className={`
          h-[24px] px-2 flex items-center justify-center rounded-[3px]
          bg-white text-[#1E73BE] hover:text-[#155A96] font-normal text-[12px] leading-none
          border border-[#D1D5DB] hover:border-[#1E73BE] transition-all duration-150 shadow-xs
          ${saturationMode !== "normal" ? "ring-1 ring-[#1E73BE] font-semibold text-[#155A96]" : ""}
        `}
        title={`Adjust Saturation (Current: ${saturationMode})`}
        aria-label="Adjust Saturation"
      >
        Saturation
      </button>

      {/* 4. Audio Reader Toggle: Logo Only, No Name */}
      {isSupported && (
        <button
          type="button"
          onClick={toggleAudio}
          className={`
            w-[24px] h-[24px] flex items-center justify-center rounded-[3px]
            transition-all duration-150 shadow-xs
            ${
              isAudioEnabled
                ? "bg-[#FEF9ED] text-[#C8921B] border border-[#C8921B] ring-1 ring-[#C8921B]/40"
                : "bg-white text-[#555555] hover:text-[#1E73BE] border border-[#D1D5DB] hover:border-[#1E73BE]"
            }
          `}
          title={`Audio Menu Reader (Shortcut: Alt+A) - ${isAudioEnabled ? "Audio ON" : "Audio OFF"}`}
          aria-label="Toggle Audio Menu Reader"
          aria-pressed={isAudioEnabled}
        >
          <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "animate-pulse text-[#C8921B]" : ""}`} />
        </button>
      )}
    </div>
  );
};

export default AccessibilityAudioReader;
