import { useEffect } from "react";
import { authEvents } from "@focusdive/auth";
import { setLoginEmail, setLoginStep } from "../storage/authFlowStorage";

type Options = {
  email?: string;
};

export function useSaveLoginStep(options: Options = {}) {
  const { email } = options;

  useEffect(() => {
    const off = authEvents.on("login_email_sent", () => {
      setLoginStep("token");

      if (email) setLoginEmail(email);
    });

    return off;
  }, [email]);
}
