import mitt from "mitt";

type TimerEvents = {
  timer_finished: { mode: "focus" | "break" };
};

export const timerEvents = mitt<TimerEvents>();
