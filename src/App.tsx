import React, { useState } from "react";
import AudioTrack from "./AudioTrack";
import CommonTimeline from "./CommonTimeline";
import { Track, TrackPart } from "./models";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [parts, setParts] = useState<TrackPart[]>([]);
  const [playAll, setPlayAll] = useState(false); // State to control parallel playback

  const togglePlayAll = () => {
    setPlayAll(!playAll);
  };
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(parts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setParts(items);
  };
  const handleSelectPart = (part: TrackPart) => {
    setParts((prevParts) => [...prevParts, part]);
  };

  const addTrack = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const newTrackId = tracks.length + 1;
      const newTrack: Track = {
        id: newTrackId,
        url: URL.createObjectURL(file),
        parts: [],
      };
      setTracks([...tracks, newTrack]);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={addTrack}
        accept="audio/*"
        style={{ marginBottom: "20px" }}
      />
      <button onClick={togglePlayAll} style={{ display: "block" }}>
        {playAll ? "Stop" : "Parallel Play Uploaded Tracks"}
      </button>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="commonTimeline">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {tracks.map((track, index) => (
                <Draggable
                  key={track.id}
                  draggableId={track.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <AudioTrack
                        track={track}
                        onSelectPart={handleSelectPart}
                        playAll={playAll}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <CommonTimeline parts={parts} onDragEnd={onDragEnd} />
    </div>
  );
};
export default App;
