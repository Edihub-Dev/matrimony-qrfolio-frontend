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

export type AdminProfileOwner = {
  _id: string;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  isBlocked?: boolean;
};

export type AdminProfileListItem = {
  _id: string;
  userId?: AdminProfileOwner | string;
  profileFor?: string | null;
  gender?: string | null;
  age?: string | null;
  religion?: string | null;
  motherTongue?: string | null;
  city?: string | null;
  completenessScore?: number;
  trustScore?: number;
  isVerified?: boolean;
  featuredUntil?: string | null;
  flags?: {
    suspicious?: boolean;
    inactive?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type AdminProfileListResponse = {
  items: AdminProfileListItem[];
  page: number;
  limit: number;
  total: number;
};

export type AdminProfilesApiError = {
  ok: false;
  status: number;
  error?: string;
  authError?: boolean;
  forbidden?: boolean;
};

export type AdminProfilesApiSuccess<T> = {
  ok: true;
  status: number;
  data: T;
};

export type AdminProfilesApiResult<T> =
  | AdminProfilesApiSuccess<T>
  | AdminProfilesApiError;

const mapError = (error: any): AdminProfilesApiError => {
  const status = error?.response?.status ?? 0;
  const message =
    error?.response?.data?.message || error?.message || 'Request failed.';

  const result: AdminProfilesApiError = {
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

export const listProfilesForAdmin = async (
  page?: number,
  limit?: number,
  search?: string,
  verified?: 'any' | 'true' | 'false',
): Promise<AdminProfilesApiResult<AdminProfileListResponse>> => {
  try {
    const params: any = { page, limit };
    if (search && search.trim()) params.search = search.trim();
    if (verified && verified !== 'any') params.verified = verified;

    const response = await axios.get<AdminProfileListResponse>(
      '/api/admin/profiles',
      {
        params,
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

export const verifyProfileForAdmin = async (
  id: string,
): Promise<
  AdminProfilesApiResult<{ id: string; isVerified: boolean; trustScore: number }>
> => {
  try {
    const response = await axios.post<{
      id: string;
      isVerified: boolean;
      trustScore: number;
    }>(
      `/api/admin/profiles/${id}/verify`,
      {},
      {
        headers: {
          ...authHeaders(),
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

export const unverifyProfileForAdmin = async (
  id: string,
): Promise<
  AdminProfilesApiResult<{ id: string; isVerified: boolean; trustScore: number }>
> => {
  try {
    const response = await axios.post<{
      id: string;
      isVerified: boolean;
      trustScore: number;
    }>(
      `/api/admin/profiles/${id}/unverify`,
      {},
      {
        headers: {
          ...authHeaders(),
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

export const featureProfileForAdmin = async (
  id: string,
  featuredUntil?: string,
): Promise<AdminProfilesApiResult<{ id: string; featuredUntil: string }>> => {
  try {
    const payload: any = {};
    if (featuredUntil) payload.featuredUntil = featuredUntil;

    const response = await axios.post<{
      id: string;
      featuredUntil: string;
    }>(
      `/api/admin/profiles/${id}/feature`,
      payload,
      {
        headers: {
          ...authHeaders(),
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
