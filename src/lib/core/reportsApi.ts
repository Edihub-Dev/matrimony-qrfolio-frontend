import axios from 'axios';

export type ReportsApiError = {
  ok: false;
  status: number;
  error?: string;
  authError?: boolean;
};

export type ReportsApiSuccess<T> = {
  ok: true;
  status: number;
  data: T;
};

export type ReportsApiResult<T> = ReportsApiSuccess<T> | ReportsApiError;

const mapError = (error: any): ReportsApiError => {
  const status = error?.response?.status ?? 0;
  const message =
    error?.response?.data?.message || error?.message || 'Request failed.';

  const result: ReportsApiError = {
    ok: false,
    status,
    error: message,
  };

  if (status === 401 || status === 403) {
    result.authError = true;
  }

  return result;
};

export type BlockedUserSummary = {
  blockedUserId: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  blockedAt?: string;
};

export type BlockedUsersResponse = {
  items: BlockedUserSummary[];
};

export const blockUser = async (
  targetUserId: string,
): Promise<ReportsApiResult<{ blocked: boolean }>> => {
  try {
    const response = await axios.post<{ blocked: boolean }>(
      '/api/reports/block',
      { targetUserId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
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

export const listBlockedUsers = async (): Promise<
  ReportsApiResult<BlockedUsersResponse>
> => {
  try {
    const response = await axios.get<BlockedUsersResponse>(
      '/api/reports/blocks',
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

export const unblockUser = async (
  targetUserId: string,
): Promise<ReportsApiResult<{ blocked: boolean }>> => {
  try {
    const response = await axios.delete<{ blocked: boolean }>(
      '/api/reports/block',
      {
        data: { targetUserId },
        headers: {
          'Content-Type': 'application/json',
        },
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

export const reportProfile = async (
  params: {
    targetUserId?: string;
    targetProfileId?: string;
    reason: string;
    details?: string;
  },
): Promise<ReportsApiResult<{ id: string; status: string }>> => {
  try {
    const response = await axios.post<{ id: string; status: string }>(
      '/api/reports/report',
      params,
      {
        headers: {
          'Content-Type': 'application/json',
        },
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
