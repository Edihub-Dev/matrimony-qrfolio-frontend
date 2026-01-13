import axios from "axios";
import { logBehavior } from "./behaviorApi";

type InteractionAction = "view" | "like" | "skip" | "shortlist" | "comment";

type InteractionPayload = {
  targetProfileId: string;
  action: InteractionAction;
  metadata?: Record<string, any>;
};

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("qrAuthToken");
};

const authHeaders = () => {
  const token = getAuthToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const postInteraction = async (payload: InteractionPayload): Promise<void> => {
  try {
    await axios.post(
      "/api/interactions",
      {
        targetProfileId: payload.targetProfileId,
        action: payload.action,
        metadata: payload.metadata || {},
      },
      {
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
      },
    );
  } catch {
    // Best-effort: do not block UI if interaction logging fails
  }
};

export type MatchInteractionSource = "feed" | "filter" | "search" | "swipe";

export const viewProfileEvent = async (
  profileId: string,
  source: MatchInteractionSource,
): Promise<void> => {
  const action = source === "search" ? "search_click" : "view";
  await logBehavior({
    targetProfileId: profileId,
    action,
    metadata: { source },
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("qrMatrimonyInteractionsUpdated"));
  }
};

export const likeProfileEvent = async (
  profileId: string,
  source: MatchInteractionSource,
  extraMetadata?: Record<string, any>,
): Promise<void> => {
  const metadata = { source, ...(extraMetadata || {}) };

  // Keep analytics in behavior log
  await logBehavior({
    targetProfileId: profileId,
    action: "like",
    metadata,
  });

  // Trigger notifications & interaction-specific logic
  await postInteraction({
    targetProfileId: profileId,
    action: "like",
    metadata,
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("qrMatrimonyInteractionsUpdated"));
  }
};

export const commentProfileEvent = async (
  profileId: string,
  source: MatchInteractionSource,
  text: string,
  extraMetadata?: Record<string, any>,
): Promise<void> => {
  const metadata = { source, text, ...(extraMetadata || {}) };

  // Analytics: record as a comment in behavior log
  await logBehavior({
    targetProfileId: profileId,
    action: "comment",
    metadata,
  });

  // Interactions + notifications
  await postInteraction({
    targetProfileId: profileId,
    action: "comment",
    metadata,
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("qrMatrimonyInteractionsUpdated"));
  }
};

export const skipProfileEvent = async (
  profileId: string,
  source: MatchInteractionSource,
  extraMetadata?: Record<string, any>,
): Promise<void> => {
  await logBehavior({
    targetProfileId: profileId,
    action: "skip",
    metadata: { source, ...(extraMetadata || {}) },
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("qrMatrimonyInteractionsUpdated"));
  }
};

export const shortlistProfileEvent = async (
  profileId: string,
  source: MatchInteractionSource,
): Promise<void> => {
  const metadata = { source, variant: "shortlist" };

  // Analytics: record as shortlist in behavior log
  await logBehavior({
    targetProfileId: profileId,
    action: "shortlist",
    metadata,
  });

  // Notifications + mutual match checks share same endpoint
  await postInteraction({
    targetProfileId: profileId,
    action: "shortlist",
    metadata,
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("qrMatrimonyInteractionsUpdated"));
  }
};
