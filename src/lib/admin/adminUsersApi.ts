import axios from 'axios';

export type AdminUserListItem = {
  _id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  isBlocked: boolean;
  isAdmin?: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
};

export type AdminUserListResponse = {
  items: AdminUserListItem[];
  page: number;
  limit: number;
  total: number;
};

export type AdminApiError = {
  ok: false;
  status: number;
  error?: string;
  authError?: boolean;
  forbidden?: boolean;
};

export type AdminApiSuccess<T> = {
  ok: true;
  status: number;
  data: T;
};

export type AdminApiResult<T> = AdminApiSuccess<T> | AdminApiError;

const mapError = (error: any): AdminApiError => {
  const status = error?.response?.status ?? 0;
  const message =
    error?.response?.data?.message || error?.message || 'Request failed.';

  const result: AdminApiError = {
    ok: false,
    status,
    error: message,
  };

  if (status === 401) {
    result.authError = true;
  }
  if (status === 403) {
    result.forbidden = true;
  }

  return result;
};

export const listUsersForAdmin = async (
  page?: number,
  limit?: number,
  search?: string,
  blocked?: 'any' | 'true' | 'false',
): Promise<AdminApiResult<AdminUserListResponse>> => {
  try {
    const params: any = { page, limit };
    if (search && search.trim()) params.search = search.trim();
    if (blocked && blocked !== 'any') params.blocked = blocked;

    const response = await axios.get<AdminUserListResponse>('/api/admin/users', {
      params,
    });

    return {
      ok: true,
      status: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return mapError(error);
  }
};

export const setUserBlockedForAdmin = async (
  id: string,
  isBlocked: boolean,
): Promise<AdminApiResult<{ id: string; isBlocked: boolean }>> => {
  try {
    const response = await axios.post<{ id: string; isBlocked: boolean }>(
      `/api/admin/users/${id}/block`,
      { isBlocked },
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
