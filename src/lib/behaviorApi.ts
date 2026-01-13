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

export type BehaviorEvent = {
  targetUserId?: string;
  targetProfileId?: string;
  action: 'view' | 'like' | 'skip' | 'search_click' | 'shortlist' | 'comment';
  metadata?: Record<string, any>;
};

export const logBehavior = async (
  events: BehaviorEvent | BehaviorEvent[],
): Promise<void> => {
  try {
    const payload = Array.isArray(events) ? events : [events];
    await axios.post('/api/behavior', payload, {
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
    });
  } catch {
    // best-effort: do not block UI on analytics failures
  }
};
