import React, { useEffect, useState } from "react";
import { Shield, Ban, CheckCircle, Search, Users } from "lucide-react";
import {
  listUsersForAdmin,
  setUserBlockedForAdmin,
  type AdminUserListItem,
} from "@/lib/admin/adminUsersApi";
import { Button } from "@/components/ui/Button";

export const AdminUsersPage: React.FC = () => {
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [search, setSearch] = useState("");
  const [blockedFilter, setBlockedFilter] = useState<"any" | "true" | "false">(
    "any",
  );

  const load = async (targetPage: number) => {
    setLoading(true);
    setError(null);
    setAuthError(false);
    setForbidden(false);

    const result = await listUsersForAdmin(
      targetPage,
      limit,
      search,
      blockedFilter,
    );

    if (!result.ok) {
      setError(result.error || "Failed to load users.");
      if (result.authError) setAuthError(true);
      if (result.forbidden) setForbidden(true);
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setItems(result.data.items || []);
    setPage(result.data.page || targetPage);
    setTotal(result.data.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    void load(1);
  };

  const handleToggleBlocked = async (user: AdminUserListItem) => {
    const nextBlocked = !user.isBlocked;
    const result = await setUserBlockedForAdmin(user._id, nextBlocked);
    if (!result.ok) {
      setError(result.error || "Failed to update user status.");
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item._id === user._id
          ? { ...item, isBlocked: result.data.isBlocked }
          : item,
      ),
    );
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50/80 px-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-100 bg-white/90 px-6 py-8 text-center shadow-md">
          <h1 className="text-lg font-semibold text-rose-900 mb-2">
            Login required
          </h1>
          <p className="text-sm text-rose-700 mb-4">
            Please login as an admin user to access this page.
          </p>
          <Button
            size="md"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
          >
            Go to landing page
          </Button>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50/80 px-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-100 bg-white/90 px-6 py-8 text-center shadow-md">
          <h1 className="text-lg font-semibold text-rose-900 mb-2">
            Access denied
          </h1>
          <p className="text-sm text-rose-700 mb-4">
            Your account does not have admin access. If you believe this is a
            mistake, please contact the team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-50">
      <main className="py-6 sm:py-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/40">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-300">
                  Admin
                </p>
                <h1 className="text-xl sm:text-2xl font-semibold text-white">
                  User moderation
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-300 max-w-xl">
                  View matrimony users, search by email/phone/name, and block
                  accounts that should not appear in the matchmaking feed.
                </p>
              </div>
            </div>
          </header>

          <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900/90 to-slate-950 shadow-xl shadow-black/60 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Users className="h-4 w-4 text-rose-300" />
                <span>
                  Showing{" "}
                  <span className="font-semibold text-rose-100">
                    {items.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-rose-100">{total}</span>{" "}
                  users
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="flex items-center gap-1.5 rounded-full bg-slate-900/70 border border-slate-700 px-3 py-1.5">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search email, phone, or name"
                    className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <select
                  value={blockedFilter}
                  onChange={(event) =>
                    setBlockedFilter(
                      event.target.value as "any" | "true" | "false",
                    )
                  }
                  className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="any">All users</option>
                  <option value="false">Only active</option>
                  <option value="true">Only blocked</option>
                </select>
                <Button
                  type="button"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-500 text-xs"
                  onClick={handleApplyFilters}
                  disabled={loading}
                >
                  Apply
                </Button>
              </div>
            </div>

            {error && (
              <div className="mb-3 rounded-2xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-[11px] text-rose-200">
                {error}
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-[0.16em]">
                  <tr>
                    <th className="px-3 py-2 text-left">User</th>
                    <th className="px-3 py-2 text-left">Contact</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Created</th>
                    <th className="px-3 py-2 text-left">Last login</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-6 text-center text-[11px] text-slate-400"
                      >
                        No users found for current filters.
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-6 text-center text-[11px] text-slate-400"
                      >
                        Loading users…
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    items.map((user) => {
                      const createdAt = user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "";
                      const lastLogin = user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString()
                        : "—";
                      const nameOrEmail = user.fullName || user.email || "User";
                      const initials = (nameOrEmail || "U")
                        .trim()
                        .charAt(0)
                        .toUpperCase();

                      return (
                        <tr
                          key={user._id}
                          className="border-t border-slate-800/80"
                        >
                          <td className="px-3 py-3 align-top">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-semibold text-slate-100">
                                {initials}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-semibold text-slate-50">
                                  {nameOrEmail}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {user._id}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-col gap-0.5 text-[10px] text-slate-300">
                              {user.email && <span>{user.email}</span>}
                              {user.phone && <span>{user.phone}</span>}
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-col gap-1 text-[10px]">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] font-semibold ${
                                  user.isBlocked
                                    ? "border-rose-500/60 bg-rose-950/60 text-rose-200"
                                    : "border-emerald-500/50 bg-emerald-950/40 text-emerald-200"
                                }`}
                              >
                                {user.isBlocked ? (
                                  <Ban className="h-3 w-3" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                                <span>
                                  {user.isBlocked ? "Blocked" : "Active"}
                                </span>
                              </span>
                              {user.isAdmin && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-900/40 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
                                  <Shield className="h-3 w-3" />
                                  Admin
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top text-[10px] text-slate-300">
                            {createdAt || "—"}
                          </td>
                          <td className="px-3 py-3 align-top text-[10px] text-slate-300">
                            {lastLogin}
                          </td>
                          <td className="px-3 py-3 align-top text-right">
                            <Button
                              type="button"
                              size="sm"
                              className={
                                user.isBlocked
                                  ? "bg-emerald-600 hover:bg-emerald-500 text-[11px]"
                                  : "bg-rose-600 hover:bg-rose-500 text-[11px]"
                              }
                              onClick={() => void handleToggleBlocked(user)}
                              disabled={loading}
                            >
                              {user.isBlocked ? "Unblock" : "Block"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-300">
                <span>
                  Page{" "}
                  <span className="font-semibold text-slate-50">{page}</span> of{" "}
                  <span className="font-semibold text-slate-50">
                    {totalPages}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-slate-700 text-slate-200 hover:bg-slate-800/80"
                    disabled={loading || page <= 1}
                    onClick={() => void load(page - 1)}
                  >
                    Prev
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-slate-700 text-slate-200 hover:bg-slate-800/80"
                    disabled={loading || page >= totalPages}
                    onClick={() => void load(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage;
