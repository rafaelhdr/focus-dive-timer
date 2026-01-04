import { getTimerSocket } from "./socketClient";
import { attachTimerChannel } from "./channel";

export async function pushTimerToServer(data: any) {
  const socket = await getTimerSocket();
  const ch = attachTimerChannel(socket);
  ch.sendTimerData(data);
}
