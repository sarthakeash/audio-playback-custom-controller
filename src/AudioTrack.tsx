import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Track, TrackPart } from "./models";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import { AudioTrackProps } from "./models";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";

const AudioTrack: React.FC<AudioTrackProps> = ({
  track,
  onSelectPart,
  playAll,
}) => {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState<Boolean>(false);

  const handleSelectPart = (start: number, end: number) => {
    const part: TrackPart = {
      url: track.url,
      id: `part-${track.id}-${new Date().getTime()}`,
      startTime: Number(start.toFixed(3)),
      endTime: Number(end.toFixed(3)),
      trackId: track.id,
      label: `Part from Track ${track.id}`,
    };
    onSelectPart(part);
  };
  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "red",
        progressColor: "black",
        cursorColor: "transparent",
        barWidth: 2,
        height: 100,
        plugins: [TimelinePlugin.create()],
      });

      wavesurfer.current.load(track.url);
      const wsRegions = wavesurfer.current.registerPlugin(
        RegionsPlugin.create()
      );

      const random = (min, max) => Math.random() * (max - min) + min;
      const randomColor = () =>
        `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

      wavesurfer.current.on("decode", () => {
        wsRegions.addRegion({
          start: 9,
          end: 10,
          content: "Cramped region",
          color: randomColor(),
          minLength: 1,
          maxLength: 100,
        });
      });

      wavesurfer.current.once("decode", () => {
        const slider = document.querySelector(
          `#track-${track.id}`
        ) as HTMLInputElement;

        slider.addEventListener("input", (e) => {
          const minPxPerSec = (e.target as HTMLInputElement).valueAsNumber;
          wavesurfer.current.zoom(minPxPerSec);
        });
      });

      {
        let activeRegion = null;
        wsRegions.on("region-in", (region: any) => {
          console.log("region-in", region);
          activeRegion = region;
        });
        wsRegions.on("region-out", (region: any) => {
          console.log("region-out", region);
          activeRegion = null;
        });
        wsRegions.on("region-clicked", (region: any, e: Event) => {
          e.stopPropagation();
          activeRegion = region;
          region.setOptions({ color: randomColor() });
          handleSelectPart(region.start, region.end);
        });
        wavesurfer.current.on("interaction", () => {
          activeRegion = null;
        });
      }

      return () => wavesurfer.current.destroy();
    }
  }, [track]);

  useEffect(() => {
    if (playAll) {
      wavesurfer.current?.play();
    } else {
      wavesurfer.current?.pause();
    }
  }, [playAll]);

  const handlePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.pause();
      setIsPlaying(false);
    }
  };
  return (
    <div style={{ marginBottom: "30px" }}>
      <label>
        Zoom:{" "}
        <input type="range" min="10" max="1000" id={`track-${track.id}`} />
      </label>

      <div className="audio-track">
        <div id={`waveform-${track.id}`} ref={waveformRef}></div>
      </div>
      {isPlaying ? (
        <button onClick={handlePause} style={{ marginTop: "10px" }}>
          Pause
        </button>
      ) : (
        <button onClick={handlePlay} style={{ marginTop: "10px" }}>
          Play the above track
        </button>
      )}
    </div>
  );
};

export default AudioTrack;
