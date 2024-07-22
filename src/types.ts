export type Result = HandPosResult[];

export interface HandPosResult {
  keypoints: Keypoint[];
  keypoints3D: Keypoint[];
  handedness: string;
  confidence: number;
  wrist: FingerPos;
  thumb_cmc: FingerPos;
  thumb_mcp: FingerPos;
  thumb_ip: FingerPos;
  thumb_tip: FingerPos;
  index_finger_mcp: FingerPos;
  index_finger_pip: FingerPos;
  index_finger_dip: FingerPos;
  index_finger_tip: FingerPos;
  middle_finger_mcp: FingerPos;
  middle_finger_pip: FingerPos;
  middle_finger_dip: FingerPos;
  middle_finger_tip: FingerPos;
  ring_finger_mcp: FingerPos;
  ring_finger_pip: FingerPos;
  ring_finger_dip: FingerPos;
  ring_finger_tip: FingerPos;
  pinky_finger_mcp: FingerPos;
  pinky_finger_pip: FingerPos;
  pinky_finger_dip: FingerPos;
  pinky_finger_tip: FingerPos;
}

export interface FingerPos {
  x: number;
  y: number;
  x3D: number;
  y3D: number;
  z3D: number;
}

export interface Keypoint {
  x: number;
  y: number;
  name: string;
  z?: number;
}
