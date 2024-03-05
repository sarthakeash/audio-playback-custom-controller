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
