export const WS_TOPICS = {
  WAR_ROOM: 'war-room',
  CANDIDATE_BRIEF: 'candidate-brief',
  SYSTEM_ALERT: 'system-alert',
} as const;

export type WSTopic = typeof WS_TOPICS[keyof typeof WS_TOPICS];

export type WSMessage =
  | { type: 'war-room-update'; payload: unknown; timestamp: string }
  | { type: 'candidate-brief-update'; payload: unknown; timestamp: string }
  | { type: 'ping'; timestamp: string }
  | { type: 'pong'; timestamp: string }
  | { type: 'error'; message: string; timestamp: string };
