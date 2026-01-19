import { TimerMode } from "@focusdive/timer";
import { io, Socket } from "socket.io-client";
import { apiUrl } from "@focusdive/config";
import { TimerData } from "@/hooks/types";
import { getAccessToken } from "@focusdive/auth";

interface TimerSocketCallbacks {
  onTimerState: (data: TimerData) => void;
  onTimerUpdated: (data: TimerData) => void;
  onConnected: () => void;
  onDisconnected: () => void;
  onConnectionError: (error: any) => void;
}

class TimerSocketService {
  private socket: Socket | null = null;
  private callbacks: TimerSocketCallbacks | null = null;

  async initialize(callbacks: TimerSocketCallbacks): Promise<Socket | null> {
    // Skip if socket already exists
    if (this.socket) return this.socket;

    console.log("Initializing WebSocket connection to:", `${apiUrl}/timer`);

    try {
      // Get authentication token
      const accessToken = await getAccessToken();

      // Create socket connection with token as query parameter
      this.socket = io(`${apiUrl}/timer`, {
        withCredentials: true,
        query: {
          token: accessToken
        }
      });

      this.callbacks = callbacks;
      this.setupEventListeners();

      return this.socket;
    } catch (error) {
      console.error("Error initializing socket:", error);
      return null;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket || !this.callbacks) return;

    this.socket.on("connect", () => {
      console.log("WebSocket connected successfully");
      this.callbacks?.onConnected();

      // Request current timer state from server
      this.socket?.emit("get_timer");
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.callbacks?.onConnectionError(error);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      this.callbacks?.onDisconnected();
    });

    // Handle timer state from server
    this.socket.on("timer_state", (data: TimerData) => {
      console.log("Received timer state:", data);
      this.callbacks?.onTimerState(data);
    });

    // Listen for timer updates from server
    this.socket.on("timer_updated", (data: TimerData) => {
      console.log("Received timer update:", data);
      this.callbacks?.onTimerUpdated(data);
    });
  }

  updateTimer(timerEndsAt: number | null, mode: TimerMode, isRunning: boolean): void {
    if (!this.socket) {
      console.warn("Cannot update timer: WebSocket not connected");
      return;
    }

    console.log("Updating timer on server:", { timerEndsAt, mode, isRunning });
    this.socket.emit("timer_data", {
      timerEndsAt,
      mode,
      isRunning,
    });
  }

  resetTimer(): void {
    if (!this.socket) {
      console.warn("Cannot reset timer: WebSocket not connected");
      return;
    }

    console.log("Resetting timer on server");
    this.socket.emit("reset_timer");
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.callbacks = null;
    }
  }
}

export const timerSocketService = new TimerSocketService();
