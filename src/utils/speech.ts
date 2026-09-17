// Speech Synthesis utility for Activity 2: English Listening & Sentence Builder

interface SpeechOptions {
  rate?: number; // 0.8 for slow, 1.0 for normal
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let preferredVoice: SpeechSynthesisVoice | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      resolve(voices);
      return;
    }
    // Chrome sometimes loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices() || []);
    };
    // Fallback timeout in case onvoiceschanged does not fire
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices() || []);
    }, 300);
  });
}

export async function getBestEnglishVoice(): Promise<SpeechSynthesisVoice | null> {
  if (preferredVoice) return preferredVoice;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = await loadVoices();
  if (!voices || voices.length === 0) return null;

  // Prioritize high quality English voices (Google US English, Samantha, Natural, en-US, en-GB)
  const priorityList = [
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en-US') && (v.name.includes('Google') || v.name.includes('Natural')),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en-US'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en-GB'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
  ];

  for (const matchFn of priorityList) {
    const found = voices.find(matchFn);
    if (found) {
      preferredVoice = found;
      return found;
    }
  }

  // Fallback to first available voice
  preferredVoice = voices[0] || null;
  return preferredVoice;
}

export async function speakSentence(
  text: string, 
  options: SpeechOptions = {}
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser environment.');
    options.onError?.(new Error('SpeechSynthesis not supported'));
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.lang = 'en-US';

    const voice = await getBestEnglishVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      options.onError?.(e);
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Failed to speak sentence:', err);
    options.onError?.(err);
    options.onEnd?.();
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
