export interface TrackPart {
  id: string;
  startTime: number;
  url: string;
  endTime: number;
  trackId: number;
  label?: string;
}

export interface Track {
  id: number;
  url: string;
  parts: TrackPart[];
}
export interface CommonTimelineProps {
  parts: TrackPart[];
  onDragEnd: (result: any) => void;
}
export interface AudioTrackProps {
  track: Track;
  onSelectPart: (part: TrackPart) => void;
  playAll: boolean; // New prop to control playback from the parent component

}
