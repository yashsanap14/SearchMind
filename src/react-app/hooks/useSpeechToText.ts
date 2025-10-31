import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typing for Web Speech API Recognition, including webkit fallback
type GenericRecognition = any;

function getRecognition(): GenericRecognition | null {
  const w = window as unknown as {
    SpeechRecognition?: GenericRecognition;
    webkitSpeechRecognition?: GenericRecognition;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

export function useSpeechToText(options?: {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
}) {
  const { lang = "en-US", interimResults = true, continuous = false } = options || {};

  const recognitionRef = useRef<GenericRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recognitionRef.current = getRecognition();
    setIsSupported(!!recognitionRef.current);
    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        /* no-op */
      }
    };
  }, []);

  const start = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    setTranscript("");
    setError(null);

    rec.lang = lang;
    rec.interimResults = interimResults;
    rec.continuous = continuous;

    rec.onresult = (event: any) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        finalText += res[0]?.transcript || "";
      }
      setTranscript(finalText.trim());
    };

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = (e: any) => {
      setIsListening(false);
      setError(e?.error || "speech_error");
    };

    try {
      rec.start();
    } catch (e) {
      setError("failed_to_start");
    }
  }, [lang, interimResults, continuous]);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* no-op */
    }
  }, []);

  const toggle = useCallback(() => {
    if (!isSupported) return;
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isSupported, isListening, start, stop]);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    start,
    stop,
    toggle,
    setTranscript,
  } as const;
}


