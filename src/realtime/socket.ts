import { SOCKET_URL } from '@/data/constants';

type Listener<T = unknown> = (payload: T) => void;

class SocketClient {
  private socket: WebSocket | null = null;
  private readonly listeners = new Map<string, Set<Listener>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect(url: string = SOCKET_URL) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.info('[socket] connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data) as {
          type: string;
          payload: unknown;
        };
        this.listeners.get(type)?.forEach((cb) => cb(payload));
      } catch (e) {
        console.warn('[socket] invalid message', e);
      }
    };

    this.socket.onclose = () => {
      console.info('[socket] closed, reconnecting in 3s...');
      this.reconnectTimer = setTimeout(() => this.connect(url), 3000);
    };
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
  }

  on<T = unknown>(type: string, cb: Listener<T>) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(cb as Listener);
    return () => this.listeners.get(type)?.delete(cb as Listener);
  }

  emit<T = unknown>(type: string, payload: T) {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({ type, payload }));
  }
}

export const socket = new SocketClient();
