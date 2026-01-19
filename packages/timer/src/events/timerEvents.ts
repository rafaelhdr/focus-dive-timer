import mitt from "mitt";
import { TimerMode } from "../types";

type TimerEvents = {
  timer_finished: { mode: TimerMode };
};

export const timerEvents = mitt<TimerEvents>();
