import { useEffect, useRef, useCallback } from 'react';
export function useWS(topic, onMessage) {
    const wsRef = useRef(null);
    const attemptsRef = useRef(0);
    const mountedRef = useRef(false);
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;
    const connect = useCallback(() => {
        if (!mountedRef.current)
            return;
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${location.host}/ws?topic=${topic}`);
        wsRef.current = ws;
        ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                if (msg.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
                    return;
                }
                onMessageRef.current(msg);
            }
            catch { /* ignore */ }
        };
        ws.onopen = () => { attemptsRef.current = 0; };
        ws.onclose = ws.onerror = () => {
            if (!mountedRef.current)
                return;
            attemptsRef.current++;
            const delay = Math.min(attemptsRef.current * 2000, 30000);
            setTimeout(connect, delay);
        };
    }, [topic]);
    useEffect(() => {
        mountedRef.current = true;
        connect();
        return () => {
            mountedRef.current = false;
            wsRef.current?.close();
        };
    }, [connect]);
}
