import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import * as publicApi from "@/lib/matrimony/publicMatrimonyApi";
import * as reportsApi from "@/lib/core/reportsApi";
import { PublicMatrimonyProfile } from "@/components/matrimony/M-PublicProfile";

const makeProfile = (overrides: any = {}) => ({
  _id: "u1",
  userId: "user-123",
  fullProfile: {
    basicDetails: {
      fullName: "Test User",
      gender: "Male",
    },
    about: {
      profileManagedBy: "Self",
    },
    gallery: [],
  },
  ...overrides,
});

describe("PublicMatrimonyProfile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders loading then profile when API succeeds", async () => {
    const apiSpy = vi
      .spyOn(publicApi, "getPublicMatrimonyProfile")
      .mockResolvedValue({
        ok: true,
        status: 200,
        profile: makeProfile(),
      } as any);

    render(<PublicMatrimonyProfile profileId="abc123" />);

    expect(screen.getByText(/Loading Profile/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(apiSpy).toHaveBeenCalled();
      expect(screen.queryByText(/Loading Profile/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Matrimony public profile/i)).toBeInTheDocument();
  });

  it("shows not found message when API returns 404", async () => {
    vi.spyOn(publicApi, "getPublicMatrimonyProfile").mockResolvedValue({
      ok: false,
      status: 404,
      notFound: true,
    } as any);

    render(<PublicMatrimonyProfile profileId="missing" />);

    await waitFor(() => {
      expect(screen.getByText(/Profile not found\./i)).toBeInTheDocument();
    });
  });

  it("invokes blockUser when Block profile is clicked", async () => {
    vi.spyOn(publicApi, "getPublicMatrimonyProfile").mockResolvedValue({
      ok: true,
      status: 200,
      profile: makeProfile(),
    } as any);

    const blockSpy = vi
      .spyOn(reportsApi, "blockUser")
      .mockResolvedValue({ ok: true, status: 200 } as any);

    render(<PublicMatrimonyProfile profileId="abc123" />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^Block profile$/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /^Block profile$/i }));

    await waitFor(() => {
      expect(blockSpy).toHaveBeenCalledWith("user-123");
    });
  });

  it("invokes unblockUser when Unblock profile is clicked", async () => {
    vi.spyOn(publicApi, "getPublicMatrimonyProfile").mockResolvedValue({
      ok: true,
      status: 200,
      profile: makeProfile(),
    } as any);

    const unblockSpy = vi
      .spyOn(reportsApi, "unblockUser")
      .mockResolvedValue({ ok: true, status: 200 } as any);

    render(<PublicMatrimonyProfile profileId="abc123" />);

    await waitFor(() => {
      expect(screen.getByText(/Unblock profile/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Unblock profile/i));

    await waitFor(() => {
      expect(unblockSpy).toHaveBeenCalledWith("user-123");
    });
  });

  it.todo("invokes reportProfile when Report profile is submitted");
  it.todo("does not show contact details when visibility requires gating");
});
