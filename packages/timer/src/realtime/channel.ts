import type { TimerData } from "../types";

type Listener<T = unknown> = (data: T) => void;

function send(socket: WebSocket, event: string, data?: unknown) {
  socket.send(JSON.stringify({ event, data }));
}

function onEvent<T>(
  socket: WebSocket,
  event: string,
  cb: Listener<T>
): () => void {
  const handler = (msg: MessageEvent) => {
    try {
      const parsed = JSON.parse(msg.data);
      console.log("[WS] incoming message:", parsed);
      if (parsed.event === event) cb(parsed.data as T);
    } catch {
      // ignore non-JSON messages
    }
  };
  socket.addEventListener("message", handler);
  return () => socket.removeEventListener("message", handler);
}

export function attachTimerChannel(socket: WebSocket) {
  return {
    requestTimer() {
      send(socket, "get_timer");
    },

    sendTimerData(data: TimerData) {
      send(socket, "timer_data", data);
    },

    onTimerState(cb: Listener<TimerData>) {
      return onEvent<TimerData>(socket, "timer_state", cb);
    },

    onTimerUpdated(cb: Listener<TimerData>) {
      return onEvent<TimerData>(socket, "timer_updated", cb);
    },

    onConnected(cb: () => void) {
      socket.addEventListener("open", cb);
      return () => socket.removeEventListener("open", cb);
    },

    onDisconnected(cb: (event: CloseEvent) => void) {
      socket.addEventListener("close", cb);
      return () => socket.removeEventListener("close", cb);
    },

    onConnectionError(cb: (event: Event) => void) {
      socket.addEventListener("error", cb);
      return () => socket.removeEventListener("error", cb);
    },
  };
}

