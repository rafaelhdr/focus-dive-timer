import { useMutation } from "@tanstack/react-query";
import { loginWithEmail, verifyToken } from "../services/auth";
import { setTokens } from "../storage/auth";

export function useRequestLoginToken() {
  return useMutation({
    mutationFn: (email: string) => loginWithEmail(email),
  });
}

export function useVerifyLoginToken() {
  return useMutation({
    mutationFn: ({ email, token }: { email: string; token: string }) =>
      verifyToken(email, token),
    onSuccess: (res) => {
      if (res?.success && res.access_token && res.refresh_token) {
        setTokens(res.access_token, res.refresh_token);
      }
    },
  });
}
