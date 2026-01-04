import { useEffect } from "react";
import { getTimerSocket } from "./socketClient";
import { attachTimerChannel } from "./channel";
import { useTimerStore } from "../store/timerStore"; // ajuste o path se necessário
import type { TimerData } from "../types"; // ajuste o path se necessário

export function useTimerRealtime() {
  const setFromServer = useTimerStore((s) => s.setFromServer);

  useEffect(() => {
    let mounted = true;
    const unsubscribers: Array<() => void> = [];

    (async () => {
      try {
        const socket = await getTimerSocket();
        if (!mounted) return;

        const ch = attachTimerChannel(socket);

        unsubscribers.push(
          ch.onConnected(() => {
            ch.requestTimer();
          }),
          ch.onTimerState((data: TimerData) => {
            setFromServer(data);
          }),
          ch.onTimerUpdated((data: TimerData) => {
            setFromServer(data);
          }),
          ch.onConnectionError((err) => {
            console.error("Timer socket connect_error:", err);
          })
        );
      } catch (err) {
        console.error("Failed to initialize timer realtime:", err);
      }
    })();

    return () => {
      mounted = false;
      unsubscribers.forEach((u) => u());
    };
  }, [setFromServer]);
}
