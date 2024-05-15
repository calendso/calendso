import { useTranscription } from "@daily-co/daily-react";
import { useDaily, useDailyEvent } from "@daily-co/daily-react";
import React, { Fragment, useCallback, useRef, useState, useLayoutEffect, useEffect } from "react";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";

export const CalAiTranscribe = () => {
  const daily = useDaily();
  const { t } = useLocale();

  const [transcript, setTranscript] = useState("");

  const [transcriptHeight, setTranscriptHeight] = useState(0);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const transcription = useTranscription();

  useDailyEvent(
    "app-message",
    useCallback((ev) => {
      const data = ev?.data;
      if (data.user_name && data.text) setTranscript(`${data.user_name}: ${data.text}`);
    }, [])
  );

  useDailyEvent("transcription-started", (ev) => {
    daily?.updateCustomTrayButtons({
      transcription: {
        label: "Stop",
        tooltip: "Toggle real time transcription powered by AI",
        iconPath: `${WEBAPP_URL}/sparkles-red.svg`,
        iconPathDarkMode: `${WEBAPP_URL}/sparkles-red.svg`,
      },
    });
  });

  useDailyEvent("transcription-stopped", (ev) => {
    daily?.updateCustomTrayButtons({
      transcription: {
        label: "Cal.ai",
        tooltip: "Toggle real time transcription powered by AI",
        iconPath: `${WEBAPP_URL}/sparkles`,
        iconPathDarkMode: `${WEBAPP_URL}/sparkles`,
      },
    });
  });

  useDailyEvent("custom-button-click", (ev) => {
    if (ev?.button_id !== "transcription") {
      return;
    }

    if (transcription?.isTranscribing) {
      daily?.stopTranscription();
    } else {
      daily?.startTranscription();
    }
  });

  useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTranscriptHeight(entry.target.scrollHeight);
      }
    });

    if (transcriptRef.current) {
      observer.observe(transcriptRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current?.scrollHeight,
      behavior: "smooth",
    });
  }, [transcriptHeight]);

  return (
    <>
      <div
        id="cal-ai-thing"
        style={{
          textShadow: "0 0 20px black, 0 0 20px black, 0 0 20px black",
        }}
        ref={transcriptRef}
        className="max-h-full overflow-x-hidden overflow-y-scroll p-8 text-center text-white">
        {transcript
          ? transcript.split("\n").map((line, i) => (
              <Fragment key={`transcript-${i}`}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))
          : ""}
      </div>
    </>
  );
};
