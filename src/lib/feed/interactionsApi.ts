import axios from 'axios';

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('qrAuthToken');
};

const authHeaders = () => {
  const token = getAuthToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export type InteractionAction = 'view' | 'like' | 'skip' | 'shortlist' | 'comment';

export type InteractionPayload = {
  targetProfileId: string;
  action: InteractionAction;
  metadata?: Record<string, any>;
};

export type InteractionResponse = {
  ok: boolean;
  action: InteractionAction;
  targetProfileId: string;
  interactionId?: string;
};

export const postInteraction = async (
  payload: InteractionPayload,
): Promise<InteractionResponse> => {
  const response = await axios.post<InteractionResponse>(
    '/api/interactions',
    payload,
    {
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};

export type ProfileComment = {
  id: string;
  text: string;
  createdAt: string;
  actorUserId: string;
  actorProfileId?: string | null;
  actorDisplayName?: string | null;
  actorProfilePhotoUrl?: string | null;
};

export type ProfileCommentsResponse = {
  items: ProfileComment[];
  page: number;
  limit: number;
  hasMore: boolean;
};

export const getProfileComments = async (
  profileId: string,
  page?: number,
  limit?: number,
): Promise<ProfileCommentsResponse> => {
  const response = await axios.get<ProfileCommentsResponse>(
    `/api/interactions/comments/${profileId}`,
    {
      params: {
        page,
        limit,
      },
      headers: authHeaders(),
    },
  );

  return response.data;
};
