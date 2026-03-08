import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fdApi, fdKeys } from "@focusdive/api-client";
import { useAuthStore } from "@focusdive/auth";

type SlackConnectStatus = "loading" | "success" | "error";

type UseSlackConnectCallbackResult = {
  status: SlackConnectStatus;
  message: string;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
};

export function useSlackConnect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const hasTriggeredRef = useRef(false);

  const searchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  );

  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  const mutation = fdApi.useMutation(
    "post",
    "/v1/integrations/slack/connect",
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: fdKeys.slackStatus(),
        });
      },
    },
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    if (oauthError) return;
    if (!code) return;
    if (hasTriggeredRef.current) return;

    hasTriggeredRef.current = true;
    mutation.mutate({
      body: { code },
    });
  }, [code, oauthError, isAuthenticated, mutation]);

  if (oauthError) {
    return {
      status: "error",
      message: "Failed to connect to Slack.",
      isLoading: false,
      isSuccess: false,
      isError: true,
    } satisfies UseSlackConnectCallbackResult;
  }

  if (!code) {
    return {
      status: "error",
      message: "No authorization code provided.",
      isLoading: false,
      isSuccess: false,
      isError: true,
    } satisfies UseSlackConnectCallbackResult;
  }

  if (!isAuthenticated || mutation.isPending) {
    return {
      status: "loading",
      message: "Connecting to Slack...",
      isLoading: true,
      isSuccess: false,
      isError: false,
    } satisfies UseSlackConnectCallbackResult;
  }

  if (mutation.isError) {
    return {
      status: "error",
      message: "An error occurred while connecting to Slack.",
      isLoading: false,
      isSuccess: false,
      isError: true,
    } satisfies UseSlackConnectCallbackResult;
  }

  if (mutation.isSuccess) {
    return {
      status: "success",
      message: "Successfully connected to Slack!",
      isLoading: false,
      isSuccess: true,
      isError: false,
    } satisfies UseSlackConnectCallbackResult;
  }

  return {
    status: "loading",
    message: "Connecting to Slack...",
    isLoading: true,
    isSuccess: false,
    isError: false,
  } satisfies UseSlackConnectCallbackResult;
}
