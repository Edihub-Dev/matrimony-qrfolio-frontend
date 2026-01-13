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

export type NotificationItem = {
  id: string;
  type: 'like' | 'shortlist' | 'comment' | 'mutual_match';
  targetProfileId: string | null;
  actorUserId: string | null;
  payload: Record<string, any> | null;
  read: boolean;
  createdAt: string;
};

export type NotificationsResponse = {
  items: NotificationItem[];
  page: number;
  limit: number;
  hasMore: boolean;
  unreadCount: number;
};

export const fetchNotifications = async (
  page?: number,
  limit?: number,
  onlyUnread?: boolean,
): Promise<NotificationsResponse> => {
  const response = await axios.get<NotificationsResponse>('/api/notifications', {
    params: { page, limit, onlyUnread },
    headers: authHeaders(),
  });
  return response.data;
};

export const markNotificationsRead = async (
  ids?: string[],
  all?: boolean,
): Promise<{ ok: boolean; updated: number; unreadCount: number }> => {
  const response = await axios.post<{
    ok: boolean;
    updated: number;
    unreadCount: number;
  }>(
    '/api/notifications/mark-read',
    {
      ids,
      all,
    },
    {
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};
