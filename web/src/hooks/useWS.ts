import { useEffect, useRef, useCallback } from 'react';
import type { WSMessage } from '../types/ws.js';

export function useWS(topic: string, onMessage: (msg: WSMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const attemptsRef = useRef(0);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${location.host}/ws?topic=${topic}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as WSMessage;
        if (msg.type === 'ping') { ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() })); return; }
        onMessageRef.current(msg);
      } catch { /* ignore */ }
    };

    ws.onopen = () => { attemptsRef.current = 0; };

    ws.onclose = ws.onerror = () => {
      attemptsRef.current++;
      const delay = Math.min(attemptsRef.current * 2000, 30000);
      setTimeout(connect, delay);
    };
  }, [topic]);

  useEffect(() => {
    connect();
    return () => { wsRef.current?.close(); };
  }, [connect]);
}
