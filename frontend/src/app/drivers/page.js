"use client";

import { useState, useEffect, useCallback } from "react";
import { getDrivers, getTopDrivers, getWorstDrivers } from "@/lib/api";
import {
  Users,
  Award,
  AlertOctagon,
  Search,
  Star,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [topDrivers, setTopDrivers] = useState([]);
  const [worstDrivers, setWorstDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("delay_rate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [driverData, topData, worstData] = await Promise.all([
          getDrivers({ page, pageSize, search, sortBy, sortOrder }),
          getTopDrivers(),
          getWorstDrivers(),
        ]);

        if (isMounted) {
          setDrivers(driverData.items || []);
          setTotalPages(driverData.total_pages || 1);
          setTotalCount(driverData.total || 0);
          setTopDrivers(topData || []);
          setWorstDrivers(worstData || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load driver data");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [page, pageSize, search, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Driver Performance Analytics
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Historical driver delay rates, rating metrics, and PyTorch feature engineering scores
        </p>
      </div>

      {error && (
        <div className="p-4 badge-danger rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Highlights: Top & Worst Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Reliable Drivers */}
        <div className="enterprise-card p-5 border-t-2" style={{ borderTopColor: "var(--accent-emerald)" }}>
          <h2 className="text-sm font-bold mb-3 flex items-center space-x-2" style={{ color: "var(--text-primary)" }}>
            <Award className="w-4 h-4" style={{ color: "var(--accent-emerald)" }} />
            <span>Top Reliable Drivers (Lowest Delay Rate)</span>
          </h2>
          <div className="space-y-2">
            {topDrivers.slice(0, 5).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs"
                style={{ background: "var(--bg-main)", border: "1px solid var(--border-main)" }}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{d.driver_id}</span>
                  <div className="flex items-center space-x-1" style={{ color: "var(--accent-amber)" }}>
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-bold">{d.avg_rating?.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span style={{ color: "var(--text-secondary)" }}>{d.total_rides} rides</span>
                  <span className="badge-success font-mono font-bold">
                    {(d.delay_rate * 100).toFixed(1)}% delay
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Delay Rate Drivers */}
        <div className="enterprise-card p-5 border-t-2" style={{ borderTopColor: "var(--accent-rose)" }}>
          <h2 className="text-sm font-bold mb-3 flex items-center space-x-2" style={{ color: "var(--text-primary)" }}>
            <AlertOctagon className="w-4 h-4" style={{ color: "var(--accent-rose)" }} />
            <span>Highest Delay Rate Drivers (High Risk)</span>
          </h2>
          <div className="space-y-2">
            {worstDrivers.slice(0, 5).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs"
                style={{ background: "var(--bg-main)", border: "1px solid var(--border-main)" }}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{d.driver_id}</span>
                  <div className="flex items-center space-x-1" style={{ color: "var(--accent-amber)" }}>
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-bold">{d.avg_rating?.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span style={{ color: "var(--text-secondary)" }}>{d.total_rides} rides</span>
                  <span className="badge-danger font-mono font-bold">
                    {(d.delay_rate * 100).toFixed(1)}% delay
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="enterprise-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search Driver ID (e.g. DRV_0001)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-medium"
          >
            <option value={15}>15 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="enterprise-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th
                  onClick={() => toggleSort("driver_id")}
                  className="px-4 py-3.5 cursor-pointer hover:opacity-80"
                >
                  Driver ID
                </th>
                <th
                  onClick={() => toggleSort("total_rides")}
                  className="px-4 py-3.5 cursor-pointer hover:opacity-80"
                >
                  Total Rides
                </th>
                <th
                  onClick={() => toggleSort("avg_rating")}
                  className="px-4 py-3.5 cursor-pointer hover:opacity-80"
                >
                  Average Rating
                </th>
                <th
                  onClick={() => toggleSort("delay_rate")}
                  className="px-4 py-3.5 cursor-pointer hover:opacity-80"
                >
                  Historical Delay Rate
                </th>
                <th className="px-4 py-3.5">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border-main)" }}>
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 rounded w-24" style={{ background: "var(--bg-hover)" }}></div></td>
                    <td className="px-4 py-4"><div className="h-4 rounded w-16" style={{ background: "var(--bg-hover)" }}></div></td>
                    <td className="px-4 py-4"><div className="h-4 rounded w-16" style={{ background: "var(--bg-hover)" }}></div></td>
                    <td className="px-4 py-4"><div className="h-4 rounded w-20" style={{ background: "var(--bg-hover)" }}></div></td>
                    <td className="px-4 py-4"><div className="h-6 rounded-full w-20" style={{ background: "var(--bg-hover)" }}></div></td>
                  </tr>
                ))
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12" style={{ color: "var(--text-muted)" }}>
                    No driver records found.
                  </td>
                </tr>
              ) : (
                drivers.map((d) => {
                  const delayPct = (d.delay_rate * 100).toFixed(1);
                  const isHighRisk = d.delay_rate >= 0.3;
                  const isLowRisk = d.delay_rate <= 0.15;

                  return (
                    <tr key={d.id} className="font-mono text-xs">
                      <td className="px-4 py-3.5 font-bold" style={{ color: "var(--text-primary)" }}>{d.driver_id}</td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: "var(--text-primary)" }}>{d.total_rides}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-1" style={{ color: "var(--accent-amber)" }}>
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-bold">{d.avg_rating?.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold">
                        <span className={isHighRisk ? "text-[var(--accent-rose)]" : isLowRisk ? "text-[var(--accent-emerald)]" : "text-[var(--accent-amber)]"}>
                          {delayPct}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={isHighRisk ? "badge-danger" : isLowRisk ? "badge-success" : "badge-warning"}>
                          {isHighRisk ? "High Risk" : isLowRisk ? "Low Risk" : "Moderate Risk"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ background: "var(--bg-sidebar)", borderTop: "1px solid var(--border-main)", color: "var(--text-secondary)" }}>
          <div>
            Showing <span className="font-bold" style={{ color: "var(--text-primary)" }}>{drivers.length}</span> of{" "}
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>{totalCount.toLocaleString()}</span> drivers
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-1.5 btn-secondary disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 btn-secondary disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
