"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Table,
  BarChart3,
  Activity,
  Users,
  Sliders,
  Car,
  LogOut,
  LogIn,
  Shield,
  Sun,
  Moon,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: "Predictions", href: "/predictions", icon: Table, roles: ["admin", "data_scientist", "guest"] },
    { label: "Model Dashboard", href: "/dashboard", icon: BarChart3, roles: ["admin", "data_scientist", "guest"] },
    { label: "Training Monitor", href: "/training", icon: Activity, roles: ["admin"] },
    { label: "Driver Analytics", href: "/drivers", icon: Users, roles: ["admin", "data_scientist", "guest"] },
    { label: "Admin Panel", href: "/admin", icon: Sliders, roles: ["admin"] },
  ];

  const currentRole = isAuthenticated ? role : "guest"; 
  const filteredNavItems = navItems.filter((item) => {
    return item.roles.includes(currentRole);
  });

  const isDark = theme === "dark";

  return (
    <aside
      style={{
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-main)",
        color: "var(--text-primary)",
        transition: "background 200ms ease, border-color 200ms ease",
      }}
      className="w-64 flex flex-col justify-between h-screen sticky top-0 z-30 flex-shrink-0"
    >
      <div>
        {/* Logo Header */}
        <div
          style={{ borderBottom: "1px solid var(--border-main)" }}
          className="p-5 flex items-center space-x-3"
        >
          <div
            style={{
              background: "rgba(79, 70, 229, 0.12)",
              border: "1px solid rgba(79, 70, 229, 0.30)",
              color: "var(--accent-indigo)",
            }}
            className="p-2 rounded-xl flex items-center justify-center"
          >
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h1 style={{ color: "var(--text-primary)" }} className="font-bold text-base tracking-tight leading-tight">
              Ride ETA
            </h1>
            <p style={{ color: "var(--text-secondary)" }} className="text-[11px] font-medium mt-0.5">
              Enterprise ML Engine
            </p>
          </div>
        </div>

        {/* User Profile Card */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-main)",
          }}
          className="p-3.5 m-3 rounded-[14px]"
        >
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div
                  style={{
                    background: "rgba(79, 70, 229, 0.15)",
                    border: "1px solid rgba(79, 70, 229, 0.30)",
                    color: "var(--accent-indigo)",
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                >
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p style={{ color: "var(--text-primary)" }} className="text-xs font-bold leading-tight">
                    {user?.username}
                  </p>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase mt-0.5 ${
                      role === "admin"
                        ? "badge-danger"
                        : role === "data_scientist"
                          ? "badge-info"
                          : "badge-success"
                    }`}
                  >
                    {role === "data_scientist" ? "Data Sci" : role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                style={{ color: "var(--text-muted)" }}
                className="p-1 hover:text-[var(--accent-rose)] transition-colors rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{ color: "var(--accent-indigo)" }}
              className="flex items-center justify-between w-full py-1 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center space-x-2">
                <LogIn className="w-4 h-4" />
                <span>Sign In / Select Role</span>
              </div>
            </Link>
          )}
        </div>

        {/* Nav Links */}
        <nav className="px-3 py-2 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/predictions" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                style={
                  isActive
                    ? {
                      background: "var(--accent-indigo)",
                      color: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                    }
                    : {
                      color: "var(--text-secondary)",
                    }
                }
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  !isActive ? "hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]" : ""
                }`}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: isActive ? "#FFFFFF" : "var(--text-muted)" }}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: Status + Theme Toggle */}
      <div className="p-3 space-y-2">
        {/* Theme Toggle Row */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-main)",
          }}
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
        >
          <div className="flex items-center space-x-2">
            {isDark ? (
              <Moon className="w-4 h-4" style={{ color: "var(--accent-indigo)" }} />
            ) : (
              <Sun className="w-4 h-4" style={{ color: "var(--accent-indigo)" }} />
            )}
            <span style={{ color: "var(--text-secondary)" }} className="text-xs font-medium">
              {isDark ? "Dark Mode" : "Light Mode"}
            </span>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          />
        </div>

        {/* System Status */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-main)",
          }}
          className="p-3 rounded-xl text-[11px]"
        >
          <div className="flex items-center space-x-2 font-semibold" style={{ color: "var(--accent-emerald)" }}>
            <Shield className="w-3.5 h-3.5" />
            <span>RBAC Security Active</span>
          </div>
          <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
            PyTorch &amp; SQLite Integrated
          </p>
        </div>
      </div>
    </aside>
  );
}
