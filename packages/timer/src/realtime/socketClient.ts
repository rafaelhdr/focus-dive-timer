import { io, Socket } from "socket.io-client";
import { apiUrl } from "@focusdive/config";
import { getAccessToken } from "@focusdive/auth";

let socket: Socket | null = null;
let connecting: Promise<Socket> | null = null;

export async function getTimerSocket(): Promise<Socket> {
  if (socket) return socket;
  if (connecting) return connecting;

  connecting = (async () => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error("Not authenticated: missing access token");
    }

    const s = io(`${apiUrl}/timer`, {
      withCredentials: true,
      query: { token },
    });

    socket = s;
    return s;
  })().finally(() => {
    connecting = null;
  });

  return connecting;
}

export function disconnectTimerSocket(): void {
  socket?.disconnect();
  socket = null;
  connecting = null;
}

export async function reconnectTimerSocket(): Promise<Socket> {
  disconnectTimerSocket();
  return getTimerSocket();
}

export function getExistingTimerSocket(): Socket | null {
  return socket;
}

