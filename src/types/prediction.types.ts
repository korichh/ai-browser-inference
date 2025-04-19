export type TPrediction = {
  leftEye: TPredictionCoords;
  rightEye: TPredictionCoords;
  yaw: number;
  pitch: number;
  bbox: TPredictionCoordsSizes;
  color: string;
  class: string;
  confidence: number;
};

export type TPredictionCoords = {
  x: number;
  y: number;
};

export type TPredictionCoordsSizes = TPredictionCoords & {
  width: number;
  height: number;
};
