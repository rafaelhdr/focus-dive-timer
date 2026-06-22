import { apiUrl } from "@focusdive/config";
import { getAccessToken } from "@focusdive/auth-token";

let socket: WebSocket | null = null;
let connecting: Promise<WebSocket> | null = null;

export async function getTimerSocket(): Promise<WebSocket> {
  if (socket && socket.readyState === WebSocket.OPEN) return socket;
  if (connecting) return connecting;

  connecting = (async () => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error("Not authenticated: missing access token");
    }

    const wsUrl = apiUrl.replace(/^http/, "ws");
    const s = new WebSocket(`${wsUrl}/ws/timer?token=${encodeURIComponent(token)}`);

    await new Promise<void>((resolve, reject) => {
      s.onopen = () => resolve();
      s.onerror = (err) => reject(err);
    });

    socket = s;
    return s;
  })().finally(() => {
    connecting = null;
  });

  return connecting;
}

export function disconnectTimerSocket(): void {
  socket?.close();
  socket = null;
  connecting = null;
}

export async function reconnectTimerSocket(): Promise<WebSocket> {
  disconnectTimerSocket();
  return getTimerSocket();
}

export function getExistingTimerSocket(): WebSocket | null {
  return socket;
}

