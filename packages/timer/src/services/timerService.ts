import { apiUrl } from "@focusdive/config";
import { getAccessToken } from "@focusdive/auth";

export type UpdateTimerPayload = {
  isRunning: boolean;
  endsAt: number | null;
  mode: string;
  remainingTime: number | null;
};

export const updateTimer = async (data: UpdateTimerPayload): Promise<boolean> => {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`${apiUrl}/timer`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify({
        isRunning: data.isRunning,
        endsAt: data.endsAt,
        mode: data.mode,
        remainingTime: data.remainingTime,
      }),
    });

    if (!response.ok) {
      console.error("Failed to update timer:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating timer:", error);
    return false;
  }
};
