import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { TrackPart } from "./models"; // Adjust import paths as needed
import "./CommonTimeline.css";
interface CommonTimelineProps {
  parts: TrackPart[];
  onDragEnd: (result: any) => void;
}

const CommonTimeline: React.FC<CommonTimelineProps> = ({
  parts,
  onDragEnd,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [currentTime, setCurrentTime] = useState(0); 
  const requestIdRef = useRef<number | null>(null); 
  const playbackIntervalRef = useRef<NodeJS.Timer | null>(null);
  const totalDuration = parts.reduce(
    (total, part) => total + (part.endTime - part.startTime) * 1000,
    0
  );

  const updatePlaybackTime = (startTime: number) => {
    if (!audioCtxRef.current) return;
    const elapsedTime = audioCtxRef.current.currentTime * 1000 - startTime;
    setCurrentTime(elapsedTime);
    requestIdRef.current = requestAnimationFrame(() =>
      updatePlaybackTime(startTime)
    );
  };
  const playPartsSequentially = async () => {
    if (isPlaying || parts.length === 0) return;
    setIsPlaying(true);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }
    let globalStartTime = audioCtxRef.current.currentTime * 1000;
    requestIdRef.current = requestAnimationFrame(() =>
      updatePlaybackTime(globalStartTime)
    );
    for (const part of parts) {
      const duration = part.endTime - part.startTime;
      const source = audioCtxRef.current.createBufferSource();
      const response = await fetch(part.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtxRef.current.decodeAudioData(
        arrayBuffer
      );
      source.buffer = audioBuffer;
      source.connect(audioCtxRef.current.destination);
      source.start(0, part.startTime, duration);
      await new Promise((resolve) => {
        source.onended = resolve;
      });
    }
    clearInterval(playbackIntervalRef.current);
    setIsPlaying(false);
    if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
  };
  const stopPlayback = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
  };

  const pointerPosition = (currentTime / totalDuration) * 100;

  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  const pointerStyle: CSSProperties = {
    position: "absolute",
    left: `${pointerPosition}%`,
    width: "1.5px",
    height: "10px",
    backgroundColor: "red",
  };
  const pointerContainerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "10px",
  };

  return (
    <div>
      <button onClick={playPartsSequentially} disabled={isPlaying}>
        {isPlaying ? "Playing..." : "Play All Parts"}
      </button>
      <button onClick={stopPlayback} disabled={!isPlaying}>
        Stop
      </button>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="commonTimeline" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="common-timeline"
            >
              {parts.map((part, index) => (
                <Draggable key={part.id} draggableId={part.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="timeline-part"
                    >
                      {part.label}: {part.startTime}s to {part.endTime}s
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="pointer-container" style={pointerContainerStyle}>
        <div className="pointer" style={pointerStyle}></div>
      </div>
    </div>
  );
};

export default CommonTimeline;
