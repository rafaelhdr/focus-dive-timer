import type { Socket } from "socket.io-client";
import type { TimerData } from "../types";

export function attachTimerChannel(socket: Socket) {
  return {
    requestTimer() {
      socket.emit("get_timer");
    },

    sendTimerData(data: TimerData) {
      socket.emit("timer_data", data);
    },

    onTimerState(cb: (data: TimerData) => void) {
      socket.on("timer_state", cb);
      return () => socket.off("timer_state", cb);
    },

    onTimerUpdated(cb: (data: TimerData) => void) {
      socket.on("timer_updated", cb);
      return () => socket.off("timer_updated", cb);
    },

    onConnected(cb: () => void) {
      socket.on("connect", cb);
      return () => socket.off("connect", cb);
    },

    onDisconnected(cb: (reason: string) => void) {
      socket.on("disconnect", cb);
      return () => socket.off("disconnect", cb);
    },

    onConnectionError(cb: (error: unknown) => void) {
      socket.on("connect_error", cb);
      return () => socket.off("connect_error", cb);
    },
  };
}
