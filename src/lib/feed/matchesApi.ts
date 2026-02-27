import axios from 'axios';

export type MatchFeedItem = {
  id: string;
  profileId: string;
  displayName: string;
  age?: string;
  height?: string;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  city?: string;
  state?: string;
  education?: string;
  profession?: string;
  profilePhotoUrl?: string;
  gender?: string;
  matchPercentage: number;
  recommended: boolean;
  boosted?: boolean;
  viewsCount?: number;
  likesCount?: number;
  shortlistedCount?: number;
};

export type MatchesFeedResponse = {
  items: MatchFeedItem[];
  page: number;
  limit: number;
  hasMore: boolean;
  viewerCompleteness?: number;
  viewerGender?: string | null;
};

export type MatchesApiSuccess<T> = {
  ok: true;
  status: number;
  data: T;
};

export type MatchesApiError = {
  ok: false;
  status: number;
  error?: string;
  authError?: boolean;
  needsProfile?: boolean;
  profileCompleteness?: number;
  errorCode?: string;
};

export type MatchesApiResult<T> = MatchesApiSuccess<T> | MatchesApiError;

const mapError = (error: any): MatchesApiError => {
  const status = (error && error.response && error.response.status) || 0;
  const data = (error && error.response && error.response.data) || undefined;
  const message =
    (data && data.message) || error?.message || 'Failed to fetch matches.';

  const result: MatchesApiError = {
    ok: false,
    status,
    error: message,
  };

  if (status === 401 || status === 403) {
    result.authError = true;
  }

  const errorCode = data && data.errorCode;

  if (status === 400) {
    if (errorCode === 'PROFILE_INCOMPLETE') {
      result.needsProfile = true;
      if (typeof (data as any)?.profileCompleteness === 'number') {
        result.profileCompleteness = (data as any).profileCompleteness;
      }
    } else if (typeof message === 'string') {
      if (message.toLowerCase().includes('matrimony profile not found')) {
        result.needsProfile = true;
      }
    }
  }

  return result;
};

export const getMatchesFeed = async (
  page?: number,
  limit?: number,
): Promise<MatchesApiResult<MatchesFeedResponse>> => {
  try {
    const response = await axios.get<MatchesFeedResponse>('/api/matches/feed', {
      params: {
        page,
        limit,
      },
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

export const getShortlistedProfiles = async (
  page?: number,
  limit?: number,
): Promise<MatchesApiResult<MatchesFeedResponse>> => {
  try {
    const response = await axios.get<MatchesFeedResponse>(
      "/api/behavior/shortlisted-profiles",
      {
        params: {
          page,
          limit,
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

export const getViewedProfiles = async (
  page?: number,
  limit?: number,
): Promise<MatchesApiResult<MatchesFeedResponse>> => {
  try {
    const response = await axios.get<MatchesFeedResponse>(
      "/api/behavior/viewed-profiles",
      {
        params: {
          page,
          limit,
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

export const getLikedProfiles = async (
  page?: number,
  limit?: number,
): Promise<MatchesApiResult<MatchesFeedResponse>> => {
  try {
    const response = await axios.get<MatchesFeedResponse>(
      "/api/behavior/liked-profiles",
      {
        params: {
          page,
          limit,
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

export type FeedFilters = {
  religion?: string;
  caste?: string;
  subcaste?: string;
  motherTongue?: string;
  state?: string;
  district?: string;
  ageRange?: string;
  heightRange?: string;
  education?: string;
  profession?: string;
  gender?: string;
};

export const filterMatches = async (
  filters: FeedFilters,
  page?: number,
  limit?: number,
): Promise<MatchesApiResult<MatchesFeedResponse>> => {
  try {
    const response = await axios.post<MatchesFeedResponse>(
      '/api/matches/filter',
      filters || {},
      {
        params: {
          page,
          limit,
        },
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

export const searchUsersWithMatches = async (
  query: string,
  page?: number,
  limit?: number,
): Promise<MatchesApiResult<MatchesFeedResponse>> => {
  try {
    const response = await axios.get<MatchesFeedResponse>('/api/users/search', {
      params: {
        q: query,
        page,
        limit,
      },
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
