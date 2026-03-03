import type { WarRoomData, CandidateBrief } from './domain.js';

export type WSMessage =
  | { type: 'war-room-update'; payload: WarRoomData; timestamp: string }
  | { type: 'candidate-brief-update'; payload: CandidateBrief; timestamp: string }
  | { type: 'connected'; topic: string; timestamp: string }
  | { type: 'ping'; timestamp: string }
  | { type: 'pong'; timestamp: string }
  | { type: 'error'; message: string; timestamp: string };
