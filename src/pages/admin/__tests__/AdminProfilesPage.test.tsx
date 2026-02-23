import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import * as adminProfilesApi from "@/lib/admin/adminProfilesApi";
import AdminProfilesPage from "@/pages/admin/AdminProfilesPage";

const makeListResult = (
  overrides: Partial<adminProfilesApi.AdminProfileListResponse> = {},
): adminProfilesApi.AdminProfilesApiSuccess<adminProfilesApi.AdminProfileListResponse> => ({
  ok: true,
  status: 200,
  data: {
    items: [],
    page: 1,
    limit: 20,
    total: 0,
    ...overrides,
  },
});

describe("AdminProfilesPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders basic layout and summary when API returns items", async () => {
    const spy = vi
      .spyOn(adminProfilesApi, "listProfilesForAdmin")
      .mockResolvedValue(
        makeListResult({
          items: [
            {
              _id: "p1",
              gender: "Male",
              age: "30",
              religion: "Hindu",
              motherTongue: "Hindi",
              city: "Delhi",
              completenessScore: 90,
              trustScore: 85,
              isVerified: true,
              createdAt: new Date().toISOString(),
              featuredUntil: null,
              flags: {},
            },
          ],
          total: 1,
        }),
      );

    render(<AdminProfilesPage />);

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    expect(screen.getByText(/Profile moderation/i)).toBeInTheDocument();
    expect(screen.getByText(/Showing/i)).toBeInTheDocument();

    expect(screen.getByText(/Male/)).toBeInTheDocument();
    expect(screen.getByText(/Trust score:/i)).toBeInTheDocument();
  });

  it("shows error banner when API fails", async () => {
    vi.spyOn(adminProfilesApi, "listProfilesForAdmin").mockResolvedValue({
      ok: false,
      status: 500,
      error: "Server error",
    } as adminProfilesApi.AdminProfilesApiError);

    render(<AdminProfilesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  it.todo("applies search and verified filters when Apply is clicked");
  it.todo("disables pagination buttons appropriately at boundaries");
});
