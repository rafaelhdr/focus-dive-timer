import mitt from "mitt";
import { TimerMode } from "../types";

type TimerEvents = {
  timer_finished: { mode: TimerMode, endsAt: number};
};

export const timerEvents = mitt<TimerEvents>();
