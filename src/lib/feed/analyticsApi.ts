import axios from "axios";
import type { MatchFeedItem, MatchesApiResult, MatchesApiError } from "./matchesApi";

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

export type InteractionBucket =
  | "viewed_me"
  | "liked_me"
  | "shortlisted_me"
  | "commented_me";

export type InteractionAnalyticsItem = MatchFeedItem & {
  lastInteractionAt: string;
  lastInteractionType: "view" | "search_click" | "like" | "shortlist" | "comment";
  interactionCount: number;
};

export type InteractionAnalyticsResponse = {
  items: InteractionAnalyticsItem[];
  page: number;
  limit: number;
  hasMore: boolean;
  error?: string;
  errorCode?: string;
};

const mapError = (error: any): MatchesApiError => {
  const status = (error && error.response && error.response.status) || 0;
  const data = (error && error.response && error.response.data) || undefined;
  const message =
    (data && (data as any).message) || error?.message || "Failed to fetch analytics.";

  const result: MatchesApiError = {
    ok: false,
    status,
    error: message,
  };

  if (status === 401 || status === 403) {
    result.authError = true;
  }

  const errorCode = data && (data as any).errorCode;
  if (typeof errorCode === "string") {
    result.errorCode = errorCode;   
  }

  return result;
};

export const getInteractionAnalytics = async (
  bucket: InteractionBucket,
  page?: number,
  limit?: number,
): Promise<MatchesApiResult<InteractionAnalyticsResponse>> => {
  try {
    const response = await axios.get<InteractionAnalyticsResponse>(
      "/api/analytics/interactions",
      {
        params: {
          bucket,
          page,
          limit,
        },
        headers: authHeaders(),
      },
    );

    return {
      ok: true,
      status: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return mapError(error);
  }
};
